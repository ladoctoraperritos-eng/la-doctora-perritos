// Datos de la app interna. Viven en el navegador (localStorage) hasta conectar Supabase en la etapa de
// servicios externos; el modelo ya es el definitivo (perro · cuidado · registro · tutor) para migrar sin
// cambiar las pantallas. Se siembra con lo que la persona contó en el onboarding, o con un ejemplo.

import { armarPanel, leer as leerRespuestas, planRecomendado, TEXTO_CUIDADORES, type IdPlan, type Respuestas } from './onboarding';

export type Tipo = 'medicamento' | 'suplemento' | 'comida' | 'vacuna' | 'antiparasitario' | 'bano' | 'control';

export interface Perro {
  id: string;
  nombre: string;
  /** Foto del perro (opcional): se sube desde la ficha del perro. */
  foto?: string;
  /** Día de nacimiento «YYYY-MM-DD» (opcional). */
  nacimiento?: string;
  pesoKg?: number;
  raza?: string;
  /** Datos importantes: alergias, condiciones, cirugías. */
  notas?: string;
  /** Número de microchip (solo dígitos). */
  chip?: string;
  /** Persona responsable y su teléfono, para cuando alguien encuentra al perro. */
  responsable?: string;
  telefono?: string;
}
export interface Tutor {
  id: string;
  nombre: string;
  /** Correo al que se manda la invitación (opcional). */
  correo?: string;
  /** Invitada pero aún no entra: el aviso se envía al conectar las cuentas. */
  pendiente?: boolean;
  /** Foto de perfil (opcional). */
  foto?: string;
}

export interface Ajustes {
  avisoHora: boolean;
  avisoStock: boolean;
  avisoFechas: boolean;
  /** Días de anticipación para stock y fechas. */
  anticipacion: 3 | 5 | 7;
}
export const AJUSTES_INICIALES: Ajustes = { avisoHora: true, avisoStock: true, avisoFechas: true, anticipacion: 5 };
export interface Cuidado {
  id: string;
  perroId: string;
  tipo: Tipo;
  nombre: string;
  detalle: string;
  /** Cuidado diario: hora del aviso («20:00»). */
  hora?: string;
  /** Cuidado con fecha (vacuna, control, alimento que se acaba): día «YYYY-MM-DD». Si además tiene `hora`, es la fecha de reposición. */
  proxima?: string;
  /** Última vez que se hizo (vacunas, baños, controles). */
  ultima?: string;
  /** Cada cuántos días se repite: al registrarlo hoy, la próxima fecha se recalcula sola. */
  cada?: number;
}
export interface Registro {
  id: string;
  cuidadoId: string;
  dia: string;
  quien: string;
  hora: string;
}
/** Bitácora del perro: síntomas y notas con fecha, para el seguimiento y para llevar al veterinario. */
export type Intensidad = 'leve' | 'moderado' | 'fuerte';
export interface Nota {
  id: string;
  perroId: string;
  dia: string;
  hora: string;
  tipo: 'sintoma' | 'nota';
  texto: string;
  intensidad?: Intensidad;
  quien: string;
}

/** Un veterinario de contacto de la familia: para llamar directo desde el SOS. */
export interface Veterinario {
  nombre?: string;
  telefono?: string;
}
/** Tipo de veterinario: el de siempre (horario normal) y el de urgencias (24/7, para cuando el de
 * cabecera no atiende). Muchas clínicas no dan servicio 24 horas, así que suelen ser dos contactos distintos. */
export type TipoVeterinario = 'habitual' | 'urgencia';

export interface EstadoApp {
  plan: IdPlan;
  notas: Nota[];
  ajustes: Ajustes;
  /** Correo de acceso de esta cuenta (el que dejó en el paso de planes). */
  correo?: string;
  perros: Perro[];
  tutores: Tutor[];
  /** Tutor que usa este aparato: quien queda registrado al marcar. */
  yo: string;
  cuidados: Cuidado[];
  registros: Registro[];
  veterinarioHabitual?: Veterinario;
  veterinarioUrgencia?: Veterinario;
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
  return { plan: planRecomendado(r), notas: [], ajustes: { ...AJUSTES_INICIALES, avisoHora: r.avisos !== 'no' }, correo: r.correo || undefined, perros: [perro], tutores, yo: 't1', cuidados, registros: [] };
}

/** Una semana de registros de ejemplo, repartidos entre dos personas (con algún día sin marcar, como en la vida real). */
function historialEjemplo(ahora: Date): Registro[] {
  const diarios: { id: string; hora: string }[] = [
    { id: 'c1', hora: '08:00' },
    { id: 'c3', hora: '13:00' },
    { id: 'c4', hora: '19:00' },
    { id: 'c2', hora: '20:00' },
  ];
  const filas: Registro[] = [];
  for (let d = 1; d <= 6; d++) {
    diarios.forEach((c, i) => {
      if ((d * 7 + i) % 9 === 0) return;
      const min = ((d * 13 + i * 17) % 25) + 2;
      const h = Number(c.hora.slice(0, 2));
      filas.push({ id: `h-${d}-${c.id}`, cuidadoId: c.id, dia: enDias(-d, ahora), quien: (d + i) % 3 === 0 ? 'Diego' : 'Camila', hora: `${dos(h)}:${dos(min)}` });
    });
  }
  return filas;
}

function notasEjemplo(ahora: Date): Nota[] {
  return [
    { id: 'n1', perroId: 'p1', dia: enDias(-1, ahora), hora: '21:40', tipo: 'sintoma', intensidad: 'moderado', texto: 'Se rasca mucho las orejas después de comer.', quien: 'Diego' },
    { id: 'n2', perroId: 'p1', dia: enDias(-3, ahora), hora: '09:10', tipo: 'sintoma', intensidad: 'leve', texto: 'Vomitó una vez, espuma blanca. Después comió normal.', quien: 'Camila' },
    { id: 'n3', perroId: 'p1', dia: enDias(-5, ahora), hora: '18:00', tipo: 'nota', texto: 'Empezó el Omega-3. La veterinaria pidió revisar en 3 semanas.', quien: 'Camila' },
    { id: 'n4', perroId: 'p2', dia: enDias(-2, ahora), hora: '08:30', tipo: 'sintoma', intensidad: 'leve', texto: 'Cojea un poco de la pata trasera al levantarse.', quien: 'Diego' },
  ];
}

/** Ejemplo completo para quien entra sin haber hecho el onboarding (y para las capturas). */
function ejemplo(ahora: Date): EstadoApp {
  const hoy = claveDia(ahora);
  return {
    plan: 'esencial',
    notas: notasEjemplo(ahora),
    ajustes: AJUSTES_INICIALES,
    correo: 'camila@correo.com',
    perros: [
      { id: 'p1', nombre: 'Toffee', foto: '/brand/perro-golden-onboarding.webp', raza: 'Golden retriever', pesoKg: 29, nacimiento: `${ahora.getFullYear() - 4}-03-12`, notas: 'Alérgico al pollo. Medicado con Apoquel.', chip: '985112345678901', responsable: 'Camila Rojas', telefono: '+56 9 1234 5678' },
      { id: 'p2', nombre: 'Luna', raza: 'Mestiza', pesoKg: 12, nacimiento: `${ahora.getFullYear() - 8}-08-02` },
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
      { id: 'c7', perroId: 'p2', tipo: 'antiparasitario', nombre: 'Antiparasitario', detalle: 'Pipeta mensual', proxima: enDias(12, ahora), ultima: enDias(-18, ahora), cada: 30 },
      { id: 'c8', perroId: 'p1', tipo: 'vacuna', nombre: 'Vacuna anual', detalle: 'Con el veterinario', proxima: enDias(-2, ahora), ultima: enDias(-367, ahora), cada: 365 },
      { id: 'c9', perroId: 'p1', tipo: 'bano', nombre: 'Baño', detalle: 'Shampoo hipoalergénico', proxima: enDias(9, ahora), ultima: enDias(-21, ahora), cada: 30 },
      { id: 'c10', perroId: 'p2', tipo: 'control', nombre: 'Control veterinario', detalle: 'Chequeo senior', proxima: enDias(40, ahora), ultima: enDias(-140, ahora), cada: 180 },
    ],
    registros: [{ id: 'r1', cuidadoId: 'c1', dia: hoy, quien: 'Diego', hora: '08:12' }, ...historialEjemplo(ahora)],
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
    if (crudo) {
      const guardado = JSON.parse(crudo) as EstadoApp;
      return { ...guardado, notas: guardado.notas ?? [], plan: guardado.plan ?? 'esencial', ajustes: { ...AJUSTES_INICIALES, ...guardado.ajustes } };
    }
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

// ── Edición: perros y cuidados ──
export const LIMITE_PERROS: Record<IdPlan, number> = { esencial: 2, familia: 5 };
export const nuevoId = (prefijo: string): string => `${prefijo}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function guardarPerro(p: Perro): void {
  const e = obtenerApp();
  const existe = e.perros.some((x) => x.id === p.id);
  cambiar({ ...e, perros: existe ? e.perros.map((x) => (x.id === p.id ? p : x)) : [...e.perros, p] });
}
/** Borra al perro con sus cuidados y su historial. */
export function eliminarPerro(id: string): void {
  const e = obtenerApp();
  const suyos = new Set(e.cuidados.filter((c) => c.perroId === id).map((c) => c.id));
  cambiar({ ...e, perros: e.perros.filter((p) => p.id !== id), cuidados: e.cuidados.filter((c) => c.perroId !== id), registros: e.registros.filter((r) => !suyos.has(r.cuidadoId)), notas: e.notas.filter((n) => n.perroId !== id) });
}
export function guardarCuidado(c: Cuidado): void {
  const e = obtenerApp();
  const existe = e.cuidados.some((x) => x.id === c.id);
  cambiar({ ...e, cuidados: existe ? e.cuidados.map((x) => (x.id === c.id ? c : x)) : [...e.cuidados, c] });
}
export function eliminarCuidado(id: string): void {
  const e = obtenerApp();
  cambiar({ ...e, cuidados: e.cuidados.filter((c) => c.id !== id), registros: e.registros.filter((r) => r.cuidadoId !== id) });
}
/** «Lo hice hoy»: guarda la fecha y, si se repite, recalcula la próxima. */
export function registrarSalud(cuidadoId: string, ahora: Date): void {
  const e = obtenerApp();
  const hoyClave = claveDia(ahora);
  const quien = e.tutores.find((t) => t.id === e.yo)?.nombre ?? 'Tú';
  cambiar({
    ...e,
    cuidados: e.cuidados.map((c) => (c.id === cuidadoId ? { ...c, ultima: hoyClave, proxima: c.cada ? enDias(c.cada, ahora) : undefined } : c)),
    registros: [...e.registros, { id: `r-${ahora.getTime()}-${cuidadoId}`, cuidadoId, dia: hoyClave, quien, hora: horaTexto(ahora) }],
  });
}

/** «4 años y 2 meses» a partir de la fecha de nacimiento. */
export function edadTexto(nacimiento: string | undefined, ahora: Date): string | null {
  if (!nacimiento) return null;
  const [a, m, d] = nacimiento.split('-').map(Number);
  let meses = (ahora.getFullYear() - a) * 12 + (ahora.getMonth() + 1 - m);
  if (ahora.getDate() < d) meses -= 1;
  if (meses < 0) return null;
  const anios = Math.floor(meses / 12);
  const resto = meses % 12;
  if (anios === 0) return resto === 1 ? '1 mes' : `${resto} meses`;
  const aTxt = anios === 1 ? '1 año' : `${anios} años`;
  return resto === 0 ? aTxt : `${aTxt} y ${resto} ${resto === 1 ? 'mes' : 'meses'}`;
}

// ── Personas y ajustes ──
export const LIMITE_TUTORES: Record<IdPlan, number> = { esencial: 2, familia: 3 };

export function guardarTutor(t: Tutor): void {
  const e = obtenerApp();
  const existe = e.tutores.some((x) => x.id === t.id);
  cambiar({ ...e, tutores: existe ? e.tutores.map((x) => (x.id === t.id ? t : x)) : [...e.tutores, t] });
}
/** Quita a una persona; sus registros pasados se conservan con su nombre. */
export function eliminarTutor(id: string): void {
  const e = obtenerApp();
  if (id === e.yo) return;
  cambiar({ ...e, tutores: e.tutores.filter((t) => t.id !== id) });
}
export function guardarAjustes(parcial: Partial<Ajustes>): void {
  const e = obtenerApp();
  cambiar({ ...e, ajustes: { ...e.ajustes, ...parcial } });
}
/** Guarda el nombre y/o teléfono de un veterinario (habitual o de urgencia) para el botón «Llamar» del SOS. */
export function guardarVeterinario(tipo: TipoVeterinario, parcial: Partial<Veterinario>): void {
  const e = obtenerApp();
  const clave = tipo === 'habitual' ? 'veterinarioHabitual' : 'veterinarioUrgencia';
  cambiar({ ...e, [clave]: { ...e[clave], ...parcial } });
}

// ── Exportar ──
const NOMBRE_TIPO_CSV: Record<Tipo, string> = { medicamento: 'Medicamento', suplemento: 'Suplemento', comida: 'Alimento', vacuna: 'Vacuna', antiparasitario: 'Antiparasitario', bano: 'Baño', control: 'Control' };
const celda = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

/** Historial completo en CSV (abre en Excel/Sheets): día, hora, perro, cuidado, tipo, persona. */
export function historialCsv(e: EstadoApp): string {
  const filas = e.registros
    .map((r) => {
      const c = e.cuidados.find((x) => x.id === r.cuidadoId);
      const p = c && e.perros.find((x) => x.id === c.perroId);
      return c && p ? { r, c, p } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => `${b.r.dia} ${b.r.hora}`.localeCompare(`${a.r.dia} ${a.r.hora}`));
  const lineas = ['Día,Hora,Perro,Cuidado,Tipo,Persona', ...filas.map(({ r, c, p }) => [r.dia, r.hora, p.nombre, c.nombre, NOMBRE_TIPO_CSV[c.tipo], r.quien].map(celda).join(','))];
  return '﻿' + lineas.join('\r\n');
}

// ── Bitácora ──
export function guardarNota(n: Nota): void {
  const e = obtenerApp();
  const existe = e.notas.some((x) => x.id === n.id);
  cambiar({ ...e, notas: existe ? e.notas.map((x) => (x.id === n.id ? n : x)) : [...e.notas, n] });
}
export function eliminarNota(id: string): void {
  const e = obtenerApp();
  cambiar({ ...e, notas: e.notas.filter((n) => n.id !== id) });
}
/** Quién escribe las notas en este aparato. */
export function quienSoy(e: EstadoApp): string {
  return e.tutores.find((t) => t.id === e.yo)?.nombre ?? 'Tú';
}
