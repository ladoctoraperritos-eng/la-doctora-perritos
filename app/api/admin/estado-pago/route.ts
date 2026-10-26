// Panel de administración — marca una familia como "activa" (para que reciba el aviso diario y no
// tope con límites del plan) sin que haya pasado por Hotmart, o la vuelve a dejar como "sin pagar".
// Pensado para cuentas agregadas a mano desde "Agregar una persona a mano" (pruebas, invitados sin
// cobro). Server-only, verifica admin.

import { NextResponse } from 'next/server';
import { verificarAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const v = await verificarAdmin(req.headers.get('authorization'));
  if (!v.ok) return NextResponse.json({ motivo: v.motivo }, { status: v.estado });
  const { admin } = v;

  let cuerpo: { hogarId?: string; accion?: 'activar' | 'desactivar' };
  try {
    cuerpo = await req.json();
  } catch {
    return NextResponse.json({ motivo: 'Faltan los datos.' }, { status: 400 });
  }
  const { hogarId, accion } = cuerpo;
  if (!hogarId || (accion !== 'activar' && accion !== 'desactivar')) {
    return NextResponse.json({ motivo: 'Faltan los datos.' }, { status: 400 });
  }

  const { error } = await admin.from('hogares').update({ estado_pago: accion === 'activar' ? 'active' : 'sin_pagar' }).eq('id', hogarId);
  if (error) return NextResponse.json({ motivo: 'No pudimos cambiar el estado: ' + error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
