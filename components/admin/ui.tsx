// Piezas compartidas del panel de administración. Estilo Tufte (17-VISUALIZACION-DATOS.md): máximo
// dato, mínima tinta — sin 3D, sin rejillas, sin sombras decorativas en los gráficos.

import { useEffect, useState } from 'react';
import { animate, motion, useReducedMotion, type Variants } from 'motion/react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

/** Entrada escalonada de las secciones del panel (baseline de movimiento del SO). */
export const CONTENEDOR_PANEL: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
export const ITEM_PANEL: Variants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } } };

function ContadorAnimado({ n }: { n: number }) {
  const reduce = useReducedMotion();
  const [v, setV] = useState(reduce ? n : 0);
  useEffect(() => {
    if (reduce) return;
    const c = animate(0, n, { duration: 0.7, ease: 'easeOut', onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [n, reduce]);
  return <>{v}</>;
}

export function Tarjeta({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <motion.div variants={ITEM_PANEL} className={`rounded-[var(--radius-card)] bg-[var(--surface)] p-5 shadow-[var(--shadow-1)] ${className}`}>{children}</motion.div>;
}

export function Titulo({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold leading-tight">{children}</h2>;
}

/** Card de dato héroe: número grande + etiqueta + insight corto (nunca solo el número pelado). */
export function Dato({ numero, etiqueta, insight }: { numero: string | number; etiqueta: string; insight?: string }) {
  return (
    <Tarjeta className="flex flex-col gap-1">
      <p className="text-sm text-[var(--text-secondary)]">{etiqueta}</p>
      <p className="text-3xl font-semibold tabular-nums leading-none">{typeof numero === 'number' ? <ContadorAnimado n={numero} /> : numero}</p>
      {/* Reserva la línea aunque no haya insight: así todas las tarjetas de una fila quedan parejas. */}
      <p className="mt-1 min-h-[1.25rem] text-sm text-[var(--text-secondary)]">{insight ?? ' '}</p>
    </Tarjeta>
  );
}

/** Cuando un dato no existe todavía: nunca se inventa, se dice por qué — con MENOS peso visual
 * que una tarjeta de dato real (fondo hundido, sin sombra) para no competir con los números que sí
 * importan, pero sin quedar totalmente plana (nivel de profundidad propio). */
export function SinDatos({ motivo }: { motivo: string }) {
  return (
    <motion.div variants={ITEM_PANEL} className="flex items-baseline gap-2 rounded-[var(--radius-button)] bg-[var(--surface-2)] px-4 py-2.5">
      <p className="shrink-0 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Sin datos</p>
      <p className="text-sm text-[var(--text-secondary)]">{motivo}</p>
    </motion.div>
  );
}

/** Varios "sin datos" relacionados (ej. ventas, negocio, IA) agrupados en una sola tarjeta hundida,
 * en vez de repetir la misma caja varias veces seguidas. */
export function SinDatosLista({ titulo, items }: { titulo: string; items: { etiqueta: string; motivo: string }[] }) {
  return (
    <motion.div variants={ITEM_PANEL} className="flex flex-col gap-3 rounded-[var(--radius-card)] bg-[var(--surface-2)] p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">{titulo}: sin datos todavía</p>
      <ul className="flex flex-col gap-2">
        {items.map((it) => (
          <li key={it.etiqueta}>
            <p className="text-sm font-semibold">{it.etiqueta}</p>
            <p className="text-sm text-[var(--text-secondary)]">{it.motivo}</p>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export function Aviso({ nivel, texto }: { nivel: 'alerta' | 'info' | 'ok'; texto: string }) {
  const Icono = nivel === 'alerta' ? AlertTriangle : nivel === 'ok' ? CheckCircle2 : Info;
  const color = nivel === 'alerta' ? 'var(--danger)' : nivel === 'ok' ? 'var(--accent)' : 'var(--text-secondary)';
  return (
    <p
      className={`flex items-start gap-2 rounded-[var(--radius-button)] px-4 py-3 text-base font-medium ${
        nivel === 'alerta'
          ? 'bg-[color-mix(in_oklab,var(--danger)_12%,var(--surface))] text-[var(--danger)]'
          : nivel === 'ok'
            ? 'bg-[color-mix(in_oklab,var(--accent)_10%,var(--surface))] text-[var(--text-primary)]'
            : 'bg-[var(--surface-2)] text-[var(--text-primary)]'
      }`}
    >
      <Icono size={20} color={color} className="mt-0.5 shrink-0" aria-hidden="true" />
      {texto}
    </p>
  );
}

/** Barras simples (sin librería) para la serie de 14 días: la tinta mínima que pide 17. */
export function Barras({ datos }: { datos: { dia: string; cantidad: number }[] }) {
  const maxReal = Math.max(0, ...datos.map((d) => d.cantidad));
  if (maxReal === 0) {
    return <p className="py-6 text-center text-sm text-[var(--text-secondary)]">Sin actividad en los últimos 14 días.</p>;
  }
  const max = maxReal;
  const total = datos.reduce((s, d) => s + d.cantidad, 0);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-24 items-end gap-1" role="img" aria-label="Registros por día, últimos 14 días">
        {datos.map((d) => (
          <div key={d.dia} className="flex flex-1 flex-col items-center gap-1">
            <motion.div
              className="w-full rounded-t-sm bg-[var(--accent)]"
              initial={{ height: 0 }}
              animate={{ height: d.cantidad === 0 ? '3px' : `${Math.max(8, (d.cantidad / max) * 100)}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              title={`${d.dia}: ${d.cantidad}`}
            />
          </div>
        ))}
      </div>
      <p className="text-sm text-[var(--text-secondary)]">{total} en total en los últimos 14 días.</p>
    </div>
  );
}
