'use client';

// Aviso opcional y cerrable: invita a guardar la app en la pantalla de inicio. Vive en el layout
// de la app (primera pantalla tras entrar), no en la landing, para no distraer de la venta.
// Se esconde solo si: ya se cerró antes (localStorage), o si ya se está usando instalada
// (display-mode: standalone / navigator.standalone en iPhone).

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const CLAVE = 'dp_tip_instalar_cerrado';

function yaInstalada(): boolean {
  if (typeof window === 'undefined') return false;
  const standaloneIOS = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  const standaloneWeb = window.matchMedia?.('(display-mode: standalone)').matches;
  return !!(standaloneIOS || standaloneWeb);
}

export default function TipInstalar() {
  const [visible, setVisible] = useState(false);
  const [esIOS, setEsIOS] = useState(true);

  useEffect(() => {
    try {
      if (localStorage.getItem(CLAVE) === '1') return;
    } catch {
      // sin localStorage (privado/bloqueado): se muestra igual, solo no se recuerda el cierre.
    }
    if (yaInstalada()) return;
    setEsIOS(/iphone|ipad|ipod/i.test(window.navigator.userAgent));
    setVisible(true);
  }, []);

  const cerrar = () => {
    setVisible(false);
    try {
      localStorage.setItem(CLAVE, '1');
    } catch {
      // nada que hacer: solo vuelve a aparecer la próxima vez, no es grave.
    }
  };

  if (!visible) return null;

  return (
    <div role="status" className="mx-6 mt-4 flex flex-col gap-2 rounded-[var(--radius-card)] bg-[var(--elevated)] p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-base font-semibold">Guarda La Doctora Perritos en tu pantalla de inicio</p>
        <button type="button" onClick={cerrar} aria-label="Cerrar este aviso" className="-m-1 flex size-8 shrink-0 items-center justify-center rounded-full text-[var(--text-secondary)] [touch-action:manipulation]">
          <X size={18} />
        </button>
      </div>
      <p className="text-sm text-[var(--text-secondary)]">
        {esIOS
          ? 'En Safari: toca el botón de compartir y elige "Añadir a pantalla de inicio".'
          : 'En Chrome: toca el menú (⋮) y elige "Agregar a pantalla de inicio".'}
      </p>
    </div>
  );
}
