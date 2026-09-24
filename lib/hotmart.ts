// Enlaces de pago de Hotmart: una oferta por plan y periodo (4 en total).
// Se cargan de variables de entorno (.env.local y el hosting); si falta alguna, el paywall
// muestra el botón desactivado en vez de mandar a ninguna parte.
import type { IdPlan } from './onboarding';

export type PeriodoPago = 'mes' | 'anio';

const URLS: Record<IdPlan, Record<PeriodoPago, string | undefined>> = {
  esencial: {
    mes: process.env.NEXT_PUBLIC_HOTMART_ESENCIAL_MENSUAL,
    anio: process.env.NEXT_PUBLIC_HOTMART_ESENCIAL_ANUAL,
  },
  familia: {
    mes: process.env.NEXT_PUBLIC_HOTMART_FAMILIA_MENSUAL,
    anio: process.env.NEXT_PUBLIC_HOTMART_FAMILIA_ANUAL,
  },
};

export function urlCheckout(plan: IdPlan, periodo: PeriodoPago): string | null {
  const url = URLS[plan][periodo];
  return url && url.startsWith('https://') ? url : null;
}
