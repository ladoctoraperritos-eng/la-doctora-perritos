'use client';

// Hoja inferior (bottom sheet) para formularios cortos: agregar o editar sin salir de la pantalla.
// Accesible: role=dialog, foco al título al abrir, Escape cierra, el fondo cierra al tocarlo.

import { useEffect, useRef, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';

export function Hoja({ abierta, titulo, onCerrar, children }: { abierta: boolean; titulo: string; onCerrar: () => void; children: ReactNode }) {
  const titular = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!abierta) return;
    titular.current?.focus();
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar();
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [abierta, onCerrar]);

  return (
    <AnimatePresence>
      {abierta && (
        <motion.div key="hoja" className="fixed inset-0 z-30 flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <button type="button" aria-label="Cerrar" tabIndex={-1} onClick={onCerrar} className="absolute inset-0 bg-[color-mix(in_oklab,var(--text-primary)_45%,transparent)]" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-hoja"
            initial={{ y: 48 }}
            animate={{ y: 0 }}
            exit={{ y: 48 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex max-h-[92dvh] w-full max-w-md flex-col rounded-t-[var(--radius-card)] bg-[var(--bg)] shadow-[var(--shadow-2)]"
          >
            <div className="flex items-center justify-between gap-4 px-6 pb-2 pt-4">
              <h2 id="titulo-hoja" ref={titular} tabIndex={-1} className="text-2xl font-bold leading-tight outline-none">
                {titulo}
              </h2>
              <button type="button" onClick={onCerrar} aria-label="Cerrar" className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-[var(--text-secondary)] [touch-action:manipulation]">
                <X size={22} aria-hidden="true" />
              </button>
            </div>
            <div className="overflow-y-auto px-6 pb-8 pt-2">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
