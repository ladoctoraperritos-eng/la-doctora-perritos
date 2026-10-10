// Borrar mi cuenta, de verdad: cumple el derecho de eliminación que promete /privacidad. Antes,
// el botón "Borrar todos mis datos" de la app solo limpiaba el navegador — los datos sincronizados
// en la nube (perros, cuidados, registros, tutores) seguían existiendo. Esto los borra de verdad.
//
// Si la persona es la ÚNICA de su familia, se borra la familia completa (hogares, con cascada a
// todo lo demás) y su cuenta de acceso. Si cuida junto a otras personas, solo se borra SU acceso y
// SU cuenta — los datos compartidos de la familia (que otros siguen usando) no se tocan.

import { NextResponse } from 'next/server';
import { verificarUsuario } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const v = await verificarUsuario(req.headers.get('authorization'));
  if (!v.ok) return NextResponse.json({ motivo: v.motivo }, { status: v.estado });
  const { admin, user } = v;

  const { data: miembros, error: errMiembros } = await admin.from('miembros_hogar').select('hogar_id').eq('user_id', user.id);
  if (errMiembros) {
    console.error('[cuenta/eliminar] no se pudo leer la familia del usuario', user.id, errMiembros);
    return NextResponse.json({ motivo: 'No pudimos revisar tu familia. Intenta de nuevo en un momento.' }, { status: 500 });
  }

  for (const m of miembros ?? []) {
    const { count } = await admin.from('miembros_hogar').select('user_id', { count: 'exact', head: true }).eq('hogar_id', m.hogar_id);
    if ((count ?? 0) <= 1) {
      // Eres la única persona de esta familia: se borra la familia completa (cascada a perros,
      // cuidados, registros, tutores, notas, veterinarios, invitaciones).
      const { error } = await admin.from('hogares').delete().eq('id', m.hogar_id);
      if (error) {
        console.error('[cuenta/eliminar] no se pudo borrar el hogar', m.hogar_id, error);
        return NextResponse.json({ motivo: 'No pudimos borrar tus datos. Intenta de nuevo en un momento.' }, { status: 500 });
      }
    } else {
      // Hay más personas cuidando en esta familia: solo se quita TU acceso, no los datos de todos.
      const { error } = await admin.from('miembros_hogar').delete().eq('hogar_id', m.hogar_id).eq('user_id', user.id);
      if (error) {
        console.error('[cuenta/eliminar] no se pudo quitar el acceso', user.id, m.hogar_id, error);
        return NextResponse.json({ motivo: 'No pudimos quitar tu acceso. Intenta de nuevo en un momento.' }, { status: 500 });
      }
    }
  }

  // Si esta cuenta también administraba el panel, se le quita ese acceso también.
  await admin.from('admins').delete().eq('user_id', user.id);

  const { error: errAuth } = await admin.auth.admin.deleteUser(user.id);
  if (errAuth) {
    console.error('[cuenta/eliminar] no se pudo cerrar la cuenta de acceso', user.id, errAuth);
    return NextResponse.json({ motivo: 'Borramos tus datos, pero no pudimos cerrar tu cuenta de acceso. Escríbenos para terminarlo.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
