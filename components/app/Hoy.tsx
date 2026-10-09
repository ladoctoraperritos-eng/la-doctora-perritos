'use client';

// Pantalla «Hoy» (M0, el ritual diario). Una misión: saber qué toca ahora y marcarlo con un toque.
// SPEC (PREFLIGHT):
//   objeto_principal: tarjeta «Siguiente cuidado» con la hora en grande + botón «Marcar como hecho»
//   niveles: display 3xl (título) · title xl (cuidado) · body base · label sm
//   acento_en: hora clave, botón principal, anillo de progreso, estado activo del menú
//   baseline: entrada escalonada · anillo que se llena · conteo del progreso · tap con escala · celebración sobria
//   dispositivo_ownable: foto del perro a color con marco de hairline degradado en la cabecera (decisión del usuario 2026-09-24)
//   estados: cargando (esqueleto) · vacío · al día (éxito) · sin conexión · deshabilitado (menú «Pronto»)

import Link from 'next/link';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { animate, AnimatePresence, MotionConfig, motion, useReducedMotion } from 'motion/react';
import {
  Bug,
  Check,
  ChevronRight,
  Droplets,
  Flame,
  Leaf,
  Plus,
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
  actualizarRacha,
  deshacer,
  deshacerSalud,
  horaTexto,
  registrarSalud,
  hoy,
  huboFalloGuardado,
  manana,
  marcarHecho,
  obtenerApp,
  proximos,
  reintentarGuardado,
  suscribirApp,
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

/** Ilustraciones propias del usuario (2026-09-29), a color: reemplazan el ícono de línea cuando existen. */
const IMAGEN_TIPO: Partial<Record<Tipo, string>> = {
  medicamento: '/brand/cuidado-medicamento.png',
  suplemento: '/brand/cuidado-suplemento.png',
  comida: '/brand/cuidado-comida.png',
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

/** Conteo animado: la cifra héroe («3 por hacer hoy») nunca aparece estática, cuenta hasta el valor. */
function ContadorAnimado({ n }: { n: number }) {
  const reduce = useReducedMotion();
  const [v, setV] = useState(reduce ? n : 0);
  const previo = useRef(0);
  useEffect(() => {
    if (reduce) {
      setV(n);
      return;
    }
    const c = animate(previo.current, n, { duration: 0.5, ease: 'easeOut', onUpdate: (x) => setV(Math.round(x)) });
    previo.current = n;
    return () => c.stop();
  }, [n, reduce]);
  return <>{v}</>;
}

export const entrada = (i: number) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.28, delay: 0.05 * i, ease: [0.16, 1, 0.3, 1] as const },
});


/** Insignia de marca (esquina superior derecha de cada pestaña): el mismo logo en todos los paneles. */
export function LogoMarca() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/logo-marca.png"
      alt="La Doctora Perritos"
      width={36}
      height={36}
      className="size-9 shrink-0 self-start rounded-full bg-[var(--surface-2)] object-cover object-top"
    />
  );
}

export function Avatar({ perro, grande = false, tam, iconoTam }: { perro: Perro; grande?: boolean; tam?: string; iconoTam?: number }) {
  const clase = tam ?? (grande ? 'size-24' : 'size-14');
  const icono = iconoTam ?? (grande ? 40 : 28);
  return perro.foto ? (
    <span className={`borde-degradado ${clase} shrink-0 overflow-hidden rounded-full border-2 shadow-[var(--shadow-1)]`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={perro.foto} alt={`Foto de ${perro.nombre}`} width={96} height={96} className="size-full object-cover" />
    </span>
  ) : (
    <span aria-hidden="true" className={`inline-flex ${clase} shrink-0 items-center justify-center rounded-full bg-[var(--chip-bg)]`}>
      <PawPrint size={icono} color="var(--accent)" />
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
      className={`inline-flex ${tam} shrink-0 items-center justify-center rounded-full font-semibold ${textoTam} ${
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
    <motion.section {...entrada(1)} aria-label="Siguiente cuidado" className="rounded-[var(--radius-card)] bg-[var(--surface)] p-6 text-[var(--text-primary)] shadow-[var(--shadow-1)]">
      <p className="text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">Siguiente cuidado</p>
      <div className="mt-3 flex items-start gap-4">
        <ChipIcono tipo={fila.cuidado.tipo} tam="size-12" />
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold leading-tight">{fila.cuidado.nombre}</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {varios ? `${fila.perro.nombre} · ` : ''}
            {fila.cuidado.detalle}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <span className="text-3xl font-semibold tabular-nums text-[var(--accent)]">{fila.cuidado.hora}</span>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${tono[t]}`}>{texto}</span>
      </div>
      <button
        type="button"
        onClick={onHecho}
        className="mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--accent)] text-lg font-semibold text-[var(--bg)] shadow-[var(--shadow-2)] transition-transform duration-150 active:scale-[0.97] [touch-action:manipulation]"
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
        className="flex min-h-16 w-full items-center gap-4 py-4 text-left transition-transform duration-150 active:scale-[0.98] [touch-action:manipulation]"
      >
        <ChipIcono tipo={fila.cuidado.tipo} />
        <span className="min-w-0 flex-1">
          <span className="block text-base font-semibold">{fila.cuidado.nombre}</span>
          <span className="block text-sm text-[var(--text-secondary)]">
            {varios ? `${fila.perro.nombre} · ` : ''}
            {fila.cuidado.detalle}
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-base font-semibold tabular-nums text-[var(--accent)]">{fila.cuidado.hora}</span>
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
    <motion.li
      layout
      initial={{ opacity: 0, scale: 0.96, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex min-h-16 items-center gap-4 py-4"
    >
      <span className="relative inline-flex shrink-0">
        <ChipIcono tipo={fila.cuidado.tipo} tam="size-11" />
        <motion.span
          aria-hidden="true"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.1 }}
          className="absolute -bottom-1 -right-1 inline-flex size-5 items-center justify-center rounded-full bg-[var(--accent)] ring-2 ring-[var(--elevated)]"
        >
          <Check size={11} color="var(--bg)" strokeWidth={3.5} />
        </motion.span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold text-[var(--text-secondary)] line-through decoration-2">{fila.cuidado.nombre}</span>
        <span className="block text-sm text-[var(--text-tertiary)]">
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
    </motion.li>
  );
}

export function textoDias(d: number): { texto: string; tono: keyof typeof tono } {
  if (d < 0) return { texto: d === -1 ? 'Venció ayer' : `Venció hace ${-d} días`, tono: 'atrasado' };
  if (d === 0) return { texto: 'Hoy', tono: 'pronto' };
  if (d === 1) return { texto: 'Mañana', tono: 'pronto' };
  return { texto: `En ${d} días`, tono: d <= 7 ? 'pronto' : 'normal' };
}

function FilaFutura({ fila, varios, i, onHecho }: { fila: FilaProxima; varios: boolean; i: number; onHecho?: () => void }) {
  const { texto, tono: t } = textoDias(fila.dias);
  return (
    <motion.li {...entrada(i)} className="flex min-h-16 items-center gap-4 py-4">
      <ChipIcono tipo={fila.cuidado.tipo} />
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold">{fila.cuidado.hora ? `Reponer ${fila.cuidado.nombre}` : fila.cuidado.nombre}</span>
        <span className="block text-sm text-[var(--text-secondary)]">
          {varios ? `${fila.perro.nombre} · ` : ''}
          {fila.cuidado.hora ? 'Se acaba' : fila.cuidado.detalle}
        </span>
        <span className={`mt-1 inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-sm font-semibold ${tono[t]}`}>{texto}</span>
      </span>
      {onHecho && (
        <button type="button" onClick={onHecho} aria-label={`Marcar ${fila.cuidado.nombre} de ${fila.perro.nombre} como hecho`} className="inline-flex size-11 shrink-0 items-center justify-center [touch-action:manipulation]">
          <span aria-hidden="true" className="inline-flex size-8 items-center justify-center rounded-full border-2 border-[var(--border-ui)]" />
        </button>
      )}
    </motion.li>
  );
}

/** Fila de un cuidado vencido (vacuna, control) en «Atrasados» — misma geometría que FilaPendiente
 * (checkbox circular a la derecha, botón de ancho completo) para que ambos se lean como una sola
 * familia, en vez de dos layouts distintos conviviendo en la misma lista. */
function FilaVencida({ fila, varios, onHecho, i }: { fila: FilaProxima; varios: boolean; onHecho: () => void; i: number }) {
  const { texto, tono: t } = textoDias(fila.dias);
  return (
    <motion.li {...entrada(i)}>
      <button
        type="button"
        onClick={onHecho}
        aria-label={`Marcar ${fila.cuidado.nombre} de ${fila.perro.nombre} como hecho`}
        className="flex min-h-16 w-full items-center gap-4 py-4 text-left transition-transform duration-150 active:scale-[0.98] [touch-action:manipulation]"
      >
        <ChipIcono tipo={fila.cuidado.tipo} />
        <span className="min-w-0 flex-1">
          <span className="block text-base font-semibold">{fila.cuidado.nombre}</span>
          <span className="block text-sm text-[var(--text-secondary)]">
            {varios ? `${fila.perro.nombre} · ` : ''}
            {fila.cuidado.detalle}
          </span>
          <span className={`mt-1 inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-sm font-semibold ${tono[t]}`}>{texto}</span>
        </span>
        <span aria-hidden="true" className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-[var(--border-ui)]" />
      </button>
    </motion.li>
  );
}

/** Fila de "Hecho hoy" para un cuidado que se resolvió por fuera del sistema de horas (una vacuna
 * vencida que se marcó al día) — permanece visible con Deshacer mientras dure la sesión, no solo
 * 6 segundos en un toast que luego no se puede recuperar. */
function FilaHechaVencida({ tipo, nombre, perroNombre, varios, quien, hora, onDeshacer }: { tipo: Tipo; nombre: string; perroNombre: string; varios: boolean; quien: string; hora: string; onDeshacer: () => void }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, scale: 0.96, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex min-h-16 items-center gap-4 py-4"
    >
      <span className="relative inline-flex shrink-0">
        <ChipIcono tipo={tipo} tam="size-11" />
        <motion.span
          aria-hidden="true"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.1 }}
          className="absolute -bottom-1 -right-1 inline-flex size-5 items-center justify-center rounded-full bg-[var(--accent)] ring-2 ring-[var(--elevated)]"
        >
          <Check size={11} color="var(--bg)" strokeWidth={3.5} />
        </motion.span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold text-[var(--text-secondary)] line-through decoration-2">{nombre}</span>
        <span className="block text-sm text-[var(--text-tertiary)]">
          {varios ? `${perroNombre} · ` : ''}
          {quien} · {hora}
        </span>
      </span>
      <button
        type="button"
        onClick={onDeshacer}
        aria-label={`Deshacer ${nombre}`}
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-[var(--text-secondary)] [touch-action:manipulation]"
      >
        <Undo2 size={20} aria-hidden="true" />
      </button>
    </motion.li>
  );
}

function FilaMascotas({ perros, activo, onElegir }: { perros: Perro[]; activo: string | null; onElegir: (id: string | null) => void }) {
  return (
    <nav aria-label="Mis mascotas" className="flex gap-4 overflow-x-auto pb-1">
      {perros.map((p) => {
        const on = activo === p.id;
        return (
          <button key={p.id} type="button" aria-pressed={on} onClick={() => onElegir(on ? null : p.id)} className="flex min-w-16 flex-col items-center gap-2 [touch-action:manipulation]">
            <span className={`flex rounded-full p-0.5 ${on ? 'ring-2 ring-[var(--accent)]' : ''}`}>
              <Avatar perro={p} tam="size-16" iconoTam={24} />
            </span>
            <span className={`text-sm ${on ? 'font-semibold text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}>{p.nombre}</span>
          </button>
        );
      })}
      <Link href="/app/perros" className="flex min-w-16 flex-col items-center gap-2">
        <span aria-hidden="true" className="inline-flex size-16 items-center justify-center rounded-full bg-[var(--surface-2)]">
          <Plus size={24} color="var(--accent)" />
        </span>
        <span className="text-sm text-[var(--text-secondary)]">Añadir</span>
      </Link>
    </nav>
  );
}

/** Racha de días seguidos con todo al día. Celebración SOBRIA a propósito (ficha de arte: sin
 * springs grandes ni confetti, «clínica humana») — un pulso suave y un color que aparece, nada más. */
function RachaBadge({ dias, celebrar }: { dias: number; celebrar: boolean }) {
  if (dias <= 0) return null;
  return (
    <motion.div
      initial={false}
      animate={celebrar ? { scale: [1, 1.08, 1] } : { scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="inline-flex items-center gap-1.5 self-start rounded-full bg-[color-mix(in_oklab,var(--accent)_12%,var(--surface))] px-3 py-1.5"
    >
      <Flame size={16} color="var(--accent)" aria-hidden="true" />
      <span className="text-sm font-semibold text-[var(--accent)]">
        <ContadorAnimado n={dias} /> {dias === 1 ? 'día seguido' : 'días seguidos'}
      </span>
    </motion.div>
  );
}

/** Mascota protagonista: la foto se funde con el petróleo, nombre grande y un subtítulo corto. */
function BannerMascota({ perro, pendientes }: { perro: Perro; pendientes: number }) {
  return (
    <motion.section {...entrada(0)} aria-label={`Mascota ${perro.nombre}`} className="relative min-h-56 overflow-hidden rounded-[var(--radius-card)] bg-[var(--accent)] text-[var(--bg)] shadow-[var(--shadow-2)]">
      {perro.foto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={perro.foto} alt={`Foto de ${perro.nombre}`} width={320} height={320} className="absolute inset-y-0 right-0 h-full w-3/5 object-cover object-top" />
      ) : (
        <span aria-hidden="true" className="absolute right-6 top-6 opacity-30">
          <PawPrint size={96} color="var(--bg)" />
        </span>
      )}
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,var(--accent)_30%,transparent_62%)]" />
      <div className="relative flex min-h-56 flex-col justify-end p-6">
        <p className="text-3xl leading-none [font-family:var(--font-serif)]">{perro.nombre}</p>
        <p className="mt-2 text-base text-[var(--bg)]/85">{pendientes > 0 ? `${pendientes} por hacer hoy` : "Su cuidado, al día"}</p>
      </div>
    </motion.section>
  );
}

export default function Hoy() {
  const e = useSyncExternalStore(suscribirApp, obtenerApp, () => null);
  const minuto = useSyncExternalStore(suscribirReloj, minutoActual, () => null);
  const conexion = useSyncExternalStore(suscribirRed, enLinea, () => true);
  const fallo = useSyncExternalStore(suscribirApp, huboFalloGuardado, () => false);
  const [perroId, setPerroId] = useState<string | null>(null);
  const [verTodasProximas, setVerTodasProximas] = useState(false);
  const [ultimo, setUltimo] = useState<{ texto: string; deshacer: () => void } | null>(null);
  const [hechasExtra, setHechasExtra] = useState<{ id: string; tipo: Tipo; nombre: string; perroNombre: string; quien: string; hora: string; deshacer: () => void }[]>([]);
  const [celebrarRacha, setCelebrarRacha] = useState(false);
  useEffect(() => {
    if (!ultimo) return;
    const t = setTimeout(() => setUltimo(null), 6000);
    return () => clearTimeout(t);
  }, [ultimo]);
  // Racha: se comprueba cada vez que cambian los datos o la hora. Solo suma la primera vez que «todo
  // está al día» en el día (actualizarRacha ya es idempotente), y dispara la celebración sobria 1 sola vez.
  useEffect(() => {
    if (!e || minuto === null) return;
    const ahoraLocal = new Date(minuto * 60000);
    const { pendientes: p, hechos: h } = hoy(e, perroId, ahoraLocal);
    const totalLocal = p.length + h.length;
    if (totalLocal === 0 || h.length !== totalLocal) return;
    const r = actualizarRacha(ahoraLocal);
    if (!r.subio) return;
    setCelebrarRacha(true);
    const t = setTimeout(() => setCelebrarRacha(false), 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [e, minuto, perroId]);
  const hacer = (cuidadoId: string, nombre: string) => {
    const id = marcarHecho(cuidadoId, new Date());
    setUltimo({ texto: nombre, deshacer: () => deshacer(id) });
  };
  const hacerVencida = (fila: FilaProxima) => {
    const momento = new Date();
    const r = registrarSalud(fila.cuidado.id, momento);
    const quien = e?.tutores.find((t) => t.id === e.yo)?.nombre ?? 'Tú';
    const deshacerEsto = () => {
      deshacerSalud(r.anterior, r.registroId);
      setHechasExtra((xs) => xs.filter((x) => x.id !== r.registroId));
    };
    setHechasExtra((xs) => [...xs, { id: r.registroId, tipo: fila.cuidado.tipo, nombre: fila.cuidado.nombre, perroNombre: fila.perro.nombre, quien, hora: horaTexto(momento), deshacer: deshacerEsto }]);
    setUltimo({ texto: fila.cuidado.nombre, deshacer: deshacerEsto });
  };

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
  const [siguiente, ...resto] = pendientes;
  const mana = manana(e, perroId);
  const vencidas = futuros.filter((f) => f.dias < 0);
  const restoAtrasado = resto.filter((f) => f.faltan < 0);
  const restoAlDia = resto.filter((f) => f.faltan >= 0);
  const proximas = futuros.filter((f) => f.dias >= 0);

  return (
    <MotionConfig reducedMotion="user">
      <>
        {fallo && (
          <div role="alert" className="flex items-center justify-between gap-2 bg-[color-mix(in_oklab,var(--danger)_14%,var(--surface))] px-6 py-2 text-[var(--danger)]">
            <p className="text-sm font-semibold">No pudimos guardar en este aparato. Lo ves ahora, pero puede perderse al cerrar.</p>
            <button type="button" onClick={reintentarGuardado} className="inline-flex min-h-11 shrink-0 items-center px-3 text-base font-semibold underline underline-offset-4 [touch-action:manipulation]">
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
          <header className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--text-secondary)]">Hola, {e.tutores.find((t) => t.id === e.yo)?.nombre ?? 'Tú'}</p>
                <p className="text-sm text-[var(--text-secondary)]">{fechaLarga(ahora)}</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">Cuidado que se siente cerca</p>
                <h1 className="mt-1 text-3xl font-normal leading-tight tracking-[-0.01em] [font-family:var(--font-serif)]">Todo su cuidado, en un lugar</h1>
              </div>
            </div>
            <LogoMarca />
          </header>

          {total > 0 && (
            <motion.div {...entrada(0)} className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-lg font-semibold leading-snug">
                  {hechos.length === total ? (
                    'Todo listo por hoy'
                  ) : (
                    <>
                      <ContadorAnimado n={total - hechos.length} /> por hacer hoy
                    </>
                  )}
                </p>
                <RachaBadge dias={e.ajustes.racha?.dias ?? 0} celebrar={celebrarRacha} />
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                <ContadorAnimado n={hechos.length} /> de {total} cuidados de {varios ? "tus perros" : (activo ?? e.perros[0]).nombre}
              </p>
              <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-[var(--surface-2)]" aria-hidden="true">
                <div className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-500" style={{ width: `${(hechos.length / total) * 100}%` }} />
              </div>
            </motion.div>
          )}

          <FilaMascotas perros={e.perros} activo={perroId} onElegir={setPerroId} />

          {(activo ?? e.perros[0]) && <BannerMascota perro={activo ?? e.perros[0]} pendientes={pendientes.filter((p) => p.perro.id === (activo ?? e.perros[0]).id).length} />}

          {siguiente ? (
            <Tarjeta fila={siguiente} varios={varios} onHecho={() => hacer(siguiente.cuidado.id, siguiente.cuidado.nombre)} />
          ) : total > 0 ? (
            <motion.section {...entrada(1)} aria-label="Todo al día" className="flex items-start gap-4 px-1 py-2">
              <motion.span
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]"
              >
                <Check size={26} color="var(--bg)" strokeWidth={3} aria-hidden="true" />
              </motion.span>
              <div>
                <p className="text-base font-semibold leading-tight">Todo al día{activo ? ` con ${activo.nombre}` : ''}</p>
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
              <p className="text-base font-semibold leading-tight">Hoy no hay cuidados con hora</p>
              <p className="text-base text-[var(--text-secondary)]">
                {futuros[0]
                  ? `Lo próximo es ${futuros[0].cuidado.nombre.toLowerCase()}, ${textoDias(futuros[0].dias).texto.toLowerCase()}.`
                  : 'Cuando agregues medicamentos, suplementos o controles, aparecerán aquí a su hora.'}
              </p>
            </motion.section>
          )}

          {restoAtrasado.length + vencidas.length > 0 && (
            <section aria-label="Atrasados">
              <h2 className="mb-2 text-lg font-semibold text-[var(--danger)]">Atrasados</h2>
              <ul className="flex flex-col divide-y divide-[var(--border-suave)] rounded-[var(--radius-card)] bg-[var(--surface)] px-4">
                {restoAtrasado.map((f, i) => (
                  <FilaPendiente key={f.cuidado.id} fila={f} varios={varios} i={i + 2} onHecho={() => hacer(f.cuidado.id, f.cuidado.nombre)} />
                ))}
                {vencidas.map((f, i) => (
                  <FilaVencida key={f.cuidado.id} fila={f} varios={varios} i={i + 2 + restoAtrasado.length} onHecho={() => hacerVencida(f)} />
                ))}
              </ul>
            </section>
          )}

          {restoAlDia.length > 0 && (
            <section aria-label="Pendiente hoy">
              <h2 className="mb-2 text-lg font-semibold">Siguientes de hoy</h2>
              <ul className="flex flex-col divide-y divide-[var(--border-suave)] rounded-[var(--radius-card)] bg-[var(--surface)] px-4">
                {restoAlDia.map((f, i) => (
                  <FilaPendiente key={f.cuidado.id} fila={f} varios={varios} i={i + 2} onHecho={() => hacer(f.cuidado.id, f.cuidado.nombre)} />
                ))}
              </ul>
            </section>
          )}

          <Link href="/app/sos" aria-label="Urgencias: qué hacer ahora" className="flex items-center justify-between gap-3 rounded-[var(--radius-card)] bg-[color-mix(in_oklab,var(--danger)_8%,var(--surface))] p-4 [touch-action:manipulation]">
            <span>
              <span className="block text-base font-semibold text-[var(--danger)]">Urgencias</span>
              <span className="block text-sm text-[var(--text-secondary)]">Qué hacer ahora mismo</span>
            </span>
            <ChevronRight size={20} color="var(--danger)" aria-hidden="true" />
          </Link>

          {(hechos.length > 0 || hechasExtra.length > 0) && (
            <section aria-label="Hecho hoy">
              <h2 className="mb-2 text-lg font-semibold">Hecho hoy</h2>
              <ul className="flex flex-col divide-y divide-[var(--border-suave)] rounded-[var(--radius-card)] bg-[var(--surface)] px-4">
                {hechos.map((f) => (
                  <FilaHecha key={f.cuidado.id} fila={f} varios={varios} onDeshacer={() => f.registro && deshacer(f.registro.id)} />
                ))}
                {hechasExtra.map((x) => (
                  <FilaHechaVencida key={x.id} tipo={x.tipo} nombre={x.nombre} perroNombre={x.perroNombre} varios={varios} quien={x.quien} hora={x.hora} onDeshacer={x.deshacer} />
                ))}
              </ul>
            </section>
          )}

          {proximas.length > 0 && (
            <section aria-label="Próximamente">
              <h2 className="mb-2 text-lg font-semibold">Próximamente</h2>
              <ul className="flex flex-col divide-y divide-[var(--border-suave)] rounded-[var(--radius-card)] bg-[var(--surface)] px-4">
                {(verTodasProximas ? proximas : proximas.slice(0, 3)).map((f, i) => (
                  <FilaFutura key={f.cuidado.id} fila={f} varios={varios} i={i + 3} />
                ))}
              </ul>
              {proximas.length > 3 && (
                <button type="button" onClick={() => setVerTodasProximas((v) => !v)} className="mt-3 inline-flex min-h-11 items-center px-1 text-base font-semibold text-[var(--accent)] [touch-action:manipulation]">
                  {verTodasProximas ? "Ver menos" : `Ver las ${proximas.length} próximas`}
                </button>
              )}
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
                ultimo.deshacer();
                setUltimo(null);
              }}
              className="inline-flex min-h-11 items-center gap-1 rounded-[var(--radius-button)] px-3 text-base font-semibold text-[var(--accent-on-dark)] [touch-action:manipulation]"
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
