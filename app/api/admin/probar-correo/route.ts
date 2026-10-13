// Herramienta de prueba para la dueña: manda cualquiera de los correos del negocio a su propia
// casilla, para confirmar que se ven bien y que llegan — sin tocar datos de ningún cliente real.
import { NextResponse } from 'next/server';
import { verificarAdmin } from '@/lib/supabase-admin';
import {
  enviarCorreoDeAcceso,
  enviarCorreoEbook,
  enviarCorreoPagoFallido,
  enviarCorreoCancelacion,
  enviarCorreoCarritoAbandonado,
  enviarCorreoBienvenidaDia,
} from '@/lib/email';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const v = await verificarAdmin(req.headers.get('authorization'));
  if (!v.ok) return NextResponse.json({ motivo: v.motivo }, { status: v.estado });
  const { admin, user } = v;
  const email = user.email;
  if (!email) return NextResponse.json({ motivo: 'Tu cuenta no tiene correo.' }, { status: 400 });

  let cuerpo: { tipo?: string };
  try {
    cuerpo = await req.json();
  } catch {
    return NextResponse.json({ motivo: 'Faltan los datos.' }, { status: 400 });
  }

  const origen = new URL(req.url).origin;
  const nombrePrueba = 'Camila (prueba)';
  let resultado: { ok: boolean; motivo?: string };

  switch (cuerpo.tipo) {
    case 'acceso':
      resultado = await enviarCorreoDeAcceso(admin, email, `${origen}/app`, nombrePrueba);
      break;
    case 'ebook':
      resultado = await enviarCorreoEbook(admin, email, nombrePrueba);
      break;
    case 'pago_fallido':
      resultado = await enviarCorreoPagoFallido(email, nombrePrueba, 5);
      break;
    case 'cancelacion':
      resultado = await enviarCorreoCancelacion(email, nombrePrueba, '15 de noviembre de 2026');
      break;
    case 'carrito':
      resultado = await enviarCorreoCarritoAbandonado(email, nombrePrueba);
      break;
    case 'bienvenida_d1':
      resultado = await enviarCorreoBienvenidaDia(email, 1);
      break;
    case 'bienvenida_d3':
      resultado = await enviarCorreoBienvenidaDia(email, 3);
      break;
    case 'bienvenida_d7':
      resultado = await enviarCorreoBienvenidaDia(email, 7);
      break;
    default:
      return NextResponse.json({ motivo: 'Tipo de correo desconocido.' }, { status: 400 });
  }

  if (!resultado.ok) return NextResponse.json({ motivo: resultado.motivo ?? 'No se pudo enviar.' }, { status: 500 });
  return NextResponse.json({ ok: true, correo: email });
}
