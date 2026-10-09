// Acceso a la cuenta por enlace mágico (un correo con un botón para entrar, sin contraseña).
// Si la configuración de Supabase falta, devuelve un estado honesto: nunca un éxito falso.

import { clienteSupabase } from '@/lib/supabase';

export type ResultadoAcceso =
  | { ok: true }
  | { ok: false; motivo: 'no_configurado' | 'correo_invalido' | 'error_envio' };

export const correoValido = (c: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.trim());

export async function enviarEnlaceDeAcceso(correo: string): Promise<ResultadoAcceso> {
  if (!correoValido(correo)) return { ok: false, motivo: 'correo_invalido' };
  const supabase = clienteSupabase();
  if (!supabase) return { ok: false, motivo: 'no_configurado' };
  const { error } = await supabase.auth.signInWithOtp({
    email: correo.trim(),
    options: { emailRedirectTo: `${window.location.origin}/app` },
  });
  if (error) return { ok: false, motivo: 'error_envio' };
  return { ok: true };
}
