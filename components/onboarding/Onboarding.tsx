'use client';

// Onboarding: nombre → «qué te gustaría dejar de tener que recordar» → una mini-configuración REAL por cada
// elección → aviso pedido en contexto → Panel armado con sus datos → /paywall (02B). El momento de activación
// es configurar al menos un cuidado real y ver cuándo toca actuar; lo demás (raza, peso, historial) va al perfil.

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MotionConfig, animate, motion, useReducedMotion } from 'motion/react';
import { Check, Footprints, Heart, Home, PawPrint, User, Users, type LucideIcon } from 'lucide-react';
import Marca from './Marca';
import { CONDICIONES, hayGarantia, hayPrueba } from '@/lib/oferta';
import { ENCUADRE_INICIAL, EncuadreFoto, type Encuadre, leerFoto, recortarFoto } from '@/components/app/Perros';
import {
  actualizar,
  armarPanel,
  contarRespuestas,
  MAX_OLVIDOS,
  obtener,
  pasosPara,
  prioridadEfectiva,
  suscribir,
  TEXTO_CONTROL,
  TEXTO_CUIDADORES,
  VACIAS,
  type Anticipacion,
  type Cuando,
  type Cuidadores,
  type Dias,
  type Frecuencia,
  type ItemPanel,
  type Momento,
  type Olvido,
  type Paso,
  type Respuestas,
  type TipoControl,
} from '@/lib/onboarding';

const useRespuestas = (): Respuestas => useSyncExternalStore(suscribir, obtener, () => VACIAS);

const base =
  'flex w-full text-left border-2 transition-colors duration-200 active:scale-[0.98] [touch-action:manipulation] rounded-[var(--radius-card)]';
const estiloOpcion = (on: boolean) =>
  on ? 'border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_8%,var(--surface))]' : 'border-[var(--border-ui)] bg-[var(--surface)]';

function Marcador({ on, tam = 24 }: { on: boolean; tam?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{ width: tam, height: tam }}
      className={`inline-flex shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
        on ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--border-ui)]'
      }`}
    >
      {on && <Check size={14} color="var(--bg)" strokeWidth={3} />}
    </span>
  );
}

interface Opcion<T extends string> {
  valor: T;
  titulo: string;
  detalle?: string;
  icono?: LucideIcon;
  imagen?: string;
}

function IconoOpcion({ icono: Icono, imagen, tam }: { icono?: LucideIcon; imagen?: string; tam: number }) {
  if (imagen) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={imagen} alt="" width={tam} height={tam} className="object-contain" />;
  }
  return Icono ? <Icono size={tam} color="var(--accent)" aria-hidden="true" /> : null;
}

const entradaEscalonada = (i: number) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25, delay: 0.05 * i, ease: [0.16, 1, 0.3, 1] as const },
});

/** Lista vertical con ícono: una sola elección. */
function Lista<T extends string>({
  nombreGrupo,
  opciones,
  seleccion,
  onElegir,
}: {
  nombreGrupo: string;
  opciones: Opcion<T>[];
  seleccion: T | null;
  onElegir: (v: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={nombreGrupo} className="mt-6 flex flex-col gap-2">
      {opciones.map((o, i) => {
        const on = seleccion === o.valor;
        return (
          <motion.div key={o.valor} {...entradaEscalonada(i)}>
            <button type="button" role="radio" aria-checked={on} onClick={() => onElegir(o.valor)} className={`${base} min-h-14 items-center gap-4 p-3 ${estiloOpcion(on)}`}>
              <span className="inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-button)] bg-[var(--chip-bg)]">
                <IconoOpcion icono={o.icono} imagen={o.imagen} tam={22} />
              </span>
              <span className="flex-1">
                <span className="block text-base font-semibold text-[var(--text-primary)]">{o.titulo}</span>
                {o.detalle && <span className="block text-sm text-[var(--text-secondary)]">{o.detalle}</span>}
              </span>
              <Marcador on={on} />
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}

/** Rejilla de 2 columnas con ícono: varias elecciones (hasta el límite). */
function Rejilla({
  nombreGrupo,
  opciones,
  seleccion,
  onElegir,
}: {
  nombreGrupo: string;
  opciones: Opcion<Olvido>[];
  seleccion: Olvido[];
  onElegir: (v: Olvido) => void;
}) {
  return (
    <div role="group" aria-label={nombreGrupo} className="mt-5 grid grid-cols-2 gap-2">
      {opciones.map((o, i) => {
        const on = seleccion.includes(o.valor);
        return (
          <motion.div key={o.valor} {...entradaEscalonada(i)} className="h-full">
            <button
              type="button"
              role="checkbox"
              aria-checked={on}
              onClick={() => onElegir(o.valor)}
              className={`${base} h-full min-h-[6.5rem] flex-col justify-between gap-2 p-3 ${estiloOpcion(on)}`}
            >
              <span className="flex w-full items-start justify-between">
                <span className="inline-flex size-10 items-center justify-center overflow-hidden rounded-[var(--radius-button)] bg-[var(--chip-bg)]">
                  <IconoOpcion icono={o.icono} imagen={o.imagen} tam={22} />
                </span>
                <Marcador on={on} tam={22} />
              </span>
              <span className="block text-base font-semibold leading-tight text-[var(--text-primary)]">{o.titulo}</span>
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}

/** Fichas de texto para una elección corta dentro de una mini-configuración. */
function Fichas<T extends string>({
  titulo,
  opciones,
  valor,
  onElegir,
  columnas,
}: {
  titulo: string;
  opciones: { valor: T; texto: string }[];
  valor: T | null;
  onElegir: (v: T) => void;
  columnas: 1 | 2 | 3;
}) {
  const cols = columnas === 1 ? 'grid-cols-1' : columnas === 2 ? 'grid-cols-2' : 'grid-cols-3';
  return (
    <div role="radiogroup" aria-label={titulo} className="mt-6">
      <p className="mb-2 text-base font-semibold">{titulo}</p>
      <div className={`grid gap-2 ${cols}`}>
        {opciones.map((o) => {
          const on = valor === o.valor;
          return (
            <button
              key={o.valor}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onElegir(o.valor)}
              className={`${base} min-h-14 items-center justify-center px-2 py-2 text-center text-base font-semibold ${estiloOpcion(on)}`}
            >
              {o.texto}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const OLVIDOS: Opcion<Olvido>[] = [
  { valor: 'medicamentos', titulo: 'Sus medicamentos', imagen: '/brand/cuidado-medicamento.png' },
  { valor: 'vacunas', titulo: 'Vacunas, antiparasitarios y controles', imagen: '/brand/cuidado-vacuna.png' },
  { valor: 'alimento', titulo: 'Cuándo comprar alimento', imagen: '/brand/cuidado-comida.png' },
  { valor: 'quien', titulo: 'Quién ya hizo cada cuidado', imagen: '/brand/personas.png' },
  { valor: 'documentos', titulo: 'Documentos e historial', imagen: '/brand/documentos.png' },
  { valor: 'emergencia', titulo: 'Saber qué hacer en una emergencia', imagen: '/brand/emergencia.png' },
];
const CUIDADORES: Opcion<Cuidadores>[] = [
  { valor: 'solo_yo', titulo: 'Solo yo', icono: User },
  { valor: 'pareja', titulo: 'Mi pareja y yo', icono: Heart },
  { valor: 'familia', titulo: 'Mi familia', detalle: 'Hasta 3 personas', icono: Home },
  { valor: 'cuidador', titulo: 'Un cuidador o paseador', icono: Footprints },
  { valor: 'varias', titulo: 'Varias personas', icono: Users },
];
const FRECUENCIA: { valor: Frecuencia; texto: string }[] = [
  { valor: '1_dia', texto: 'Diario' },
  { valor: '2_dia', texto: '2 al día' },
  { valor: 'semana', texto: 'Semanal' },
];
const HORA: { valor: Momento; texto: string }[] = [
  { valor: 'manana', texto: 'Mañana' },
  { valor: 'mediodia', texto: 'Mediodía' },
  { valor: 'noche', texto: 'Noche' },
];
const DIAS: { valor: Dias; texto: string }[] = [
  { valor: '7', texto: '7 días' },
  { valor: '15', texto: '15 días' },
  { valor: '30', texto: '30 días' },
  { valor: 'no_se', texto: 'No lo sé' },
];
const ANTICIPACION: { valor: Anticipacion; texto: string }[] = [
  { valor: '3', texto: '3 días' },
  { valor: '5', texto: '5 días' },
  { valor: '7', texto: '7 días' },
];
const TIPO_CONTROL: { valor: TipoControl; texto: string }[] = [
  { valor: 'vacuna', texto: TEXTO_CONTROL.vacuna },
  { valor: 'antiparasitario', texto: TEXTO_CONTROL.antiparasitario },
  { valor: 'veterinario', texto: TEXTO_CONTROL.veterinario },
];
const CUANDO: { valor: Cuando; texto: string }[] = [
  { valor: 'semana', texto: 'Esta semana' },
  { valor: 'mes', texto: 'Este mes' },
  { valor: 'meses', texto: 'En 2-3 meses' },
  { valor: 'no_se', texto: 'No lo sé' },
];

/** Estos pasos se pueden saltar: el Panel simplemente no muestra ese cuidado. */
const SALTABLES: Paso[] = ['control', 'cuidadores'];
type Fase = 'preguntas' | 'armando' | 'resultado';

const AYUDA: Record<Paso, string> = {
  nombre: 'Escribe su nombre para seguir.',
  olvidos: 'Elige al menos una opción para seguir.',
  prioridad: 'Elige con cuál empezamos.',
  med: 'Elige cada cuánto y en qué momento para seguir.',
  comida: 'Elige los días y la anticipación para seguir.',
  control: 'Elige cuál es y cuándo corresponde, o salta esta pregunta.',
  cuidadores: 'Elige una opción o salta esta pregunta.',
  info: '',
  avisos: '',
};
const LIMITE = `Puedes elegir hasta ${MAX_OLVIDOS} por ahora. El resto lo agregas después.`;

function Cabecera({ paso, total, onAtras }: { paso: number; total: number; onAtras: () => void }) {
  return (
    <header className="flex items-center gap-4">
      <button
        type="button"
        onClick={onAtras}
        aria-label="Volver"
        className="inline-flex size-11 items-center justify-center rounded-full text-[var(--text-secondary)] [touch-action:manipulation]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/accion-volver.png" alt="" width={22} height={22} className="object-contain" />
      </button>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={paso + 1}
        aria-label={`Paso ${paso + 1} de ${total}`}
        className="relative h-2 flex-1 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--border-ui)_55%,var(--surface-2))]"
      >
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-[var(--accent)] transition-[width] duration-300 ease-out"
          style={{ width: `${((paso + 1) / total) * 100}%` }}
        />
      </div>
    </header>
  );
}

const botonPrimario =
  'inline-flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] bg-[image:var(--accent-gradient)] text-lg font-semibold text-[var(--bg)] shadow-[var(--shadow-2)] transition-colors active:scale-[0.98] [touch-action:manipulation]';
const botonSecundario =
  'h-12 rounded-[var(--radius-button)] text-base font-medium text-[var(--text-secondary)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] [touch-action:manipulation]';
const titulo = 'text-3xl font-bold leading-tight outline-none';

/** Texto de la notificación de ejemplo: usa lo primero que la persona configuró. */
function avisoEjemplo(r: Respuestas, nombre: string): string {
  const panel = armarPanel(r);
  const med = panel.hoy[0];
  if (med) return `Es hora de ${med.titulo} de ${nombre} · ${med.etiqueta}`;
  if (r.comidaAviso) return `Al alimento de ${nombre} le quedan ${r.comidaAviso} días`;
  const ctl = panel.proximo.find((p) => p.id === 'ctl');
  if (ctl) return `${ctl.titulo} de ${nombre}: ya toca agendarlo`;
  return `Hoy toca cuidar a ${nombre}`;
}

export default function Onboarding() {
  const r = useRespuestas();
  const router = useRouter();
  const [fase, setFase] = useState<Fase>('preguntas');
  const [paso, setPaso] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const irAlResultado = useCallback(() => setFase('resultado'), []);
  const raiz = useRef<HTMLDivElement>(null);
  const campoNombre = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Al cambiar de pantalla el foco pasa al título (lectores de pantalla y teclado).
    if (fase === 'preguntas' && paso === 0) return;
    raiz.current?.querySelector<HTMLElement>('h1')?.focus();
  }, [paso, fase]);

  const nombre = r.nombre.trim() || 'tu mascota';
  const pasos = pasosPara(r);
  const actual = pasos[Math.min(paso, pasos.length - 1)];
  const medicamento = r.medNombre.trim() || 'su medicamento';
  const prioridad = prioridadEfectiva(r);

  // Foto opcional: mismo patrón que la ficha de mascota (original sin recortar + encuadre elegido).
  const [fotoOriginal, setFotoOriginal] = useState<string | undefined>(undefined);
  const [fotoEnfoque, setFotoEnfoque] = useState<Encuadre>(ENCUADRE_INICIAL);
  const [cargandoFoto, setCargandoFoto] = useState(false);
  const entradaFoto = useRef<HTMLInputElement>(null);
  const elegirFoto = async (archivo: File | undefined) => {
    if (!archivo) return;
    setCargandoFoto(true);
    try {
      setFotoOriginal(await leerFoto(archivo));
      setFotoEnfoque(ENCUADRE_INICIAL);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos cargar la foto.');
    } finally {
      setCargandoFoto(false);
    }
  };
  useEffect(() => {
    if (!fotoOriginal) return;
    let cancelado = false;
    void recortarFoto(fotoOriginal, fotoEnfoque).then((foto) => {
      if (!cancelado) actualizar({ foto });
    });
    return () => {
      cancelado = true;
    };
  }, [fotoOriginal, fotoEnfoque]);

  const valido: Record<Paso, boolean> = {
    nombre: r.nombre.trim().length > 0,
    olvidos: r.olvidos.length > 0,
    prioridad: r.prioridad !== null,
    med: r.medFrecuencia !== null && r.medHora !== null,
    comida: r.comidaDias !== null && r.comidaAviso !== null,
    control: r.controlTipo !== null && r.controlCuando !== null,
    cuidadores: r.cuidadores !== null,
    info: true,
    avisos: true,
  };

  const irAlPaso = (i: number) => {
    setError(null);
    setPaso(i);
  };
  const siguiente = () => {
    if (paso < pasos.length - 1) irAlPaso(paso + 1);
  };
  const continuar = () => {
    if (valido[actual]) return siguiente();
    // El botón nunca está «muerto»: si falta algo, lo dice y lleva el foco donde corresponde.
    setError(AYUDA[actual]);
    if (actual === 'nombre') campoNombre.current?.focus();
  };
  const elegir = (parcial: Partial<Respuestas>) => {
    actualizar(parcial);
    setError(null);
  };
  const alternarOlvido = (v: Olvido) => {
    const ya = r.olvidos.includes(v);
    if (!ya && r.olvidos.length >= MAX_OLVIDOS) return setError(LIMITE);
    elegir({ olvidos: ya ? r.olvidos.filter((o) => o !== v) : [...r.olvidos, v] });
  };
  const decidirAvisos = (v: 'si' | 'no') => {
    actualizar({ avisos: v });
    setFase('armando');
  };
  const atras = () => {
    if (fase !== 'preguntas') {
      irAlPaso(pasos.length - 1);
      setFase('preguntas');
      return;
    }
    if (paso > 0) irAlPaso(paso - 1);
    else router.push('/');
  };

  const entrada = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const },
  };

  return (
    <MotionConfig reducedMotion="user">
      <div ref={raiz} className="relative mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden text-[var(--text-primary)] [font-family:var(--font-body)]">
        {/* Profundidad sutil (DESIGN-CORE): el mismo mesh del hero de la landing, muy tenue. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: 'radial-gradient(700px 420px at 50% -10%, color-mix(in oklab, var(--accent) 8%, transparent) 0%, transparent 60%)' }}
        />
        <div className="shrink-0 px-6 pt-4">
          <div className="-mt-2 mb-1 flex items-center justify-between">
            <Marca />
          </div>
          {fase === 'preguntas' ? (
            <Cabecera paso={paso} total={pasos.length} onAtras={atras} />
          ) : (
            <button
              type="button"
              onClick={atras}
              aria-label="Volver"
              className="inline-flex size-11 items-center justify-center rounded-full text-[var(--text-secondary)] [touch-action:manipulation]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/accion-volver.png" alt="" width={22} height={22} className="object-contain" />
            </button>
          )}
        </div>

        {/* Área con scroll PROPIO (no el de la página): así la barra de abajo queda fija detrás del
            contenido en vez de flotar encima cuando una pregunta no entra en una pantalla. */}
        <div className="flex-1 overflow-y-auto px-6 pb-8">
        {fase === 'preguntas' && (
          <motion.main key={actual} {...entrada} className="flex flex-1 flex-col pt-6">
            {actual === 'nombre' && (
              <>
                <h1 tabIndex={-1} className={titulo}>¿Cómo se llama?</h1>
                <p className="mt-2 text-base text-[var(--text-secondary)]">Empezamos con esta mascota. Agregas las demás cuando quieras.</p>
                <label htmlFor="nombre" className="sr-only">
                  Nombre de tu mascota
                </label>
                <input
                  id="nombre"
                  ref={campoNombre}
                  autoFocus
                  value={r.nombre}
                  maxLength={30}
                  autoComplete="off"
                  placeholder="Por ejemplo, Toffee"
                  aria-describedby="ayuda"
                  aria-invalid={error !== null && !valido.nombre}
                  onChange={(e) => {
                    actualizar({ nombre: e.target.value });
                    setError(null);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && continuar()}
                  className={`mt-6 h-14 w-full rounded-[var(--radius-card)] border-2 bg-[var(--surface)] px-4 text-xl font-semibold outline-none placeholder:text-[var(--text-secondary)] focus:border-[var(--accent)] ${
                    error !== null && !valido.nombre ? 'border-[var(--accent)] ring-4 ring-[color-mix(in_oklab,var(--accent)_25%,transparent)]' : 'border-[var(--border-ui)]'
                  }`}
                />
                {fotoOriginal ? (
                  <EncuadreFoto fuente={fotoOriginal} enfoque={fotoEnfoque} onCambiar={setFotoEnfoque} nombre={nombre} />
                ) : (
                  <div className="flex flex-1 flex-col items-center justify-center gap-4">
                    <span aria-hidden="true" className="borde-degradado inline-flex size-40 items-center justify-center rounded-full bg-[var(--chip-bg)] shadow-[var(--shadow-1)]">
                      <PawPrint size={56} color="var(--accent)" />
                    </span>
                    <input ref={entradaFoto} id="foto-mascota" type="file" accept="image/*" className="sr-only" onChange={(e) => { void elegirFoto(e.target.files?.[0]); e.target.value = ''; }} />
                    <button
                      type="button"
                      onClick={() => entradaFoto.current?.click()}
                      disabled={cargandoFoto}
                      className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-[var(--border-ui)] bg-[var(--surface)] px-4 text-base font-semibold [touch-action:manipulation]"
                    >
                      {cargandoFoto ? 'Preparando…' : 'Añade una foto (opcional)'}
                    </button>
                  </div>
                )}
              </>
            )}
            {actual === 'prioridad' && (
              <>
                <h1 tabIndex={-1} className={titulo}>¿Qué quieres dejar bajo control primero?</h1>
                <p className="mt-2 text-base text-[var(--text-secondary)]">Empezamos por una. Lo demás lo puedes agregar después.</p>
                <Lista
                  nombreGrupo="Qué dejamos bajo control primero"
                  opciones={OLVIDOS.filter((o) => r.olvidos.includes(o.valor))}
                  seleccion={r.prioridad}
                  onElegir={(v) => elegir({ prioridad: v })}
                />
              </>
            )}
            {actual === 'olvidos' && (
              <>
                <h1 tabIndex={-1} className={`${titulo} text-balance`}>¿Qué te gustaría dejar de tener que recordar?</h1>
                <p className="mt-2 text-base text-[var(--text-secondary)]">
                  Ese «¿le di la pastilla?» que se repite. Elige hasta {MAX_OLVIDOS} para {nombre}. Llevas <strong className="font-semibold text-[var(--text-primary)]">{r.olvidos.length}</strong>.
                </p>
                {error === LIMITE && (
                  <p role="alert" className="mt-3 flex items-center gap-2 rounded-[var(--radius-button)] border-2 border-[var(--accent)] bg-[var(--surface)] px-3 py-2 text-base font-semibold">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/brand/accion-alerta.png" alt="" width={20} height={20} className="shrink-0 object-contain" />
                    {LIMITE}
                  </p>
                )}
                <Rejilla nombreGrupo="Qué te gustaría dejar de recordar" opciones={OLVIDOS} seleccion={r.olvidos} onElegir={alternarOlvido} />
              </>
            )}
            {actual === 'med' && (
              <>
                <h1 tabIndex={-1} className={titulo}>Dejemos bajo control el medicamento de {nombre}</h1>
                <p className="mt-2 text-base text-[var(--text-secondary)]">Solo lo esencial. La dosis exacta la ajustas dentro.</p>
                <label htmlFor="med" className="mt-6 block text-base font-semibold">
                  ¿Cómo se llama? <span className="font-normal text-[var(--text-secondary)]">(opcional)</span>
                </label>
                <input
                  id="med"
                  value={r.medNombre}
                  maxLength={40}
                  autoComplete="off"
                  placeholder="Por ejemplo, Apoquel"
                  onChange={(e) => actualizar({ medNombre: e.target.value })}
                  className="mt-2 h-14 w-full rounded-[var(--radius-card)] border-2 border-[var(--border-ui)] bg-[var(--surface)] px-4 text-lg font-semibold outline-none placeholder:text-[var(--text-secondary)] focus:border-[var(--accent)]"
                />
                <Fichas titulo="¿Cada cuánto se lo das?" opciones={FRECUENCIA} valor={r.medFrecuencia} onElegir={(v) => elegir({ medFrecuencia: v })} columnas={3} />
                <Fichas titulo="¿En qué momento se lo das?" opciones={HORA} valor={r.medHora} onElegir={(v) => elegir({ medHora: v })} columnas={3} />
                <Fichas titulo={`¿Quieres que también te avisemos antes de que se acabe ${medicamento}?`} opciones={DIAS} valor={r.stockDias} onElegir={(v) => elegir({ stockDias: v })} columnas={2} />
              </>
            )}
            {actual === 'info' && (
              <>
                <span className="inline-flex size-14 items-center justify-center overflow-hidden rounded-full bg-[var(--chip-bg)]">
                  <IconoOpcion imagen={prioridad === 'documentos' ? '/brand/documentos.png' : '/brand/emergencia.png'} tam={28} />
                </span>
                <h1 tabIndex={-1} className={`${titulo} mt-5`}>
                  {prioridad === 'documentos' ? `Perfecto, ${nombre} ya tiene su lugar` : 'Perfecto, tendrás ayuda a la mano'}
                </h1>
                <p className="mt-2 text-base text-[var(--text-secondary)]">
                  {prioridad === 'documentos'
                    ? 'Podrás guardar recetas, exámenes y documentos cuando entres a la app.'
                    : 'Tendrás acceso rápido a la guía SOS desde la app. No reemplaza a tu veterinario.'}
                </p>
              </>
            )}
            {actual === 'comida' && (
              <>
                <h1 tabIndex={-1} className={titulo}>Que el alimento de {nombre} nunca se acabe sin que lo notes</h1>
                <p className="mt-2 text-base text-[var(--text-secondary)]">Sin marcas ni gramos: eso viene después.</p>
                <Fichas titulo="¿Para cuántos días crees que queda?" opciones={DIAS} valor={r.comidaDias} onElegir={(v) => elegir({ comidaDias: v })} columnas={2} />
                <Fichas titulo="¿Con cuánta anticipación te avisamos?" opciones={ANTICIPACION} valor={r.comidaAviso} onElegir={(v) => elegir({ comidaAviso: v })} columnas={3} />
              </>
            )}
            {actual === 'control' && (
              <>
                <h1 tabIndex={-1} className={titulo}>¿Cuál es el próximo cuidado de {nombre}?</h1>
                <p className="mt-2 text-base text-[var(--text-secondary)]">Con eso basta. El historial completo lo cargas cuando quieras.</p>
                <Fichas titulo="¿Qué es?" opciones={TIPO_CONTROL} valor={r.controlTipo} onElegir={(v) => elegir({ controlTipo: v })} columnas={1} />
                <Fichas titulo="¿Cuándo corresponde?" opciones={CUANDO} valor={r.controlCuando} onElegir={(v) => elegir({ controlCuando: v })} columnas={2} />
              </>
            )}
            {actual === 'cuidadores' && (
              <>
                <h1 tabIndex={-1} className={titulo}>¿Quién cuida a {nombre} contigo?</h1>
                <p className="mt-2 text-base text-[var(--text-secondary)]">Así todos verán qué ya se hizo y nadie dudará.</p>
                <Lista nombreGrupo="Quién cuida contigo" opciones={CUIDADORES} seleccion={r.cuidadores} onElegir={(v) => elegir({ cuidadores: v })} />
              </>
            )}
            {actual === 'avisos' && (
              <>
                <span className="inline-flex size-14 items-center justify-center overflow-hidden rounded-full bg-[var(--chip-bg)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/brand/aviso.png" alt="" width={28} height={28} className="object-contain" />
                </span>
                <h1 tabIndex={-1} className={`${titulo} mt-5`}>Déjanos recordar por ti</h1>
                <p className="mt-2 text-base text-[var(--text-secondary)]">
                  Activa los avisos para que te digamos antes del próximo medicamento, control o reposición de {nombre}.
                </p>
                <div
                  aria-label="Ejemplo de aviso"
                  className="mt-6 flex items-start gap-3 rounded-[var(--radius-card)] border-2 border-[var(--border-ui)] bg-[var(--surface)] p-4 shadow-[var(--shadow-1)]"
                >
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)]">
                    <PawPrint size={20} color="var(--bg)" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm text-[var(--text-secondary)]">La Doctora Perritos · ejemplo</span>
                    <span className="block text-base font-semibold">{avisoEjemplo(r, nombre)}</span>
                  </span>
                </div>
                <p className="mt-3 text-sm text-[var(--text-secondary)]">Se encienden al crear tu cuenta. Puedes cambiarlo cuando quieras.</p>
              </>
            )}

            {/* Reserva el alto de la barra fija: en pantallas con varias preguntas (p. ej. medicamento +
                stock), sin esto la barra queda flotando ENCIMA del contenido en vez de debajo. */}
            <div className="h-36 shrink-0" aria-hidden="true" />
            <div className="sticky bottom-0 z-10 -mx-6 mt-auto flex flex-col gap-2 bg-gradient-to-t from-[var(--bg)] from-75% to-transparent px-6 pb-4 pt-8">
              {(
                <div id="ayuda" role="status" aria-live="polite">
                  {error && error !== LIMITE && (
                    <p className="flex items-center gap-2 rounded-[var(--radius-button)] border-2 border-[var(--accent)] bg-[var(--surface)] px-3 py-2 text-base font-semibold">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/brand/accion-alerta.png" alt="" width={20} height={20} className="shrink-0 object-contain" />
                      {error}
                    </p>
                  )}
                </div>
              )}
              {actual === 'avisos' ? (
                <>
                  <button type="button" className={botonPrimario} onClick={() => decidirAvisos('si')}>
                    Activar recordatorios
                  </button>
                  <button type="button" className={botonSecundario} onClick={() => decidirAvisos('no')}>
                    Ahora no
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className={botonPrimario} onClick={continuar}>
                    Continuar
                  </button>
                  {SALTABLES.includes(actual) ? (
                    <button type="button" onClick={siguiente} className={botonSecundario}>
                      Saltar por ahora
                    </button>
                  ) : (
                    <div aria-hidden="true" className="h-12" />
                  )}
                </>
              )}
            </div>
          </motion.main>
        )}

        {fase === 'armando' && <Armando nombre={nombre} r={r} onListo={irAlResultado} />}
        {fase === 'resultado' && <Resultado nombre={nombre} r={r} entrada={entrada} />}
        </div>
      </div>
    </MotionConfig>
  );
}

function Armando({ nombre, r, onListo }: { nombre: string; r: Respuestas; onListo: () => void }) {
  const panel = armarPanel(r);
  const primero = panel.hoy[0];
  const lineas = [
    `Organizando el primer cuidado de ${nombre}…`,
    primero && r.avisos === 'si' ? `Preparando el aviso de ${primero.titulo} a las ${primero.etiqueta}…` : 'Preparando su aviso…',
    'Dejándolo todo listo…',
  ];
  const [visibles, setVisibles] = useState(0);
  useEffect(() => {
    const t = [
      setTimeout(() => setVisibles(1), 300),
      setTimeout(() => setVisibles(2), 1200),
      setTimeout(() => setVisibles(3), 2100),
      setTimeout(() => setVisibles(4), 3000),
      setTimeout(onListo, 3600),
    ];
    return () => t.forEach(clearTimeout);
  }, [onListo]);
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <span className="inline-flex size-16 items-center justify-center overflow-hidden rounded-full bg-[var(--chip-bg)] motion-safe:animate-pulse">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/pata.png" alt="" width={32} height={32} className="object-contain" />
      </span>
      <h1 tabIndex={-1} className="text-balance text-3xl font-bold leading-tight outline-none">Estamos preparando su Panel de Hoy</h1>
      <p className="text-lg text-[var(--text-secondary)]">Así {nombre} queda bajo control.</p>
      <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--border-ui)_55%,var(--surface-2))]" aria-hidden="true">
        <motion.div
          className="h-full rounded-full bg-[var(--accent)]"
          initial={{ width: '0%' }}
          animate={{ width: `${(visibles / 4) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
      <ul className="flex min-h-24 w-full max-w-xs flex-col gap-3 text-left" aria-live="polite">
        {lineas.slice(0, Math.min(visibles, 3)).map((l, i) => (
          <motion.li key={l} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="flex items-center gap-3 text-base font-medium text-[var(--text-primary)]">
            {i < visibles - 1 || visibles === 4 ? (
              <Check size={18} color="var(--accent)" aria-hidden="true" />
            ) : (
              <span aria-hidden="true" className="inline-block size-4 rounded-full border-2 border-[var(--accent)] border-t-transparent motion-safe:animate-spin" />
            )}
            {l}
          </motion.li>
        ))}
      </ul>
      <button type="button" onClick={onListo} className="min-h-11 rounded-[var(--radius-button)] px-4 text-base font-medium text-[var(--text-secondary)] underline underline-offset-4">
        Ver mi Panel ya
      </button>
    </main>
  );
}

const IMAGEN_ITEM: Record<string, string> = {
  med: '/brand/cuidado-medicamento.png',
  com: '/brand/cuidado-comida.png',
  rep: '/brand/paquete.png',
  ctl: '/brand/cuidado-control.png',
  doc: '/brand/documentos.png',
  eme: '/brand/emergencia.png',
};

function Seccion({ nombre, children }: { nombre: string; children: React.ReactNode }) {
  return (
    <section aria-label={nombre} className="mt-6">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">{nombre}</h2>
      <ul className="flex flex-col gap-2">{children}</ul>
    </section>
  );
}

function FilaInfo({ it }: { it: ItemPanel }) {
  const imagen = IMAGEN_ITEM[it.id] ?? '/brand/pata.png';
  return (
    <li className="flex min-h-16 items-center gap-4 rounded-[var(--radius-card)] border border-[var(--border-ui)] bg-[var(--surface)] p-4 shadow-[var(--shadow-1)]">
      <span className="inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-button)] bg-[var(--chip-bg)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imagen} alt="" width={20} height={20} className="object-contain" />
      </span>
      <span className="flex-1">
        <span className="block text-base font-semibold">{it.titulo}</span>
        <span className="block text-sm text-[var(--text-secondary)]">{it.detalle}</span>
      </span>
      {it.etiqueta && <span className="rounded-full bg-[var(--chip-bg)] px-3 py-1 text-base font-bold tabular-nums text-[var(--accent)]">{it.etiqueta}</span>}
    </li>
  );
}

function ContadorAnimado({ n }: { n: number }) {
  const reduce = useReducedMotion();
  const [v, setV] = useState(reduce ? n : 0);
  useEffect(() => {
    if (reduce) return;
    const c = animate(0, n, { duration: 0.8, ease: 'easeOut', onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [n, reduce]);
  return <span className="font-bold tabular-nums text-[var(--text-primary)]">{reduce ? n : v}</span>;
}

function Resultado({ nombre, r, entrada }: { nombre: string; r: Respuestas; entrada: object }) {
  const reduce = useReducedMotion();
  const panel = armarPanel(r);
  const [hechos, setHechos] = useState<string[]>([]);
  const marcar = (id: string) => {
    setHechos((h) => (h.includes(id) ? h.filter((x) => x !== id) : [...h, id]));
    if (!r.primeraVictoria) actualizar({ primeraVictoria: true });
  };
  const n = contarRespuestas(r);
  const comparte = r.cuidadores !== null && r.cuidadores !== 'solo_yo';
  return (
    <motion.main {...entrada} className="flex flex-1 flex-col pt-4">
      <div className="flex aspect-[5/2] items-center justify-center overflow-hidden rounded-[var(--radius-card)] border-2 border-[var(--surface)] bg-[var(--chip-bg)] shadow-[var(--shadow-2)]">
        {r.foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={r.foto} alt={`Foto de ${nombre}`} width={1000} height={400} className="size-full object-cover" />
        ) : (
          <PawPrint size={40} color="var(--accent)" aria-hidden="true" />
        )}
      </div>
      <h1 tabIndex={-1} className="mt-4 text-3xl font-bold leading-tight outline-none">
        Todo listo para <span className="text-[var(--accent)]">{nombre}</span>
      </h1>
      <p className="mt-2 text-base text-[var(--text-secondary)]">
        {panel.hoy.length > 0 ? 'Toca lo de hoy para marcarlo como hecho. Así se siente.' : 'Nada urgente hoy. Te avisamos cuando toque algo.'}
      </p>
      <div className="mt-3 min-h-14" role="status" aria-live="polite">
        {hechos.length > 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-[var(--radius-button)] bg-[var(--chip-bg)] px-4 py-3 text-base font-semibold">
            ¡Eso es! Así de simple queda el día de {nombre}.
          </motion.p>
        )}
      </div>

      {panel.hoy.length > 0 && (
        <Seccion nombre="Hoy">
          {panel.hoy.map((it) => {
            const hecho = hechos.includes(it.id);
            return (
              <li key={it.id}>
                <button
                  type="button"
                  aria-pressed={hecho}
                  onClick={() => marcar(it.id)}
                  className="flex min-h-16 w-full items-center gap-4 rounded-[var(--radius-card)] border border-l-4 border-[var(--border-ui)] border-l-[var(--accent)] bg-[var(--surface)] p-4 text-left shadow-[var(--shadow-2)] active:scale-[0.98] [touch-action:manipulation]"
                >
                  <motion.span
                    aria-hidden="true"
                    animate={{ scale: hecho && !reduce ? [1, 1.15, 1] : 1 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className={`inline-flex size-8 shrink-0 items-center justify-center rounded-full border-2 ${hecho ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--border-ui)]'}`}
                  >
                    {hecho && <Check size={18} color="var(--bg)" strokeWidth={3} />}
                  </motion.span>
                  <span className="flex-1">
                    <span className="block text-base font-semibold">{it.titulo}</span>
                    <span className="block text-sm text-[var(--text-secondary)]">
                      {hecho ? (comparte ? 'Listo · así lo verán los demás' : 'Listo · así queda registrado con la hora') : it.detalle}
                    </span>
                  </span>
                  <span className="text-base font-bold tabular-nums text-[var(--accent)]">{it.etiqueta}</span>
                </button>
              </li>
            );
          })}
        </Seccion>
      )}

      {panel.proximo.length > 0 && (
        <Seccion nombre="Próximamente">
          {panel.proximo.map((it) => (
            <FilaInfo key={it.id} it={it} />
          ))}
        </Seccion>
      )}

      {panel.siempre.length > 0 && (
        <Seccion nombre="Siempre a mano">
          {panel.siempre.map((it) => (
            <FilaInfo key={it.id} it={it} />
          ))}
        </Seccion>
      )}

      <Seccion nombre="Cuidadores">
        <li className="flex min-h-14 items-center gap-4 rounded-[var(--radius-card)] border border-[var(--border-ui)] bg-[var(--surface)] p-3 shadow-[var(--shadow-1)]">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--chip-bg)]">
            <User size={20} color="var(--accent)" aria-hidden="true" />
          </span>
          <span className="flex-1 text-base font-semibold">Tú</span>
        </li>
        {comparte && r.cuidadores && (
          <li className="flex min-h-14 items-center gap-4 rounded-[var(--radius-card)] border-2 border-dashed border-[var(--accent-2)] p-3">
            <span className="inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--accent-2)_22%,var(--surface))]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/personas.png" alt="" width={20} height={20} className="object-contain" />
            </span>
            <span className="flex-1">
              <span className="block text-base font-semibold">{TEXTO_CUIDADORES[r.cuidadores]}</span>
              <span className="block text-sm text-[var(--text-secondary)]">Los invitas desde el Panel, cuando crees tu cuenta.</span>
            </span>
          </li>
        )}
      </Seccion>

      <p className="mt-6 text-lg font-semibold">Ya no tienes que llevar todo esto en la cabeza.</p>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">Armado con tus <ContadorAnimado n={n} /> respuestas. Las fechas exactas las ajustas dentro.</p>

      <div className="mt-auto flex flex-col gap-2 pt-8">
        {hayPrueba() && (
          <p className="text-center text-base font-semibold">
            {CONDICIONES.prueba.dias} días gratis{hayGarantia() ? ' · Garantía de ' + CONDICIONES.garantia.dias + ' días sobre tu primer pago' : ''}
          </p>
        )}
        <Link href="/paywall" className={botonPrimario}>
          {hayPrueba() ? 'Probar gratis con ' + nombre : 'Ver planes para ' + nombre}
        </Link>
      </div>
    </motion.main>
  );
}
