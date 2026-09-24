// Respuestas del onboarding. Viven en el navegador (localStorage) hasta que la persona paga y crea su
// cuenta: registro DESPUÉS del primer valor (02B). Nada de esto sale del dispositivo por ahora.
// Flujo: nombre → «qué te gustaría dejar de recordar» (hasta 3) → una mini-configuración real por cada
// elección → aviso en contexto → Panel armado con SUS datos. Lo demás (raza, peso, historial) va en el perfil.

export type Olvido =
  | 'medicamentos'
  | 'vacunas'
  | 'alimento'
  | 'quien'
  | 'documentos'
  | 'emergencia';
export type Frecuencia = '1_dia' | '2_dia' | 'semana';
export type Momento = 'manana' | 'mediodia' | 'noche';
export type Dias = '7' | '15' | '30' | 'no_se';
export type Anticipacion = '3' | '5' | '7';
export type TipoControl = 'vacuna' | 'antiparasitario' | 'veterinario';
export type Cuando = 'semana' | 'mes' | 'meses' | 'no_se';
export type Cuidadores = 'solo_yo' | 'pareja' | 'familia' | 'cuidador' | 'varias';
export type Avisos = 'si' | 'no';

export interface Respuestas {
  nombre: string;
  olvidos: Olvido[];
  medNombre: string;
  medFrecuencia: Frecuencia | null;
  medHora: Momento | null;
  stockDias: Dias | null;
  comidaDias: Dias | null;
  comidaAviso: Anticipacion | null;
  controlTipo: TipoControl | null;
  controlCuando: Cuando | null;
  cuidadores: Cuidadores | null;
  avisos: Avisos | null;
  /** Primera victoria: marcó como «dado» el primer cuidado de su Panel de Hoy. */
  primeraVictoria: boolean;
}

export const VACIAS: Respuestas = {
  nombre: '',
  olvidos: [],
  medNombre: '',
  medFrecuencia: null,
  medHora: null,
  stockDias: null,
  comidaDias: null,
  comidaAviso: null,
  controlTipo: null,
  controlCuando: null,
  cuidadores: null,
  avisos: null,
  primeraVictoria: false,
};

export const MAX_OLVIDOS = 3;
const CLAVE = 'ldp-onboarding-v2';

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
  return [
    r.nombre.trim() !== '',
    r.olvidos.length > 0,
    r.medFrecuencia,
    r.stockDias,
    r.comidaDias,
    r.controlTipo,
    r.cuidadores,
    r.avisos,
  ].filter(Boolean).length;
}

export type IdPlan = 'esencial' | 'familia';

/** Esencial cubre hasta 2 tutores; si son más personas cuidando, corresponde Familia (hasta 3). */
export function planRecomendado(r: Respuestas): IdPlan {
  return r.cuidadores === 'familia' || r.cuidadores === 'varias' ? 'familia' : 'esencial';
}

export const HORA_POR_MOMENTO: Record<Momento, string> = {
  manana: '08:00',
  mediodia: '13:00',
  noche: '20:00',
};

export type Paso = 'nombre' | 'olvidos' | 'med' | 'stock' | 'comida' | 'control' | 'cuidadores' | 'avisos';

/** Los pasos dependen de lo que eligió: solo se le pregunta por lo que dijo que quiere dejar de recordar. */
export function pasosPara(r: Respuestas): Paso[] {
  const o = r.olvidos;
  const pasos: Paso[] = ['nombre', 'olvidos'];
  if (o.includes('medicamentos')) pasos.push('med');
  if (o.includes('medicamentos')) pasos.push('stock');
  if (o.includes('alimento')) pasos.push('comida');
  if (o.includes('vacunas')) pasos.push('control');
  if (o.includes('quien')) pasos.push('cuidadores');
  pasos.push('avisos');
  return pasos;
}

export const TEXTO_FRECUENCIA: Record<Frecuencia, string> = {
  '1_dia': '1 vez al día',
  '2_dia': '2 veces al día',
  semana: '1 vez por semana',
};
export const TEXTO_CONTROL: Record<TipoControl, string> = {
  vacuna: 'Vacuna',
  antiparasitario: 'Antiparasitario',
  veterinario: 'Control veterinario',
};
export const TEXTO_CUANDO: Record<Cuando, string> = {
  semana: 'Esta semana',
  mes: 'Este mes',
  meses: 'En 2-3 meses',
  no_se: 'Por definir',
};
export const TEXTO_CUIDADORES: Record<Cuidadores, string> = {
  solo_yo: 'Solo tú',
  pareja: 'Tu pareja',
  familia: 'Tu familia',
  cuidador: 'Un cuidador o paseador',
  varias: 'Varias personas',
};

export interface ItemPanel {
  id: string;
  titulo: string;
  detalle: string;
  /** Etiqueta a la derecha de la fila: hora del aviso o cuánto falta. */
  etiqueta: string;
}

export interface Panel {
  hoy: ItemPanel[];
  proximo: ItemPanel[];
  siempre: ItemPanel[];
}

const diasTexto = (d: Dias | null) => (d && d !== 'no_se' ? `~${d} días` : 'Por definir');

/** Arma el Panel de Hoy con lo que la persona configuró de verdad (no con ejemplos genéricos). */
export function armarPanel(r: Respuestas): Panel {
  const o = r.olvidos;
  const med = r.medNombre.trim() || 'Medicamento';
  const panel: Panel = { hoy: [], proximo: [], siempre: [] };
  if (o.includes('medicamentos') && r.medFrecuencia && r.medHora) {
    panel.hoy.push({
      id: 'med',
      titulo: med,
      detalle: `${TEXTO_FRECUENCIA[r.medFrecuencia]}${r.avisos === 'si' ? ' · Te avisaremos antes' : ''}`,
      etiqueta: HORA_POR_MOMENTO[r.medHora],
    });
  }
  if (o.includes('alimento') && r.comidaDias) {
    panel.proximo.push({
      id: 'com',
      titulo: 'Alimento',
      detalle: r.comidaAviso ? `Te avisamos ${r.comidaAviso} días antes` : 'Aviso antes de que se acabe',
      etiqueta: diasTexto(r.comidaDias),
    });
  }
  if (o.includes('medicamentos') && r.stockDias) {
    panel.proximo.push({
      id: 'rep',
      titulo: `Reponer ${med}`,
      detalle: 'Aviso antes de que se acabe',
      etiqueta: diasTexto(r.stockDias),
    });
  }
  if (o.includes('vacunas') && r.controlTipo && r.controlCuando) {
    panel.proximo.push({
      id: 'ctl',
      titulo: TEXTO_CONTROL[r.controlTipo],
      detalle: 'Con fecha y aviso anticipado',
      etiqueta: TEXTO_CUANDO[r.controlCuando],
    });
  }
  if (o.includes('documentos')) {
    panel.siempre.push({ id: 'doc', titulo: 'Documentos e historial', detalle: 'Todo en un solo lugar', etiqueta: '' });
  }
  if (o.includes('emergencia')) {
    panel.siempre.push({ id: 'eme', titulo: 'Guía de emergencia', detalle: 'Qué hacer primero, sin diagnosticar', etiqueta: '' });
  }
  return panel;
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
