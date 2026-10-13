// Acceso a la cuenta por enlace mágico (un correo con un botón para entrar, sin contraseña).
// El correo lo manda el servidor con Resend (ver app/api/auth/enviar-acceso) — más confiable
// que el envío integrado de Supabase, que tiene un límite muy bajo de correos por hora.

export type ResultadoAcceso =
  | { ok: true }
  | { ok: false; motivo: 'no_configurado' | 'correo_invalido' | 'error_envio' | 'demasiado_pronto' };

export const correoValido = (c: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.trim());

export async function enviarEnlaceDeAcceso(correo: string): Promise<ResultadoAcceso> {
  if (!correoValido(correo)) return { ok: false, motivo: 'correo_invalido' };
  try {
    const resp = await fetch('/api/auth/enviar-acceso', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo: correo.trim() }),
    });
    const datos = await resp.json().catch(() => ({}));
    if (datos.ok) return { ok: true };
    return { ok: false, motivo: datos.motivo ?? 'error_envio' };
  } catch {
    return { ok: false, motivo: 'error_envio' };
  }
}
