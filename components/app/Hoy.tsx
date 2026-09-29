'use client';

// Pantalla «Hoy» (M0, el ritual diario). Una misión: saber qué toca ahora y marcarlo con un toque.
// SPEC (PREFLIGHT):
//   objeto_principal: tarjeta «Siguiente cuidado» con la hora en grande + botón «Marcar como hecho»
//   niveles: display 3xl (título) · title xl (cuidado) · body base · label sm
//   acento_en: hora clave, botón principal, anillo de progreso, estado activo del menú
//   baseline: entrada escalonada · anillo que se llena · conteo del progreso · tap con escala · celebración sobria
//   dispositivo_ownable: foto del perro a color con marco de hairline degradado en la cabecera (decisión del usuario 2026-09-24)
//   estados: cargando (esqueleto) · vacío · al día (éxito) · sin conexión · deshabilitado (menú «Pronto»)

import { useEffect, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, MotionConfig, animate, motion, useReducedMotion } from 'motion/react';
import {
  Bug,
  Check,
  Droplets,
  Leaf,
  PawPrint,
  Pill,
  Stethoscope,
  Syringe,
  Undo2,
  Utensils,
  WifiOff,
  type LucideIcon,
} from 'lucide-react';
import {
  deshacer,
  hoy,
  huboFalloGuardado,
  manana,
  marcarHecho,
  obtenerApp,
  proximos,
  reintentarGuardado,
  suscribirApp,
  type EstadoApp,
  type FilaHoy,
  type Perro,
  type FilaProxima,
  type Tipo,
} from '@/lib/app';

export const ICONO: Record<Tipo, LucideIcon> = {
  medicamento: Pill,
  suplemento: Leaf,
  comida: Utensils,
  vacuna: Syringe,
  antiparasitario: Bug,
  bano: Droplets,
  control: Stethoscope,
};

/** Ilustraciones propias del usuario (2026-09-29), a color: reemplazan el ícono de línea cuando existen.
 * «comida» aún no tiene la suya, así que sigue con el ícono de línea + color de categoría. */
const IMAGEN_TIPO: Partial<Record<Tipo, string>> = {
  medicamento: '/brand/cuidado-medicamento.png',
  suplemento: '/brand/cuidado-suplemento.png',
  antiparasitario: '/brand/cuidado-antiparasitario.png',
  bano: '/brand/cuidado-bano.png',
  control: '/brand/cuidado-control.png',
  vacuna: '/brand/cuidado-vacuna.png',
};

// Reloj de la app: minuto actual en el navegador; en el servidor es null (sin desajuste de hidratación).
const suscribirReloj = (avisar: () => void) => {
  const id = setInterval(avisar, 30000);
  return () => clearInterval(id);
};
const minutoActual = () => Math.floor(Date.now() / 60000);
const enLinea = () => navigator.onLine;
const suscribirRed = (avisar: () => void) => {
  window.addEventListener('online', avisar);
  window.addEventListener('offline', avisar);
  return () => {
    window.removeEventListener('online', avisar);
    window.removeEventListener('offline', avisar);
  };
};

const fechaLarga = (d: Date) => {
  const t = new Intl.DateTimeFormat('es', { weekday: 'short', day: 'numeric', month: 'short' }).format(d).replace(/\.|,/g, '');
  return t.charAt(0).toUpperCase() + t.slice(1);
};

const etiquetaFaltan = (min: number): { texto: string; tono: 'atrasado' | 'pronto' | 'normal' } => {
  if (min < 0) {
    const a = -min;
    return { texto: a >= 60 ? `Atrasado ${Math.floor(a / 60)} h` : `Atrasado ${a} min`, tono: 'atrasado' };
  }
  if (min <= 60) return { texto: min <= 1 ? 'Ahora' : `En ${min} min`, tono: 'pronto' };
  return { texto: `En ${Math.floor(min / 60)} h`, tono: 'normal' };
};

export const tono = {
  atrasado: 'bg-[color-mix(in_oklab,var(--danger)_14%,var(--surface))] text-[var(--danger)]',
  pronto: 'bg-[color-mix(in_oklab,var(--warn)_14%,var(--surface))] text-[var(--warn)]',
  normal: 'bg-[var(--chip-bg)] text-[var(--accent)]',
} as const;

export const entrada = (i: number) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.28, delay: 0.05 * i, ease: [0.16, 1, 0.3, 1] as const },
});

function Anillo({ hechos, total }: { hechos: number; total: number }) {
  const reduce = useReducedMotion();
  const fraccion = total === 0 ? 0 : hechos / total;
  const [visto, setVisto] = useState(reduce ? hechos : 0);
  useEffect(() => {
    if (reduce) return;
    const c = animate(visto, hechos, { duration: 0.5, ease: 'easeOut', onUpdate: (x) => setVisto(Math.round(x)) });
    return () => c.stop();
    // Se anima solo cuando cambia el número de hechos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hechos, reduce]);
  return (
    <div className="relative size-16 shrink-0" role="img" aria-label={`${hechos} de ${total} cuidados hechos hoy`}>
      <svg viewBox="0 0 96 96" className="size-16 -rotate-90">
        <circle cx="48" cy="48" r="40" fill="none" strokeWidth="8" className="stroke-[color-mix(in_oklab,var(--border-ui)_40%,var(--surface-2))]" />
        <motion.circle
          cx="48"
          cy="48"
          r="40"
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className="stroke-[var(--accent)]"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: fraccion, opacity: fraccion > 0 ? 1 : 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold tabular-nums leading-none">{reduce ? hechos : visto}</span>
        <span className="text-sm text-[var(--text-secondary)]">/{total}</span>
      </div>
    </div>
  );
}

export function Avatar({ perro, grande = false }: { perro: Perro; grande?: boolean }) {
  const tam = grande ? 'size-24' : 'size-14';
  return perro.foto ? (
    <span className={`borde-degradado ${tam} shrink-0 overflow-hidden rounded-full border-2 shadow-[var(--shadow-1)]`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={perro.foto} alt={`Foto de ${perro.nombre}`} width={96} height={96} className="size-full object-cover" />
    </span>
  ) : (
    <span aria-hidden="true" className={`inline-flex ${tam} shrink-0 items-center justify-center rounded-full bg-[var(--chip-bg)]`}>
      <PawPrint size={grande ? 40 : 28} color="var(--accent)" />
    </span>
  );
}

/** Círculo de una persona: su foto si tiene, si no la inicial (verde si eres tú, coral si es otra). */
export function PersonaCirculo({ nombre, foto, esYo, tam = 'size-8', textoTam = 'text-sm' }: { nombre: string; foto?: string; esYo: boolean; tam?: string; textoTam?: string }) {
  if (foto) {
    return (
      <span className={`inline-flex ${tam} shrink-0 items-center justify-center overflow-hidden rounded-full border-2 ${esYo ? 'border-[var(--accent)]' : 'border-[var(--accent-2)]'}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={foto} alt={`Foto de ${nombre}`} width={64} height={64} className="size-full object-cover" />
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`inline-flex ${tam} shrink-0 items-center justify-center rounded-full font-bold ${textoTam} ${
        esYo ? 'bg-[var(--accent)] text-[var(--bg)]' : 'bg-[var(--accent-2)] text-[var(--text-primary)]'
      }`}
    >
      {nombre.charAt(0).toUpperCase()}
    </span>
  );
}

function Esqueleto() {
  return (
    <div className="flex flex-col gap-4 px-6 pt-6" aria-busy="true" aria-label="Cargando tu día">
      <div className="h-4 w-40 rounded-full bg-[var(--surface-2)] motion-safe:animate-pulse" />
      <div className="h-10 w-64 rounded-[var(--radius-button)] bg-[var(--surface-2)] motion-safe:animate-pulse" />
      <div className="h-44 rounded-[var(--radius-card)] bg-[var(--surface-2)] motion-safe:animate-pulse" />
      <div className="h-16 rounded-[var(--radius-card)] bg-[var(--surface-2)] motion-safe:animate-pulse" />
      <div className="h-16 rounded-[var(--radius-card)] bg-[var(--surface-2)] motion-safe:animate-pulse" />
    </div>
  );
}

/** Color por categoría (2026-09-28, dirección «premium»): solo en el ícono secundario, nunca en CTA/precio
 * ni en las etiquetas de urgencia (esas siguen semáforo rojo/ámbar). El acento verde manda en todo lo demás. */
export const CATEGORIA: Record<Tipo, string> = {
  medicamento: 'var(--cat-botiquin)',
  suplemento: 'var(--cat-botiquin)',
  comida: 'var(--cat-comida)',
  vacuna: 'var(--cat-salud)',
  antiparasitario: 'var(--cat-salud)',
  bano: 'var(--cat-salud)',
  control: 'var(--cat-salud)',
};

export function ChipIcono({ tipo, tam = 'size-11' }: { tipo: Tipo; tam?: string }) {
  const imagen = IMAGEN_TIPO[tipo];
  if (imagen) {
    return (
      <span className={`inline-flex ${tam} shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-button)] bg-[var(--surface-2)]`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imagen} alt="" width={40} height={40} className="size-[80%] object-contain" />
      </span>
    );
  }
  const Icono = ICONO[tipo];
  const color = CATEGORIA[tipo];
  return (
    <span className={`inline-flex ${tam} shrink-0 items-center justify-center rounded-[var(--radius-button)]`} style={{ background: `color-mix(in oklab, ${color} 16%, var(--surface))` }}>
      <Icono size={22} color={color} aria-hidden="true" />
    </span>
  );
}

function Tarjeta({ fila, onHecho, varios }: { fila: FilaHoy; onHecho: () => void; varios: boolean }) {
  const { texto, tono: t } = etiquetaFaltan(fila.faltan);
  return (
    <motion.section {...entrada(1)} aria-label="Siguiente cuidado" className="borde-degradado rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-2)]">
      <p className="text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">Siguiente cuidado</p>
      <div className="mt-3 flex items-start gap-4">
        <ChipIcono tipo={fila.cuidado.tipo} tam="size-12" />
        <div className="min-w-0 flex-1">
          <p className="text-xl font-bold leading-tight">{fila.cuidado.nombre}</p>
          <p className="mt-1 text-base text-[var(--text-secondary)]">
            {varios ? `${fila.perro.nombre} · ` : ''}
            {fila.cuidado.detalle}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <span className="text-3xl font-bold tabular-nums text-[var(--accent)]">{fila.cuidado.hora}</span>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${tono[t]}`}>{texto}</span>
      </div>
      <button
        type="button"
        onClick={onHecho}
        className="mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[image:var(--accent-gradient)] text-lg font-semibold text-[var(--bg)] shadow-[var(--shadow-2)] transition-transform duration-150 active:scale-[0.97] [touch-action:manipulation]"
      >
        <Check size={22} strokeWidth={3} aria-hidden="true" />
        Marcar como hecho
      </button>
    </motion.section>
  );
}

function FilaPendiente({ fila, varios, onHecho, i }: { fila: FilaHoy; varios: boolean; onHecho: () => void; i: number }) {
  const { texto, tono: t } = etiquetaFaltan(fila.faltan);
  return (
    <motion.li {...entrada(i)}>
      <button
        type="button"
        onClick={onHecho}
        aria-label={`Marcar ${fila.cuidado.nombre} de ${fila.perro.nombre} como hecho`}
        className="flex min-h-16 w-full items-center gap-4 rounded-[var(--radius-card)] border border-[var(--border-ui)] bg-[var(--surface)] p-4 text-left shadow-[var(--shadow-1)] transition-transform duration-150 active:scale-[0.98] [touch-action:manipulation]"
      >
        <ChipIcono tipo={fila.cuidado.tipo} />
        <span className="min-w-0 flex-1">
          <span className="block text-base font-semibold">{fila.cuidado.nombre}</span>
          <span className="block text-sm text-[var(--text-secondary)]">
            {varios ? `${fila.perro.nombre} · ` : ''}
            {fila.cuidado.detalle}
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-base font-bold tabular-nums text-[var(--accent)]">{fila.cuidado.hora}</span>
            {t !== 'normal' && <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-sm font-semibold ${tono[t]}`}>{texto}</span>}
          </span>
        </span>
        <span aria-hidden="true" className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-[var(--border-ui)]" />
      </button>
    </motion.li>
  );
}

function FilaHecha({ fila, varios, onDeshacer }: { fila: FilaHoy; varios: boolean; onDeshacer: () => void }) {
  return (
    <li className="flex min-h-16 items-center gap-4 rounded-[var(--radius-card)] bg-[var(--elevated)] p-4">
      <span aria-hidden="true" className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]">
        <Check size={18} color="var(--bg)" strokeWidth={3} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold">{fila.cuidado.nombre}</span>
        <span className="block text-sm text-[var(--text-secondary)]">
          {varios ? `${fila.perro.nombre} · ` : ''}
          {fila.registro?.quien} · {fila.registro?.hora}
        </span>
      </span>
      <button
        type="button"
        onClick={onDeshacer}
        aria-label={`Deshacer ${fila.cuidado.nombre}`}
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-[var(--text-secondary)] [touch-action:manipulation]"
      >
        <Undo2 size={20} aria-hidden="true" />
      </button>
    </li>
  );
}

export function textoDias(d: number): { texto: string; tono: keyof typeof tono } {
  if (d < 0) return { texto: d === -1 ? 'Venció ayer' : `Venció hace ${-d} días`, tono: 'atrasado' };
  if (d === 0) return { texto: 'Hoy', tono: 'pronto' };
  if (d === 1) return { texto: 'Mañana', tono: 'pronto' };
  return { texto: `En ${d} días`, tono: d <= 7 ? 'pronto' : 'normal' };
}

function FilaFutura({ fila, varios, i }: { fila: FilaProxima; varios: boolean; i: number }) {
  const { texto, tono: t } = textoDias(fila.dias);
  return (
    <motion.li {...entrada(i)} className="flex min-h-16 items-center gap-4 rounded-[var(--radius-card)] border border-[var(--border-ui)] bg-[var(--surface)] p-4">
      <ChipIcono tipo={fila.cuidado.tipo} />
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold">{fila.cuidado.hora ? `Reponer ${fila.cuidado.nombre}` : fila.cuidado.nombre}</span>
        <span className="block text-sm text-[var(--text-secondary)]">
          {varios ? `${fila.perro.nombre} · ` : ''}
          {fila.cuidado.hora ? 'Se acaba' : fila.cuidado.detalle}
        </span>
        <span className={`mt-1 inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-sm font-semibold ${tono[t]}`}>{texto}</span>
      </span>
    </motion.li>
  );
}

function Selector({ e, activo, onElegir }: { e: EstadoApp; activo: string | null; onElegir: (id: string | null) => void }) {
  const opciones = [{ id: null as string | null, nombre: 'Todos' }, ...e.perros.map((p) => ({ id: p.id as string | null, nombre: p.nombre }))];
  return (
    <div role="radiogroup" aria-label="Perro" className="flex gap-2 overflow-x-auto pb-1">
      {opciones.map((o) => {
        const on = o.id === activo;
        return (
          <button
            key={o.id ?? 'todos'}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onElegir(o.id)}
            className={`inline-flex min-h-11 shrink-0 items-center rounded-full border-2 px-4 text-base font-semibold [touch-action:manipulation] ${
              on ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--bg)]' : 'border-[var(--border-ui)] bg-[var(--surface)] text-[var(--text-primary)]'
            }`}
          >
            {o.nombre}
          </button>
        );
      })}
    </div>
  );
}

export default function Hoy() {
  const e = useSyncExternalStore(suscribirApp, obtenerApp, () => null);
  const minuto = useSyncExternalStore(suscribirReloj, minutoActual, () => null);
  const conexion = useSyncExternalStore(suscribirRed, enLinea, () => true);
  const fallo = useSyncExternalStore(suscribirApp, huboFalloGuardado, () => false);
  const [perroId, setPerroId] = useState<string | null>(null);
  const [ultimo, setUltimo] = useState<{ id: string; texto: string } | null>(null);
  useEffect(() => {
    if (!ultimo) return;
    const t = setTimeout(() => setUltimo(null), 6000);
    return () => clearTimeout(t);
  }, [ultimo]);
  const hacer = (cuidadoId: string, nombre: string) => setUltimo({ id: marcarHecho(cuidadoId, new Date()), texto: nombre });

  if (!e || minuto === null) {
    return (
      <main className="flex-1">
        <Esqueleto />
      </main>
    );
  }

  const ahora = new Date(minuto * 60000);
  const { pendientes, hechos } = hoy(e, perroId, ahora);
  const futuros = proximos(e, perroId, ahora);
  const varios = e.perros.length > 1 && perroId === null;
  const total = pendientes.length + hechos.length;
  const activo = e.perros.find((p) => p.id === perroId);
  const titulo = activo ? `Hoy con ${activo.nombre}` : e.perros.length === 1 ? `Hoy con ${e.perros[0].nombre}` : 'Hoy con tus perros';
  const [siguiente, ...resto] = pendientes;
  const mana = manana(e, perroId);

  return (
    <MotionConfig reducedMotion="user">
      <>
        {fallo && (
          <div role="alert" className="flex items-center justify-between gap-2 bg-[color-mix(in_oklab,var(--danger)_14%,var(--surface))] px-6 py-2 text-[var(--danger)]">
            <p className="text-sm font-semibold">No pudimos guardar en este aparato. Lo ves ahora, pero puede perderse al cerrar.</p>
            <button type="button" onClick={reintentarGuardado} className="inline-flex min-h-11 shrink-0 items-center px-3 text-base font-bold underline underline-offset-4 [touch-action:manipulation]">
              Reintentar
            </button>
          </div>
        )}
        {!conexion && (
          <p role="status" className="flex items-center justify-center gap-2 bg-[var(--surface-2)] px-6 py-2 text-sm font-medium">
            <WifiOff size={16} aria-hidden="true" />
            Sin conexión: tus marcas se guardan en este aparato.
          </p>
        )}
        <main className="flex flex-1 flex-col gap-6 px-6 pb-24 pt-6">
          <header className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <Avatar perro={activo ?? e.perros[0]} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--text-secondary)]">{fechaLarga(ahora)}</p>
                <h1 className="mt-1 text-2xl font-bold leading-tight">{titulo}</h1>
              </div>
            </div>
          </header>

          {total > 0 && (
            <div className="flex items-center gap-4">
              <Anillo hechos={hechos.length} total={total} />
              <p className="text-base font-semibold">
                {hechos.length === total ? 'Todos los cuidados de hoy están hechos' : `${total - hechos.length} por hacer hoy`}
              </p>
            </div>
          )}

          {e.perros.length > 1 && <Selector e={e} activo={perroId} onElegir={setPerroId} />}

          {siguiente ? (
            <Tarjeta fila={siguiente} varios={varios} onHecho={() => hacer(siguiente.cuidado.id, siguiente.cuidado.nombre)} />
          ) : total > 0 ? (
            <motion.section {...entrada(1)} aria-label="Todo al día" className="borde-degradado flex items-start gap-4 rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-2)]">
              <motion.span
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]"
              >
                <Check size={26} color="var(--bg)" strokeWidth={3} aria-hidden="true" />
              </motion.span>
              <div>
                <p className="text-xl font-bold leading-tight">Todo al día{activo ? ` con ${activo.nombre}` : ''}</p>
                <p className="mt-1 text-base text-[var(--text-secondary)]">
                  {mana.cuantos > 0 ? `Mañana: ${mana.cuantos} cuidados, desde las ${mana.primera}.` : 'No queda nada por hoy.'}
                </p>
                {futuros[0] && (
                  <p className="mt-1 text-base text-[var(--text-secondary)]">
                    Ojo: {futuros[0].cuidado.nombre.toLowerCase()}, {textoDias(futuros[0].dias).texto.toLowerCase()}.
                  </p>
                )}
              </div>
            </motion.section>
          ) : (
            <motion.section {...entrada(1)} aria-label="Sin cuidados hoy" className="flex flex-col items-start gap-3 rounded-[var(--radius-card)] border-2 border-dashed border-[var(--border-ui)] p-6">
              <ChipIcono tipo="control" tam="size-12" />
              <p className="text-xl font-bold leading-tight">Hoy no hay cuidados con hora</p>
              <p className="text-base text-[var(--text-secondary)]">
                {futuros[0]
                  ? `Lo próximo es ${futuros[0].cuidado.nombre.toLowerCase()}, ${textoDias(futuros[0].dias).texto.toLowerCase()}.`
                  : 'Cuando agregues medicamentos, suplementos o controles, aparecerán aquí a su hora.'}
              </p>
            </motion.section>
          )}

          {resto.length > 0 && (
            <section aria-label="Pendiente hoy">
              <h2 className="mb-2 text-lg font-bold">Siguientes de hoy</h2>
              <ul className="flex flex-col gap-2">
                {resto.map((f, i) => (
                  <FilaPendiente key={f.cuidado.id} fila={f} varios={varios} i={i + 2} onHecho={() => hacer(f.cuidado.id, f.cuidado.nombre)} />
                ))}
              </ul>
            </section>
          )}

          {hechos.length > 0 && (
            <section aria-label="Hecho hoy">
              <h2 className="mb-2 text-lg font-bold">Hecho hoy</h2>
              <ul className="flex flex-col gap-2">
                {hechos.map((f) => (
                  <FilaHecha key={f.cuidado.id} fila={f} varios={varios} onDeshacer={() => f.registro && deshacer(f.registro.id)} />
                ))}
              </ul>
            </section>
          )}

          {futuros.length > 0 && (
            <section aria-label="Próximamente">
              <h2 className="mb-2 text-lg font-bold">Próximamente</h2>
              <ul className="flex flex-col gap-2">
                {futuros.map((f, i) => (
                  <FilaFutura key={f.cuidado.id} fila={f} varios={varios} i={i + 3} />
                ))}
              </ul>
            </section>
          )}
        </main>
        <AnimatePresence>
        {ultimo && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            role="status"
            className="sticky bottom-20 z-20 mx-6 mb-2 flex items-center justify-between gap-2 rounded-[var(--radius-card)] bg-[var(--text-primary)] py-2 pl-4 pr-2 text-[var(--bg)] shadow-[var(--shadow-2)]">
            <span className="text-base font-semibold">{ultimo.texto}: hecho</span>
            <button
              type="button"
              onClick={() => {
                deshacer(ultimo.id);
                setUltimo(null);
              }}
              className="inline-flex min-h-11 items-center gap-1 rounded-[var(--radius-button)] px-3 text-base font-bold text-[var(--accent-on-dark)] [touch-action:manipulation]"
            >
              <Undo2 size={18} aria-hidden="true" />
              Deshacer
            </button>
          </motion.div>
        )}
        </AnimatePresence>
      </>
    </MotionConfig>
  );
}
