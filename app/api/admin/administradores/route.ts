// Panel de administración — quién tiene acceso al panel (no a la app, al PANEL). Server-only: solo
// un administrador ya verificado puede ver o agregar a otro. Distinto de /api/admin/invitar, que es
// para darle acceso a la APP a un cliente, no al panel de administración.

import { NextResponse } from 'next/server';
import { verificarAdmin } from '@/lib/supabase-admin';
import { enviarCorreoDeAcceso } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const correoValido = (c: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.trim());

export async function GET(req: Request) {
  const v = await verificarAdmin(req.headers.get('authorization'));
  if (!v.ok) return NextResponse.json({ motivo: v.motivo }, { status: v.estado });
  const { admin } = v;

  const { data: filas, error } = await admin.from('admins').select('user_id, nombre, creado_en').order('creado_en', { ascending: true });
  if (error) return NextResponse.json({ motivo: 'No pudimos leer los administradores: ' + error.message }, { status: 500 });

  const administradores = await Promise.all(
    (filas ?? []).map(async (f) => {
      const { data: u } = await admin.auth.admin.getUserById(f.user_id as string);
      return { userId: f.user_id as string, nombre: (f.nombre as string | null) ?? 'Sin nombre', correo: u.user?.email ?? 'Correo no encontrado', creadoEn: f.creado_en as string };
    })
  );

  return NextResponse.json({ administradores, soyYo: v.user.id });
}

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

  // Busca si ya existe una cuenta con ese correo (puede ser una clienta que ya usa la app, o alguien
  // nuevo). Si no existe, se crea; el acceso se manda por Resend (enviarCorreoDeAcceso), igual que
  // el resto de los correos del negocio — ya no por el envío integrado de Supabase.
  const origen = new URL(req.url).origin;
  let userId: string | undefined;
  const { data: creado, error: errCrear } = await admin.auth.admin.createUser({ email: correo, email_confirm: true, user_metadata: { nombre } });
  if (errCrear) {
    if (errCrear.status === 422 || /already registered|already exists/i.test(errCrear.message)) {
      const { data: lista, error: errLista } = await admin.auth.admin.listUsers();
      if (errLista) return NextResponse.json({ motivo: 'No pudimos buscar esa cuenta: ' + errLista.message }, { status: 500 });
      userId = lista.users.find((u) => u.email?.toLowerCase() === correo.toLowerCase())?.id;
      if (!userId) return NextResponse.json({ motivo: 'Esa cuenta existe pero no la pudimos encontrar.' }, { status: 500 });
    } else {
      return NextResponse.json({ motivo: 'No pudimos crear la cuenta: ' + errCrear.message }, { status: 500 });
    }
  } else {
    userId = creado.user?.id;
  }
  if (!userId) return NextResponse.json({ motivo: 'No se pudo identificar la cuenta.' }, { status: 500 });

  const { error: errInsertar } = await admin.from('admins').upsert({ user_id: userId, nombre }, { onConflict: 'user_id' });
  if (errInsertar) return NextResponse.json({ motivo: 'No pudimos darle el acceso: ' + errInsertar.message }, { status: 500 });

  const { ok, motivo } = await enviarCorreoDeAcceso(admin, correo, `${origen}/admin`, nombre);
  if (!ok) return NextResponse.json({ motivo: 'Se le dio acceso al panel, pero no pudimos mandarle el correo: ' + motivo }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const v = await verificarAdmin(req.headers.get('authorization'));
  if (!v.ok) return NextResponse.json({ motivo: v.motivo }, { status: v.estado });
  const { admin, user } = v;

  const { userId } = (await req.json().catch(() => ({}))) as { userId?: string };
  if (!userId) return NextResponse.json({ motivo: 'Falta indicar a quién quitar.' }, { status: 400 });
  if (userId === user.id) return NextResponse.json({ motivo: 'No puedes quitarte el acceso a ti misma desde aquí.' }, { status: 400 });

  const { error } = await admin.from('admins').delete().eq('user_id', userId);
  if (error) return NextResponse.json({ motivo: 'No pudimos quitar el acceso: ' + error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
