'use client';

// Gráficos reales del panel (Recharts). Una sola serie real por gráfico — nunca se inventan
// series de datos que no existen. Estilo Tufte: tinta mínima, sin rejillas pesadas, sin 3D,
// tooltip al pasar el mouse. Todo el color sale de var(--accent) y el resto de tokens de
// globals.css — nunca un valor hexadecimal suelto en este archivo.

import { motion } from 'motion/react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const EJE = { fontSize: 12, fill: 'var(--text-secondary)', fontFamily: 'var(--font-body)' };

function TooltipPersonalizado({ active, payload, label, etiqueta }: { active?: boolean; payload?: { value: number }[]; label?: string; etiqueta: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[var(--radius-button)] bg-[var(--text-primary)] px-3 py-2 text-sm text-[var(--surface)] shadow-[var(--shadow-2)]">
      <p className="font-semibold">{label}</p>
      <p className="text-[var(--surface-2)]">
        {payload[0].value} {etiqueta}
      </p>
    </div>
  );
}

/** Barras: cuántos cuidados se marcaron como hechos cada día, últimos 14 días. */
export function GraficoBarrasUso({ datos }: { datos: { dia: string; cantidad: number }[] }) {
  const datosEtiquetados = datos.map((d) => ({ ...d, etiqueta: formatoDiaCorto(d.dia) }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={datosEtiquetados} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barCategoryGap={4}>
        <CartesianGrid vertical={false} stroke="var(--border-suave)" />
        <XAxis dataKey="etiqueta" tick={EJE} axisLine={false} tickLine={false} interval={3} padding={{ left: 16, right: 16 }} />
        <YAxis tick={EJE} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
        <Tooltip cursor={{ fill: 'var(--surface-2)' }} content={<TooltipPersonalizado etiqueta="marcados como hechos" />} />
        <Bar dataKey="cantidad" fill="var(--accent)" radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Área: el mismo dato con sensación de tendencia (sección "Uso de la app", vista más grande). */
export function GraficoAreaUso({ datos }: { datos: { dia: string; cantidad: number }[] }) {
  const datosEtiquetados = datos.map((d) => ({ ...d, etiqueta: formatoDiaCorto(d.dia) }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={datosEtiquetados} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="rellenoUso" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.28} />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--border-suave)" />
        <XAxis dataKey="etiqueta" tick={EJE} axisLine={false} tickLine={false} interval={3} padding={{ left: 16, right: 16 }} />
        <YAxis tick={EJE} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
        <Tooltip cursor={{ stroke: 'var(--accent)', strokeWidth: 1 }} content={<TooltipPersonalizado etiqueta="marcados como hechos" />} />
        <Area type="monotone" dataKey="cantidad" stroke="var(--accent)" strokeWidth={2} fill="url(#rellenoUso)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function formatoDiaCorto(iso: string): string {
  const [, m, d] = iso.split('-');
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];
  return `${Number(d)} ${meses[Number(m) - 1]}`;
}

/** Embudo horizontal: cada paso del onboarding, con el ancho proporcional al primero. Solo se
 * muestra cuando ya hay eventos reales (hayEventos); si no, la pantalla usa el estado vacío. */
export function Embudo({ pasos }: { pasos: { tipo: string; etiqueta: string; cantidad: number }[] }) {
  const max = Math.max(1, ...pasos.map((p) => p.cantidad));
  return (
    <div className="flex flex-col gap-3">
      {pasos.map((p, i) => {
        const porcentaje = max > 0 ? Math.round((p.cantidad / max) * 100) : 0;
        const anchoPct = p.cantidad === 0 ? 2 : Math.max(4, (p.cantidad / max) * 100);
        return (
          <div key={p.tipo}>
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {i + 1}. {p.etiqueta}
              </p>
              <p className="shrink-0 text-sm tabular-nums text-[var(--text-secondary)]">
                {p.cantidad} · {porcentaje}%
              </p>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
              <motion.div
                className="h-full rounded-full bg-[var(--accent)]"
                initial={{ width: 0 }}
                animate={{ width: `${anchoPct}%` }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
