'use client';

// Barra lateral del panel: pensada primero para escritorio (donde la dueña lo revisa casi
// siempre — 43 "desktop sin vergüenza"). En celular se convierte en pestañas horizontales
// con scroll, para no perder la navegación.

import {
  AlertTriangle,
  CreditCard,
  Home,
  LayoutList,
  type LucideIcon,
  Megaphone,
  PawPrint,
  Receipt,
  Settings,
  Sparkles,
  Users,
} from 'lucide-react';
import type { Seccion } from './secciones';

/** Agrupado por qué tan seguido se usa hoy: lo real y diario arriba, lo que todavía no tiene datos
 * (depende de Hotmart/IA/ads) junto y aparte, la configuración al final. */
const GRUPOS: { etiqueta?: string; items: { id: Seccion; etiqueta: string; icono: LucideIcon }[] }[] = [
  {
    items: [
      { id: 'inicio', etiqueta: 'Inicio', icono: Home },
      { id: 'usuarios', etiqueta: 'Usuarios', icono: Users },
      { id: 'mascotas', etiqueta: 'Mascotas', icono: PawPrint },
      { id: 'uso', etiqueta: 'Uso de la app', icono: LayoutList },
      { id: 'errores', etiqueta: 'Errores y alertas', icono: AlertTriangle },
    ],
  },
  {
    etiqueta: 'Aún sin datos',
    items: [
      { id: 'ventas', etiqueta: 'Ventas', icono: Receipt },
      { id: 'suscripciones', etiqueta: 'Suscripciones', icono: CreditCard },
      { id: 'ia', etiqueta: 'IA y costos', icono: Sparkles },
      { id: 'marketing', etiqueta: 'Marketing y canales', icono: Megaphone },
    ],
  },
  { items: [{ id: 'configuracion', etiqueta: 'Configuración', icono: Settings }] },
];

export function Sidebar({ activa, onCambiar }: { activa: Seccion; onCambiar: (s: Seccion) => void }) {
  return (
    <nav aria-label="Secciones del panel" className="relative flex shrink-0 flex-col gap-1 border-b border-[var(--border-suave)] bg-[var(--surface)] p-3 md:w-64 md:border-b-0 md:border-r md:p-4">
      <div className="hidden items-center gap-2 px-2 pb-5 md:flex">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo-marca.png" alt="" width={32} height={32} className="size-8 shrink-0 rounded-full bg-[var(--surface-2)] object-cover object-top" />
        <div>
          <p className="text-base font-semibold leading-tight [font-family:var(--font-serif)]">La Doctora Perritos</p>
          <p className="text-xs text-[var(--text-secondary)]">Panel de administración</p>
        </div>
      </div>
      <div className="flex items-stretch gap-1 overflow-x-auto md:flex-col md:items-start md:gap-4 md:overflow-visible">
        {GRUPOS.map((grupo, gi) => (
          <div key={gi} className="flex shrink-0 items-stretch gap-1 md:flex-col md:items-stretch md:gap-1">
            {gi > 0 && <div aria-hidden="true" className="mx-1 my-1 w-px shrink-0 bg-[var(--border-suave)] md:hidden" />}
            {grupo.etiqueta && <p className="hidden px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] md:block">{grupo.etiqueta}</p>}
            {grupo.items.map((it) => {
              const activo = it.id === activa;
              const Icono = it.icono;
              return (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => onCambiar(it.id)}
                  aria-current={activo ? 'page' : undefined}
                  className={`group flex shrink-0 items-center gap-3 rounded-[var(--radius-button)] px-3 py-2.5 text-sm font-medium transition-colors [touch-action:manipulation] ${
                    activo ? 'bg-[var(--surface-2)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icono size={18} color={activo ? 'var(--accent)' : 'currentColor'} aria-hidden="true" />
                  <span className="whitespace-nowrap">{it.etiqueta}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
      {/* Pista de que hay más pestañas a la derecha en el scroll horizontal de celular. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[var(--surface)] to-transparent md:hidden" />
    </nav>
  );
}
