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
import { estadoParaEvento, esEventoInformativo, planParaOferta, esOfertaAnual, EVENTO_CAMBIO_PLAN, EVENTO_CARRITO_ABANDONADO } from '@/lib/hotmart-fsm';
import { enviarCorreoDeAcceso, enviarCorreoEbook, enviarCorreoPagoFallido, enviarCorreoCancelacion, enviarCorreoCarritoAbandonado } from '@/lib/email';

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

  // 5a. Carrito abandonado: solo manda el correo de recuperación, no toca el acceso de nadie.
  if (evento === EVENTO_CARRITO_ABANDONADO) {
    const { error: errDupe } = await admin.from('hotmart_eventos_procesados').insert({ event_id: eventId, tipo_evento: evento, payload_hash: payloadHash });
    if (errDupe) {
      await registrar(eventId, evento, 'duplicado');
      return NextResponse.json({ received: true, result: 'duplicate' });
    }
    const { ok, motivo } = await enviarCorreoCarritoAbandonado(email, nombre);
    await registrar(eventId, evento, ok ? 'aplicado' : 'error');
    if (!ok) console.error('[webhook hotmart] no se pudo mandar el correo de carrito abandonado', { motivo });
    return NextResponse.json({ received: true, result: ok ? 'applied' : 'error' });
  }

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
        // Crear la cuenta SIN que Supabase mande su propio correo (email_confirm:true evita el
        // de verificación) — el correo de verdad lo manda Resend más abajo, con o sin cuenta
        // nueva, usando siempre el mismo enlace generado por Supabase.
        const { error: errCrear } = await admin.auth.admin.createUser({ email, email_confirm: true, user_metadata: { nombre } });
        const yaExiste = errCrear && /already registered|already exists/i.test(errCrear.message);
        if (!errCrear || yaExiste) {
          const { ok, motivo } = await enviarCorreoDeAcceso(admin, email, `${origen}/app`, nombre);
          if (ok) {
            await admin.from('hogares').update({ acceso_creado: true }).eq('id', hogarId);
          } else {
            console.error('[webhook hotmart] cuenta creada pero el correo falló, se reintenta en el próximo aviso', { motivo });
          }
        } else {
          console.error('[webhook hotmart] no se pudo crear la cuenta de acceso', { codigo: errCrear.code });
        }
      }
    }
  }

  // 9. Avisos que no tienen que ver con crear acceso: pago fallido (dunning) y cancelación
  //    (win-back). Solo en eventos recién aplicados, nunca en duplicados/ilegales.
  if (resultado === 'aplicado' && estado === 'applied') {
    const hogarId = data?.hogar_id as string | undefined;
    if (hogarId && nuevoEstado === 'past_due') {
      const { ok, motivo } = await enviarCorreoPagoFallido(email, nombre, 5);
      if (!ok) console.error('[webhook hotmart] no se pudo avisar el pago fallido', { motivo });
    }
    if (hogarId && nuevoEstado === 'cancelled') {
      const { data: hogarAccesoUntil } = await admin.from('hogares').select('access_until').eq('id', hogarId).maybeSingle();
      const fecha = hogarAccesoUntil?.access_until ? new Date(hogarAccesoUntil.access_until).toLocaleDateString('es') : undefined;
      const { ok, motivo } = await enviarCorreoCancelacion(email, nombre, fecha);
      if (!ok) console.error('[webhook hotmart] no se pudo avisar la cancelación', { motivo });
    }
    // Regalo del plan anual: una sola vez, solo al confirmar el primer cobro real ('active', no 'trialing').
    if (hogarId && nuevoEstado === 'active' && esOfertaAnual(codigoOferta)) {
      const { data: hogarEbook } = await admin.from('hogares').select('ebook_enviado').eq('id', hogarId).maybeSingle();
      if (hogarEbook && hogarEbook.ebook_enviado === false) {
        const { ok, motivo } = await enviarCorreoEbook(admin, email, nombre);
        if (ok) await admin.from('hogares').update({ ebook_enviado: true }).eq('id', hogarId);
        else console.error('[webhook hotmart] no se pudo mandar el ebook, se reintenta en el próximo aviso', { motivo });
      }
    }
  }

  // 10. Siempre 200 cuando se tomó una decisión (incluido duplicado/ilegal): así Hotmart deja de
  //    reintentar. Solo los 4xx/5xx de arriba (no autorizado, cuerpo inválido, error real) hacen
  //    que Hotmart vuelva a intentar.
  return NextResponse.json({ received: true, result: estado ?? 'ok' });
}
