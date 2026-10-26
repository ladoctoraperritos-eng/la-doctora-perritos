// Puente entre la app y la base de datos (Supabase). La app sigue trabajando en el navegador, así que
// cada cambio se sube a la nube por separado: solo lo nuevo, lo editado o lo borrado. Al entrar con
// la cuenta, los datos de la nube reemplazan a los del navegador (si la familia ya existe allí).

import type { SupabaseClient } from '@supabase/supabase-js';
import { alCambiarEstado, cargarDesdeNube, obtenerApp, type Cuidado, type EstadoApp, type Nota, type Perro, type Registro, type Tutor, type Veterinario } from '@/lib/app';
import { clienteSupabase } from '@/lib/supabase';

type Fila = Record<string, unknown>;

interface Lote {
  tabla: string;
  filas: Fila[];
  /** Columna(s) que identifican una fila en la base. */
  clave: string;
}

// ── Conversión: forma de la app ⇄ columnas de la base ──
/** Qué mandar en la columna `foto`: una foto nueva (texto `data:`) se manda tal cual para subirla;
 * si se quitó la foto, se manda `null`; si ya es una URL (foto que vino resuelta desde Storage), NO
 * se reenvía — se omite la clave para no pisar la ruta guardada con una URL firmada y temporal. */
const fotoParaGuardar = (foto: string | undefined): string | null | undefined => {
  if (foto === undefined) return null;
  if (foto.startsWith('data:')) return foto;
  return undefined;
};
const aPerro = (p: Perro, hogar: string): Fila => ({ id: p.id, hogar_id: hogar, nombre: p.nombre, foto: fotoParaGuardar(p.foto), nacimiento: p.nacimiento ?? null, peso_kg: p.pesoKg ?? null, raza: p.raza ?? null, notas: p.notas ?? null, chip: p.chip ?? null, responsable: p.responsable ?? null, telefono: p.telefono ?? null });
const aTutor = (t: Tutor, hogar: string): Fila => ({ id: t.id, hogar_id: hogar, nombre: t.nombre, correo: t.correo ?? null, pendiente: t.pendiente ?? false, foto: fotoParaGuardar(t.foto) });
const aCuidado = (c: Cuidado, hogar: string): Fila => ({ id: c.id, hogar_id: hogar, perro_id: c.perroId, tipo: c.tipo, nombre: c.nombre, detalle: c.detalle, hora: c.hora ?? null, proxima: c.proxima ?? null, ultima: c.ultima ?? null, cada: c.cada ?? null, racion: c.racion ?? null, detenido: c.detenido ?? false });
const aRegistro = (r: Registro, hogar: string): Fila => ({ id: r.id, hogar_id: hogar, cuidado_id: r.cuidadoId, dia: r.dia, quien: r.quien, hora: r.hora });
const aNota = (n: Nota, hogar: string): Fila => ({ id: n.id, hogar_id: hogar, perro_id: n.perroId, dia: n.dia, hora: n.hora, tipo: n.tipo, texto: n.texto, intensidad: n.intensidad ?? null, quien: n.quien });
const aVet = (tipo: 'habitual' | 'urgencia', v: Veterinario, hogar: string): Fila => ({ hogar_id: hogar, tipo, nombre: v.nombre ?? null, telefono: v.telefono ?? null });

/** Lo que cambió en una colección: filas nuevas o editadas, e ids que se quitaron. */
function cambiosDe<T extends { id: string }>(antes: T[], despues: T[], tabla: string, fila: (x: T) => Fila): { lote?: Lote; quitar?: { tabla: string; ids: string[] } } {
  const previo = new Map(antes.map((x) => [x.id, JSON.stringify(x)]));
  const editadas = despues.filter((x) => previo.get(x.id) !== JSON.stringify(x));
  const quitadas = antes.filter((x) => !despues.some((y) => y.id === x.id)).map((x) => x.id);
  return {
    lote: editadas.length ? { tabla, clave: 'id', filas: editadas.map(fila) } : undefined,
    quitar: quitadas.length ? { tabla, ids: quitadas } : undefined,
  };
}

// ── Estado de la conexión ──
let cliente: SupabaseClient | null = null;
let hogarId: string | null = null;
let cancelarEscucha: (() => void) | null = null;
/** Último estado que sí llegó a la nube. Si una subida falla, el siguiente intento parte de aquí y no pierde nada. */
let sincronizado: EstadoApp | null = null;
let falloNube = false;
const oyentesNube = new Set<() => void>();
function fijarFallo(valor: boolean): void {
  if (falloNube === valor) return;
  falloNube = valor;
  oyentesNube.forEach((f) => f());
}
export const huboFalloNube = (): boolean => falloNube;
/** Para que la pantalla se entere cuando cambia el estado de la subida. */
export function suscribirNube(f: () => void): () => void {
  oyentesNube.add(f);
  return () => {
    oyentesNube.delete(f);
  };
}

/** Qué cambió entre dos estados, por colección. Solo se envía lo distinto. */
function diferencias(antes: EstadoApp, despues: EstadoApp, hogar: string) {
  const partes = [
    cambiosDe(antes.perros, despues.perros, 'perros', (x) => aPerro(x, hogar)),
    cambiosDe(antes.tutores, despues.tutores, 'tutores', (x) => aTutor(x, hogar)),
    cambiosDe(antes.cuidados, despues.cuidados, 'cuidados', (x) => aCuidado(x, hogar)),
    cambiosDe(antes.registros, despues.registros, 'registros', (x) => aRegistro(x, hogar)),
    cambiosDe(antes.notas, despues.notas, 'notas', (x) => aNota(x, hogar)),
  ];
  const subir: Lote[] = partes.flatMap((p) => (p.lote ? [p.lote] : []));
  const borrar = partes.flatMap((p) => (p.quitar ? [p.quitar] : []));
  const vetsA = JSON.stringify([antes.veterinarioHabitual, antes.veterinarioUrgencia]);
  const vetsB = JSON.stringify([despues.veterinarioHabitual, despues.veterinarioUrgencia]);
  if (vetsA !== vetsB) {
    const filas: Fila[] = [];
    if (despues.veterinarioHabitual) filas.push(aVet('habitual', despues.veterinarioHabitual, hogar));
    if (despues.veterinarioUrgencia) filas.push(aVet('urgencia', despues.veterinarioUrgencia, hogar));
    if (filas.length) subir.push({ tabla: 'veterinarios', clave: 'hogar_id,tipo', filas });
  }
  // El plan ya no lo escribe el navegador (solo el servidor, al confirmar un pago real) — acá solo
  // se vigilan los ajustes propios de la persona (avisos, racha, etc.).
  const hogarCambio = JSON.stringify(antes.ajustes) !== JSON.stringify(despues.ajustes);
  return { subir, borrar, hogarCambio };
}

/** Convierte un data URL (`data:image/jpeg;base64,...`) a Blob sin pasar por `fetch()`: en Safari
 * de iPhone, `fetch()` sobre un data URL grande puede fallar en silencio (ni siquiera llega a
 * intentar la subida) — decodificar el base64 a mano es más pesado en CPU pero siempre funciona. */
function dataUrlABlob(dataUrl: string): Blob {
  const [cabecera, base64] = dataUrl.split(',', 2);
  const tipo = /data:([^;]+)/.exec(cabecera)?.[1] ?? 'image/jpeg';
  const binario = atob(base64);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
  return new Blob([bytes], { type: tipo });
}

/** Las fotos nunca viven como texto largo dentro de la fila: antes de guardar, se suben al lugar
 * hecho para archivos (Storage) y la fila solo guarda la ruta. Así cada consulta de la familia no
 * arrastra el peso completo de cada foto. */
async function subirFotosDeLote(c: SupabaseClient, hogar: string, tabla: string, filas: Fila[]): Promise<void> {
  for (const fila of filas) {
    const foto = fila.foto;
    if (typeof foto !== 'string' || !foto.startsWith('data:')) continue;
    const ruta = `${hogar}/${tabla}-${fila.id as string}.jpg`;
    const { error } = await c.storage.from('fotos').upload(ruta, dataUrlABlob(foto), { upsert: true, contentType: 'image/jpeg' });
    if (error) throw error;
    fila.foto = ruta;
  }
}

async function enviar(c: SupabaseClient, hogar: string, cambios: ReturnType<typeof diferencias>, despues: EstadoApp): Promise<void> {
  if (cambios.hogarCambio) {
    const { error } = await c.from('hogares').update({ ajustes: despues.ajustes }).eq('id', hogar);
    if (error) throw error;
  }
  // Primero lo que otras filas necesitan (perros, tutores, cuidados), luego lo que depende de ellos.
  const orden = ['perros', 'tutores', 'cuidados', 'registros', 'notas', 'veterinarios'];
  for (const tabla of orden) {
    for (const lote of cambios.subir.filter((l) => l.tabla === tabla)) {
      if (tabla === 'perros' || tabla === 'tutores') await subirFotosDeLote(c, hogar, tabla, lote.filas);
      const { error } = await c.from(lote.tabla).upsert(lote.filas, { onConflict: lote.clave });
      if (error) throw error;
    }
  }
  for (const quitar of cambios.borrar) {
    const { error } = await c.from(quitar.tabla).delete().in('id', quitar.ids);
    if (error) throw error;
  }
}

/** Sube solo lo que cambió desde el último estado que llegó a la nube. Si falla, lo deja pendiente. */
async function subir(despues: EstadoApp): Promise<void> {
  if (!cliente || !hogarId || !sincronizado) return;
  try {
    await enviar(cliente, hogarId, diferencias(sincronizado, despues, hogarId), despues);
    sincronizado = despues;
    fijarFallo(false);
  } catch (err) {
    console.error('[nube] no se pudo guardar', err);
    fijarFallo(true);
  }
}

/** Botón «Reintentar»: vuelve a intentar subir todo lo que quedó pendiente. */
export async function reintentarNube(): Promise<void> {
  await subir(obtenerApp());
}

/** Invita de verdad a un cuidador: lo deja anotado para que, al entrar con ese correo, se una a
 * ESTA familia (no a una nueva), y le manda el enlace de acceso de una vez. Sin esto, «invitar»
 * solo guardaba un nombre y un correo sin darle acceso real a nadie. */
export async function invitarCuidador(correo: string): Promise<'enviado' | 'sin_nube'> {
  if (!cliente || !hogarId) return 'sin_nube';
  const { error } = await cliente.from('invitaciones_hogar').upsert({ hogar_id: hogarId, correo: correo.trim().toLowerCase() }, { onConflict: 'hogar_id,correo' });
  if (error) throw error;
  return 'enviado';
}

/** La fila guarda una RUTA de Storage (no la foto en sí); esto la convierte en una URL que ya
 * puede usarse directo en una etiqueta `<img>`. Las fotos viejas (de antes de este cambio) siguen
 * siendo texto `data:` dentro de la fila: se devuelven tal cual hasta que alguien las vuelva a guardar. */
async function resolverFoto(c: SupabaseClient, ruta: string | null | undefined): Promise<string | undefined> {
  if (!ruta) return undefined;
  if (ruta.startsWith('data:') || ruta.startsWith('http')) return ruta;
  const { data } = await c.storage.from('fotos').createSignedUrl(ruta, 60 * 60 * 24 * 7);
  return data?.signedUrl;
}

/** Trae de la nube todo lo de la familia y lo convierte a la forma de la app. `correoSesion` es el
 * correo real con el que la persona inició sesión — siempre manda sobre cualquier valor guardado
 * antes (p. ej. lo que escribió en el formulario de bienvenida), para que "Yo" nunca muestre un
 * correo viejo o de otra persona. */
async function traer(c: SupabaseClient, hogar: string, correoSesion?: string): Promise<EstadoApp> {
  const [h, p, t, cu, r, n, v] = await Promise.all([
    c.from('hogares').select('plan, ajustes').eq('id', hogar).single(),
    c.from('perros').select('*').eq('hogar_id', hogar),
    c.from('tutores').select('*').eq('hogar_id', hogar),
    c.from('cuidados').select('*').eq('hogar_id', hogar),
    c.from('registros').select('*').eq('hogar_id', hogar),
    c.from('notas').select('*').eq('hogar_id', hogar),
    c.from('veterinarios').select('*').eq('hogar_id', hogar),
  ]);
  for (const res of [h, p, t, cu, r, n, v]) if (res.error) throw res.error;
  const local = obtenerApp();
  const vet = (v.data ?? []) as Fila[];
  const buscarVet = (tipo: string): Veterinario | undefined => {
    const f = vet.find((x) => x.tipo === tipo);
    return f ? { nombre: (f.nombre as string | null) ?? undefined, telefono: (f.telefono as string | null) ?? undefined } : undefined;
  };
  const [fotosPerros, fotosTutores] = await Promise.all([
    Promise.all((p.data ?? []).map((x: Fila) => resolverFoto(c, x.foto as string | null))),
    Promise.all((t.data ?? []).map((x: Fila) => resolverFoto(c, x.foto as string | null))),
  ]);
  return {
    ...local,
    correo: correoSesion ?? local.correo,
    plan: (h.data?.plan ?? local.plan) as EstadoApp['plan'],
    ajustes: { ...local.ajustes, ...(h.data?.ajustes as object | undefined) },
    perros: (p.data ?? []).map((x: Fila, i) => ({ id: x.id as string, nombre: x.nombre as string, foto: fotosPerros[i], nacimiento: opc(x.nacimiento), pesoKg: (x.peso_kg as number | null) ?? undefined, raza: opc(x.raza), notas: opc(x.notas), chip: opc(x.chip), responsable: opc(x.responsable), telefono: opc(x.telefono) })),
    tutores: (t.data ?? []).map((x: Fila, i) => ({ id: x.id as string, nombre: x.nombre as string, correo: opc(x.correo), pendiente: x.pendiente as boolean, foto: fotosTutores[i] })),
    cuidados: (cu.data ?? []).map((x: Fila) => ({ id: x.id as string, perroId: x.perro_id as string, tipo: x.tipo as Cuidado['tipo'], nombre: x.nombre as string, detalle: x.detalle as string, hora: opc(x.hora), proxima: opc(x.proxima), ultima: opc(x.ultima), cada: (x.cada as number | null) ?? undefined, racion: (x.racion as Cuidado['racion']) ?? undefined, detenido: (x.detenido as boolean | null) ?? false })),
    registros: (r.data ?? []).map((x: Fila) => ({ id: x.id as string, cuidadoId: x.cuidado_id as string, dia: x.dia as string, quien: x.quien as string, hora: x.hora as string })),
    notas: (n.data ?? []).map((x: Fila) => ({ id: x.id as string, perroId: x.perro_id as string, dia: x.dia as string, hora: x.hora as string, tipo: x.tipo as Nota['tipo'], texto: x.texto as string, intensidad: (x.intensidad as Nota['intensidad']) ?? undefined, quien: x.quien as string })),
    veterinarioHabitual: buscarVet('habitual'),
    veterinarioUrgencia: buscarVet('urgencia'),
  };
}
const opc = (v: unknown): string | undefined => (typeof v === 'string' && v !== '' ? v : undefined);

/** Al entrar con la cuenta: si la familia ya existe en la nube, se traen sus datos; si no, se crea y se sube lo del navegador. */
export async function iniciarNube(): Promise<'nube' | 'sin_sesion' | 'sin_configurar' | 'error'> {
  const c = clienteSupabase();
  if (!c) return 'sin_configurar';
  const { data: sesion } = await c.auth.getSession();
  if (!sesion.session) return 'sin_sesion';
  cliente = c;
  try {
    const correoSesion = sesion.session.user.email ?? undefined;
    const { data: membresia, error } = await c.from('miembros_hogar').select('hogar_id').limit(1);
    if (error) throw error;
    if (membresia && membresia.length > 0) {
      // Si a esta persona la invitaron a OTRA familia después de ya tener la suya (propia y
      // todavía vacía, sin perros), la pasa a la familia que la invitó — antes esa invitación se
      // quedaba esperando para siempre sin aplicarse nunca, porque solo se revisaba al no tener
      // ninguna familia todavía.
      const { data: cambiada } = await c.rpc('aceptar_invitacion_existente');
      hogarId = (cambiada as string | null) ?? (membresia[0].hogar_id as string);
      cargarDesdeNube(await traer(c, hogarId, correoSesion));
    } else {
      // Antes de crear una familia nueva y vacía, se revisa si a esta persona la invitaron a una
      // familia que ya existe (otro tutor la agregó desde «Quienes cuidan contigo»). Si es así, se
      // une a esa — nunca se le crea una propia por error.
      const { data: unida } = await c.rpc('aceptar_invitacion');
      if (unida) {
        hogarId = unida as string;
        cargarDesdeNube(await traer(c, hogarId, correoSesion));
      } else {
        const { data: nuevo, error: errCrear } = await c.rpc('crear_hogar', { p_nombre: 'Mi hogar' });
        if (errCrear) throw errCrear;
        hogarId = nuevo as string;
        const actual = obtenerApp();
        const vacio: EstadoApp = { ...actual, perros: [], tutores: [], cuidados: [], registros: [], notas: [], veterinarioHabitual: undefined, veterinarioUrgencia: undefined };
        await enviar(c, hogarId, diferencias(vacio, actual, hogarId), actual);
      }
    }
    sincronizado = obtenerApp();
    cancelarEscucha?.();
    cancelarEscucha = alCambiarEstado((_antes, despues) => {
      void subir(despues);
    });
    fijarFallo(false);
    return 'nube';
  } catch {
    fijarFallo(true);
    return 'error';
  }
}

let arranque: ReturnType<typeof iniciarNube> | null = null;
/** Llamada segura desde la pantalla: aunque se monte dos veces, la conexión solo se inicia una vez. */
export function arrancarNube(): ReturnType<typeof iniciarNube> {
  arranque ??= iniciarNube();
  return arranque;
}
