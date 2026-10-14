// Corre una vez al día (límite del plan gratis de hosting — ver ESTADO.md "sistema de avisos").
// Por cada hogar con acceso activo, arma un solo correo con lo que toca HOY (cuidados con hora fija
// aún sin marcar) y lo que se acerca (vacunas/baños/reposición de stock, dentro de su margen de
// anticipación). Sustituye por ahora a la notificación push, que todavía no existe.
import { NextResponse } from 'next/server';
import { clienteAdmin } from '@/lib/supabase-admin';
import { enviarCorreoAvisoDiario } from '@/lib/email';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface Ajustes {
  avisoHora?: boolean;
  avisoStock?: boolean;
  avisoFechas?: boolean;
  anticipacion?: number;
}

export async function GET(req: Request) {
  const secreto = process.env.CRON_SECRET;
  const auth = req.headers.get('authorization');
  if (!secreto || auth !== `Bearer ${secreto}`) {
    return NextResponse.json({ error: 'no autorizado' }, { status: 401 });
  }

  const admin = clienteAdmin();
  if (!admin) return NextResponse.json({ error: 'servidor sin configurar' }, { status: 500 });

  const hoy = new Date();
  const hoyClave = hoy.toISOString().slice(0, 10);

  const { data: hogares, error } = await admin.from('hogares').select('id, ajustes').in('estado_pago', ['trialing', 'active']);
  if (error) {
    console.error('[cron avisos] error al leer hogares', { codigo: error.code });
    return NextResponse.json({ error: 'no se pudo leer hogares' }, { status: 500 });
  }

  let correosEnviados = 0;
  let hogaresConAviso = 0;

  for (const hogar of hogares ?? []) {
    const ajustes = (hogar.ajustes ?? {}) as Ajustes;
    if (ajustes.avisoHora === false && ajustes.avisoStock === false && ajustes.avisoFechas === false) continue;
    const anticipacion = ajustes.anticipacion ?? 5;

    const { data: perros } = await admin.from('perros').select('id, nombre').eq('hogar_id', hogar.id);
    if (!perros || perros.length === 0) continue;
    const nombrePorPerro = new Map(perros.map((p) => [p.id as string, p.nombre as string]));

    const { data: cuidados } = await admin
      .from('cuidados')
      .select('id, perro_id, nombre, hora, proxima')
      .eq('hogar_id', hogar.id)
      .in('perro_id', perros.map((p) => p.id as string));
    if (!cuidados || cuidados.length === 0) continue;

    const { data: registrosHoy } = await admin.from('registros').select('cuidado_id').eq('hogar_id', hogar.id).eq('dia', hoyClave);
    const hechosHoy = new Set((registrosHoy ?? []).map((r) => r.cuidado_id as string));

    const pendientesHoy =
      ajustes.avisoHora === false
        ? []
        : cuidados
            .filter((c) => c.hora && !hechosHoy.has(c.id as string))
            .map((c) => ({ nombre: c.nombre as string, hora: c.hora as string, perro: nombrePorPerro.get(c.perro_id as string) ?? '' }));

    const proximos =
      ajustes.avisoStock === false && ajustes.avisoFechas === false
        ? []
        : cuidados
            .filter((c) => {
              if (!c.proxima) return false;
              const dias = Math.round((new Date(c.proxima as string + 'T00:00:00').getTime() - new Date(hoyClave + 'T00:00:00').getTime()) / 86400000);
              return dias >= 0 && dias <= anticipacion;
            })
            .map((c) => ({ nombre: c.nombre as string, perro: nombrePorPerro.get(c.perro_id as string) ?? '', proxima: c.proxima as string }));

    if (pendientesHoy.length === 0 && proximos.length === 0) continue;
    hogaresConAviso++;

    const { data: miembros } = await admin.from('miembros_hogar').select('user_id').eq('hogar_id', hogar.id);
    for (const m of miembros ?? []) {
      const { data: u } = await admin.auth.admin.getUserById(m.user_id as string);
      const correo = u.user?.email;
      if (!correo) continue;
      const { ok, motivo } = await enviarCorreoAvisoDiario(correo, { pendientesHoy, proximos });
      if (ok) correosEnviados++;
      else console.error('[cron avisos] no se pudo mandar el aviso', { hogar: hogar.id, motivo });
    }
  }

  return NextResponse.json({ ok: true, hogaresConAviso, correosEnviados });
}
