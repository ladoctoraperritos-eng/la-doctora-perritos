// Cliente de Supabase para el navegador. Usa solo la clave pública (anon): la seguridad de los datos
// la dan las reglas de acceso por fila de la base (ver ESTADO.md, "Decisiones técnicas"). Nunca poner
// aquí la clave service_role.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const CLAVE = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Devuelve el cliente, o null si la configuración no está en el archivo de entorno. */
export function clienteSupabase(): SupabaseClient | null {
  if (!URL || !CLAVE) return null;
  return createClient(URL, CLAVE, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
}
