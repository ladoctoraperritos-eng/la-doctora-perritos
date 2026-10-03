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
import { ChevronDown, Phone } from 'lucide-react';
import { Hoja } from './Hoja';
import { Campo, CampoTelefono, botonPrimario, campo } from './Perros';
import { entrada, LogoMarca, tono } from './Hoy';
import { guardarVeterinario, obtenerApp, suscribirApp, type TipoVeterinario, type Veterinario } from '@/lib/app';
import { NIVELES_TRIAGE, SITUACIONES, type NivelTriage, type SituacionSos } from '@/lib/sos';

const TONO_NIVEL: Record<NivelTriage, keyof typeof tono> = { emergencia: 'atrasado', urgencia: 'pronto', control: 'normal' };

/** Muchas clínicas no dan atención 24 horas: se guardan dos contactos, el de siempre y el de urgencias. */
const COPY_VET: Record<TipoVeterinario, { etiqueta: string; vacio: string; tituloHoja: string }> = {
  urgencia: { etiqueta: 'Veterinario de urgencia (24/7)', vacio: 'Guarda el teléfono de tu veterinario de urgencia (24/7)', tituloHoja: 'Veterinario de urgencia (24/7)' },
  habitual: { etiqueta: 'Veterinario de cabecera', vacio: 'Guarda el teléfono de tu veterinario de cabecera', tituloHoja: 'Veterinario de cabecera' },
};

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
  const [abierto, setAbierto] = useState(false);
  return (
    <section aria-label="¿Qué tan urgente es?" className="rounded-[var(--radius-card)] border border-[var(--border-ui)] bg-[var(--surface)] p-4 shadow-[var(--shadow-1)]">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        className="flex w-full items-center justify-between gap-2 text-left transition-transform duration-150 active:scale-[0.99] [touch-action:manipulation]"
      >
        <span className="text-base font-bold">¿Qué tan urgente es? <span className="font-normal text-[var(--text-secondary)]">Emergencia, urgencia o control</span></span>
        <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-[var(--accent)]">
          {abierto ? 'Ocultar' : 'Ver niveles'}
          <ChevronDown size={16} className={`transition-transform duration-200 ${abierto ? 'rotate-180' : ''}`} aria-hidden="true" />
        </span>
      </button>
      {abierto && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="mt-3 flex flex-col gap-3">
          {NIVELES_TRIAGE.map((n) => (
            <div key={n.nivel}>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-sm font-semibold ${tono[TONO_NIVEL[n.nivel]]}`}>{n.titulo}</span>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{n.detalle}</p>
              <p className="mt-1 text-sm">{n.ejemplos.slice(0, 4).join(' · ')}</p>
            </div>
          ))}
        </motion.div>
      )}
    </section>
  );
}

/** Tarjeta de un contacto veterinario. El de urgencia va destacado (es el que importa en el SOS); el de
 * cabecera va en tono neutro, como dato de respaldo. */
function TarjetaVeterinario({ tipo, nombre, telefono, onEditar }: { tipo: TipoVeterinario; nombre?: string; telefono?: string; onEditar: () => void }) {
  const destacado = tipo === 'urgencia';
  const { etiqueta, vacio } = COPY_VET[tipo];
  if (!telefono) {
    return (
      <button
        type="button"
        onClick={onEditar}
        className={`flex min-h-16 w-full items-center gap-3 rounded-[var(--radius-card)] border-2 border-dashed p-4 text-left text-base font-semibold transition-transform duration-150 active:scale-[0.98] [touch-action:manipulation] ${
          destacado ? 'border-[var(--danger)] text-[var(--danger)]' : 'border-[var(--border-ui)] text-[var(--text-secondary)]'
        }`}
      >
        <Phone size={20} className="shrink-0" aria-hidden="true" />
        {vacio}
      </button>
    );
  }
  return (
    <section
      aria-label={etiqueta}
      className="flex items-center gap-3 rounded-[var(--radius-card)] p-4"
      style={
        destacado
          ? {
              border: '1px solid transparent',
              boxShadow: 'var(--shadow-2)',
              background:
                'linear-gradient(color-mix(in oklab, var(--accent) 7%, var(--surface)), color-mix(in oklab, var(--accent) 7%, var(--surface))) padding-box, linear-gradient(135deg, color-mix(in oklab, var(--accent) 60%, transparent), transparent 60%) border-box',
            }
          : { border: '1px solid var(--border-ui)', boxShadow: 'var(--shadow-1)', background: 'var(--surface)' }
      }
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm text-[var(--text-secondary)]">{etiqueta}</p>
        <p className="text-base font-semibold">{nombre || 'Sin nombre guardado'}</p>
        <p className="text-base font-semibold tabular-nums text-[var(--text-secondary)]">{telefono}</p>
      </div>
      <button
        type="button"
        onClick={onEditar}
        aria-label={`Editar ${etiqueta.toLowerCase()}`}
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-[var(--border-ui)] transition-transform duration-150 active:scale-[0.95] [touch-action:manipulation]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/accion-editar.png" alt="" width={18} height={18} className="object-contain" />
      </button>
      <a
        href={`tel:${telefono.replace(/[\s()-]/g, '')}`}
        aria-label={`Llamar a ${nombre || etiqueta}`}
        className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full transition-transform duration-150 active:scale-[0.95] [touch-action:manipulation] ${
          destacado ? 'bg-[var(--danger)] text-[var(--bg)]' : 'border-2 border-[var(--accent)] text-[var(--accent)]'
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/accion-llamar.png" alt="" width={20} height={20} className="object-contain" />
      </a>
    </section>
  );
}

function FormVeterinario({ tipo, nombre, telefono, onListo }: { tipo: TipoVeterinario; nombre?: string; telefono?: string; onListo: () => void }) {
  const [n, setN] = useState(nombre ?? '');
  const [t, setT] = useState(telefono ?? '');
  const [errorTelefono, setErrorTelefono] = useState<string | null>(null);
  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();
        const soloTel = t.replace(/[\s()-]/g, '');
        if (soloTel && !/^\+?\d{7,15}$/.test(soloTel)) {
          setErrorTelefono('Escribe un teléfono válido, por ejemplo +56 9 1234 5678.');
          return;
        }
        guardarVeterinario(tipo, { nombre: n.trim() || undefined, telefono: t.trim() || undefined });
        onListo();
      }}
      noValidate
    >
      <Campo id={`nombre-vet-${tipo}`} etiqueta="Nombre del veterinario o clínica" opcional>
        <input id={`nombre-vet-${tipo}`} value={n} maxLength={60} onChange={(e) => setN(e.target.value)} placeholder="Por ejemplo, Clínica San Roque" className={campo} />
      </Campo>
      <CampoTelefono
        id={`telefono-vet-${tipo}`}
        valor={t}
        onCambiar={(v) => {
          setT(v);
          setErrorTelefono(null);
        }}
        error={errorTelefono}
      />
      <div className="mt-8">
        <button type="submit" className={botonPrimario}>
          Guardar
        </button>
      </div>
    </form>
  );
}

function Lista({ e, onAbrir, onEditarVet }: { e: ReturnType<typeof obtenerApp>; onAbrir: (id: string) => void; onEditarVet: (tipo: TipoVeterinario) => void }) {
  return (
    <>
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold leading-tight">SOS</h1>
          <p className="mt-1 text-base text-[var(--text-secondary)]">Qué hacer ahora mismo, antes de llegar al veterinario.</p>
          <p className="mt-2 flex items-start gap-1.5 text-sm text-[var(--text-tertiary)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/accion-alerta.png" alt="" width={14} height={14} className="mt-0.5 shrink-0 object-contain" />
            Esta guía no reemplaza a tu veterinario. Ante cualquier duda, llama o ve directo a una clínica.
          </p>
        </div>
        <LogoMarca />
      </header>

      <div className="flex flex-col gap-2">
        <TarjetaVeterinario tipo="urgencia" nombre={e.veterinarioUrgencia?.nombre} telefono={e.veterinarioUrgencia?.telefono} onEditar={() => onEditarVet('urgencia')} />
        <TarjetaVeterinario tipo="habitual" nombre={e.veterinarioHabitual?.nombre} telefono={e.veterinarioHabitual?.telefono} onEditar={() => onEditarVet('habitual')} />
      </div>

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
  vetParaLlamar,
  onVolver,
  onEditarVet,
}: {
  s: SituacionSos;
  vetParaLlamar?: Veterinario;
  onVolver: () => void;
  onEditarVet: (tipo: TipoVeterinario) => void;
}) {
  const telefono = vetParaLlamar?.telefono;
  return (
    <>
      <button
        type="button"
        onClick={onVolver}
        className="-ml-3 inline-flex min-h-11 w-fit items-center gap-2 rounded-[var(--radius-button)] px-3 text-base font-semibold text-[var(--text-secondary)] transition-transform duration-150 active:scale-[0.97] [touch-action:manipulation]"
      >
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
        <motion.section {...entrada(3)} aria-label="Qué evitar" className="rounded-[var(--radius-card)] border border-[var(--border-ui)] p-4" style={{ background: 'color-mix(in oklab, var(--warn) 10%, var(--surface))' }}>
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

      <motion.section {...entrada(4)} aria-label="Cuándo ir al veterinario" className="rounded-[var(--radius-card)] border border-[var(--border-ui)] p-4" style={{ background: 'color-mix(in oklab, var(--danger) 10%, var(--surface))' }}>
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
          Llamar a {vetParaLlamar?.nombre || 'tu veterinario'}
        </a>
      ) : (
        <button
          type="button"
          onClick={() => onEditarVet('urgencia')}
          className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] border-2 border-dashed border-[var(--danger)] px-4 text-base font-semibold text-[var(--danger)] transition-transform duration-150 active:scale-[0.97] [touch-action:manipulation]"
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
  const [editandoVet, setEditandoVet] = useState<TipoVeterinario | null>(null);

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
  // En una emergencia, el de urgencia (24/7) es a quien se llama primero; si no está guardado, el de cabecera.
  const vetParaLlamar = e.veterinarioUrgencia?.telefono ? e.veterinarioUrgencia : e.veterinarioHabitual;

  return (
    <MotionConfig reducedMotion="user">
      <>
        <main className="flex flex-1 flex-col gap-6 px-6 pb-6 pt-6">
          {!situacion ? (
            <Lista e={e} onAbrir={setSituacionId} onEditarVet={setEditandoVet} />
          ) : (
            <Detalle s={situacion} vetParaLlamar={vetParaLlamar} onVolver={() => setSituacionId(null)} onEditarVet={setEditandoVet} />
          )}
        </main>

        <Hoja abierta={editandoVet !== null} titulo={editandoVet ? COPY_VET[editandoVet].tituloHoja : ''} onCerrar={() => setEditandoVet(null)}>
          {editandoVet && (
            <FormVeterinario
              tipo={editandoVet}
              nombre={e[editandoVet === 'urgencia' ? 'veterinarioUrgencia' : 'veterinarioHabitual']?.nombre}
              telefono={e[editandoVet === 'urgencia' ? 'veterinarioUrgencia' : 'veterinarioHabitual']?.telefono}
              onListo={() => setEditandoVet(null)}
            />
          )}
        </Hoja>
      </>
    </MotionConfig>
  );
}
