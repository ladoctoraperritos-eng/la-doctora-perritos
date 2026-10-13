// Qué hace cada aviso de Hotmart con el acceso de un hogar. Los nombres EXACTOS de los eventos
// (el campo "event" del aviso) son los que documenta Hotmart en su API — el panel los muestra
// traducidos ("Compra aprobada"), pero el aviso que llega siempre usa el nombre en inglés.
// ⚠️ TRIAL: no vimos un evento propio de "inicio de prueba" en el panel de la cuenta — es
// probable que el inicio de la prueba llegue como PURCHASE_APPROVED con el importe en 0. Eso se
// confirma con la primera compra de prueba real (ver PRUEBA-HOTMART.md); hasta entonces, un
// PURCHASE_APPROVED con valor 0 también se trata como 'trialing', no 'active'.

export type EstadoPago = 'trialing' | 'active' | 'past_due' | 'cancelled' | 'expired' | 'refunded' | 'chargeback';

const EVENTO_A_ESTADO: Record<string, EstadoPago> = {
  PURCHASE_APPROVED: 'active',
  PURCHASE_COMPLETE: 'active',
  PURCHASE_DELAYED: 'past_due',
  SUBSCRIPTION_CANCELLATION: 'cancelled',
  PURCHASE_EXPIRED: 'expired',
  PURCHASE_REFUNDED: 'refunded',
  PURCHASE_CHARGEBACK: 'chargeback',
};

export const EVENTO_CAMBIO_PLAN = 'SWITCH_PLAN';

/** Eventos que SOLO se registran (bitácora) pero no cambian el acceso todavía. */
const EVENTOS_INFORMATIVOS = new Set([
  'PURCHASE_CANCELED', // compra cancelada antes de completarse (no es lo mismo que reembolso)
  'PURCHASE_WAITING_PAYMENT',
  'PURCHASE_REFUND_REQUESTED',
  'PURCHASE_BILLET_PRINTED',
]);

export function esEventoInformativo(evento: string): boolean {
  return EVENTOS_INFORMATIVOS.has(evento);
}

/** `valorCentavos === 0` es la señal de que un PURCHASE_APPROVED es en realidad el inicio de
 * la prueba gratis, no un cobro real — (verificar) con la primera compra de prueba. */
export function estadoParaEvento(evento: string, valorCentavos: number | null): EstadoPago | null {
  const base = EVENTO_A_ESTADO[evento];
  if (!base) return null;
  if (base === 'active' && valorCentavos === 0) return 'trialing';
  return base;
}

/** A qué plan (esencial/familia) corresponde cada oferta de Hotmart — ajustar si se crean más. */
const OFERTA_A_PLAN: Record<string, 'esencial' | 'familia'> = {
  '8sff7dkv': 'esencial', // Esencial mensual
  tnvge31b: 'esencial', // Esencial anual
  '3u8dzfal': 'familia', // Familia mensual
  f888hid4: 'familia', // Familia anual
};

export function planParaOferta(codigoOferta: string | undefined): 'esencial' | 'familia' {
  if (!codigoOferta) return 'esencial';
  return OFERTA_A_PLAN[codigoOferta] ?? 'esencial';
}
