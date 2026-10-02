'use client';

// Menú flotante de la app (Hoy · Mascotas · SOS · Historial · Yo). Vive en el layout de /app, montado una
// sola vez: así el indicador detrás de la pestaña activa se anima deslizándose al cambiar de sección
// (layoutId de Motion), en vez de aparecer/desaparecer de golpe en cada pantalla.

import Link from 'next/link';
import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';

// Los 5 íconos son ilustraciones propias del usuario (2026-09-29/2026-10-02): a color, no cambian de tono
// al activarse (el rectángulo verde detrás marca cuál está activo).
const ITEMS: { id: string; texto: string; href: string; icono?: LucideIcon; imagen?: string }[] = [
  { id: 'hoy', imagen: '/brand/icono-hoy.webp', texto: 'Hoy', href: '/app' },
  { id: 'perros', imagen: '/brand/icono-mascotas.webp', texto: 'Mascotas', href: '/app/perros' },
  { id: 'historial', imagen: '/brand/icono-historial.webp', texto: 'Historial', href: '/app/historial' },
  { id: 'sos', imagen: '/brand/emergencia.png', texto: 'SOS', href: '/app/sos' },
  { id: 'yo', imagen: '/brand/icono-yo.webp', texto: 'Yo', href: '/app/yo' },
] as const;

export type SeccionApp = (typeof ITEMS)[number]['id'];

export function Menu({ activa }: { activa: SeccionApp }) {
  return (
    <nav aria-label="Secciones" className="sticky bottom-4 z-20 mx-4 mt-auto">
      <ul className="grid grid-cols-5 gap-1 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-1.5 shadow-[var(--shadow-2)]">
        {ITEMS.map(({ id, icono: Icono, imagen, texto, href }) => {
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
                {imagen ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imagen}
                    alt=""
                    width={24}
                    height={24}
                    className={`size-6 rounded-md object-contain transition-transform duration-200 ${on ? 'scale-110' : 'scale-100 opacity-80'}`}
                  />
                ) : (
                  Icono && <Icono size={22} aria-hidden="true" />
                )}
                {texto}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
