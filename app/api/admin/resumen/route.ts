// Panel de administración — resumen. Server-only: verifica admin, calcula métricas REALES con las
// tablas que ya existen (hogares, perros, cuidados, registros) y marca "sin datos" lo que todavía no
// se puede medir (ventas, IA, errores) en vez de inventarlo. Ver docs/sistema/21-BACKOFFICE.md.

import { NextResponse } from 'next/server';
import { verificarAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const diasAtras = (n: number) => new Date(Date.now() - n * 86400000).toISOString();
const diaClave = (iso: string) => iso.slice(0, 10);

export async function GET(req: Request) {
  const v = await verificarAdmin(req.headers.get('authorization'));
  if (!v.ok) return NextResponse.json({ motivo: v.motivo }, { status: v.estado });
  const { admin, user } = v;

  const [hogares, perros, cuidados, registros, errores30d, eventos, miAdmin] = await Promise.all([
    admin.from('hogares').select('id, creado_en'),
    admin.from('perros').select('id, hogar_id'),
    admin.from('cuidados').select('id, hogar_id'),
    admin.from('registros').select('hogar_id, creado_en').gte('creado_en', diasAtras(30)),
    admin.from('error_log').select('id, mensaje, contexto, creado_en').gte('creado_en', diasAtras(30)).order('creado_en', { ascending: false }).limit(50),
    admin.from('event_log').select('tipo, creado_en').gte('creado_en', diasAtras(30)),
    admin.from('admins').select('nombre').eq('user_id', user.id).maybeSingle(),
  ]);
  for (const r of [hogares, perros, cuidados, registros, errores30d, eventos]) {
    if (r.error) return NextResponse.json({ motivo: 'No pudimos leer los datos: ' + r.error.message }, { status: 500 });
  }

  const totalHogares = hogares.data?.length ?? 0;
  const hogaresConActividad = (dias: number) => {
    const corte = diasAtras(dias);
    const activos = new Set((registros.data ?? []).filter((r) => r.creado_en >= corte).map((r) => r.hogar_id));
    return activos.size;
  };
  const activos7 = hogaresConActividad(7);
  const activos30 = hogaresConActividad(30);
  const nuevosEstaSemana = (hogares.data ?? []).filter((h) => h.creado_en >= diasAtras(7)).length;

  // Registros por día (últimos 14) para el gráfico de uso — Tufte: solo la serie, sin rejillas ni 3D.
  const porDia = new Map<string, number>();
  for (let i = 13; i >= 0; i--) porDia.set(diaClave(diasAtras(i)), 0);
  for (const r of registros.data ?? []) {
    const clave = diaClave(r.creado_en);
    if (porDia.has(clave)) porDia.set(clave, (porDia.get(clave) ?? 0) + 1);
  }
  const usoPorDia = Array.from(porDia, ([dia, cantidad]) => ({ dia, cantidad }));

  // Embudo del onboarding: cuenta eventos del event_log si ya los hay (empieza vacío a propósito).
  const EVENTOS_FUNNEL = ['onboarding_started', 'pet_named', 'priority_selected', 'first_care_configured', 'notifications_requested', 'first_panel_viewed', 'paywall_viewed', 'trial_started'];
  const conteoEventos = new Map<string, number>();
  for (const e of eventos.data ?? []) conteoEventos.set(e.tipo, (conteoEventos.get(e.tipo) ?? 0) + 1);
  const embudoOnboarding = EVENTOS_FUNNEL.map((tipo) => ({ tipo, cantidad: conteoEventos.get(tipo) ?? 0 }));
  const hayEventos = eventos.data && eventos.data.length > 0;

  // Avisos automáticos (21-BACKOFFICE): qué pasó → por qué importa → qué hacer, en simple.
  const avisos: { nivel: 'alerta' | 'info' | 'ok'; texto: string }[] = [];
  if ((errores30d.data?.length ?? 0) > 0) {
    avisos.push({ nivel: 'alerta', texto: `Hubo ${errores30d.data!.length} error(es) registrados en los últimos 30 días. Revisa la sección Salud para ver cuáles se repiten más.` });
  }
  // Los detalles de ventas/negocio/IA ya se explican en su propia sección más abajo: aquí solo se
  // avisa lo urgente (errores) o que todo está en orden, para no repetir el mismo texto dos veces.
  if (avisos.filter((a) => a.nivel === 'alerta').length === 0) avisos.unshift({ nivel: 'ok', texto: 'Todo en orden: no hay alertas de dinero ni de errores graves este mes.' });

  return NextResponse.json({
    admin: { nombre: miAdmin.data?.nombre ?? null, correo: user.email ?? null },
    usuarios: { total: totalHogares, activos7, activos30, nuevosEstaSemana },
    uso: {
      totalPerros: perros.data?.length ?? 0,
      totalCuidados: cuidados.data?.length ?? 0,
      totalRegistros30d: registros.data?.length ?? 0,
      usoPorDia,
      embudoOnboarding,
      hayEventos,
    },
    ventas: { sinDatos: true, motivo: 'Todavía no está conectado el aviso automático que Hotmart manda cuando alguien paga.' },
    negocio: { sinDatos: true, motivo: 'Lo que entra, lo que queda limpio y cuánto vale cada cliente se calculan en cuanto haya ventas registradas.' },
    ia: { sinDatos: true, motivo: 'La app no usa inteligencia artificial todavía, así que no hay costo que medir.' },
    errores: { total30d: errores30d.data?.length ?? 0, recientes: errores30d.data ?? [] },
    avisos,
  });
}
