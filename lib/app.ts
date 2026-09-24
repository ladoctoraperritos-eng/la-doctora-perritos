// Datos de la app interna. Viven en el navegador (localStorage) hasta conectar Supabase en la etapa de
// servicios externos; el modelo ya es el definitivo (perro · cuidado · registro · tutor) para migrar sin
// cambiar las pantallas. Se siembra con lo que la persona contó en el onboarding, o con un ejemplo.

import { armarPanel, leer as leerRespuestas, TEXTO_CUIDADORES, type Respuestas } from './onboarding';

export type Tipo = 'medicamento' | 'suplemento' | 'comida' | 'vacuna' | 'antiparasitario' | 'bano' | 'control';

export interface Perro {
  id: string;
  nombre: string;
  /** Foto del perro (opcional): se sube desde la ficha del perro. */
  foto?: string;
}
export interface Tutor {
  id: string;
  nombre: string;
}
export interface Cuidado {
  id: string;
  perroId: string;
  tipo: Tipo;
  nombre: string;
  detalle: string;
  /** Cuidado diario: hora del aviso («20:00»). */
  hora?: string;
  /** Cuidado con fecha (vacuna, control, alimento que se acaba): día «YYYY-MM-DD». */
  proxima?: string;
}
export interface Registro {
  id: string;
  cuidadoId: string;
  dia: string;
  quien: string;
  hora: string;
}
export interface EstadoApp {
  perros: Perro[];
  tutores: Tutor[];
  /** Tutor que usa este aparato: quien queda registrado al marcar. */
  yo: string;
  cuidados: Cuidado[];
  registros: Registro[];
}

// ── Fechas ──
const dos = (n: number) => String(n).padStart(2, '0');
export const claveDia = (d: Date): string => `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
export const horaTexto = (d: Date): string => `${dos(d.getHours())}:${dos(d.getMinutes())}`;
const aMinutos = (hora: string): number => Number(hora.slice(0, 2)) * 60 + Number(hora.slice(3, 5));
const enDias = (n: number, desde: Date): string => {
  const d = new Date(desde);
  d.setDate(d.getDate() + n);
  return claveDia(d);
};
/** Días completos entre hoy y una fecha «YYYY-MM-DD» (negativo = vencido). */
export function diasHasta(clave: string, hoy: Date): number {
  const [a, m, d] = clave.split('-').map(Number);
  const destino = new Date(a, m - 1, d).getTime();
  const base = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).getTime();
  return Math.round((destino - base) / 86400000);
}

// ── Semillas ──
const sumarHoras = (hora: string, h: number) => `${dos((Number(hora.slice(0, 2)) + h) % 24)}:${hora.slice(3, 5)}`;

/** Panel armado con las respuestas del onboarding: sus cuidados reales, sin inventar nada. */
function desdeOnboarding(r: Respuestas, ahora: Date): EstadoApp {
  const perro: Perro = { id: 'p1', nombre: r.nombre.trim() };
  const panel = armarPanel(r);
  const cuidados: Cuidado[] = [];
  for (const it of panel.hoy) {
    cuidados.push({ id: `c-${it.id}`, perroId: perro.id, tipo: 'medicamento', nombre: it.titulo, detalle: it.detalle.split(' · ')[0], hora: it.etiqueta });
    if (r.medFrecuencia === '2_dia') {
      cuidados.push({ id: `c-${it.id}-2`, perroId: perro.id, tipo: 'medicamento', nombre: it.titulo, detalle: '2.ª dosis', hora: sumarHoras(it.etiqueta, 12) });
    }
  }
  const dias = (etiqueta: string) => (etiqueta.startsWith('~') ? Number(etiqueta.replace(/\D/g, '')) : null);
  const aFecha = (n: number | null, respaldo: number) => enDias(n ?? respaldo, ahora);
  for (const it of panel.proximo) {
    if (it.id === 'com') cuidados.push({ id: 'c-com', perroId: perro.id, tipo: 'comida', nombre: 'Alimento', detalle: 'Se acaba', proxima: aFecha(dias(it.etiqueta), 14) });
    else if (it.id === 'rep') cuidados.push({ id: 'c-rep', perroId: perro.id, tipo: 'medicamento', nombre: it.titulo, detalle: 'Reponer antes de que se acabe', proxima: aFecha(dias(it.etiqueta), 14) });
    else {
      const cuando = r.controlCuando === 'semana' ? 5 : r.controlCuando === 'mes' ? 20 : r.controlCuando === 'meses' ? 60 : 30;
      const tipo: Tipo = r.controlTipo === 'antiparasitario' ? 'antiparasitario' : r.controlTipo === 'vacuna' ? 'vacuna' : 'control';
      cuidados.push({ id: 'c-ctl', perroId: perro.id, tipo, nombre: it.titulo, detalle: 'Con aviso anticipado', proxima: enDias(cuando, ahora) });
    }
  }
  const tutores: Tutor[] = [{ id: 't1', nombre: 'Tú' }];
  if (r.cuidadores && r.cuidadores !== 'solo_yo') tutores.push({ id: 't2', nombre: TEXTO_CUIDADORES[r.cuidadores] });
  return { perros: [perro], tutores, yo: 't1', cuidados, registros: [] };
}

/** Ejemplo completo para quien entra sin haber hecho el onboarding (y para las capturas). */
function ejemplo(ahora: Date): EstadoApp {
  const hoy = claveDia(ahora);
  return {
    perros: [
      { id: 'p1', nombre: 'Toffee', foto: '/brand/perro-golden-onboarding.webp' },
      { id: 'p2', nombre: 'Luna' },
    ],
    tutores: [
      { id: 't1', nombre: 'Camila' },
      { id: 't2', nombre: 'Diego' },
    ],
    yo: 't1',
    cuidados: [
      { id: 'c1', perroId: 'p1', tipo: 'suplemento', nombre: 'Omega-3', detalle: '1 cápsula con su comida', hora: '08:00' },
      { id: 'c2', perroId: 'p1', tipo: 'medicamento', nombre: 'Apoquel', detalle: '1 comprimido', hora: '20:00' },
      { id: 'c3', perroId: 'p2', tipo: 'medicamento', nombre: 'Condroitina', detalle: '½ comprimido', hora: '13:00' },
      { id: 'c4', perroId: 'p2', tipo: 'suplemento', nombre: 'Probiótico', detalle: '1 sobre con la cena', hora: '19:00' },
      { id: 'c5', perroId: 'p1', tipo: 'comida', nombre: 'Alimento', detalle: 'Quedan unos 7 días', proxima: enDias(7, ahora) },
      { id: 'c6', perroId: 'p1', tipo: 'medicamento', nombre: 'Reponer Apoquel', detalle: 'Quedan 12 comprimidos', proxima: enDias(6, ahora) },
      { id: 'c7', perroId: 'p2', tipo: 'antiparasitario', nombre: 'Antiparasitario', detalle: 'Pipeta mensual', proxima: enDias(12, ahora) },
      { id: 'c8', perroId: 'p1', tipo: 'vacuna', nombre: 'Vacuna anual', detalle: 'Con el veterinario', proxima: enDias(-2, ahora) },
    ],
    registros: [{ id: 'r1', cuidadoId: 'c1', dia: hoy, quien: 'Diego', hora: '08:12' }],
  };
}

// ── Almacén reactivo (useSyncExternalStore) ──
const CLAVE = 'ldp-app-v1';
let estado: EstadoApp | null = null;
const oyentes = new Set<() => void>();
const avisar = () => oyentes.forEach((f) => f());

function cargar(): EstadoApp {
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    if (crudo) return JSON.parse(crudo) as EstadoApp;
  } catch {
    // almacenamiento bloqueado: se siembra en memoria
  }
  const ahora = new Date();
  const respuestas = leerRespuestas();
  return respuestas.nombre.trim() ? desdeOnboarding(respuestas, ahora) : ejemplo(ahora);
}
let falloGuardado = false;
function guardar(e: EstadoApp): void {
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(e));
    falloGuardado = false;
  } catch {
    // Navegación privada o sin espacio: sigue en memoria y se avisa a la persona.
    falloGuardado = true;
  }
}
export const huboFalloGuardado = (): boolean => falloGuardado;
/** Vuelve a intentar guardar lo que hay en pantalla. */
export function reintentarGuardado(): void {
  guardar(obtenerApp());
  avisar();
}

export const obtenerApp = (): EstadoApp => (estado ??= cargar());
export const suscribirApp = (f: () => void) => {
  oyentes.add(f);
  return () => {
    oyentes.delete(f);
  };
};
function cambiar(nuevo: EstadoApp) {
  estado = nuevo;
  guardar(nuevo);
  avisar();
}

/** Marca un cuidado como hecho ahora, a nombre del tutor de este aparato. */
export function marcarHecho(cuidadoId: string, ahora: Date): string {
  const e = obtenerApp();
  const quien = e.tutores.find((t) => t.id === e.yo)?.nombre ?? 'Tú';
  const id = `r-${ahora.getTime()}-${cuidadoId}`;
  cambiar({ ...e, registros: [...e.registros, { id, cuidadoId, dia: claveDia(ahora), quien, hora: horaTexto(ahora) }] });
  return id;
}

/** Cuántos cuidados con hora tiene mañana y el primero (los diarios se repiten). */
export function manana(e: EstadoApp, perroId: string | null): { cuantos: number; primera?: string } {
  const horas = e.cuidados.filter((c) => c.hora && (!perroId || c.perroId === perroId)).map((c) => c.hora as string).sort();
  return { cuantos: horas.length, primera: horas[0] };
}
export function deshacer(registroId: string): void {
  const e = obtenerApp();
  cambiar({ ...e, registros: e.registros.filter((r) => r.id !== registroId) });
}
export function reiniciarApp(): void {
  try {
    window.localStorage.removeItem(CLAVE);
  } catch {
    // nada que borrar
  }
  estado = null;
  avisar();
}

// ── Lo que muestra «Hoy» ──
export interface FilaHoy {
  cuidado: Cuidado;
  perro: Perro;
  registro?: Registro;
  /** Minutos que faltan para la hora (negativo = atrasado). */
  faltan: number;
}

const ordenar = (a: FilaHoy, b: FilaHoy) => aMinutos(a.cuidado.hora ?? '00:00') - aMinutos(b.cuidado.hora ?? '00:00');

export function hoy(e: EstadoApp, perroId: string | null, ahora: Date): { pendientes: FilaHoy[]; hechos: FilaHoy[] } {
  const dia = claveDia(ahora);
  const minutos = ahora.getHours() * 60 + ahora.getMinutes();
  const pendientes: FilaHoy[] = [];
  const hechos: FilaHoy[] = [];
  for (const c of e.cuidados) {
    if (!c.hora || (perroId && c.perroId !== perroId)) continue;
    const perro = e.perros.find((p) => p.id === c.perroId);
    if (!perro) continue;
    const registro = e.registros.find((r) => r.cuidadoId === c.id && r.dia === dia);
    const fila: FilaHoy = { cuidado: c, perro, registro, faltan: aMinutos(c.hora) - minutos };
    (registro ? hechos : pendientes).push(fila);
  }
  return { pendientes: pendientes.sort(ordenar), hechos: hechos.sort(ordenar) };
}

export interface FilaProxima {
  cuidado: Cuidado;
  perro: Perro;
  dias: number;
}

export function proximos(e: EstadoApp, perroId: string | null, ahora: Date): FilaProxima[] {
  const filas: FilaProxima[] = [];
  for (const c of e.cuidados) {
    if (!c.proxima || (perroId && c.perroId !== perroId)) continue;
    const perro = e.perros.find((p) => p.id === c.perroId);
    if (perro) filas.push({ cuidado: c, perro, dias: diasHasta(c.proxima, ahora) });
  }
  return filas.sort((a, b) => a.dias - b.dias);
}
