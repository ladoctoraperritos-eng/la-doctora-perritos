// Correos transaccionales con Resend: no tiene el límite tan bajo del envío gratuito de
// Supabase, así que esto es lo que de verdad hay que usar cuando puede llegar más de un
// cliente nuevo por hora (ej. al activar una compra desde el webhook de Hotmart).
//
// El enlace de acceso lo sigue generando Supabase (es quien sabe crear sesiones válidas) — lo
// único que cambia es QUIÉN manda el correo con ese enlace: Resend, no el SMTP de prueba de
// Supabase. `generateLink` NO manda ningún correo por sí solo, solo devuelve la URL.
import 'server-only';
import { Resend } from 'resend';
import type { SupabaseClient } from '@supabase/supabase-js';

const DESDE = 'La Doctora Perritos <acceso@ladoctoraperritos.com>';

function clienteResend(): Resend | null {
  const clave = process.env.RESEND_API_KEY;
  return clave ? new Resend(clave) : null;
}

/** Genera el enlace de acceso con Supabase (sin que Supabase mande nada) y lo envía por Resend
 * con el correo de bienvenida. Si Resend no está configurado, cae de vuelta al envío de
 * Supabase (mejor un correo con el límite bajo que ningún correo). */
export async function enviarCorreoDeAcceso(
  admin: SupabaseClient,
  email: string,
  redirectTo: string,
  nombre?: string
): Promise<{ ok: boolean; motivo?: string }> {
  const resend = clienteResend();
  if (!resend) {
    const { error } = await admin.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
    return error ? { ok: false, motivo: error.message } : { ok: true };
  }

  const { data, error: errLink } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo },
  });
  if (errLink || !data?.properties?.action_link) {
    return { ok: false, motivo: errLink?.message ?? 'no se pudo generar el enlace' };
  }
  const enlace = data.properties.action_link;
  const saludo = nombre ? `¡Hola ${nombre}!` : '¡Hola!';

  const { error: errEnvio } = await resend.emails.send({
    from: DESDE,
    to: email,
    subject: 'Tu acceso a La Doctora Perritos ya está listo',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#20332f;">
        <h1 style="font-size:22px;">${saludo} 🐾</h1>
        <p>Tu cuenta de La Doctora Perritos ya está activa. Entra con el botón de abajo — no necesitas contraseña.</p>
        <p style="margin:28px 0;">
          <a href="${enlace}" style="background:#0b6b63;color:#fff;padding:14px 28px;border-radius:12px;
             text-decoration:none;font-weight:600;display:inline-block">Entrar a la app →</a>
        </p>
        <p style="color:#5a6a65;font-size:14px;">Si el botón no funciona, entra en
          <a href="https://www.ladoctoraperritos.com/login">www.ladoctoraperritos.com/login</a> con este mismo correo.</p>
        <p style="color:#5a6a65;font-size:14px;">¿Dudas? Escríbenos a contacto@ladoctoraperritos.com</p>
      </div>
    `,
  });
  if (errEnvio) return { ok: false, motivo: errEnvio.message };
  return { ok: true };
}
