// Corre una vez al día (ver vercel.json): manda el correo de bienvenida del día 1, 3 o 7 a cada
// hogar que ya pagó por primera vez y todavía no lo recibió ese día. Protegido con CRON_SECRET
// — Vercel lo manda solo en el header Authorization cuando el cron está configurado así.
import { NextResponse } from 'next/server';
import { clienteAdmin } from '@/lib/supabase-admin';
import { enviarCorreoBienvenidaDia } from '@/lib/email';

export const runtime = 'nodejs';
export const maxDuration = 60;

const DIAS: { dia: 1 | 3 | 7; columna: 'bienvenida_d1_enviado' | 'bienvenida_d3_enviado' | 'bienvenida_d7_enviado' }[] = [
  { dia: 1, columna: 'bienvenida_d1_enviado' },
  { dia: 3, columna: 'bienvenida_d3_enviado' },
  { dia: 7, columna: 'bienvenida_d7_enviado' },
];

export async function GET(req: Request) {
  const secreto = process.env.CRON_SECRET;
  const auth = req.headers.get('authorization');
  if (!secreto || auth !== `Bearer ${secreto}`) {
    return NextResponse.json({ error: 'no autorizado' }, { status: 401 });
  }

  const admin = clienteAdmin();
  if (!admin) return NextResponse.json({ error: 'servidor sin configurar' }, { status: 500 });

  const resultados: Record<string, number> = {};
  for (const { dia, columna } of DIAS) {
    // Ventana de 24h alrededor del día exacto (el cron corre una vez al día, no a una hora fija
    // respecto al pago de cada quien) — evita mandar el del día 1 recién al día 2 por el desfase.
    const desde = new Date(Date.now() - (dia + 1) * 86400000).toISOString();
    const hasta = new Date(Date.now() - (dia - 1) * 86400000).toISOString();

    const { data: hogares, error } = await admin
      .from('hogares')
      .select('id, hotmart_email')
      .eq(columna, false)
      .not('first_paid_at', 'is', null)
      .not('hotmart_email', 'is', null)
      .gte('first_paid_at', desde)
      .lt('first_paid_at', hasta);

    if (error) {
      console.error('[cron bienvenida] error al buscar hogares', { dia, codigo: error.code });
      continue;
    }

    let enviados = 0;
    for (const h of hogares ?? []) {
      if (!h.hotmart_email) continue;
      const { ok, motivo } = await enviarCorreoBienvenidaDia(h.hotmart_email, dia);
      if (ok) {
        await admin.from('hogares').update({ [columna]: true }).eq('id', h.id);
        enviados++;
      } else {
        console.error('[cron bienvenida] no se pudo enviar', { dia, hogar: h.id, motivo });
      }
    }
    resultados[`dia_${dia}`] = enviados;
  }

  return NextResponse.json({ ok: true, enviados: resultados });
}
