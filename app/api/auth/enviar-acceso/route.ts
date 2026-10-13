// El botón "Enviarme el enlace" de /login llamaba antes directo a Supabase desde el navegador
// (con su límite bajo de correos). Ahora pasa por aquí, que manda el correo con Resend — el
// mismo camino que ya usa el acceso post-compra del webhook.
import { NextResponse } from 'next/server';
import { clienteAdmin } from '@/lib/supabase-admin';
import { enviarCorreoDeAcceso } from '@/lib/email';

export const runtime = 'nodejs';

const correoValido = (c: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.trim());

export async function POST(req: Request) {
  let cuerpo: { correo?: string };
  try {
    cuerpo = await req.json();
  } catch {
    return NextResponse.json({ ok: false, motivo: 'correo_invalido' }, { status: 400 });
  }
  const correo = (cuerpo.correo ?? '').trim();
  if (!correoValido(correo)) return NextResponse.json({ ok: false, motivo: 'correo_invalido' }, { status: 400 });

  const admin = clienteAdmin();
  if (!admin) return NextResponse.json({ ok: false, motivo: 'no_configurado' });

  // Límite: no más de un enlace por correo cada 60 segundos — sin esto, cualquiera podría
  // escribir el correo de otra persona aquí una y otra vez para saturarla de avisos.
  const { data: limite } = await admin.from('limite_envios').select('ultimo_envio').eq('correo', correo).maybeSingle();
  if (limite && Date.now() - new Date(limite.ultimo_envio).getTime() < 60_000) {
    return NextResponse.json({ ok: false, motivo: 'demasiado_pronto' }, { status: 429 });
  }
  await admin.from('limite_envios').upsert({ correo, ultimo_envio: new Date().toISOString() });

  const origen = new URL(req.url).origin;
  const { ok, motivo } = await enviarCorreoDeAcceso(admin, correo, `${origen}/app`);
  if (!ok) {
    console.error('[auth/enviar-acceso] no se pudo enviar', { motivo });
    return NextResponse.json({ ok: false, motivo: 'error_envio' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
