// Cliente de Supabase SOLO PARA EL SERVIDOR (panel de administración). Usa la clave service_role,
// que ignora toda regla de seguridad por fila: por eso este archivo JAMÁS se importa desde un
// componente de cliente ('use client') ni se expone al navegador. Cada función de aquí abajo
// empieza verificando que quien llama es un administrador antes de devolver nada.

import 'server-only';
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const CLAVE_SERVICIO = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CLAVE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Cliente con la clave de servicio: bypasea RLS. Null si falta configurar la clave. */
export function clienteAdmin(): SupabaseClient | null {
  if (!URL || !CLAVE_SERVICIO) return null;
  return createClient(URL, CLAVE_SERVICIO, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Cliente con la clave pública: solo para validar el token de quien llama (auth.getUser). */
function clienteAnon(): SupabaseClient | null {
  if (!URL || !CLAVE_ANON) return null;
  return createClient(URL, CLAVE_ANON, { auth: { persistSession: false, autoRefreshToken: false } });
}

export type VerificacionAdmin = { ok: true; user: User; admin: SupabaseClient } | { ok: false; estado: number; motivo: string };

/** Verifica EN EL SERVIDOR que el token recibido pertenece a un administrador real (tabla `admins`).
 * No ocultar un botón no es seguridad: cada ruta del panel debe llamar esto antes de leer nada. */
export async function verificarAdmin(authorizationHeader: string | null): Promise<VerificacionAdmin> {
  const admin = clienteAdmin();
  const anon = clienteAnon();
  if (!admin || !anon) return { ok: false, estado: 500, motivo: 'El servidor no tiene configurada la clave de administración.' };

  const token = authorizationHeader?.startsWith('Bearer ') ? authorizationHeader.slice(7) : null;
  if (!token) return { ok: false, estado: 401, motivo: 'Falta iniciar sesión.' };

  const { data, error } = await anon.auth.getUser(token);
  if (error || !data.user) return { ok: false, estado: 401, motivo: 'Tu sesión no es válida. Entra de nuevo.' };

  const { data: fila } = await admin.from('admins').select('user_id').eq('user_id', data.user.id).maybeSingle();
  if (!fila) return { ok: false, estado: 403, motivo: 'Esta cuenta no tiene acceso al panel.' };

  return { ok: true, user: data.user, admin };
}
