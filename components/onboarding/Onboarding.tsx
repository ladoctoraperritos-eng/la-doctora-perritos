'use client';

// Onboarding: una pregunta por pantalla, cada respuesta cambia algo real del Panel de Hoy (02B).
// Orden: preguntas → reconocimiento (con resumen editable) → «armando tu panel» → resultado con
// primera victoria → /paywall.

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MotionConfig, motion, useReducedMotion } from 'motion/react';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Clock,
  Footprints,
  Heart,
  Home,
  Leaf,
  Moon,
  PawPrint,
  Pencil,
  Pill,
  ShieldCheck,
  Sprout,
  Sun,
  Sunrise,
  User,
  Utensils,
  type LucideIcon,
} from 'lucide-react';
import Marca from './Marca';
import {
  actualizar,
  armarPanel,
  contarRespuestas,
  HORA_POR_MOMENTO,
  obtener,
  suscribir,
  VACIAS,
  type CantidadPerros,
  type Cuidado,
  type Cuidadores,
  type Etapa,
  type Momento,
  type Respuestas,
} from '@/lib/onboarding';

const useRespuestas = (): Respuestas => useSyncExternalStore(suscribir, obtener, () => VACIAS);

interface Opcion<T extends string> {
  valor: T;
  titulo: string;
  detalle?: string;
  icono: LucideIcon;
}

function Opciones<T extends string>({
  nombreGrupo,
  opciones,
  seleccion,
  multiple,
  onElegir,
}: {
  nombreGrupo: string;
  opciones: Opcion<T>[];
  seleccion: T | T[] | null;
  multiple?: boolean;
  onElegir: (v: T) => void;
}) {
  const activa = (v: T) => (Array.isArray(seleccion) ? seleccion.includes(v) : seleccion === v);
  return (
    <div role={multiple ? 'group' : 'radiogroup'} aria-label={nombreGrupo} className="mt-6 flex flex-col gap-3">
      {opciones.map((o) => {
        const Icono = o.icono;
        const on = activa(o.valor);
        return (
          <motion.div key={o.valor} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.05 * opciones.indexOf(o), ease: [0.16, 1, 0.3, 1] }}>
          <button
            type="button"
            role={multiple ? 'checkbox' : 'radio'}
            aria-checked={on}
            onClick={() => onElegir(o.valor)}
            className={`flex min-h-16 w-full items-center gap-4 rounded-[var(--radius-card)] border-2 p-4 text-left transition-colors duration-200 active:scale-[0.98] [touch-action:manipulation] ${
              on ? 'border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_8%,var(--surface))]' : 'border-[var(--border-ui)] bg-[var(--surface)]'
            }`}
          >
            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-[var(--chip-bg)]">
              <Icono size={22} color="var(--accent)" aria-hidden="true" />
            </span>
            <span className="flex-1">
              <span className="block text-base font-semibold text-[var(--text-primary)]">{o.titulo}</span>
              {o.detalle && <span className="block text-sm text-[var(--text-secondary)]">{o.detalle}</span>}
            </span>
            <span
              aria-hidden="true"
              className={`inline-flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
                on ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--border-ui)]'
              }`}
            >
              {on && <Check size={14} color="var(--bg)" strokeWidth={3} />}
            </span>
          </button>
          </motion.div>
        );
      })}
    </div>
  );
}

const CANTIDAD: Opcion<CantidadPerros>[] = [
  { valor: '1', titulo: '1 perro', icono: PawPrint },
  { valor: '2', titulo: '2 perros', icono: PawPrint },
  { valor: '3_o_mas', titulo: '3 o más', detalle: 'Hasta 5 perros', icono: PawPrint },
];
const ETAPA: Opcion<Etapa>[] = [
  { valor: 'cachorro', titulo: 'Cachorro', detalle: 'Hasta 1 año', icono: Sprout },
  { valor: 'adulto', titulo: 'Adulto', detalle: 'De 1 a 7 años', icono: PawPrint },
  { valor: 'senior', titulo: 'Senior', detalle: '8 años o más', icono: Clock },
];
const CUIDADOS: Opcion<Cuidado>[] = [
  { valor: 'medicamento', titulo: 'Medicamento', detalle: 'Con dosis y hora', icono: Pill },
  { valor: 'suplemento', titulo: 'Suplemento', detalle: 'Omega-3, condroitina…', icono: Leaf },
  { valor: 'comida', titulo: 'Comida', detalle: 'Aviso antes de que se acabe', icono: Utensils },
  { valor: 'solo_controles', titulo: 'Solo controles', detalle: 'Vacunas y citas, sin tratamiento', icono: ShieldCheck },
];
const CUIDADORES: Opcion<Cuidadores>[] = [
  { valor: 'solo_yo', titulo: 'Solo yo', icono: User },
  { valor: 'pareja', titulo: 'Mi pareja y yo', icono: Heart },
  { valor: 'familia', titulo: 'Mi familia', detalle: 'Hasta 3 tutores', icono: Home },
  { valor: 'cuidador', titulo: 'Un cuidador o paseador', icono: Footprints },
];
const MOMENTO: Opcion<Momento>[] = [
  { valor: 'manana', titulo: 'En la mañana', detalle: 'Alrededor de las 8:00', icono: Sunrise },
  { valor: 'mediodia', titulo: 'Al mediodía', detalle: 'Alrededor de las 13:00', icono: Sun },
  { valor: 'noche', titulo: 'En la noche', detalle: 'Alrededor de las 19:00', icono: Moon },
  { valor: 'varias', titulo: 'Varias veces al día', icono: Clock },
];

type Paso = 'nombre' | 'cantidad' | 'etapa' | 'cuidados' | 'cuidadores' | 'momento';
const PASOS: Paso[] = ['nombre', 'cantidad', 'etapa', 'cuidados', 'cuidadores', 'momento'];
/** Solo estos se pueden saltar (no rompen el Panel). */
const SALTABLES: Paso[] = ['etapa', 'cuidadores'];
type Fase = 'preguntas' | 'reconocimiento' | 'armando' | 'resultado';

const AYUDA: Record<Paso, string> = {
  nombre: 'Escribe su nombre para seguir.',
  cantidad: 'Elige cuántos perros tienes para seguir.',
  etapa: 'Elige una etapa o salta esta pregunta.',
  cuidados: 'Elige al menos una opción para seguir.',
  cuidadores: 'Elige una opción o salta esta pregunta.',
  momento: 'Elige un momento para seguir.',
};

function Cabecera({ paso, onAtras }: { paso: number; onAtras: () => void }) {
  return (
    <header className="flex items-center gap-4">
      <button
        type="button"
        onClick={onAtras}
        aria-label="Volver"
        className="inline-flex size-11 items-center justify-center rounded-full text-[var(--text-secondary)] [touch-action:manipulation]"
      >
        <ArrowLeft size={22} aria-hidden="true" />
      </button>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={PASOS.length}
        aria-valuenow={paso + 1}
        aria-label={`Pregunta ${paso + 1} de ${PASOS.length}`}
        className="flex flex-1 gap-2"
      >
        {PASOS.map((p, i) => (
          <span key={p} className="relative h-2 flex-1 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--border-ui)_55%,var(--surface-2))]">
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-[var(--accent)] transition-[width] duration-300 ease-out"
              style={{ width: i <= paso ? '100%' : '0%' }}
            />
          </span>
        ))}
      </div>
    </header>
  );
}

const botonPrimario =
  'inline-flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-lg font-semibold text-[var(--bg)] shadow-[var(--shadow-2)] transition-colors active:scale-[0.98] [touch-action:manipulation]';

export default function Onboarding() {
  const r = useRespuestas();
  const router = useRouter();
  const [fase, setFase] = useState<Fase>('preguntas');
  const [paso, setPaso] = useState(0);
  const [intento, setIntento] = useState(false);
  const irAlResultado = useCallback(() => setFase('resultado'), []);
  const raiz = useRef<HTMLDivElement>(null);
  const campoNombre = useRef<HTMLInputElement>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pasoRef = useRef(0);
  const cancelarAvance = () => {
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = null;
  };

  useEffect(() => {
    // Al cambiar de pantalla el foco pasa al título (lectores de pantalla y teclado).
    if (fase === 'preguntas' && paso === 0) return;
    raiz.current?.querySelector<HTMLElement>('h1')?.focus();
  }, [paso, fase]);
  useEffect(() => () => {
    if (temporizador.current) clearTimeout(temporizador.current);
  }, []);

  const nombre = r.nombre.trim() || 'tu perro';
  const actual = PASOS[paso];

  const valido: Record<Paso, boolean> = {
    nombre: r.nombre.trim().length > 0,
    cantidad: r.cantidad !== null,
    etapa: r.etapa !== null,
    cuidados: r.cuidados.length > 0,
    cuidadores: r.cuidadores !== null,
    momento: r.momento !== null,
  };

  const irAlPaso = (i: number) => {
    cancelarAvance();
    setIntento(false);
    pasoRef.current = i;
    setPaso(i);
  };
  const siguiente = () => {
    if (paso < PASOS.length - 1) irAlPaso(paso + 1);
    else setFase('reconocimiento');
  };
  const continuar = () => {
    if (valido[actual]) return siguiente();
    // El botón nunca está «muerto»: si falta algo, lo dice y lleva el foco donde corresponde.
    setIntento(true);
    if (actual === 'nombre') campoNombre.current?.focus();
  };
  const elegir = (parcial: Partial<Respuestas>) => {
    actualizar(parcial);
    setIntento(false);
  };
  const atras = () => {
    if (fase === 'reconocimiento') {
      irAlPaso(PASOS.length - 1);
      setFase('preguntas');
      return;
    }
    cancelarAvance();
    if (fase !== 'preguntas') return setFase('reconocimiento');
    if (paso > 0) irAlPaso(paso - 1);
    else router.push('/');
  };
  const editar = (i: number) => {
    cancelarAvance();
    irAlPaso(i);
    setFase('preguntas');
  };

  const entrada = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const },
  };

  return (
    <MotionConfig reducedMotion="user">
    <div ref={raiz} className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-8 pt-4 text-[var(--text-primary)] [font-family:var(--font-body)]">
      <div className="-mt-2 mb-1 flex items-center justify-between">
        <Marca />
      </div>
      {fase === 'preguntas' || fase === 'reconocimiento' ? (
        <Cabecera paso={fase === 'preguntas' ? paso : PASOS.length - 1} onAtras={atras} />
      ) : (
        <button
          type="button"
          onClick={atras}
          aria-label="Volver"
          className="inline-flex size-11 items-center justify-center rounded-full text-[var(--text-secondary)] [touch-action:manipulation]"
        >
          <ArrowLeft size={22} aria-hidden="true" />
        </button>
      )}

      {fase === 'preguntas' && (
        <motion.main key={actual} {...entrada} className="flex flex-1 flex-col pt-8">
          {actual === 'nombre' && (
            <>
              <div className="foto-duotone mb-6 aspect-[5/2] rounded-[var(--radius-card)] border-2 border-[var(--surface)] shadow-[var(--shadow-2)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/perros-duotone.jpg" alt="Dos perros mirando a la cámara" width={900} height={360} />
              </div>
              <h1 tabIndex={-1} className="text-3xl font-bold leading-tight outline-none">¿Cómo se llama tu perro?</h1>
              <p className="mt-2 text-base text-[var(--text-secondary)]">Así armamos su Panel de Hoy.</p>
              <label htmlFor="nombre" className="sr-only">
                Nombre de tu perro
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
                aria-invalid={intento && !valido.nombre}
                onChange={(e) => {
                  actualizar({ nombre: e.target.value });
                  setIntento(false);
                }}
                onKeyDown={(e) => e.key === 'Enter' && continuar()}
                className={`mt-6 h-14 w-full rounded-[var(--radius-card)] border-2 bg-[var(--surface)] px-4 text-xl font-semibold outline-none placeholder:text-[var(--text-secondary)] focus:border-[var(--accent)] ${
                  intento && !valido.nombre ? 'border-[var(--accent)] ring-4 ring-[color-mix(in_oklab,var(--accent)_25%,transparent)]' : 'border-[var(--border-ui)]'
                }`}
              />
            </>
          )}
          {actual === 'cantidad' && (
            <>
              <h1 tabIndex={-1} className="text-3xl font-bold leading-tight outline-none">¿Cuántos perros tienes?</h1>
              <p className="mt-2 text-base text-[var(--text-secondary)]">Empezamos con {nombre}; los demás los agregas después.</p>
              <Opciones nombreGrupo="Cuántos perros tienes" opciones={CANTIDAD} seleccion={r.cantidad} onElegir={(v) => elegir({ cantidad: v })} />
            </>
          )}
          {actual === 'etapa' && (
            <>
              <h1 tabIndex={-1} className="text-3xl font-bold leading-tight outline-none">¿En qué etapa está {nombre}?</h1>
              <p className="mt-2 text-base text-[var(--text-secondary)]">Cambia qué controles y vacunas le mostramos.</p>
              <Opciones nombreGrupo="Etapa de tu perro" opciones={ETAPA} seleccion={r.etapa} onElegir={(v) => elegir({ etapa: v })} />
            </>
          )}
          {actual === 'cuidados' && (
            <>
              <h1 tabIndex={-1} className="text-3xl font-bold leading-tight outline-none">¿Qué necesita {nombre} cada día?</h1>
              <p className="mt-2 text-base text-[var(--text-secondary)]">Elige lo que quieras. El resto lo agregas después.</p>
              <Opciones
                nombreGrupo="Qué necesita cada día"
                multiple
                opciones={CUIDADOS}
                seleccion={r.cuidados}
                onElegir={(v) => {
                  const ya = r.cuidados.includes(v);
                  const base = ya ? r.cuidados.filter((c) => c !== v) : [...r.cuidados, v];
                  // «Solo controles» es excluyente con lo demás.
                  elegir({ cuidados: v === 'solo_controles' && !ya ? ['solo_controles'] : base.filter((c) => c !== 'solo_controles' || v === 'solo_controles') });
                }}
              />
            </>
          )}
          {actual === 'cuidadores' && (
            <>
              <h1 tabIndex={-1} className="text-3xl font-bold leading-tight outline-none">¿Quién más cuida a {nombre}?</h1>
              <p className="mt-2 text-base text-[var(--text-secondary)]">Así todos verán qué se hizo y nadie dudará.</p>
              <Opciones nombreGrupo="Quién más lo cuida" opciones={CUIDADORES} seleccion={r.cuidadores} onElegir={(v) => elegir({ cuidadores: v })} />
            </>
          )}
          {actual === 'momento' && (
            <>
              <h1 tabIndex={-1} className="text-3xl font-bold leading-tight outline-none">¿A qué hora le das su cuidado principal?</h1>
              <p className="mt-2 text-base text-[var(--text-secondary)]">Ahí pondremos su aviso más importante.</p>
              <Opciones nombreGrupo="Hora del cuidado principal" opciones={MOMENTO} seleccion={r.momento} onElegir={(v) => elegir({ momento: v })} />
            </>
          )}

          <div className="mt-auto flex flex-col gap-2 pt-8">
            <div id="ayuda" role="status" aria-live="polite" className="min-h-12">
              {intento && !valido[actual] && (
                <p className="flex items-center gap-2 rounded-[var(--radius-button)] border-2 border-[var(--accent)] bg-[var(--surface)] px-3 py-2 text-base font-semibold">
                  <AlertCircle size={20} color="var(--accent)" aria-hidden="true" />
                  {AYUDA[actual]}
                </p>
              )}
            </div>
            <button type="button" className={botonPrimario} onClick={continuar}>
              Continuar
            </button>
            {SALTABLES.includes(actual) && (
              <button
                type="button"
                onClick={siguiente}
                className="h-12 rounded-[var(--radius-button)] text-base font-medium text-[var(--text-secondary)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] [touch-action:manipulation]"
              >
                Saltar por ahora
              </button>
            )}
          </div>
        </motion.main>
      )}

      {fase === 'reconocimiento' && <Reconocimiento nombre={nombre} r={r} entrada={entrada} onEditar={editar} onSeguir={() => setFase('armando')} />}
      {fase === 'armando' && <Armando nombre={nombre} r={r} onListo={irAlResultado} />}
      {fase === 'resultado' && <Resultado nombre={nombre} r={r} entrada={entrada} />}
    </div>
    </MotionConfig>
  );
}

function resumen(r: Respuestas): { etiqueta: string; valor: string }[] {
  const nombreOpc = <T extends string>(ops: Opcion<T>[], v: T | null) => ops.find((o) => o.valor === v)?.titulo ?? 'Sin responder';
  return [
    { etiqueta: 'Nombre', valor: r.nombre.trim() || 'Sin responder' },
    { etiqueta: 'Perros', valor: nombreOpc(CANTIDAD, r.cantidad) },
    { etiqueta: 'Etapa', valor: nombreOpc(ETAPA, r.etapa) },
    { etiqueta: 'Cada día', valor: r.cuidados.length ? (r.cuidados.length === 1 ? nombreOpc(CUIDADOS, r.cuidados[0]) : `${r.cuidados.length} cuidados`) : 'Sin responder' },
    { etiqueta: 'Lo cuidan', valor: nombreOpc(CUIDADORES, r.cuidadores) },
    { etiqueta: 'Aviso principal', valor: r.momento ? HORA_POR_MOMENTO[r.momento] : 'Sin responder' },
  ];
}

function Reconocimiento({
  nombre,
  r,
  entrada,
  onEditar,
  onSeguir,
}: {
  nombre: string;
  r: Respuestas;
  entrada: object;
  onEditar: (i: number) => void;
  onSeguir: () => void;
}) {
  return (
    <motion.main {...entrada} className="flex flex-1 flex-col gap-5 pt-4">
      {/* Dispositivo de marca: duotone de sus perros */}
      <div className="foto-duotone aspect-[5/2] rounded-[var(--radius-card)] border-2 border-[var(--surface)] shadow-[var(--shadow-2)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/perros-duotone.jpg" alt="Dos perros mirando a la cámara" width={900} height={360} />
      </div>
      <h1 tabIndex={-1} className="text-balance text-3xl font-bold leading-tight outline-none">
        Cuidar a {nombre} no tiene que depender de tu <span className="text-[var(--accent)]">memoria</span>
      </h1>
      <p className="text-lg text-[var(--text-secondary)]">Tú lo quieres hacer bien. El Panel de Hoy se acuerda contigo.</p>

      <ul aria-label="Tus respuestas" className="grid grid-cols-2 gap-2">
        {resumen(r).map((fila, i) => (
          <li key={fila.etiqueta}>
            <button
              type="button"
              onClick={() => onEditar(i)}
              aria-label={`Cambiar ${fila.etiqueta}: ${fila.valor}`}
              className="flex min-h-14 w-full items-center gap-2 rounded-[var(--radius-button)] border border-[var(--border-ui)] bg-[var(--surface)] px-3 py-2 text-left active:scale-[0.98] [touch-action:manipulation]"
            >
              <span className="flex-1">
                <span className="block text-sm text-[var(--text-secondary)]">{fila.etiqueta}</span>
                <span className="block text-base font-semibold leading-tight">{fila.valor}</span>
              </span>
              <Pencil size={16} color="var(--accent)" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-5">
        <button type="button" className={botonPrimario} onClick={onSeguir}>
          Armar el Panel de {nombre}
        </button>
      </div>
    </motion.main>
  );
}

function Armando({ nombre, r, onListo }: { nombre: string; r: Respuestas; onListo: () => void }) {
  const hora = r.momento ? HORA_POR_MOMENTO[r.momento] : '08:00';
  const lineas = [`Ordenando lo que necesita ${nombre}…`, `Poniendo su aviso principal a las ${hora}…`, 'Preparando quién hizo qué…'];
  const [visibles, setVisibles] = useState(0);
  useEffect(() => {
    const t = [
      setTimeout(() => setVisibles(1), 300),
      setTimeout(() => setVisibles(2), 1700),
      setTimeout(() => setVisibles(3), 3100),
      setTimeout(() => setVisibles(4), 4500),
      setTimeout(onListo, 5300),
    ];
    return () => t.forEach(clearTimeout);
  }, [onListo]);
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
      <span className="inline-flex size-16 items-center justify-center rounded-full bg-[var(--chip-bg)] motion-safe:animate-pulse">
        <PawPrint size={32} color="var(--accent)" aria-hidden="true" />
      </span>
      <h1 tabIndex={-1} className="text-2xl font-bold outline-none">Armando el Panel de Hoy de {nombre}</h1>
      <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--border-ui)_55%,var(--surface-2))]" aria-hidden="true">
        <motion.div
          className="h-full rounded-full bg-[var(--accent)]"
          initial={{ width: '0%' }}
          animate={{ width: `${(visibles / 4) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
      <button
        type="button"
        onClick={onListo}
        className="min-h-11 rounded-[var(--radius-button)] px-4 text-base font-medium text-[var(--text-secondary)] underline underline-offset-4"
      >
        Ver mi Panel ya
      </button>
      <ul className="flex min-h-24 flex-col gap-3 text-left" aria-live="polite">
        {lineas.slice(0, Math.min(visibles, 3)).map((l, i) => (
          <motion.li
            key={l}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-3 text-base text-[var(--text-secondary)]"
          >
            {i < visibles - 1 || visibles === 4 ? (
              <Check size={18} color="var(--accent)" aria-hidden="true" />
            ) : (
              <span aria-hidden="true" className="inline-block size-4 rounded-full border-2 border-[var(--accent)] border-t-transparent motion-safe:animate-spin" />
            )}
            {l}
          </motion.li>
        ))}
      </ul>
    </main>
  );
}

function Resultado({ nombre, r, entrada }: { nombre: string; r: Respuestas; entrada: object }) {
  const reduce = useReducedMotion();
  const items = armarPanel(r);
  const [hechos, setHechos] = useState<string[]>([]);
  const marcar = (id: string) => {
    setHechos((h) => (h.includes(id) ? h.filter((x) => x !== id) : [...h, id]));
    if (!r.primeraVictoria) actualizar({ primeraVictoria: true });
  };
  const n = contarRespuestas(r);
  const comparte = r.cuidadores !== null && r.cuidadores !== 'solo_yo';
  return (
    <motion.main {...entrada} className="flex flex-1 flex-col pt-4">
      <p className="text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">Tu Panel de Hoy</p>
      <h1 tabIndex={-1} className="mt-1 text-3xl font-bold leading-tight outline-none">Hoy con {nombre}</h1>
      <p className="mt-2 text-base text-[var(--text-secondary)]">Toca un cuidado para marcarlo como hecho. Así se siente.</p>
      <div className="mt-3 min-h-14" role="status" aria-live="polite">
        {hechos.length > 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-[var(--radius-button)] bg-[var(--chip-bg)] px-4 py-3 text-base font-semibold">
            ¡Eso es! Así de simple queda el día de {nombre}.
          </motion.p>
        )}
      </div>

      <ul className="mt-6 flex flex-col gap-3">
        {items.map((it) => {
          const hecho = hechos.includes(it.id);
          return (
            <li key={it.id}>
              <button
                type="button"
                aria-pressed={hecho}
                onClick={() => marcar(it.id)}
                className="flex min-h-16 w-full items-center gap-4 rounded-[var(--radius-card)] border border-[var(--border-ui)] bg-[var(--surface)] p-4 text-left shadow-[var(--shadow-1)] active:scale-[0.98] [touch-action:manipulation]"
              >
                <motion.span
                  aria-hidden="true"
                  animate={{ scale: hecho && !reduce ? [1, 1.15, 1] : 1 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className={`inline-flex size-8 shrink-0 items-center justify-center rounded-full border-2 ${
                    hecho ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--border-ui)]'
                  }`}
                >
                  {hecho && <Check size={18} color="var(--bg)" strokeWidth={3} />}
                </motion.span>
                <span className="flex-1">
                  <span className={`block text-base font-semibold ${hecho ? 'text-[var(--text-primary)]' : ''}`}>{it.titulo}</span>
                  <span className="block text-sm text-[var(--text-secondary)]">
                    {hecho ? (comparte ? 'Listo · así lo verán los demás tutores' : 'Listo · así queda registrado con la hora') : it.detalle}
                  </span>
                </span>
                {it.hora && <span className="text-base font-bold tabular-nums text-[var(--accent)]">{it.hora}</span>}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-sm text-[var(--text-secondary)]">Ejemplo armado con tus {n} respuestas. Tú pones los nombres y las dosis reales.</p>

      <div className="mt-auto flex flex-col gap-2 pt-8">
        <Link href="/paywall" className={botonPrimario}>
          Ver planes para {nombre}
        </Link>
      </div>
    </motion.main>
  );
}
