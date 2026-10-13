// Recibe los avisos de pago de Hotmart (compra aprobada, reembolso, cancelación...) y activa o
// quita el acceso del hogar correspondiente. Es el endpoint más atacado de toda la app: si
// alguien lo engaña, se regala la app gratis. Por eso cada aviso pasa, EN ORDEN, por: ¿viene de
// verdad de Hotmart? -> ¿es reciente? -> ¿ya lo procesé? -> ¿qué cambio de acceso implica?
//
// Los 4 campos de autorización (plan de la oferta, nuevo estado, email, código de suscriptor) se
// construyen a partir del PAYLOAD del evento. Hotmart documenta el nombre exacto de cada evento
// en inglés en su API aunque el panel los muestre traducidos — probado en la primera compra real
// (ver ESTADO.md, sección Hotmart): confirmar que las rutas de abajo (data.buyer.email, etc.)
// coinciden con el JSON real y ajustar si hace falta.
import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { clienteAdmin } from '@/lib/supabase-admin';
import { verificarHotmart } from '@/lib/hotmart-verify';
import { estadoParaEvento, esEventoInformativo, planParaOferta, EVENTO_CAMBIO_PLAN } from '@/lib/hotmart-fsm';

export const runtime = 'nodejs'; // necesita node:crypto y el cuerpo crudo de la petición

const VENTANA_REINTENTO_MS = 5 * 60 * 1000; // 5 minutos: un aviso más viejo que esto se rechaza (anti-repetición)

type Resultado = 'aplicado' | 'duplicado' | 'ilegal' | 'no_autorizado' | 'error';

async function registrar(eventId: string | null, tipo: string | null, resultado: Resultado) {
  const admin = clienteAdmin();
  if (!admin) return;
  await admin.from('hotmart_webhook_log').insert({ event_id: eventId, tipo_evento: tipo, resultado });
}

export async function POST(req: Request) {
  const admin = clienteAdmin();
  if (!admin) {
    // Sin la clave de servicio no hay forma segura de aplicar el cambio — mejor fallar que
    // regalar acceso. 500 para que Hotmart reintente cuando el servidor esté bien configurado.
    return NextResponse.json({ error: 'servidor sin configurar' }, { status: 500 });
  }

  // 1. Cuerpo crudo ANTES de parsear (para el hash de auditoría y por si algún día hace falta
  //    verificar una firma documentada por Hotmart sobre los bytes exactos recibidos).
  const cuerpoCrudo = await req.text();

  // 2. Autenticidad — el hottok puede venir por header o dentro del cuerpo según la versión.
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(cuerpoCrudo);
  } catch {
    return NextResponse.json({ error: 'cuerpo inválido' }, { status: 400 });
  }
  const hottokHeader = req.headers.get('x-hotmart-hottok');
  const hottokBody = typeof payload.hottok === 'string' ? payload.hottok : undefined;
  if (!verificarHotmart(hottokHeader ?? hottokBody)) {
    await registrar(null, typeof payload.event === 'string' ? payload.event : null, 'no_autorizado');
    return NextResponse.json({ error: 'no autorizado' }, { status: 401 });
  }

  // 3. Frescura (anti-repetición): un aviso capturado y reenviado más tarde se rechaza.
  const dataObj = (payload.data as Record<string, unknown> | undefined) ?? {};
  const purchaseObj = (dataObj.purchase as Record<string, unknown> | undefined) ?? {};
  const marcaTiempo = Number(payload.creation_date ?? purchaseObj.approved_date ?? 0) || null;
  if (marcaTiempo && Date.now() - marcaTiempo > VENTANA_REINTENTO_MS) {
    return NextResponse.json({ error: 'aviso vencido' }, { status: 400 });
  }

  // 4. Datos del evento.
  const evento = String(payload.event ?? '');
  const buyerObj = (dataObj.buyer as Record<string, unknown> | undefined) ?? {};
  const subscriptionObj = (dataObj.subscription as Record<string, unknown> | undefined) ?? {};
  const subscriberObj = (subscriptionObj.subscriber as Record<string, unknown> | undefined) ?? {};
  const offerObj = (dataObj.offer as Record<string, unknown> | undefined) ?? {};

  const email = typeof buyerObj.email === 'string' ? buyerObj.email.trim().toLowerCase() : undefined;
  const nombre = typeof buyerObj.name === 'string' ? buyerObj.name : '';
  const codigoSuscriptor = typeof subscriberObj.code === 'string' ? subscriberObj.code : undefined;
  const codigoOferta = typeof offerObj.code === 'string' ? offerObj.code : undefined;
  const valorCentavos = typeof purchaseObj.price === 'object' && purchaseObj.price
    ? Math.round((((purchaseObj.price as Record<string, unknown>).value as number) ?? 0) * 100)
    : null;

  const eventId =
    (typeof payload.id === 'string' && payload.id) ||
    (typeof purchaseObj.transaction === 'string' && purchaseObj.transaction) ||
    `${evento}:${email ?? 'sin-correo'}:${marcaTiempo ?? ''}`; // compuesto determinista, NUNCA Date.now()

  if (!email) {
    await registrar(eventId, evento, 'error');
    return NextResponse.json({ received: true, ignored: 'sin correo del comprador' });
  }

  const payloadHash = crypto.createHash('sha256').update(cuerpoCrudo).digest('hex');

  // 5. Cambio de plan (mensual<->anual, o Esencial<->Familia): no cambia el estado de pago.
  if (evento === EVENTO_CAMBIO_PLAN) {
    const planNuevo = planParaOferta(codigoOferta);
    const { data, error } = await admin.rpc('aplicar_cambio_plan_hotmart', {
      p_event_id: eventId,
      p_tipo_evento: evento,
      p_payload_hash: payloadHash,
      p_email: email,
      p_subscriber_code: codigoSuscriptor ?? null,
      p_plan_nuevo: planNuevo,
    });
    if (error) {
      console.error('[webhook hotmart] error en cambio de plan', { evento, codigo: error.code });
      await registrar(eventId, evento, 'error');
      return NextResponse.json({ error: 'no se pudo procesar' }, { status: 500 });
    }
    const resultado: Resultado = data?.status === 'duplicate' ? 'duplicado' : data?.status === 'no_match' ? 'error' : 'aplicado';
    await registrar(eventId, evento, resultado);
    return NextResponse.json({ received: true, result: data?.status ?? 'ok' });
  }

  // 6. Eventos que solo se anotan (no cambian acceso todavía).
  if (esEventoInformativo(evento)) {
    await registrar(eventId, evento, 'aplicado');
    return NextResponse.json({ received: true, ignored: evento });
  }

  const nuevoEstado = estadoParaEvento(evento, valorCentavos);
  if (!nuevoEstado) {
    // Evento que no está en nuestro catálogo (ej. uno nuevo que Hotmart agregó): se registra
    // igual para que quede visible, pero no se procesa a ciegas.
    await registrar(eventId, evento, 'aplicado');
    return NextResponse.json({ received: true, ignored: evento });
  }

  const plan = planParaOferta(codigoOferta);

  // 7. Idempotencia + cambio de estado + transición legal, todo atómico en una sola función.
  const { data, error } = await admin.rpc('aplicar_evento_hotmart', {
    p_event_id: eventId,
    p_tipo_evento: evento,
    p_payload_hash: payloadHash,
    p_email: email,
    p_subscriber_code: codigoSuscriptor ?? null,
    p_nuevo_estado: nuevoEstado,
    p_plan: plan,
  });

  if (error) {
    console.error('[webhook hotmart] error al aplicar el evento', { evento, codigo: error.code });
    await registrar(eventId, evento, 'error');
    return NextResponse.json({ error: 'no se pudo procesar' }, { status: 500 }); // 5xx: Hotmart reintenta
  }

  const estado = data?.status as string | undefined;
  const resultado: Resultado = estado === 'duplicate' ? 'duplicado' : estado === 'illegal_transition' ? 'ilegal' : 'aplicado';
  await registrar(eventId, evento, resultado);

  // 8. Si el acceso quedó aplicado y todavía no existe la cuenta de entrada (hogar nuevo o uno
  //    que nunca llegó a crearse por un fallo anterior), crearla ahora — FUERA de la transacción
  //    de arriba a propósito (crear un usuario de auth no es SQL), pero sin marcar nada como
  //    "hecho del todo" hasta que esto también funcione: si falla, el próximo aviso reintenta.
  if (resultado === 'aplicado' && (estado === 'applied')) {
    const hogarId = data?.hogar_id as string | undefined;
    if (hogarId) {
      const { data: hogarActual } = await admin.from('hogares').select('acceso_creado').eq('id', hogarId).maybeSingle();
      if (hogarActual && hogarActual.acceso_creado === false) {
        const origen = new URL(req.url).origin;
        const { error: errInvite } = await admin.auth.admin.inviteUserByEmail(email, {
          data: { nombre },
          redirectTo: `${origen}/app`,
        });
        // "already registered" es un éxito a efectos de acceso (la cuenta ya existe, solo falta
        // vincularla) — cualquier otro error se deja para que el próximo reintento lo resuelva.
        const yaExiste = errInvite && /already registered|already exists/i.test(errInvite.message);
        if (!errInvite || yaExiste) {
          await admin.from('hogares').update({ acceso_creado: true }).eq('id', hogarId);
          if (yaExiste) await admin.auth.signInWithOtp({ email, options: { emailRedirectTo: `${origen}/app` } }); // igual le reenvía el enlace
        } else {
          console.error('[webhook hotmart] no se pudo crear la cuenta de acceso', { codigo: errInvite.code });
        }
      }
    }
  }

  // 9. Siempre 200 cuando se tomó una decisión (incluido duplicado/ilegal): así Hotmart deja de
  //    reintentar. Solo los 4xx/5xx de arriba (no autorizado, cuerpo inválido, error real) hacen
  //    que Hotmart vuelva a intentar.
  return NextResponse.json({ received: true, result: estado ?? 'ok' });
}
