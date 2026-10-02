'use client';

// Pestaña «SOS»: una misión — saber qué hacer AHORA MISMO ante una emergencia, sin tener que buscar en el
// ebook. Contenido real de «Primeros Auxilios Caninos» (lib/sos.ts), resumido a pasos cortos.
// SPEC (PREFLIGHT):
//   objeto_principal: la lista de situaciones de emergencia (y su detalle con pasos a seguir)
//   niveles: display 3xl (título) · title xl (situación) · body base (pasos) · label sm
//   acento_en: el aviso de "no reemplaza al veterinario" y el botón de llamar (ambos en --danger)
//   baseline: entrada escalonada · tap con escala · hoja para guardar el teléfono del veterinario
//   estados: cargando (esqueleto) · sin teléfono de veterinario guardado (con CTA) · detalle de situación

import { useState, useSyncExternalStore } from 'react';
import { MotionConfig, motion } from 'motion/react';
import { Phone } from 'lucide-react';
import { Hoja } from './Hoja';
import { Campo, CampoTelefono, botonPrimario, campo } from './Perros';
import { entrada, tono } from './Hoy';
import { guardarVeterinario, obtenerApp, suscribirApp } from '@/lib/app';
import { NIVELES_TRIAGE, SITUACIONES, type NivelTriage, type SituacionSos } from '@/lib/sos';

const TONO_NIVEL: Record<NivelTriage, keyof typeof tono> = { emergencia: 'atrasado', urgencia: 'pronto', control: 'normal' };

function FilaSituacion({ s, i, onAbrir }: { s: SituacionSos; i: number; onAbrir: () => void }) {
  const Icono = s.icono;
  return (
    <motion.li {...entrada(i)}>
      <button
        type="button"
        onClick={onAbrir}
        aria-label={`Ver qué hacer: ${s.titulo}`}
        className="flex min-h-16 w-full items-center gap-4 rounded-[var(--radius-card)] border border-l-4 border-[var(--border-ui)] border-l-[var(--danger)] bg-[var(--surface)] p-4 text-left shadow-[var(--shadow-1)] transition-transform duration-150 active:scale-[0.98] [touch-action:manipulation]"
      >
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-button)]" style={{ background: 'color-mix(in oklab, var(--danger) 14%, var(--surface))' }}>
          <Icono size={22} color="var(--danger)" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-semibold">{s.titulo}</span>
          <span className="block text-sm text-[var(--text-secondary)]">{s.resumen}</span>
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/accion-avanzar.png" alt="" width={20} height={20} className="shrink-0 object-contain" />
      </button>
    </motion.li>
  );
}

function Triage() {
  return (
    <section aria-label="¿Qué tan urgente es?" className="rounded-[var(--radius-card)] border border-[var(--border-ui)] bg-[var(--surface)] p-4 shadow-[var(--shadow-1)]">
      <h2 className="text-lg font-bold">¿Qué tan urgente es?</h2>
      <div className="mt-3 flex flex-col gap-3">
        {NIVELES_TRIAGE.map((n) => (
          <div key={n.nivel}>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-sm font-semibold ${tono[TONO_NIVEL[n.nivel]]}`}>{n.titulo}</span>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{n.detalle}</p>
            <p className="mt-1 text-sm">{n.ejemplos.slice(0, 4).join(' · ')}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function TarjetaVeterinario({ nombre, telefono, onEditar }: { nombre?: string; telefono?: string; onEditar: () => void }) {
  if (!telefono) {
    return (
      <button
        type="button"
        onClick={onEditar}
        className="flex min-h-16 w-full items-center gap-3 rounded-[var(--radius-card)] border-2 border-dashed border-[var(--border-ui)] p-4 text-left text-base text-[var(--text-secondary)] [touch-action:manipulation]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/accion-agregar.png" alt="" width={20} height={20} className="object-contain" />
        Guarda el teléfono de tu veterinario de urgencia
      </button>
    );
  }
  return (
    <section aria-label="Tu veterinario" className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[var(--border-ui)] bg-[var(--surface)] p-4 shadow-[var(--shadow-1)]">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-[var(--text-secondary)]">Tu veterinario</p>
        <p className="text-base font-semibold">{nombre || 'Sin nombre guardado'}</p>
        <p className="text-base font-semibold tabular-nums text-[var(--text-secondary)]">{telefono}</p>
      </div>
      <button type="button" onClick={onEditar} aria-label="Editar datos del veterinario" className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-[var(--border-ui)] [touch-action:manipulation]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/accion-editar.png" alt="" width={18} height={18} className="object-contain" />
      </button>
      <a
        href={`tel:${telefono.replace(/[\s()-]/g, '')}`}
        aria-label={`Llamar a ${nombre || 'tu veterinario'}`}
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--danger)] text-[var(--bg)] [touch-action:manipulation]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/accion-llamar.png" alt="" width={20} height={20} className="object-contain" />
      </a>
    </section>
  );
}

function FormVeterinario({ nombre, telefono, onListo }: { nombre?: string; telefono?: string; onListo: () => void }) {
  const [n, setN] = useState(nombre ?? '');
  const [t, setT] = useState(telefono ?? '');
  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();
        guardarVeterinario({ nombre: n.trim() || undefined, telefono: t.trim() || undefined });
        onListo();
      }}
      noValidate
    >
      <Campo id="nombre-vet" etiqueta="Nombre de tu veterinario o clínica" opcional>
        <input id="nombre-vet" value={n} maxLength={60} onChange={(e) => setN(e.target.value)} placeholder="Por ejemplo, Clínica San Roque" className={campo} />
      </Campo>
      <CampoTelefono id="telefono-vet" valor={t} onCambiar={setT} />
      <div className="mt-8">
        <button type="submit" className={botonPrimario}>
          Guardar
        </button>
      </div>
    </form>
  );
}

function Lista({ e, onAbrir, onEditarVet }: { e: ReturnType<typeof obtenerApp>; onAbrir: (id: string) => void; onEditarVet: () => void }) {
  return (
    <>
      <header>
        <h1 className="text-3xl font-bold leading-tight">SOS</h1>
        <p className="mt-1 text-base text-[var(--text-secondary)]">Qué hacer ahora mismo, antes de llegar al veterinario.</p>
        <p className="mt-2 flex items-start gap-1.5 text-sm text-[var(--text-tertiary)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/accion-alerta.png" alt="" width={14} height={14} className="mt-0.5 shrink-0 object-contain" />
          Esta guía no reemplaza a tu veterinario. Ante cualquier duda, llama o ve directo a una clínica.
        </p>
      </header>

      <TarjetaVeterinario nombre={e.veterinario?.nombre} telefono={e.veterinario?.telefono} onEditar={onEditarVet} />

      <Triage />

      <section aria-label="Situaciones de emergencia">
        <h2 className="mb-2 text-lg font-bold">¿Qué pasó?</h2>
        <ul className="flex flex-col gap-2">
          {SITUACIONES.map((s, i) => (
            <FilaSituacion key={s.id} s={s} i={i} onAbrir={() => onAbrir(s.id)} />
          ))}
        </ul>
      </section>
    </>
  );
}

function Detalle({
  s,
  telefono,
  nombreVet,
  onVolver,
  onEditarVet,
}: {
  s: SituacionSos;
  telefono?: string;
  nombreVet?: string;
  onVolver: () => void;
  onEditarVet: () => void;
}) {
  return (
    <>
      <button type="button" onClick={onVolver} className="-ml-3 inline-flex min-h-11 w-fit items-center gap-2 rounded-[var(--radius-button)] px-3 text-base font-semibold text-[var(--text-secondary)] [touch-action:manipulation]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/accion-volver.png" alt="" width={20} height={20} className="object-contain" />
        SOS
      </button>

      <motion.div {...entrada(0)}>
        <h1 className="text-2xl font-bold leading-tight">{s.titulo}</h1>
        <p className="mt-1 text-base text-[var(--text-secondary)]">{s.resumen}</p>
      </motion.div>

      <motion.section {...entrada(1)} aria-label="Señales de alarma" className="rounded-[var(--radius-card)] border border-[var(--border-ui)] bg-[var(--surface)] p-4 shadow-[var(--shadow-1)]">
        <h2 className="text-base font-bold">Señales de alarma</h2>
        <ul className="mt-2 flex flex-col gap-1">
          {s.senales.map((x) => (
            <li key={x} className="text-base text-[var(--text-secondary)]">
              · {x}
            </li>
          ))}
        </ul>
      </motion.section>

      <motion.section
        {...entrada(2)}
        aria-label="Qué hacer"
        className="borde-degradado rounded-[var(--radius-card)] p-4 shadow-[var(--shadow-2)]"
        style={{ background: 'color-mix(in oklab, var(--accent) 6%, var(--surface))' }}
      >
        <h2 className="text-base font-bold text-[var(--accent)]">Qué hacer</h2>
        <ol className="mt-3 flex flex-col gap-3">
          {s.pasos.map((p, i) => (
            <li key={p} className="flex gap-3">
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-bold text-[var(--bg)]">{i + 1}</span>
              <span className="text-base leading-snug">{p}</span>
            </li>
          ))}
        </ol>
      </motion.section>

      {s.evitar && (
        <motion.section {...entrada(3)} aria-label="Qué evitar" className="rounded-[var(--radius-card)] p-4" style={{ background: 'color-mix(in oklab, var(--warn) 10%, var(--surface))' }}>
          <h2 className="text-base font-bold text-[var(--warn)]">Qué evitar</h2>
          <ul className="mt-2 flex flex-col gap-1">
            {s.evitar.map((x) => (
              <li key={x} className="text-base text-[var(--text-secondary)]">
                · {x}
              </li>
            ))}
          </ul>
        </motion.section>
      )}

      <motion.section {...entrada(4)} aria-label="Cuándo ir al veterinario" className="rounded-[var(--radius-card)] p-4" style={{ background: 'color-mix(in oklab, var(--danger) 10%, var(--surface))' }}>
        <h2 className="text-base font-bold text-[var(--danger)]">Ve al veterinario si…</h2>
        <ul className="mt-2 flex flex-col gap-1">
          {s.veterinarioSi.map((x) => (
            <li key={x} className="text-base text-[var(--text-primary)]">
              · {x}
            </li>
          ))}
        </ul>
      </motion.section>

      {telefono ? (
        <a
          href={`tel:${telefono.replace(/[\s()-]/g, '')}`}
          className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--danger)] text-lg font-semibold text-[var(--bg)] shadow-[var(--shadow-2)] transition-transform duration-150 active:scale-[0.97] [touch-action:manipulation]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/accion-llamar.png" alt="" width={22} height={22} className="object-contain" />
          Llamar a {nombreVet || 'tu veterinario'}
        </a>
      ) : (
        <button
          type="button"
          onClick={onEditarVet}
          className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] border-2 border-dashed border-[var(--danger)] px-4 text-base font-semibold text-[var(--danger)] [touch-action:manipulation]"
        >
          <Phone size={20} className="shrink-0" aria-hidden="true" />
          Agregar teléfono de tu veterinario
        </button>
      )}
    </>
  );
}

export default function Sos() {
  const e = useSyncExternalStore(suscribirApp, obtenerApp, () => null);
  const [situacionId, setSituacionId] = useState<string | null>(null);
  const [editandoVet, setEditandoVet] = useState(false);

  if (!e) {
    return (
      <main className="flex flex-1 flex-col gap-4 px-6 pt-6" aria-busy="true" aria-label="Cargando el SOS">
        <div className="h-10 w-32 rounded-[var(--radius-button)] bg-[var(--surface-2)] motion-safe:animate-pulse" />
        <div className="h-20 rounded-[var(--radius-card)] bg-[var(--surface-2)] motion-safe:animate-pulse" />
        <div className="h-16 rounded-[var(--radius-card)] bg-[var(--surface-2)] motion-safe:animate-pulse" />
        <div className="h-16 rounded-[var(--radius-card)] bg-[var(--surface-2)] motion-safe:animate-pulse" />
      </main>
    );
  }

  const situacion = SITUACIONES.find((s) => s.id === situacionId) ?? null;

  return (
    <MotionConfig reducedMotion="user">
      <>
        <main className="flex flex-1 flex-col gap-6 px-6 pb-6 pt-6">
          {!situacion ? (
            <Lista e={e} onAbrir={setSituacionId} onEditarVet={() => setEditandoVet(true)} />
          ) : (
            <Detalle
              s={situacion}
              telefono={e.veterinario?.telefono}
              nombreVet={e.veterinario?.nombre}
              onVolver={() => setSituacionId(null)}
              onEditarVet={() => setEditandoVet(true)}
            />
          )}
        </main>

        <Hoja abierta={editandoVet} titulo="Tu veterinario de urgencia" onCerrar={() => setEditandoVet(false)}>
          <FormVeterinario nombre={e.veterinario?.nombre} telefono={e.veterinario?.telefono} onListo={() => setEditandoVet(false)} />
        </Hoja>
      </>
    </MotionConfig>
  );
}
