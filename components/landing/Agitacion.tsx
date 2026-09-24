'use client';

// KIT DE LANDING — §3 AGITACIÓN (blueprint: 55 §3)
// El costo de seguir igual, visible. El tipo de `frases` es string[] a propósito:
// es IMPOSIBLE pasarle un párrafo de 72 palabras — cada frase es corta (máx 2
// líneas; warn a las 18 palabras). El NÚMERO del costo va en [b]/[acento] desde
// el copy marcado (es el dato héroe de la sección). MISMO fondo elevado que §2
// (un solo movimiento visual, sin separador). Cero decoración de miedo.

import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { IconChip, SectionShell, useReveal, VIEWPORT_ONCE } from './ui';
import { MarkedCopy, warnCopy, warnRango } from './MarkedCopy';

export interface AgitacionProps {
  /** 2-4 frases MARCADAS y cortas — el array es el contrato: nada de párrafos. */
  /** Título de la sección (una línea) — separa el bloque del Problema. */
  titulo?: string;
  frases: string[];
  /** Ícono de dolor opcional por frase (mismo orden) — ancla visual para escanear (55). */
  iconos?: LucideIcon[];
  /** Mini-card opcional "hoy vs en 6 meses" (55 §3). */
  contraste?: {
    labelHoy: string;
    hoy: string;
    labelFuturo: string;
    futuro: string;
  };
  id?: string;
}

export function Agitacion({ titulo, frases, iconos, contraste, id }: AgitacionProps) {
  warnRango('Agitación → frases', frases.length, 2, 4);
  frases.forEach((f, i) => warnCopy(`Agitación → frase ${i + 1}`, f, 18));
  const { contenedor, item } = useReveal();

  return (
    <SectionShell id={id} elevacion="elevada" flush="top" ariaLabel="El costo de seguir igual">
      <motion.div
        variants={contenedor}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        className="mx-auto max-w-[620px]"
      >
        {titulo && (
          <h2 className="mb-6 text-balance text-3xl font-bold leading-tight text-[var(--text-primary)] [font-family:var(--font-display)]">
            {titulo}
          </h2>
        )}
        <div className="flex flex-col gap-4">
          {frases.map((f, i) => (
            <motion.div key={i} variants={item} className="flex items-start gap-4">
              {iconos?.[i] && <IconChip icon={iconos[i]} tone="muted" />}
              <p className="text-[17px] leading-[1.6] text-[var(--text-secondary)]">
                <MarkedCopy text={f} />
              </p>
            </motion.div>
          ))}
        </div>

        {contraste && (
          <motion.div variants={item} className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-[var(--radius-card)] bg-[var(--bg)] p-5">
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
                {contraste.labelHoy}
              </p>
              <p className="mt-2 text-[17px] leading-snug text-[var(--text-primary)]"><MarkedCopy text={contraste.hoy} /></p>
            </div>
            {/* "si nada cambia": más apagado/frío — el peso lo pone el copy, no el rojo */}
            <div className="rounded-[var(--radius-card)] bg-[var(--surface-2)] p-5">
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
                {contraste.labelFuturo}
              </p>
              <p className="mt-2 text-[17px] leading-snug text-[var(--text-secondary)]"><MarkedCopy text={contraste.futuro} /></p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </SectionShell>
  );
}
