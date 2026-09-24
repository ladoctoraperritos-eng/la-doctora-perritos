'use client';

// Regalo del plan anual: el ebook de primeros auxilios de la creadora.
// El valor es el PRECIO REAL al que se vende (no un ancla inflada) — FICHA-MERCADO / ESTADO.md.

import { motion } from 'motion/react';
import { Gift } from 'lucide-react';
import { Hairline, IconChip, SectionShell, useReveal, VIEWPORT_ONCE } from './ui';
import { MarkedCopy } from './MarkedCopy';

export interface RegaloEbookProps {
  tituloMarked: string;
  detalleMarked: string;
  /** Precio real de venta del ebook ("US$9"). */
  valor: string;
}

export function RegaloEbook({ tituloMarked, detalleMarked, valor }: RegaloEbookProps) {
  const { contenedor, item } = useReveal();
  return (
    <SectionShell elevacion="elevada" compacta ariaLabel="Regalo del plan anual">
      <motion.div
        variants={contenedor}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        className="mx-auto max-w-2xl"
      >
        <motion.div variants={item}>
          <Hairline surface="surface" className="p-5">
            <div className="flex items-center gap-3">
              <IconChip icon={Gift} />
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">
                Regalo con el plan anual
              </p>
            </div>
            <div className="mt-4 flex items-center gap-4">
              {/* Portada de marca (sin persona): logo de los tres perritos sobre el acento */}
              <div
                aria-hidden="true"
                className="flex h-40 w-28 shrink-0 flex-col items-center justify-between rounded-[var(--radius-button)] bg-[var(--accent)] px-2 py-4 shadow-[var(--shadow-2)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/logo-trio.svg" alt="" width={80} height={56} className="h-auto w-20" />
                <span className="text-center text-xs font-bold uppercase leading-tight tracking-wide text-[var(--bg)]">
                  Primeros auxilios caninos
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold leading-snug text-[var(--text-primary)] [font-family:var(--font-display)]">
                  <MarkedCopy text={tituloMarked} />
                </h3>
                <p className="mt-2 text-base leading-snug text-[var(--text-secondary)]">
                  <MarkedCopy text={detalleMarked} />
                </p>
                <p className="mt-3 text-sm text-[var(--text-secondary)]">
                  Valor: <span className="font-semibold text-[var(--text-primary)]">{valor}</span> · hoy, gratis
                </p>
              </div>
            </div>
          </Hairline>
        </motion.div>
      </motion.div>
    </SectionShell>
  );
}
