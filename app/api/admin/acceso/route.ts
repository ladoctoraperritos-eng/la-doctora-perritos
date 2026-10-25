// Panel de administración — quitar o restaurar el acceso de una familia SIN borrar sus datos.
// "Quitar acceso" bloquea el inicio de sesión del dueño de esa familia (perros, cuidados e
// historial quedan intactos); "restaurar" lo vuelve a dejar entrar. Server-only, verifica admin.

import { NextResponse } from 'next/server';
import { verificarAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const v = await verificarAdmin(req.headers.get('authorization'));
  if (!v.ok) return NextResponse.json({ motivo: v.motivo }, { status: v.estado });
  const { admin } = v;

  let cuerpo: { userId?: string; accion?: 'quitar' | 'restaurar' };
  try {
    cuerpo = await req.json();
  } catch {
    return NextResponse.json({ motivo: 'Faltan los datos.' }, { status: 400 });
  }
  const { userId, accion } = cuerpo;
  if (!userId || (accion !== 'quitar' && accion !== 'restaurar')) {
    return NextResponse.json({ motivo: 'Faltan los datos.' }, { status: 400 });
  }

  const { error } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: accion === 'quitar' ? '876000h' : 'none',
  });
  if (error) return NextResponse.json({ motivo: 'No pudimos cambiar el acceso: ' + error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
