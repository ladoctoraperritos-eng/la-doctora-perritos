'use client';

// Onboarding: una pregunta por pantalla, cada respuesta cambia algo real del Panel de Hoy (02B).
// Orden: preguntas → reconocimiento → «armando tu panel» → resultado con primera victoria → /paywall.

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  Check,
  Clock,
  Home,
  Leaf,
  Moon,
  PawPrint,
  Pill,
  ShieldCheck,
  Sprout,
  Sun,
  Sunrise,
  User,
  Users,
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
          <button
            key={o.valor}
            type="button"
            role={multiple ? 'checkbox' : 'radio'}
            aria-checked={on}
            onClick={() => onElegir(o.valor)}
            className={`flex min-h-16 items-center gap-4 rounded-[var(--radius-card)] border-2 p-4 text-left transition-colors active:scale-[0.98] [touch-action:manipulation] ${
              on
                ? 'border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_8%,var(--surface))]'
                : 'border-[color-mix(in_oklab,var(--text-tertiary)_60%,transparent)] bg-[var(--surface)]'
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
              className={`inline-flex size-6 shrink-0 items-center justify-center rounded-full border-2 ${
                on ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[color-mix(in_oklab,var(--text-tertiary)_80%,transparent)]'
              }`}
            >
              {on && <Check size={14} color="var(--bg)" strokeWidth={3} />}
            </span>
          </button>
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
  { valor: 'comida', titulo: 'Comida', detalle: 'Te avisamos antes de que se acabe', icono: Utensils },
  { valor: 'solo_controles', titulo: 'Solo vacunas y controles', detalle: 'Sin tratamiento por ahora', icono: ShieldCheck },
];
const CUIDADORES: Opcion<Cuidadores>[] = [
  { valor: 'solo_yo', titulo: 'Solo yo', icono: User },
  { valor: 'pareja', titulo: 'Mi pareja y yo', icono: Users },
  { valor: 'familia', titulo: 'Mi familia', detalle: 'Hasta 3 tutores', icono: Home },
  { valor: 'cuidador', titulo: 'Un cuidador o paseador', icono: Users },
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
          <span
            key={p}
            className={`h-2 flex-1 rounded-full ${i <= paso ? 'bg-[var(--accent)]' : 'bg-[color-mix(in_oklab,var(--accent)_28%,var(--surface-2))]'}`}
          />
        ))}
      </div>
    </header>
  );
}

const botonPrimario =
  'inline-flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-lg font-semibold text-[var(--bg)] shadow-[var(--shadow-2)] transition-colors active:scale-[0.98] disabled:bg-[var(--surface-2)] disabled:text-[var(--text-secondary)] disabled:shadow-none [touch-action:manipulation]';

export default function Onboarding() {
  const r = useRespuestas();
  const router = useRouter();
  const reduce = useReducedMotion();
  const [fase, setFase] = useState<Fase>('preguntas');
  const [paso, setPaso] = useState(0);
  const irAlResultado = useCallback(() => setFase('resultado'), []);
  const raiz = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Al cambiar de pantalla el foco pasa al título (lectores de pantalla y teclado).
    if (fase === 'preguntas' && paso === 0) return;
    raiz.current?.querySelector<HTMLElement>('h1')?.focus();
  }, [paso, fase]);

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

  const siguiente = () => {
    if (paso < PASOS.length - 1) setPaso(paso + 1);
    else setFase('reconocimiento');
  };
  const atras = () => {
    if (fase !== 'preguntas') {
      setPaso(PASOS.length - 1);
      return setFase('preguntas');
    }
    if (paso > 0) setPaso(paso - 1);
    else router.push('/');
  };

  const entrada = {
    initial: { opacity: reduce ? 1 : 0, y: reduce ? 0 : 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const },
  };

  return (
    <div ref={raiz} className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-8 pt-4 text-[var(--text-primary)] [font-family:var(--font-body)]">
      <div className="-mt-2 mb-1">
        <Marca />
      </div>
      {fase === 'preguntas' ? (
        <Cabecera paso={paso} onAtras={atras} />
      ) : (
        <button
          type="button"
          onClick={atras}
          aria-label="Volver a las preguntas"
          className="inline-flex size-11 items-center justify-center rounded-full text-[var(--text-secondary)] [touch-action:manipulation]"
        >
          <ArrowLeft size={22} aria-hidden="true" />
        </button>
      )}

      {fase === 'preguntas' && (
        <motion.main key={actual} {...entrada} className="flex flex-1 flex-col pt-8">
          {actual === 'nombre' && (
            <>
              <h1 tabIndex={-1} className="outline-none text-3xl font-bold leading-tight">¿Cómo se llama tu perro?</h1>
              <p className="mt-2 text-base text-[var(--text-secondary)]">Así armamos su Panel de Hoy.</p>
              <label htmlFor="nombre" className="sr-only">
                Nombre de tu perro
              </label>
              <input
                id="nombre"
                autoFocus
                value={r.nombre}
                maxLength={30}
                autoComplete="off"
                placeholder="Por ejemplo, Toffee"
                onChange={(e) => actualizar({ nombre: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && valido.nombre && siguiente()}
                className="mt-6 h-14 w-full rounded-[var(--radius-card)] border-2 border-[color-mix(in_oklab,var(--text-tertiary)_70%,transparent)] bg-[var(--surface)] px-4 text-xl font-semibold outline-none placeholder:text-[var(--text-secondary)] focus:border-[var(--accent)]"
              />
            </>
          )}
          {actual === 'cantidad' && (
            <>
              <h1 tabIndex={-1} className="outline-none text-3xl font-bold leading-tight">¿Cuántos perros tienes?</h1>
              <p className="mt-2 text-base text-[var(--text-secondary)]">Empezamos con {nombre}; los demás los agregas después.</p>
              <Opciones nombreGrupo="Cuántos perros tienes" opciones={CANTIDAD} seleccion={r.cantidad} onElegir={(v) => actualizar({ cantidad: v })} />
            </>
          )}
          {actual === 'etapa' && (
            <>
              <h1 tabIndex={-1} className="outline-none text-3xl font-bold leading-tight">¿En qué etapa está {nombre}?</h1>
              <p className="mt-2 text-base text-[var(--text-secondary)]">Cambia qué controles y vacunas le mostramos.</p>
              <Opciones nombreGrupo="Etapa de tu perro" opciones={ETAPA} seleccion={r.etapa} onElegir={(v) => actualizar({ etapa: v })} />
            </>
          )}
          {actual === 'cuidados' && (
            <>
              <h1 tabIndex={-1} className="outline-none text-3xl font-bold leading-tight">¿Qué necesita {nombre} cada día?</h1>
              <p className="mt-2 text-base text-[var(--text-secondary)]">Elige lo que quieras. El resto lo agregas después.</p>
              <Opciones
                nombreGrupo="Qué necesita cada día"
                multiple
                opciones={CUIDADOS}
                seleccion={r.cuidados}
                onElegir={(v) => {
                  const ya = r.cuidados.includes(v);
                  const base = ya ? r.cuidados.filter((c) => c !== v) : [...r.cuidados, v];
                  // «Solo vacunas y controles» es excluyente con lo demás.
                  actualizar({ cuidados: v === 'solo_controles' && !ya ? ['solo_controles'] : base.filter((c) => c !== 'solo_controles' || v === 'solo_controles') });
                }}
              />
            </>
          )}
          {actual === 'cuidadores' && (
            <>
              <h1 tabIndex={-1} className="outline-none text-3xl font-bold leading-tight">¿Quién más cuida a {nombre}?</h1>
              <p className="mt-2 text-base text-[var(--text-secondary)]">Así todos ven qué se hizo y nadie duda.</p>
              <Opciones nombreGrupo="Quién más lo cuida" opciones={CUIDADORES} seleccion={r.cuidadores} onElegir={(v) => actualizar({ cuidadores: v })} />
            </>
          )}
          {actual === 'momento' && (
            <>
              <h1 tabIndex={-1} className="outline-none text-3xl font-bold leading-tight">¿Cuándo le das lo importante?</h1>
              <p className="mt-2 text-base text-[var(--text-secondary)]">Ahí pondremos su aviso principal.</p>
              <Opciones nombreGrupo="Cuándo le das lo importante" opciones={MOMENTO} seleccion={r.momento} onElegir={(v) => actualizar({ momento: v })} />
            </>
          )}

          <div className="mt-auto flex flex-col gap-2 pt-8">
            <button type="button" className={botonPrimario} disabled={!valido[actual]} onClick={siguiente}>
              Continuar
            </button>
            {SALTABLES.includes(actual) && (
              <button
                type="button"
                onClick={siguiente}
                className="h-12 text-base font-medium text-[var(--text-secondary)] [touch-action:manipulation]"
              >
                Saltar por ahora
              </button>
            )}
          </div>
        </motion.main>
      )}

      {fase === 'reconocimiento' && (
        <Reconocimiento nombre={nombre} entrada={entrada} onAtras={atras} onSeguir={() => setFase('armando')} />
      )}
      {fase === 'armando' && <Armando nombre={nombre} r={r} onListo={irAlResultado} />}
      {fase === 'resultado' && <Resultado nombre={nombre} r={r} entrada={entrada} />}
    </div>
  );
}

function Reconocimiento({
  nombre,
  entrada,
  onAtras,
  onSeguir,
}: {
  nombre: string;
  entrada: object;
  onAtras: () => void;
  onSeguir: () => void;
}) {
  return (
    <motion.main {...entrada} className="flex flex-1 flex-col justify-center gap-6 text-center">
      <span className="mx-auto inline-flex size-16 items-center justify-center rounded-full bg-[var(--chip-bg)]">
        <PawPrint size={32} color="var(--accent)" aria-hidden="true" />
      </span>
      <h1 tabIndex={-1} className="outline-none text-balance text-3xl font-bold leading-tight">
        {nombre} tiene a alguien que quiere hacerlo <span className="text-[var(--accent)]">bien</span>
      </h1>
      <p className="text-lg text-[var(--text-secondary)]">
        Y no tienes que acordarte de todo tú solo: el Panel de Hoy lo hace contigo.
      </p>
      <div className="flex flex-col gap-2 pt-4">
        <button type="button" className={botonPrimario} onClick={onSeguir}>
          Armar el Panel de {nombre}
        </button>
        <button type="button" onClick={onAtras} className="h-12 text-base font-medium text-[var(--text-secondary)]">
          Cambiar una respuesta
        </button>
      </div>
    </motion.main>
  );
}

function Armando({ nombre, r, onListo }: { nombre: string; r: Respuestas; onListo: () => void }) {
  const reduce = useReducedMotion();
  const hora = r.momento ? HORA_POR_MOMENTO[r.momento] : '08:00';
  const lineas = [
    `Ordenando lo que necesita ${nombre}…`,
    `Poniendo su aviso principal a las ${hora}…`,
    'Preparando quién hizo qué…',
  ];
  const [visibles, setVisibles] = useState(1);
  useEffect(() => {
    const t1 = setTimeout(() => setVisibles(2), 1300);
    const t2 = setTimeout(() => setVisibles(3), 2600);
    const t3 = setTimeout(onListo, 4000);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [onListo]);
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 text-center" aria-live="polite">
      <span className={`inline-flex size-16 items-center justify-center rounded-full bg-[var(--chip-bg)] ${reduce ? '' : 'animate-pulse'}`}>
        <PawPrint size={32} color="var(--accent)" aria-hidden="true" />
      </span>
      <h1 tabIndex={-1} className="outline-none text-2xl font-bold">Armando el Panel de Hoy de {nombre}</h1>
      <ul className="flex flex-col gap-3 text-left">
        {lineas.slice(0, visibles).map((l) => (
          <li key={l} className="flex items-center gap-3 text-base text-[var(--text-secondary)]">
            <Check size={18} color="var(--accent)" aria-hidden="true" />
            {l}
          </li>
        ))}
      </ul>
    </main>
  );
}

function Resultado({ nombre, r, entrada }: { nombre: string; r: Respuestas; entrada: object }) {
  const items = armarPanel(r);
  const [hechos, setHechos] = useState<string[]>([]);
  const marcar = (id: string) => {
    setHechos((h) => (h.includes(id) ? h.filter((x) => x !== id) : [...h, id]));
    if (!r.primeraVictoria) actualizar({ primeraVictoria: true });
  };
  const n = contarRespuestas(r);
  const comparte = r.cuidadores !== null && r.cuidadores !== 'solo_yo';
  return (
    <motion.main {...entrada} className="flex flex-1 flex-col pt-6">
      <p className="text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">Tu Panel de Hoy</p>
      <h1 tabIndex={-1} className="outline-none mt-1 text-3xl font-bold leading-tight">Hoy con {nombre}</h1>
      <p className="mt-2 text-base text-[var(--text-secondary)]">Toca un cuidado para marcarlo como hecho. Así se siente.</p>

      <ul className="mt-6 flex flex-col gap-3">
        {items.map((it) => {
          const hecho = hechos.includes(it.id);
          return (
            <li key={it.id}>
              <button
                type="button"
                aria-pressed={hecho}
                onClick={() => marcar(it.id)}
                className="flex min-h-16 w-full items-center gap-4 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--surface)] p-4 text-left shadow-[var(--shadow-1)] [touch-action:manipulation]"
              >
                <span
                  aria-hidden="true"
                  className={`inline-flex size-8 shrink-0 items-center justify-center rounded-full border-2 ${
                    hecho ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[color-mix(in_oklab,var(--text-tertiary)_80%,transparent)]'
                  }`}
                >
                  {hecho && <Check size={18} color="var(--bg)" strokeWidth={3} />}
                </span>
                <span className="flex-1">
                  <span className={`block text-base font-semibold ${hecho ? 'text-[var(--text-secondary)] line-through' : ''}`}>
                    {it.titulo}
                  </span>
                  <span className="block text-sm text-[var(--text-secondary)]">{hecho ? (comparte ? 'Listo · así lo verán los demás tutores' : 'Listo · así queda registrado con la hora') : it.detalle}</span>
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
          Seguir con {nombre}
        </Link>
      </div>
    </motion.main>
  );
}
