// Acceso a la cuenta. PENDIENTE: conectar con Supabase Auth (enlace mágico por correo) en la etapa de
// servicios externos. Mientras tanto devuelve un estado honesto, nunca un éxito falso.

export type ResultadoAcceso = { ok: true } | { ok: false; motivo: 'no_configurado' | 'correo_invalido' };

export const correoValido = (c: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.trim());

export async function enviarEnlaceDeAcceso(correo: string): Promise<ResultadoAcceso> {
  if (!correoValido(correo)) return { ok: false, motivo: 'correo_invalido' };
  return { ok: false, motivo: 'no_configurado' };
}
