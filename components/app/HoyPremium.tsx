'use client';

// MOCKUP EN REVISIÓN (2026-09-28) — comparación de dirección visual, inspirada en dos apps que el usuario
// mostró como referencia (Dogify y una app de cuidado de mascotas): íconos con color por categoría, fotos
// de perro más grandes con marco grueso, tarjetas más redondeadas y cálidas, botón con degradado sutil.
// NO reemplaza a Hoy.tsx todavía — es solo para aprobar o ajustar antes de aplicarlo a toda la app.
// El verde de marca (--accent) se mantiene como único color de acción/precio; el color por categoría
// es puramente informativo (60-30-10 sigue mandando: el acento es 10%, las categorías no compiten con él).

import { useSyncExternalStore } from 'react';
import { MotionConfig, motion } from 'motion/react';
import { Bug, Check, Droplets, Leaf, PawPrint, Pill, Stethoscope, Syringe, Utensils, type LucideIcon } from 'lucide-react';
import { hoy, marcarHecho, obtenerApp, proximos, suscribirApp, type FilaHoy, type FilaProxima, type Perro, type Tipo } from '@/lib/app';
import { textoDias, tono } from './Hoy';

const ICONO: Record<Tipo, LucideIcon> = {
  medicamento: Pill,
  suplemento: Leaf,
  comida: Utensils,
  vacuna: Syringe,
  antiparasitario: Bug,
  bano: Droplets,
  control: Stethoscope,
};

/** Color por categoría: solo decorativo en íconos secundarios. El acento verde sigue siendo el único color de acción. */
const CATEGORIA: Record<Tipo, string> = {
  medicamento: 'var(--cat-botiquin)',
  suplemento: 'var(--cat-botiquin)',
  comida: 'var(--cat-comida)',
  vacuna: 'var(--cat-salud)',
  antiparasitario: 'var(--cat-salud)',
  bano: 'var(--cat-salud)',
  control: 'var(--cat-salud)',
};

function ChipPremium({ tipo, tam = 'size-12' }: { tipo: Tipo; tam?: string }) {
  const Icono = ICONO[tipo];
  const color = CATEGORIA[tipo];
  return (
    <span
      className={`inline-flex ${tam} shrink-0 items-center justify-center rounded-2xl shadow-sm`}
      style={{ background: `color-mix(in oklab, ${color} 16%, var(--surface))` }}
    >
      <Icono size={22} color={color} aria-hidden="true" />
    </span>
  );
}

function AvatarPremium({ perro }: { perro: Perro }) {
  return perro.foto ? (
    <span className="relative inline-flex size-20 shrink-0 overflow-hidden rounded-3xl border-4 border-[var(--surface)] shadow-[0_8px_20px_-6px_rgb(11_95_90_/_0.35)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={perro.foto} alt={`Foto de ${perro.nombre}`} width={80} height={80} className="size-full object-cover" />
      <span aria-hidden="true" className="absolute -bottom-0.5 -right-0.5 inline-flex size-6 items-center justify-center rounded-full border-2 border-[var(--surface)] bg-[var(--accent)]">
        <Check size={12} color="var(--bg)" strokeWidth={3} />
      </span>
    </span>
  ) : (
    <span aria-hidden="true" className="inline-flex size-20 shrink-0 items-center justify-center rounded-3xl bg-[var(--chip-bg)]">
      <PawPrint size={34} color="var(--accent)" />
    </span>
  );
}

const entrada = (i: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay: 0.06 * i, ease: [0.16, 1, 0.3, 1] as const },
});

const botonGradiente =
  'inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-lg font-semibold text-[var(--bg)] shadow-[0_10px_24px_-8px_rgb(11_95_90_/_0.45)] transition-transform duration-150 active:scale-[0.97] [touch-action:manipulation]';
const estiloGradiente = { background: 'linear-gradient(135deg, var(--accent), color-mix(in oklab, var(--accent) 70%, black))' };

function TarjetaPremium({ fila, onHecho }: { fila: FilaHoy; onHecho: () => void }) {
  return (
    <motion.section
      {...entrada(1)}
      aria-label="Siguiente cuidado"
      className="relative overflow-hidden rounded-3xl p-6 shadow-[0_16px_36px_-14px_rgb(11_95_90_/_0.4)]"
      style={{ background: 'linear-gradient(160deg, var(--surface), color-mix(in oklab, var(--cat-botiquin) 6%, var(--surface)))' }}
    >
      <p className="text-sm font-bold uppercase tracking-wider text-[var(--accent)]">Siguiente cuidado</p>
      <div className="mt-3 flex items-start gap-4">
        <ChipPremium tipo={fila.cuidado.tipo} tam="size-14" />
        <div className="min-w-0 flex-1">
          <p className="text-xl font-bold leading-tight">{fila.cuidado.nombre}</p>
          <p className="mt-1 text-base text-[var(--text-secondary)]">{fila.perro.nombre} · {fila.cuidado.detalle}</p>
        </div>
      </div>
      <p className="mt-4 text-4xl font-bold tabular-nums text-[var(--accent)]">{fila.cuidado.hora}</p>
      <button type="button" onClick={onHecho} className={`${botonGradiente} mt-6`} style={estiloGradiente}>
        <Check size={22} strokeWidth={3} aria-hidden="true" />
        Marcar como hecho
      </button>
    </motion.section>
  );
}

function FilaPremium({ fila, i, onHecho }: { fila: FilaHoy; i: number; onHecho: () => void }) {
  return (
    <motion.li {...entrada(i)}>
      <button
        type="button"
        onClick={onHecho}
        className="flex min-h-[4.5rem] w-full items-center gap-4 rounded-3xl bg-[var(--surface)] p-4 text-left shadow-[0_6px_16px_-8px_rgb(11_95_90_/_0.25)] transition-transform duration-150 active:scale-[0.98] [touch-action:manipulation]"
      >
        <ChipPremium tipo={fila.cuidado.tipo} />
        <span className="min-w-0 flex-1">
          <span className="block text-base font-semibold">{fila.cuidado.nombre}</span>
          <span className="block text-sm text-[var(--text-secondary)]">{fila.perro.nombre} · {fila.cuidado.detalle}</span>
        </span>
        <span className="text-base font-bold tabular-nums text-[var(--accent)]">{fila.cuidado.hora}</span>
      </button>
    </motion.li>
  );
}

function FilaFuturaPremium({ fila, i }: { fila: FilaProxima; i: number }) {
  const { texto, tono: t } = textoDias(fila.dias);
  return (
    <motion.li {...entrada(i)} className="flex min-h-[4.5rem] items-center gap-4 rounded-3xl bg-[var(--surface)] p-4 shadow-[0_6px_16px_-8px_rgb(11_95_90_/_0.2)]">
      <ChipPremium tipo={fila.cuidado.tipo} />
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold">{fila.cuidado.nombre}</span>
        <span className="block text-sm text-[var(--text-secondary)]">{fila.perro.nombre} · {fila.cuidado.detalle}</span>
      </span>
      <span className={`whitespace-nowrap rounded-full px-3 py-1 text-sm font-bold ${tono[t]}`}>{texto}</span>
    </motion.li>
  );
}

export default function HoyPremium() {
  const e = useSyncExternalStore(suscribirApp, obtenerApp, () => null);
  if (!e) return null;
  const ahora = new Date();
  const { pendientes, hechos } = hoy(e, null, ahora);
  const futuros = proximos(e, null, ahora);
  const [siguiente, ...resto] = pendientes;
  const activo = e.perros[0];

  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 bg-[var(--bg)] px-6 pb-10 pt-6 text-[var(--text-primary)] [font-family:var(--font-body)]">
        <div className="rounded-full bg-[color-mix(in_oklab,var(--danger)_12%,var(--surface))] px-4 py-2 text-center text-sm font-semibold text-[var(--danger)]">
          MOCKUP en revisión · no es la app en vivo
        </div>
        <header className="flex items-center gap-4">
          <AvatarPremium perro={activo} />
          <div>
            <p className="text-sm font-semibold text-[var(--text-secondary)]">Domingo, 28 de septiembre</p>
            <h1 className="text-2xl font-bold leading-tight">Hoy con {activo.nombre}</h1>
          </div>
        </header>

        {siguiente && <TarjetaPremium fila={siguiente} onHecho={() => marcarHecho(siguiente.cuidado.id, new Date())} />}

        {resto.length > 0 && (
          <section aria-label="Siguientes de hoy">
            <h2 className="mb-2 text-lg font-bold">Siguientes de hoy</h2>
            <ul className="flex flex-col gap-3">
              {resto.map((f, i) => (
                <FilaPremium key={f.cuidado.id} fila={f} i={i + 2} onHecho={() => marcarHecho(f.cuidado.id, new Date())} />
              ))}
            </ul>
          </section>
        )}

        {hechos.length > 0 && (
          <section aria-label="Hecho hoy">
            <h2 className="mb-2 text-lg font-bold">Hecho hoy</h2>
            <ul className="flex flex-col gap-3">
              {hechos.map((f) => (
                <li key={f.cuidado.id} className="flex min-h-[4.5rem] items-center gap-4 rounded-3xl bg-[var(--elevated)] p-4">
                  <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent)]">
                    <Check size={20} color="var(--bg)" strokeWidth={3} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-semibold">{f.cuidado.nombre}</span>
                    <span className="block text-sm text-[var(--text-secondary)]">{f.registro?.quien} · {f.registro?.hora}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {futuros.length > 0 && (
          <section aria-label="Próximamente">
            <h2 className="mb-2 text-lg font-bold">Próximamente</h2>
            <ul className="flex flex-col gap-3">
              {futuros.map((f, i) => (
                <FilaFuturaPremium key={f.cuidado.id} fila={f} i={i + 3} />
              ))}
            </ul>
          </section>
        )}
      </div>
    </MotionConfig>
  );
}
