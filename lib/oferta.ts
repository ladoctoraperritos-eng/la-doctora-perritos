// Condiciones comerciales de la oferta — FUENTE ÚNICA de verdad para la landing y las páginas legales.
//
// REGLA: una condición solo se promete en la web si `verificada` es true, y eso solo pasa cuando
// está configurada y comprobada en la pasarela (Hotmart). Mientras sean false, la landing NO
// muestra prueba gratuita ni garantía. Estado real al 2026-09-24: la cuenta de Hotmart aún no
// existe, así que nada de esto está aplicado por ningún sistema de pagos (ver FICHA-MERCADO §4).

export interface Condiciones {
  prueba: { dias: number; verificada: boolean };
  garantia: {
    dias: number;
    verificada: boolean;
    /** Desde cuándo cuenta el plazo. 'sin_confirmar' = garantía activa pero sin fecha de inicio confirmada: se promete el plazo sin fijar cuándo empieza. null = no se promete. */
    desde: 'compra' | 'primer_cobro' | 'sin_confirmar' | null;
  };
  contacto: string;
}

export const CONDICIONES: Condiciones = {
  prueba: { dias: 7, verificada: true },
  garantia: { dias: 15, verificada: true, desde: 'sin_confirmar' },
  contacto: 'contacto@ladoctoraperritos.com',
};

export const hayPrueba = (): boolean => CONDICIONES.prueba.verificada;
export const hayGarantia = (): boolean => CONDICIONES.garantia.verificada && CONDICIONES.garantia.desde !== null;

// ── Fechas (siempre a partir de la fecha REAL en que la persona inicia; nunca una fecha fija) ──

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/** Suma meses sin desbordar (31 ene + 1 mes = 28/29 feb, no 3 mar). */
export function addMonths(d: Date, n: number): Date {
  const r = new Date(d);
  const dia = r.getDate();
  r.setDate(1);
  r.setMonth(r.getMonth() + n);
  const ultimo = new Date(r.getFullYear(), r.getMonth() + 1, 0).getDate();
  r.setDate(Math.min(dia, ultimo));
  return r;
}

export function formatFecha(d: Date): string {
  return new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
}

export type Periodo = 'mes' | 'anio';

export interface LineaResumen {
  etiqueta: string;
  valor: string;
  destacada?: boolean;
}

export interface Resumen {
  lineas: LineaResumen[];
  /** Aclaración del importe (anual: qué significa «equivale a»). */
  nota?: string;
  /** Solo si la garantía está definida y verificada. */
  garantia?: string;
}

/**
 * Resumen de cobro junto al botón de cada plan.
 * `inicio` = momento real en que la persona empieza (se lee en el navegador).
 */
export function resumenCobro(args: {
  inicio: Date;
  periodo: Periodo;
  importe: string;
  /** Solo anual: «US$4,08 al mes». */
  equivalente?: string;
}): Resumen {
  const { inicio, periodo, importe, equivalente } = args;
  const cadaPeriodo = periodo === 'anio' ? 'cada año' : 'cada mes';
  const sumar = (d: Date) => (periodo === 'anio' ? addMonths(d, 12) : addMonths(d, 1));

  let lineas: LineaResumen[];
  let primerCobro: Date;

  if (hayPrueba()) {
    primerCobro = addDays(inicio, CONDICIONES.prueba.dias);
    lineas = [
      { etiqueta: 'Hoy pagas', valor: 'US$0', destacada: true },
      { etiqueta: 'Primer cobro', valor: `${importe} el ${formatFecha(primerCobro)}` },
      { etiqueta: 'Renovación', valor: `${importe} ${cadaPeriodo}` },
    ];
  } else {
    primerCobro = inicio;
    lineas = [
      { etiqueta: 'Hoy pagas', valor: importe, destacada: true },
      { etiqueta: 'Próxima renovación', valor: `${formatFecha(sumar(inicio))}, y luego ${cadaPeriodo}` },
    ];
  }

  const resumen: Resumen = { lineas };
  if (periodo === 'anio' && equivalente) {
    resumen.nota = `Equivale a ${equivalente}, pero se cobra ${importe} una sola vez al año.`;
  }
  if (hayGarantia()) {
    const c = CONDICIONES.garantia;
    if (c.desde === 'sin_confirmar') {
      resumen.garantia = `Garantía de ${c.dias} días sobre tu primer pago.`;
    } else {
      const base = c.desde === 'compra' ? inicio : primerCobro;
      const limite = addDays(base, c.dias);
      const desde = c.desde === 'compra' ? 'el día de tu compra' : 'tu primer cobro';
      resumen.garantia = `Garantía de ${c.dias} días desde ${desde} (hasta el ${formatFecha(limite)}).`;
    }
  }
  return resumen;
}
