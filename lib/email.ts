// Todos los correos transaccionales del negocio, mandados con Resend (no tiene el límite tan
// bajo del envío gratuito de Supabase). Voz de marca (FICHA-ARTE): cálida, competente, tranquila
// — nunca urgencia falsa ni mayúsculas gritonas.
import 'server-only';
import { Resend } from 'resend';
import type { SupabaseClient } from '@supabase/supabase-js';

const DESDE = 'La Doctora Perritos <acceso@ladoctoraperritos.com>';
const CONTACTO = 'contacto@ladoctoraperritos.com';

function clienteResend(): Resend | null {
  const clave = process.env.RESEND_API_KEY;
  return clave ? new Resend(clave) : null;
}

type ResultadoEnvio = { ok: boolean; motivo?: string };

function plantilla(tituloConEmoji: string, parrafos: string[], boton?: { texto: string; enlace: string }): string {
  const cuerpo = parrafos.map((p) => `<p style="margin:0 0 16px;line-height:1.5;">${p}</p>`).join('');
  const cta = boton
    ? `<p style="margin:28px 0;"><a href="${boton.enlace}" style="background:#0b6b63;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:600;display:inline-block">${boton.texto} →</a></p>`
    : '';
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#20332f;">
      <h1 style="font-size:22px;">${tituloConEmoji}</h1>
      ${cuerpo}
      ${cta}
      <p style="color:#5a6a65;font-size:14px;">¿Dudas? Escríbenos a ${CONTACTO}</p>
    </div>
  `;
}

async function enviar(email: string, subject: string, html: string): Promise<ResultadoEnvio> {
  const resend = clienteResend();
  if (!resend) return { ok: false, motivo: 'Resend no está configurado' };
  const { error } = await resend.emails.send({ from: DESDE, to: email, subject, html });
  return error ? { ok: false, motivo: error.message } : { ok: true };
}

/** Genera el enlace de acceso con Supabase (sin que Supabase mande nada) y lo envía por Resend.
 * Si Resend no está configurado, cae de vuelta al envío de Supabase — mejor un correo con el
 * límite bajo que ningún correo. */
export async function enviarCorreoDeAcceso(
  admin: SupabaseClient,
  email: string,
  redirectTo: string,
  nombre?: string
): Promise<ResultadoEnvio> {
  const resend = clienteResend();
  if (!resend) {
    const { error } = await admin.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
    return error ? { ok: false, motivo: error.message } : { ok: true };
  }

  const { data, error: errLink } = await admin.auth.admin.generateLink({ type: 'magiclink', email, options: { redirectTo } });
  if (errLink || !data?.properties?.action_link) {
    return { ok: false, motivo: errLink?.message ?? 'no se pudo generar el enlace' };
  }
  const saludo = nombre ? `¡Hola ${nombre}!` : '¡Hola!';
  return enviar(
    email,
    'Tu acceso a La Doctora Perritos ya está listo',
    plantilla(`${saludo} 🐾`, [
      'Tu cuenta de La Doctora Perritos ya está activa. Entra con el botón de abajo — no necesitas contraseña.',
      `Si el botón no funciona, entra en <a href="https://www.ladoctoraperritos.com/login">www.ladoctoraperritos.com/login</a> con este mismo correo.`,
    ], { texto: 'Entrar a la app', enlace: data.properties.action_link })
  );
}

/** El PDF del regalo (ebook) vive en el bucket privado 'recursos' — se manda un enlace firmado
 * temporal, nunca el archivo adjunto (pesa demasiado para ir por correo). */
export async function enviarCorreoEbook(admin: SupabaseClient, email: string, nombre?: string): Promise<ResultadoEnvio> {
  const { data, error } = await admin.storage.from('recursos').createSignedUrl('ebook-primeros-auxilios-caninos.pdf', 60 * 60 * 24 * 30);
  if (error || !data?.signedUrl) return { ok: false, motivo: error?.message ?? 'no se pudo generar el enlace de descarga' };
  const saludo = nombre ? `¡Hola ${nombre}!` : '¡Hola!';
  return enviar(
    email,
    'Tu regalo: Primeros Auxilios Caninos 🎁',
    plantilla(`${saludo} 🎁`, [
      'Gracias por elegir el plan anual. Como lo prometimos, aquí tienes tu ebook de regalo: <strong>Primeros Auxilios Caninos</strong>.',
      'Guárdalo donde lo encuentres fácil — es una guía para tener a mano ante cualquier imprevisto con tu perro.',
    ], { texto: 'Descargar mi ebook', enlace: data.signedUrl })
  );
}

/** Dunning: un cobro no se procesó. Tono tranquilo, con el plazo de gracia claro — nunca cortar
 * el acceso de golpe durante esos días. */
export async function enviarCorreoPagoFallido(email: string, nombre: string | undefined, diasGracia: number): Promise<ResultadoEnvio> {
  const saludo = nombre ? `Hola ${nombre}` : 'Hola';
  return enviar(
    email,
    'No pudimos procesar tu pago — sigue teniendo acceso',
    plantilla(saludo, [
      'Intentamos cobrar tu suscripción y no se pudo procesar — pasa seguido, a veces es solo una tarjeta vencida o sin fondos en el momento.',
      `Tranquilo/a: sigues teniendo acceso completo durante los próximos ${diasGracia} días mientras lo resuelves.`,
      'Para seguir sin interrupciones, actualiza tu método de pago directamente en Hotmart (lo encuentras en el correo de tu compra, o escríbenos y te ayudamos).',
    ])
  );
}

/** Win-back: se canceló la suscripción. Empático, sin presión — el acceso ya dicho que dura
 * hasta el fin del período pagado. */
export async function enviarCorreoCancelacion(email: string, nombre: string | undefined, accesoHasta?: string): Promise<ResultadoEnvio> {
  const saludo = nombre ? `Hola ${nombre}` : 'Hola';
  const fraseAcceso = accesoHasta ? `Sigues teniendo acceso completo hasta el ${accesoHasta}.` : 'Sigues teniendo acceso hasta el final del período que ya pagaste.';
  return enviar(
    email,
    'Lamentamos que te vayas',
    plantilla(saludo, [
      'Vimos que cancelaste tu suscripción a La Doctora Perritos. Lamentamos que te vayas.',
      fraseAcceso,
      'Si fue por algo puntual que podamos resolver, o si más adelante quieres volver, aquí vamos a estar — solo entra de nuevo a la app cuando quieras.',
    ])
  );
}

/** Carrito abandonado: alguien llegó al checkout de Hotmart y no completó la compra. */
export async function enviarCorreoCarritoAbandonado(email: string, nombre: string | undefined): Promise<ResultadoEnvio> {
  const saludo = nombre ? `Hola ${nombre}` : 'Hola';
  return enviar(
    email,
    '¿Te quedó alguna duda?',
    plantilla(saludo, [
      'Notamos que empezaste a crear tu cuenta en La Doctora Perritos pero no llegaste a terminar.',
      'Si te quedó alguna duda sobre cómo funciona, o algo no te dejó avanzar, respóndenos este correo y te ayudamos directamente.',
      'Y si solo necesitabas un poco más de tiempo, tu lugar sigue ahí — puedes retomarlo cuando quieras.',
    ], { texto: 'Retomar donde quedé', enlace: 'https://www.ladoctoraperritos.com/onboarding' })
  );
}

/** Bienvenida/activación D1-D7: una por día de la primera semana, cada una con UN foco. */
const MENSAJES_BIENVENIDA: Record<number, { asunto: string; titulo: string; parrafos: string[] }> = {
  1: {
    asunto: '¿Ya marcaste el primer cuidado de hoy?',
    titulo: 'El primer paso ya lo diste',
    parrafos: [
      'Ayer configuraste tu Panel de Hoy — el siguiente paso es simple: cuando llegue la hora de un cuidado, solo entra y márcalo como hecho.',
      'Así es como la app empieza a hacer el trabajo de recordar por ti.',
    ],
  },
  3: {
    asunto: '¿Sabías que puedes invitar a quien más cuida con vos?',
    titulo: 'No tienes que llevar la cuenta sola',
    parrafos: [
      'Si alguien más (pareja, familia, quien sea) también cuida a tu perro, puedes invitarlo desde "Yo → Quienes cuidan contigo".',
      'Así los dos ven lo mismo, y se acaba el "¿ya le diste la pastilla?".',
    ],
  },
  7: {
    asunto: 'Una semana usando La Doctora Perritos',
    titulo: 'Ya llevas una semana',
    parrafos: [
      'Una semana es tiempo suficiente para empezar a sentir la diferencia de no tener que recordarlo todo de memoria.',
      'Si algo no te está funcionando como esperabas, respóndenos este correo — nos sirve mucho saberlo.',
    ],
  },
};

export async function enviarCorreoBienvenidaDia(email: string, dia: 1 | 3 | 7): Promise<ResultadoEnvio> {
  const m = MENSAJES_BIENVENIDA[dia];
  return enviar(email, m.asunto, plantilla(m.titulo, m.parrafos));
}

/** El aviso diario: sustituye por ahora a la notificación push (que todavía no existe — ver
 * ESTADO.md). Se manda una vez al día (límite del plan gratis de hosting) con dos bloques: lo que
 * toca HOY (tiene hora fija, aún sin marcar) y lo que se acerca (vacunas, baños, reposición de
 * stock, dentro del margen de anticipación que cada hogar eligió). Nunca se manda si ambos
 * bloques están vacíos — un correo sin nada que decir es peor que ningún correo. */
export async function enviarCorreoAvisoDiario(
  email: string,
  datos: {
    pendientesHoy: { nombre: string; hora: string; perro: string }[];
    proximos: { nombre: string; perro: string; proxima: string }[];
  }
): Promise<ResultadoEnvio> {
  const filaHoy = (i: { nombre: string; hora: string; perro: string }) =>
    `<li style="margin:0 0 10px;"><strong>${i.hora}</strong> — ${i.nombre} de ${i.perro}</li>`;
  const filaProxima = (i: { nombre: string; perro: string; proxima: string }) => {
    const fecha = new Date(i.proxima + 'T00:00:00').toLocaleDateString('es', { day: 'numeric', month: 'short' });
    return `<li style="margin:0 0 10px;">${i.nombre} de ${i.perro} — ${fecha}</li>`;
  };
  const bloqueHoy = datos.pendientesHoy.length
    ? `<h2 style="font-size:17px;margin:24px 0 8px;">Hoy</h2><ul style="padding-left:20px;margin:0;">${datos.pendientesHoy.map(filaHoy).join('')}</ul>`
    : '';
  const bloqueProximos = datos.proximos.length
    ? `<h2 style="font-size:17px;margin:24px 0 8px;">Se acerca</h2><ul style="padding-left:20px;margin:0;">${datos.proximos.map(filaProxima).join('')}</ul>`
    : '';
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#20332f;">
      <h1 style="font-size:22px;">Esto es lo que toca 🐾</h1>
      ${bloqueHoy}
      ${bloqueProximos}
      <p style="margin:28px 0;"><a href="https://www.ladoctoraperritos.com/app" style="background:#0b6b63;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:600;display:inline-block">Abrir mi Panel →</a></p>
      <p style="color:#5a6a65;font-size:14px;">Puedes cambiar estos avisos en Yo → Avisos. ¿Dudas? Escríbenos a ${CONTACTO}</p>
    </div>
  `;
  return enviar(email, 'Esto es lo que toca hoy', html);
}
