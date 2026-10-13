// Panel de administración — agregar una persona a mano (correo + nombre), por si el acceso
// automático no le llegó o el dueño quiere sumarla él mismo. Crea la cuenta y le reenvía el acceso.

import { NextResponse } from 'next/server';
import { verificarAdmin } from '@/lib/supabase-admin';
import { enviarCorreoDeAcceso } from '@/lib/email';

export const runtime = 'nodejs';

const correoValido = (c: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.trim());

export async function POST(req: Request) {
  const v = await verificarAdmin(req.headers.get('authorization'));
  if (!v.ok) return NextResponse.json({ motivo: v.motivo }, { status: v.estado });
  const { admin } = v;

  let cuerpo: { correo?: string; nombre?: string };
  try {
    cuerpo = await req.json();
  } catch {
    return NextResponse.json({ motivo: 'Faltan los datos.' }, { status: 400 });
  }
  const correo = (cuerpo.correo ?? '').trim();
  const nombre = (cuerpo.nombre ?? '').trim();
  if (!correoValido(correo)) return NextResponse.json({ motivo: 'Escribe un correo válido.' }, { status: 400 });
  if (!nombre) return NextResponse.json({ motivo: 'Escribe un nombre.' }, { status: 400 });

  const origen = new URL(req.url).origin;
  const { data, error } = await admin.auth.admin.createUser({ email: correo, email_confirm: true, user_metadata: { nombre } });
  const yaExiste = error && (error.status === 422 || /already registered|already exists/i.test(error.message));

  if (error && !yaExiste) {
    return NextResponse.json({ motivo: 'No pudimos crear la cuenta: ' + error.message }, { status: 500 });
  }

  const { ok, motivo } = await enviarCorreoDeAcceso(admin, correo, `${origen}/app`, nombre);
  if (!ok) return NextResponse.json({ motivo: 'La cuenta existe pero no pudimos mandar el acceso: ' + motivo }, { status: 500 });

  return NextResponse.json({ ok: true, reenviado: !!yaExiste, userId: data?.user?.id });
}
