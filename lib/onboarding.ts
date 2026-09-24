// Respuestas del onboarding. Viven en el navegador (localStorage) hasta que la persona paga y crea su
// cuenta: registro DESPUÉS del primer valor (02B). Nada de esto sale del dispositivo por ahora.

export type Etapa = 'cachorro' | 'adulto' | 'senior';
export type Cuidado = 'medicamento' | 'suplemento' | 'comida' | 'solo_controles';
export type Cuidadores = 'solo_yo' | 'pareja' | 'familia' | 'cuidador';
export type Momento = 'manana' | 'mediodia' | 'noche' | 'varias';
export type CantidadPerros = '1' | '2' | '3_o_mas';

export interface Respuestas {
  nombre: string;
  cantidad: CantidadPerros | null;
  etapa: Etapa | null;
  cuidados: Cuidado[];
  cuidadores: Cuidadores | null;
  momento: Momento | null;
  /** Primera victoria: marcó como «dado» el primer cuidado de su Panel de Hoy. */
  primeraVictoria: boolean;
}

export const VACIAS: Respuestas = {
  nombre: '',
  cantidad: null,
  etapa: null,
  cuidados: [],
  cuidadores: null,
  momento: null,
  primeraVictoria: false,
};

const CLAVE = 'ldp-onboarding-v1';

export function leer(): Respuestas {
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    if (!crudo) return { ...VACIAS };
    return { ...VACIAS, ...(JSON.parse(crudo) as Partial<Respuestas>) };
  } catch {
    return { ...VACIAS };
  }
}

export function guardar(r: Respuestas): void {
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(r));
  } catch {
    // Navegación privada o almacenamiento bloqueado: el flujo sigue con el estado en memoria.
  }
}

export function borrar(): void {
  try {
    window.localStorage.removeItem(CLAVE);
  } catch {
    // sin almacenamiento: nada que borrar
  }
}

/** Cuántas respuestas reales dio (alimenta «Hecho con tus N respuestas» en el paywall). */
export function contarRespuestas(r: Respuestas): number {
  return [r.nombre.trim() !== '', r.cantidad, r.etapa, r.cuidados.length > 0, r.cuidadores, r.momento].filter(Boolean).length;
}

export type IdPlan = 'esencial' | 'familia';

/** El plan que corresponde según cuántos perros tiene (Esencial hasta 2, Familia de 3 a 5). */
export function planRecomendado(r: Respuestas): IdPlan {
  return r.cantidad === '3_o_mas' ? 'familia' : 'esencial';
}

export const HORA_POR_MOMENTO: Record<Momento, string> = {
  manana: '08:00',
  mediodia: '13:00',
  noche: '19:00',
  varias: '08:00',
};

export interface ItemHoy {
  id: string;
  titulo: string;
  detalle: string;
  /** Etiqueta a la derecha de la fila: hora del aviso o cuánto falta. */
  hora?: string;
  tipo: 'medicamento' | 'suplemento' | 'comida' | 'control';
}

/** Arma el «Panel de Hoy» de ejemplo con lo que la persona contó (datos de ejemplo marcados como tales). */
export function armarPanel(r: Respuestas): ItemHoy[] {
  const hora = r.momento ? HORA_POR_MOMENTO[r.momento] : '08:00';
  const items: ItemHoy[] = [];
  if (r.cuidados.includes('medicamento')) {
    items.push({ id: 'med', titulo: 'Medicamento', detalle: 'Tú pones el nombre y la dosis', hora, tipo: 'medicamento' });
  }
  if (r.cuidados.includes('suplemento')) {
    items.push({ id: 'sup', titulo: 'Suplemento', detalle: 'Con su comida', hora, tipo: 'suplemento' });
  }
  if (r.cuidados.includes('comida')) {
    items.push({ id: 'com', titulo: 'Comida', detalle: 'Quedan ~8 días de ejemplo', hora: '8 días', tipo: 'comida' });
  }
  const controlEtapa =
    r.etapa === 'cachorro' ? 'Vacunas del primer año' : r.etapa === 'senior' ? 'Control veterinario de rutina' : 'Antiparasitario y vacunas';
  items.push({ id: 'ctl', titulo: controlEtapa, detalle: 'Con fecha y aviso anticipado', hora: '12 días', tipo: 'control' });
  return items;
}

// ── Almacén reactivo (para useSyncExternalStore) ──
let estado: Respuestas | null = null;
const oyentes = new Set<() => void>();
const avisar = () => oyentes.forEach((f) => f());

export const obtener = (): Respuestas => (estado ??= leer());
export const suscribir = (f: () => void) => {
  oyentes.add(f);
  return () => {
    oyentes.delete(f);
  };
};
export function actualizar(parcial: Partial<Respuestas>): void {
  estado = { ...obtener(), ...parcial };
  guardar(estado);
  avisar();
}
export function reiniciar(): void {
  estado = { ...VACIAS };
  borrar();
  avisar();
}
