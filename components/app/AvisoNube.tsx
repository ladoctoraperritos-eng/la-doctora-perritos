'use client';

// Aviso visible cuando los cambios no llegaron a la nube. Los datos siguen en este aparato; el botón
// vuelve a intentar subirlos. Aparece en todas las pestañas porque vive en el layout compartido.

import { useSyncExternalStore } from 'react';
import { huboFalloNube, reintentarNube, suscribirNube } from '@/lib/sincronizar';

export default function AvisoNube() {
  const fallo = useSyncExternalStore(suscribirNube, huboFalloNube, () => false);
  if (!fallo) return null;
  return (
    <div role="alert" className="flex items-center justify-between gap-2 bg-[color-mix(in_oklab,var(--danger)_14%,var(--surface))] px-6 py-2 text-[var(--danger)]">
      <p className="text-sm font-semibold">No pudimos guardar tus cambios en la nube. Siguen en este aparato.</p>
      <button type="button" onClick={() => void reintentarNube()} className="inline-flex min-h-11 shrink-0 items-center px-3 text-base font-semibold underline underline-offset-4 [touch-action:manipulation]">
        Reintentar
      </button>
    </div>
  );
}
