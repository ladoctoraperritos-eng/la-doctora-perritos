'use client';

// Menú flotante de la app (Hoy · Mascotas · Historial · Yo). Vive en el layout de /app, montado una sola
// vez: así el indicador detrás de la pestaña activa se anima deslizándose al cambiar de sección (layoutId
// de Motion), en vez de aparecer/desaparecer de golpe en cada pantalla.

import Link from 'next/link';
import { motion } from 'motion/react';
import { ClipboardList, Home, PawPrint, User } from 'lucide-react';

const ITEMS = [
  { id: 'hoy', icono: Home, texto: 'Hoy', href: '/app' },
  { id: 'perros', icono: PawPrint, texto: 'Mascotas', href: '/app/perros' },
  { id: 'historial', icono: ClipboardList, texto: 'Historial', href: '/app/historial' },
  { id: 'yo', icono: User, texto: 'Yo', href: '/app/yo' },
] as const;

export type SeccionApp = (typeof ITEMS)[number]['id'];

export function Menu({ activa }: { activa: SeccionApp }) {
  return (
    <nav aria-label="Secciones" className="sticky bottom-4 z-20 mx-4 mt-auto">
      <ul className="grid grid-cols-4 gap-1 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-1.5 shadow-[var(--shadow-2)]">
        {ITEMS.map(({ id, icono: Icono, texto, href }) => {
          const on = activa === id;
          return (
            <li key={id} className="relative">
              {on && (
                <motion.span
                  layoutId="menu-activo"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  className="absolute inset-0 rounded-[var(--radius-button)] bg-[var(--chip-bg)]"
                />
              )}
              <Link
                href={href}
                aria-current={on ? 'page' : undefined}
                className={`relative z-10 flex min-h-16 flex-col items-center justify-center gap-1 rounded-[var(--radius-button)] text-sm [touch-action:manipulation] ${
                  on ? 'font-semibold text-[var(--accent)]' : 'font-medium text-[var(--text-secondary)]'
                }`}
              >
                <Icono size={22} aria-hidden="true" />
                {texto}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
