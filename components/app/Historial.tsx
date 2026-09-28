'use client';

// Pestaña «Historial»: una misión — saber quién hizo qué y cuándo (el «¿ya se lo diste?» resuelto).
// SPEC (PREFLIGHT):
//   objeto_principal: la línea de tiempo agrupada por día, con la persona de cada registro
//   niveles: display 3xl · title lg (días) · body base · label sm
//   acento_en: tu propio nombre y el conteo de la semana; el coral marca a las demás personas (ficha de arte)
//   baseline: entrada escalonada · conteo de la semana · tap con escala en filtros
//   estados: cargando (esqueleto) · sin registros · sin resultados con filtros · «ver más días»

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { motion, MotionConfig } from 'motion/react';
import { ClipboardList, NotebookPen, Thermometer, X } from 'lucide-react';
import { NOMBRE_INTENSIDAD, TONO_INTENSIDAD } from './Bitacora';
import { ChipIcono, entrada, Menu, PersonaCirculo, tono } from './Hoy';
import { Hoja } from './Hoja';
import { SlidersHorizontal } from 'lucide-react';
import { diasHasta, obtenerApp, suscribirApp, type EstadoApp, type Perro, type Registro, type Cuidado, type Nota, type Tipo } from '@/lib/app';

type GrupoTipo = 'todos' | 'medicamento' | 'suplemento' | 'comida' | 'salud' | 'bitacora';
const GRUPOS: { valor: GrupoTipo; texto: string }[] = [
  { valor: 'todos', texto: 'Todo' },
  { valor: 'medicamento', texto: 'Medicamentos' },
  { valor: 'suplemento', texto: 'Suplementos' },
  { valor: 'comida', texto: 'Alimento' },
  { valor: 'salud', texto: 'Salud' },
  { valor: 'bitacora', texto: 'Bitácora' },
];
const SALUD: Tipo[] = ['vacuna', 'antiparasitario', 'bano', 'control'];
const DIAS_POR_PAGINA = 7;

interface Fila {
  registro: Registro;
  /** Un cuidado marcado como hecho… */
  cuidado?: Cuidado;
  /** …o una anotación de la bitácora (síntoma o nota). */
  nota?: Nota;
  perro: Perro;
}

const diaTexto = (clave: string, ahora: Date) => {
  const d = diasHasta(clave, ahora);
  if (d === 0) return 'Hoy';
  if (d === -1) return 'Ayer';
  const [a, m, n] = clave.split('-').map(Number);
  const t = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(a, m - 1, n));
  return t.charAt(0).toUpperCase() + t.slice(1);
};

function Chips({ titulo, opciones, valor, onElegir }: { titulo: string; opciones: { valor: string; texto: string }[]; valor: string; onElegir: (v: string) => void }) {
  return (
    <div role="radiogroup" aria-label={titulo} className="flex gap-2 overflow-x-auto pb-1">
      {opciones.map((o) => {
        const on = valor === o.valor;
        return (
          <button
            key={o.valor}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onElegir(o.valor)}
            className={`inline-flex min-h-11 shrink-0 items-center rounded-full border-2 px-4 text-base font-semibold [touch-action:manipulation] ${
              on ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--bg)]' : 'border-[var(--border-ui)] bg-[var(--surface)] text-[var(--text-primary)]'
            }`}
          >
            {o.texto}
          </button>
        );
      })}
    </div>
  );
}

/** Inicial de la persona: verde para ti, coral para las demás (2.ª nota de la ficha de arte). */
export default function Historial() {
  const e = useSyncExternalStore(suscribirApp, obtenerApp, () => null);
  const [perroId, setPerroId] = useState('todos');
  const [persona, setPersona] = useState('todos');
  const [grupo, setGrupo] = useState<GrupoTipo>('todos');
  const [paginas, setPaginas] = useState(1);

  if (!e) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col [font-family:var(--font-body)]">
        <main className="flex flex-1 flex-col gap-4 px-6 pt-6" aria-busy="true" aria-label="Cargando el historial">
          <div className="h-10 w-48 rounded-[var(--radius-button)] bg-[var(--surface-2)] motion-safe:animate-pulse" />
          <div className="h-24 rounded-[var(--radius-card)] bg-[var(--surface-2)] motion-safe:animate-pulse" />
          <div className="h-16 rounded-[var(--radius-card)] bg-[var(--surface-2)] motion-safe:animate-pulse" />
          <div className="h-16 rounded-[var(--radius-card)] bg-[var(--surface-2)] motion-safe:animate-pulse" />
        </main>
        <Menu activa="historial" />
      </div>
    );
  }
  return <Contenido e={e} perroId={perroId} setPerroId={setPerroId} persona={persona} setPersona={setPersona} grupo={grupo} setGrupo={setGrupo} paginas={paginas} setPaginas={setPaginas} />;
}

function Contenido({
  e,
  perroId,
  setPerroId,
  persona,
  setPersona,
  grupo,
  setGrupo,
  paginas,
  setPaginas,
}: {
  e: EstadoApp;
  perroId: string;
  setPerroId: (v: string) => void;
  persona: string;
  setPersona: (v: string) => void;
  grupo: GrupoTipo;
  setGrupo: (v: GrupoTipo) => void;
  paginas: number;
  setPaginas: (n: number) => void;
}) {
  const ahora = new Date();
  const yo = e.tutores.find((t) => t.id === e.yo)?.nombre ?? '';
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

  // Todos los registros con su cuidado y su perro, del más reciente al más antiguo.
  const todas: Fila[] = [];
  for (const r of e.registros) {
    const cuidado = e.cuidados.find((c) => c.id === r.cuidadoId);
    const perro = cuidado && e.perros.find((p) => p.id === cuidado.perroId);
    if (cuidado && perro) todas.push({ registro: r, cuidado, perro });
  }
  for (const n of e.notas) {
    const perro = e.perros.find((p) => p.id === n.perroId);
    if (perro) todas.push({ registro: { id: n.id, cuidadoId: '', dia: n.dia, hora: n.hora, quien: n.quien }, nota: n, perro });
  }
  todas.sort((a, b) => `${b.registro.dia} ${b.registro.hora}`.localeCompare(`${a.registro.dia} ${a.registro.hora}`));

  const filtradas = todas.filter(
    (f) =>
      (perroId === 'todos' || f.perro.id === perroId) &&
      (persona === 'todos' || f.registro.quien === persona) &&
      (grupo === 'todos' || (grupo === 'bitacora' ? !!f.nota : !!f.cuidado && (grupo === 'salud' ? SALUD.includes(f.cuidado.tipo) : f.cuidado.tipo === grupo))),
  );
  const hayFiltros = perroId !== 'todos' || persona !== 'todos' || grupo !== 'todos';
  const nFiltros = [perroId !== 'todos', persona !== 'todos', grupo !== 'todos'].filter(Boolean).length;
  const limpiar = () => {
    setPerroId('todos');
    setPersona('todos');
    setGrupo('todos');
  };

  // Conteo de los últimos 7 días por persona (sobre lo visible según perro y tipo).
  const semana = todas.filter((f) => f.cuidado && diasHasta(f.registro.dia, ahora) > -7);
  const porPersona = e.tutores.map((t) => ({ nombre: t.nombre, n: semana.filter((f) => f.registro.quien === t.nombre).length, esYo: t.nombre === yo }));
  const totalSemana = porPersona.reduce((s, p) => s + p.n, 0);

  // Agrupado por día, mostrando `paginas` bloques de 7 días.
  const dias: string[] = [];
  for (const f of filtradas) if (!dias.includes(f.registro.dia)) dias.push(f.registro.dia);
  const visibles = dias.slice(0, paginas * DIAS_POR_PAGINA);

  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col text-[var(--text-primary)] [font-family:var(--font-body)]">
        <main className="flex flex-1 flex-col gap-6 px-6 pb-24 pt-6">
          <header>
            <h1 className="text-3xl font-bold leading-tight">Historial</h1>
            <p className="mt-1 text-base text-[var(--text-secondary)]">Quién hizo qué y cuándo.</p>
          </header>

          {totalSemana > 0 && e.tutores.length > 1 && (
            <motion.section {...entrada(0)} aria-label="Esta semana" className="borde-degradado rounded-[var(--radius-card)] p-4 shadow-[var(--shadow-1)]">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">Esta semana</h2>
              <ul className="mt-3 flex flex-col gap-3">
                {porPersona.map((p) => (
                  <li key={p.nombre} className="flex items-center gap-3">
                    <PersonaCirculo nombre={p.nombre} esYo={p.esYo} />
                    <span className="w-24 shrink-0 truncate text-base font-semibold">{p.esYo ? `${p.nombre} (tú)` : p.nombre}</span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--border-ui)_40%,var(--surface-2))]" aria-hidden="true">
                      <motion.span
                        className={`block h-full rounded-full ${p.esYo ? 'bg-[var(--accent)]' : 'bg-[var(--accent-2)]'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${(p.n / Math.max(...porPersona.map((x) => x.n), 1)) * 100}%` }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </span>
                    <span className="w-8 shrink-0 text-right text-base font-bold tabular-nums">{p.n}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-[var(--text-secondary)]">Cuidados registrados en los últimos 7 días.</p>
            </motion.section>
          )}

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setFiltrosAbiertos(true)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-[var(--border-ui)] bg-[var(--surface)] px-4 text-base font-semibold [touch-action:manipulation]"
            >
              <SlidersHorizontal size={18} aria-hidden="true" />
              Filtros
              {nFiltros > 0 && <span className="inline-flex size-6 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-bold text-[var(--bg)]">{nFiltros}</span>}
            </button>
            {hayFiltros && (
              <button type="button" onClick={limpiar} className="inline-flex min-h-11 items-center gap-1 rounded-[var(--radius-button)] px-3 text-base font-semibold text-[var(--accent)] [touch-action:manipulation]">
                <X size={18} aria-hidden="true" />
                Quitar
              </button>
            )}
          </div>
          <Hoja abierta={filtrosAbiertos} titulo="Filtros" onCerrar={() => setFiltrosAbiertos(false)}>
            <div className="flex flex-col gap-5">
              {e.perros.length > 1 && (
                <div>
                  <p className="mb-2 text-base font-semibold">Perro</p>
                  <div role="radiogroup" aria-label="Perro" className="flex flex-wrap gap-3">
                    <AvatarChip nombre="Todos" activo={perroId === 'todos'} onElegir={() => setPerroId('todos')} />
                    {e.perros.map((p) => (
                      <AvatarChip key={p.id} nombre={p.nombre} foto={p.foto} activo={perroId === p.id} onElegir={() => setPerroId(p.id)} />
                    ))}
                  </div>
                </div>
              )}
              {e.tutores.length > 1 && (
                <div>
                  <p className="mb-2 text-base font-semibold">Persona</p>
                  <div role="radiogroup" aria-label="Persona" className="flex flex-wrap gap-3">
                    <AvatarChip nombre="Todas" activo={persona === 'todos'} onElegir={() => setPersona('todos')} />
                    {e.tutores.map((t) => (
                      <AvatarChip key={t.id} nombre={t.nombre === yo ? `${t.nombre} (tú)` : t.nombre} foto={t.foto} esYo={t.nombre === yo} activo={persona === t.nombre} onElegir={() => setPersona(t.nombre)} />
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="mb-2 text-base font-semibold">Tipo de cuidado</p>
                <Chips titulo="Tipo de cuidado" valor={grupo} onElegir={(v) => setGrupo(v as GrupoTipo)} opciones={GRUPOS} />
              </div>
              <button type="button" onClick={() => setFiltrosAbiertos(false)} className="inline-flex h-14 items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-lg font-semibold text-[var(--bg)]">
                Ver resultados
              </button>
            </div>
          </Hoja>

          {todas.length === 0 ? (
            <section aria-label="Sin registros" className="flex flex-col items-start gap-3 rounded-[var(--radius-card)] border-2 border-dashed border-[var(--border-ui)] p-6">
              <span className="inline-flex size-12 items-center justify-center rounded-[var(--radius-button)] bg-[var(--chip-bg)]">
                <ClipboardList size={24} color="var(--accent)" aria-hidden="true" />
              </span>
              <p className="text-xl font-bold leading-tight">Aún no hay registros</p>
              <p className="text-base text-[var(--text-secondary)]">Cada cuidado que marques como hecho quedará aquí, con quién lo hizo y a qué hora.</p>
              <Link href="/app" className="inline-flex h-12 items-center rounded-[var(--radius-button)] bg-[var(--accent)] px-5 text-base font-semibold text-[var(--bg)]">
                Ir a Hoy
              </Link>
            </section>
          ) : filtradas.length === 0 ? (
            <section aria-label="Sin resultados" className="flex flex-col items-start gap-3 rounded-[var(--radius-card)] border-2 border-dashed border-[var(--border-ui)] p-6">
              <p className="text-xl font-bold leading-tight">Nada con estos filtros</p>
              <p className="text-base text-[var(--text-secondary)]">Prueba con otra persona, otro perro u otro tipo de cuidado.</p>
              <button type="button" onClick={limpiar} className="inline-flex h-12 items-center rounded-[var(--radius-button)] border-2 border-[var(--accent)] px-5 text-base font-semibold text-[var(--accent)]">
                Quitar filtros
              </button>
            </section>
          ) : (
            <div className="flex flex-col gap-6">
              {visibles.map((dia, gi) => (
                <section key={dia} aria-label={diaTexto(dia, ahora)}>
                  <h2 className="mb-2 text-lg font-bold">{diaTexto(dia, ahora)}</h2>
                  <ul className="flex flex-col gap-2">
                    {filtradas
                      .filter((f) => f.registro.dia === dia)
                      .map((f, i) => (
                        <motion.li key={f.registro.id} {...entrada(gi === 0 ? i : 0)} className="flex min-h-16 items-center gap-4 rounded-[var(--radius-card)] border border-[var(--border-ui)] bg-[var(--surface)] p-4">
                          {f.cuidado ? (
                            <ChipIcono tipo={f.cuidado.tipo} />
                          ) : (
                            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-[var(--chip-bg)]">
                              {f.nota?.tipo === 'sintoma' ? <Thermometer size={22} color="var(--accent)" aria-hidden="true" /> : <NotebookPen size={22} color="var(--accent)" aria-hidden="true" />}
                            </span>
                          )}
                          <span className="min-w-0 flex-1">
                            {f.nota ? (
                              <span className="flex flex-wrap items-center gap-2">
                                <span className="text-base font-semibold">{f.nota.tipo === 'sintoma' ? 'Síntoma' : 'Nota'}</span>
                                {f.nota.intensidad && <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-sm font-semibold ${tono[TONO_INTENSIDAD[f.nota.intensidad]]}`}>{NOMBRE_INTENSIDAD[f.nota.intensidad]}</span>}
                              </span>
                            ) : (
                              <span className="block text-base font-semibold">{f.cuidado?.nombre}</span>
                            )}
                            {f.nota && <span className="mt-1 block text-base">{f.nota.texto}</span>}
                            <span className="mt-1 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                              <PersonaCirculo nombre={f.registro.quien} foto={e.tutores.find((t) => t.nombre === f.registro.quien)?.foto} esYo={f.registro.quien === yo} />
                              <span>
                                {e.perros.length > 1 ? `${f.perro.nombre} · ` : ''}
                                {f.registro.quien}
                              </span>
                            </span>
                          </span>
                          <span className="shrink-0 text-base font-bold tabular-nums text-[var(--accent)]">{f.registro.hora}</span>
                        </motion.li>
                      ))}
                  </ul>
                </section>
              ))}
              {dias.length > visibles.length && (
                <button
                  type="button"
                  onClick={() => setPaginas(paginas + 1)}
                  className="inline-flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] border-2 border-[var(--accent)] text-lg font-semibold text-[var(--accent)] [touch-action:manipulation]"
                >
                  Ver más días
                </button>
              )}
            </div>
          )}
        </main>
        <Menu activa="historial" />
      </div>
    </MotionConfig>
  );
}

function AvatarChip({ nombre, foto, esYo = false, activo, onElegir }: { nombre: string; foto?: string; esYo?: boolean; activo: boolean; onElegir: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={activo}
      onClick={onElegir}
      className={`flex flex-col items-center gap-1 rounded-[var(--radius-button)] p-2 [touch-action:manipulation] ${activo ? 'bg-[color-mix(in_oklab,var(--accent)_10%,transparent)]' : ''}`}
    >
      <span className={`inline-flex size-14 items-center justify-center rounded-full border-2 ${activo ? 'border-[var(--accent)]' : 'border-transparent'}`}>
        {foto ? (
          <PersonaCirculo nombre={nombre} foto={foto} esYo={esYo} tam="size-12" />
        ) : (
          <span aria-hidden="true" className="inline-flex size-12 items-center justify-center rounded-full bg-[var(--chip-bg)] text-lg font-bold text-[var(--accent)]">
            {nombre.charAt(0).toUpperCase()}
          </span>
        )}
      </span>
      <span className={`max-w-16 truncate text-sm ${activo ? 'font-semibold text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}>{nombre}</span>
    </button>
  );
}
