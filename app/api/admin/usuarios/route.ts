// Panel de administración — lista de usuarios (familias). Server-only, verifica admin.

import { NextResponse } from 'next/server';
import { verificarAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const v = await verificarAdmin(req.headers.get('authorization'));
  if (!v.ok) return NextResponse.json({ motivo: v.motivo }, { status: v.estado });
  const { admin } = v;

  const [hogares, miembros, perros, registros, usuariosAuth] = await Promise.all([
    admin.from('hogares').select('id, nombre, plan, creado_en'),
    admin.from('miembros_hogar').select('hogar_id, user_id, rol').eq('rol', 'dueno'),
    admin.from('perros').select('id, hogar_id'),
    admin.from('registros').select('hogar_id, creado_en').order('creado_en', { ascending: false }),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ]);
  for (const r of [hogares, miembros, perros, registros]) {
    if (r.error) return NextResponse.json({ motivo: 'No pudimos leer los datos: ' + r.error.message }, { status: 500 });
  }
  if (usuariosAuth.error) return NextResponse.json({ motivo: 'No pudimos leer las cuentas: ' + usuariosAuth.error.message }, { status: 500 });

  const emailPorUser = new Map(usuariosAuth.data.users.map((u) => [u.id, u.email ?? 'Sin correo']));
  // `banned_until` en el futuro (Supabase usa un valor muy lejano, no un booleano) == acceso bloqueado.
  const accesoBloqueadoPorUser = new Map(
    usuariosAuth.data.users.map((u) => [u.id, !!u.banned_until && new Date(u.banned_until).getTime() > Date.now()])
  );
  const duenoPorHogar = new Map((miembros.data ?? []).map((m) => [m.hogar_id, m.user_id]));
  const perrosPorHogar = new Map<string, number>();
  for (const p of perros.data ?? []) perrosPorHogar.set(p.hogar_id, (perrosPorHogar.get(p.hogar_id) ?? 0) + 1);
  const ultimaActividadPorHogar = new Map<string, string>();
  for (const r of registros.data ?? []) if (!ultimaActividadPorHogar.has(r.hogar_id)) ultimaActividadPorHogar.set(r.hogar_id, r.creado_en);

  const filas = (hogares.data ?? [])
    .map((h) => {
      const duenoId = duenoPorHogar.get(h.id);
      return {
        hogarId: h.id,
        duenoId: duenoId ?? null,
        nombre: h.nombre,
        plan: h.plan,
        correo: duenoId ? (emailPorUser.get(duenoId) ?? 'Sin correo') : 'Sin dueño asignado',
        accesoBloqueado: duenoId ? (accesoBloqueadoPorUser.get(duenoId) ?? false) : false,
        perros: perrosPorHogar.get(h.id) ?? 0,
        creadoEn: h.creado_en,
        ultimaActividad: ultimaActividadPorHogar.get(h.id) ?? null,
      };
    })
    .sort((a, b) => (b.ultimaActividad ?? b.creadoEn).localeCompare(a.ultimaActividad ?? a.creadoEn));

  return NextResponse.json({ usuarios: filas });
}
