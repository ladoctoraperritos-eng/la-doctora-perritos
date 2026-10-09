'use client';

// Envoltorio compartido de las 4 pestañas de la app (Hoy, Perros, Historial, Yo). El menú vive aquí,
// montado una sola vez: al navegar entre pestañas Next.js solo cambia el contenido de `children`, así el
// indicador de la pestaña activa (layoutId en Menu.tsx) se anima deslizándose en vez de reaparecer de golpe.

import { usePathname } from 'next/navigation';
import { Menu, type SeccionApp } from '@/components/app/Menu';
import AvisoNube from '@/components/app/AvisoNube';
import SincronizarNube from '@/components/app/SincronizarNube';

const SECCION_POR_RUTA: { prefijo: string; seccion: SeccionApp }[] = [
  { prefijo: '/app/perros', seccion: 'perros' },
  { prefijo: '/app/historial', seccion: 'historial' },
  { prefijo: '/app/sos', seccion: 'sos' },
  { prefijo: '/app/yo', seccion: 'yo' },
];

export default function LayoutApp({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activa = SECCION_POR_RUTA.find((s) => pathname.startsWith(s.prefijo))?.seccion ?? 'hoy';

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col text-[var(--text-primary)] [font-family:var(--font-body)]">
      <SincronizarNube />
      <AvisoNube />
      {children}
      <Menu activa={activa} />
    </div>
  );
}
