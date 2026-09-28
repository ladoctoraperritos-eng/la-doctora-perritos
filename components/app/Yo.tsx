'use client';

// Pestaña «Yo»: una misión — que la cuenta funcione como la persona espera (quién cuida, qué avisos, qué plan, sus datos).
// SPEC (PREFLIGHT):
//   objeto_principal: la tarjeta de la persona con su nombre y correo, y debajo «Quienes cuidan contigo»
//   niveles: display 3xl · title lg (secciones) · body base · label sm
//   acento_en: interruptores activos, tu inicial (verde); coral para las demás personas (ficha de arte)
//   baseline: entrada escalonada · tap con escala · hoja con transición
//   estados: cargando (esqueleto) · límite de personas del plan · validación de correo · confirmación al borrar todo · copia descargada

import { useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, MotionConfig } from 'motion/react';
import { AlertCircle, Camera, Download, FileText, Mail, Pencil, ShieldCheck, UserPlus } from 'lucide-react';
import { Hoja } from './Hoja';
import { Borrar, botonPrimario, botonSecundario, Campo, campo, procesarFoto } from './Perros';
import { entrada, Menu, PersonaCirculo } from './Hoy';
import {
  guardarAjustes,
  guardarTutor,
  eliminarTutor,
  historialCsv,
  LIMITE_PERROS,
  LIMITE_TUTORES,
  nuevoId,
  obtenerApp,
  reiniciarApp,
  suscribirApp,
  type Ajustes,
  type Tutor,
} from '@/lib/app';
import { correoValido } from '@/lib/auth';
import { CONDICIONES } from '@/lib/oferta';
import { reiniciar as reiniciarOnboarding } from '@/lib/onboarding';
import { PLANES } from '@/lib/planes';

function descargar(nombre: string, contenido: string, tipo: string) {
  const url = URL.createObjectURL(new Blob([contenido], { type: tipo }));
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Interruptor({ activo, onCambiar, etiqueta, detalle }: { activo: boolean; onCambiar: (v: boolean) => void; etiqueta: string; detalle?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      onClick={() => onCambiar(!activo)}
      className="flex min-h-16 w-full items-center gap-4 rounded-[var(--radius-card)] border border-[var(--border-ui)] bg-[var(--surface)] p-4 text-left [touch-action:manipulation]"
    >
      <span className="flex-1">
        <span className="block text-base font-semibold">{etiqueta}</span>
        {detalle && <span className="block text-sm text-[var(--text-secondary)]">{detalle}</span>}
      </span>
      <span aria-hidden="true" className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border-2 transition-colors duration-200 ${activo ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--border-ui)] bg-[var(--surface-2)]'}`}>
        <span className={`absolute left-1 size-5 rounded-full transition-[transform,background-color] duration-200 ${activo ? 'translate-x-6 bg-[var(--bg)]' : 'translate-x-0 bg-[var(--border-ui)]'}`} />
      </span>
    </button>
  );
}

function FormTutor({ tutor, esYo, onListo }: { tutor?: Tutor; esYo: boolean; onListo: () => void }) {
  const [nombre, setNombre] = useState(tutor?.nombre ?? '');
  const [correo, setCorreo] = useState(tutor?.correo ?? '');
  const [foto, setFoto] = useState<string | undefined>(tutor?.foto);
  const [cargandoFoto, setCargandoFoto] = useState(false);
  const entradaFoto = useRef<HTMLInputElement>(null);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const elegirFoto = async (archivo: File | undefined) => {
    if (!archivo) return;
    setCargandoFoto(true);
    setErrores((x) => ({ ...x, foto: '' }));
    try {
      setFoto(await procesarFoto(archivo));
    } catch (err) {
      setErrores((x) => ({ ...x, foto: err instanceof Error ? err.message : 'No pudimos cargar la foto.' }));
    } finally {
      setCargandoFoto(false);
    }
  };

  const guardar = () => {
    const e: Record<string, string> = {};
    if (!nombre.trim()) e.nombre = 'Escribe un nombre.';
    if (!esYo && correo.trim() && !correoValido(correo)) e.correo = 'Escribe un correo válido, por ejemplo nombre@correo.com.';
    setErrores(e);
    if (Object.keys(e).length) return;
    guardarTutor({
      ...tutor,
      id: tutor?.id ?? nuevoId('t'),
      nombre: nombre.trim(),
      correo: esYo ? tutor?.correo : correo.trim() || undefined,
      pendiente: esYo ? undefined : tutor ? tutor.pendiente : true,
      foto,
    });
    onListo();
  };

  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();
        guardar();
      }}
      noValidate
    >
      <div className="mt-3 flex items-center gap-4">
        <PersonaCirculo nombre={nombre || (esYo ? 'Tú' : 'Persona')} foto={foto} esYo={esYo} tam="size-16" textoTam="text-2xl" />
        <div className="flex flex-col items-start gap-1">
          <input ref={entradaFoto} id="foto-tutor" type="file" accept="image/*" className="sr-only" onChange={(ev) => { void elegirFoto(ev.target.files?.[0]); ev.target.value = ''; }} />
          <button type="button" onClick={() => entradaFoto.current?.click()} disabled={cargandoFoto} className="inline-flex min-h-12 items-center gap-2 rounded-[var(--radius-button)] border-2 border-[var(--accent)] px-4 text-base font-semibold text-[var(--accent)] [touch-action:manipulation]">
            <Camera size={20} aria-hidden="true" />
            {cargandoFoto ? 'Preparando…' : foto ? 'Cambiar foto' : 'Agregar foto'}
          </button>
          {foto && (
            <button type="button" onClick={() => setFoto(undefined)} className="inline-flex min-h-11 items-center px-2 text-base font-medium text-[var(--text-secondary)] [touch-action:manipulation]">
              Quitar foto
            </button>
          )}
        </div>
      </div>
      {errores.foto && (
        <p role="alert" className="mt-2 flex items-center gap-2 text-base font-semibold">
          <AlertCircle size={18} color="var(--accent)" className="shrink-0" aria-hidden="true" />
          {errores.foto}
        </p>
      )}
      <Campo id="nombre-tutor" etiqueta={esYo ? 'Tu nombre' : 'Nombre'} error={errores.nombre}>
        <input id="nombre-tutor" value={nombre} maxLength={30} autoComplete={esYo ? 'name' : 'off'} onChange={(e) => { setNombre(e.target.value); setErrores((x) => ({ ...x, nombre: '' })); }} placeholder="Por ejemplo, Diego" className={campo} />
      </Campo>
      {!esYo && (
        <Campo id="correo-tutor" etiqueta="Su correo" opcional error={errores.correo}>
          <input id="correo-tutor" type="email" inputMode="email" autoComplete="off" value={correo} onChange={(e) => { setCorreo(e.target.value); setErrores((x) => ({ ...x, correo: '' })); }} placeholder="nombre@correo.com" className={campo} />
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Con su correo podrá entrar y marcar cuidados desde su celular.</p>
        </Campo>
      )}
      <div className="mt-8">
        <button type="submit" className={botonPrimario}>
          {tutor ? 'Guardar cambios' : 'Agregar persona'}
        </button>
      </div>
      {tutor && !esYo && (
        <Borrar
          etiqueta={`Quitar a ${tutor.nombre}`}
          aviso="Sus registros pasados se conservan en el historial con su nombre."
          onConfirmar={() => {
            eliminarTutor(tutor.id);
            onListo();
          }}
        />
      )}
    </form>
  );
}

type HojaEstado = null | { kind: 'tutor'; tutor?: Tutor; esYo: boolean } | { kind: 'limite' };

export default function Yo() {
  const e = useSyncExternalStore(suscribirApp, obtenerApp, () => null);
  const [hoja, setHoja] = useState<HojaEstado>(null);
  const [descargado, setDescargado] = useState<string | null>(null);
  const router = useRouter();
  const cerrar = () => setHoja(null);

  if (!e) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col [font-family:var(--font-body)]">
        <main className="flex flex-1 flex-col gap-4 px-6 pt-6" aria-busy="true" aria-label="Cargando tu cuenta">
          <div className="h-10 w-32 rounded-[var(--radius-button)] bg-[var(--surface-2)] motion-safe:animate-pulse" />
          <div className="h-24 rounded-[var(--radius-card)] bg-[var(--surface-2)] motion-safe:animate-pulse" />
          <div className="h-16 rounded-[var(--radius-card)] bg-[var(--surface-2)] motion-safe:animate-pulse" />
        </main>
        <Menu activa="yo" />
      </div>
    );
  }

  const yo = e.tutores.find((t) => t.id === e.yo) ?? e.tutores[0];
  const limitePersonas = LIMITE_TUTORES[e.plan];
  const limitePerros = LIMITE_PERROS[e.plan];
  const plan = PLANES[e.plan];
  const ajuste = (parcial: Partial<Ajustes>) => guardarAjustes(parcial);
  const invitar = () => (e.tutores.length >= limitePersonas ? setHoja({ kind: 'limite' }) : setHoja({ kind: 'tutor', esYo: false }));

  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col text-[var(--text-primary)] [font-family:var(--font-body)]">
        <main className="flex flex-1 flex-col gap-8 px-6 pb-24 pt-6">
          <header>
            <h1 className="text-3xl font-bold leading-tight">Yo</h1>
          </header>

          <motion.section {...entrada(0)} aria-label="Mi cuenta" className="borde-degradado flex items-center gap-4 rounded-[var(--radius-card)] p-4 shadow-[var(--shadow-2)]">
            <PersonaCirculo nombre={yo.nombre} foto={yo.foto} esYo tam="size-14" textoTam="text-2xl" />
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold leading-tight">{yo.nombre}</p>
              <p className="mt-1 break-words text-base text-[var(--text-secondary)]">{e.correo ?? 'Sin correo de acceso todavía'}</p>
            </div>
            <button type="button" onClick={() => setHoja({ kind: 'tutor', tutor: yo, esYo: true })} aria-label="Cambiar mi nombre" className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-[var(--border-ui)] [touch-action:manipulation]">
              <Pencil size={18} aria-hidden="true" />
            </button>
          </motion.section>

          <section aria-label="Quienes cuidan contigo">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h2 className="text-lg font-bold">Quienes cuidan contigo</h2>
              <span className="text-sm font-semibold text-[var(--text-secondary)]">
                {e.tutores.length} de {limitePersonas}
              </span>
            </div>
            <ul className="flex flex-col gap-2">
              {e.tutores.map((t, i) => {
                const esYo = t.id === yo.id;
                return (
                  <motion.li key={t.id} {...entrada(i + 1)}>
                    <button
                      type="button"
                      onClick={() => setHoja({ kind: 'tutor', tutor: t, esYo })}
                      className="flex min-h-16 w-full items-center gap-4 rounded-[var(--radius-card)] border border-[var(--border-ui)] bg-[var(--surface)] p-4 text-left shadow-[var(--shadow-1)] active:scale-[0.98] [touch-action:manipulation]"
                    >
                      <PersonaCirculo nombre={t.nombre} foto={t.foto} esYo={esYo} tam="size-11" textoTam="text-lg" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-base font-semibold">{esYo ? `${t.nombre} (tú)` : t.nombre}</span>
                        {t.pendiente ? (
                          <span className="mt-1 inline-block whitespace-nowrap rounded-full bg-[color-mix(in_oklab,var(--warn)_14%,var(--surface))] px-2 py-0.5 text-sm font-semibold text-[var(--warn)]">Invitación pendiente</span>
                        ) : (
                          <span className="block text-sm text-[var(--text-secondary)]">{t.correo ?? (esYo ? 'Administras la cuenta' : 'Sin correo')}</span>
                        )}
                      </span>
                      {!esYo && <Pencil size={18} color="var(--text-secondary)" aria-hidden="true" />}
                    </button>
                  </motion.li>
                );
              })}
            </ul>
            <button type="button" onClick={invitar} className="mt-3 flex min-h-14 w-full items-center justify-center gap-2 rounded-[var(--radius-card)] border-2 border-dashed border-[var(--accent)] text-base font-semibold text-[var(--accent)] [touch-action:manipulation]">
              <UserPlus size={20} aria-hidden="true" />
              Invitar a alguien
            </button>
          </section>

          <section aria-label="Avisos" className="flex flex-col gap-4">
            <div>
              <h2 className="mb-2 text-lg font-bold">Avisos</h2>
              <Interruptor activo={e.ajustes.avisoHora} onCambiar={(v) => ajuste({ avisoHora: v })} etiqueta="A la hora de cada cuidado" detalle="Medicamentos y suplementos, justo a la hora que fijaste" />
            </div>
            <div className="rounded-[var(--radius-card)] border border-[var(--border-ui)] p-3">
              <p className="mb-2 text-base font-semibold">Avisos anticipados</p>
              <div className="flex flex-col gap-2">
                <Interruptor activo={e.ajustes.avisoStock} onCambiar={(v) => ajuste({ avisoStock: v })} etiqueta="Antes de que se acabe algo" detalle="Alimento y medicamentos" />
                <Interruptor activo={e.ajustes.avisoFechas} onCambiar={(v) => ajuste({ avisoFechas: v })} etiqueta="Antes de una vacuna o control" detalle="Baños, antiparasitarios y citas" />
              </div>
              <div role="radiogroup" aria-label="Con cuánta anticipación" className="mt-4">
                <p className="text-base font-semibold">¿Con cuántos días de anticipación?</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">Se aplica a estos dos avisos, no al de la hora del cuidado.</p>
                <div className="mt-2 flex gap-2">
                  {([3, 5, 7] as const).map((d) => {
                    const on = e.ajustes.anticipacion === d;
                    return (
                      <button
                        key={d}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => ajuste({ anticipacion: d })}
                        className={`inline-flex min-h-11 items-center rounded-full border-2 px-4 text-base font-semibold [touch-action:manipulation] ${on ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--bg)]' : 'border-[var(--border-ui)] bg-[var(--surface)]'}`}
                      >
                        {d} días
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">Los avisos llegan a tu correo y a tu celular en cuanto activemos tu cuenta.</p>
          </section>

          <section aria-label="Tu plan">
            <h2 className="mb-2 text-lg font-bold">Tu plan</h2>
            <div className="rounded-[var(--radius-card)] border border-[var(--border-ui)] bg-[var(--surface)] p-4 shadow-[var(--shadow-1)]">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xl font-bold">Plan {plan.nombre}</p>
                <ShieldCheck size={24} color="var(--accent)" aria-hidden="true" />
              </div>
              <ul className="mt-3 flex flex-col gap-1 text-base">
                <li>
                  Perros: <strong className="font-semibold tabular-nums">{e.perros.length} de {limitePerros}</strong>
                </li>
                <li>
                  Personas: <strong className="font-semibold tabular-nums">{e.tutores.length} de {limitePersonas}</strong>
                </li>
              </ul>
              {e.plan === 'esencial' && (
                <Link href="/paywall" className={`${botonSecundario} mt-4`}>
                  Ver el plan Familia
                </Link>
              )}
              <a href={`mailto:${CONDICIONES.contacto}?subject=Mi%20suscripci%C3%B3n`} className="mt-3 inline-flex min-h-11 items-center gap-2 text-base font-semibold text-[var(--accent)]">
                <Mail size={18} aria-hidden="true" />
                Cambiar o cancelar mi suscripción
              </a>
            </div>
          </section>

          <section aria-label="Tus datos">
            <h2 className="mb-2 text-lg font-bold">Tus datos</h2>
            <p className="mb-3 text-base text-[var(--text-secondary)]">Son tuyos: llévatelos cuando quieras.</p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  descargar('historial-la-doctora-perritos.csv', historialCsv(e), 'text/csv;charset=utf-8');
                  setDescargado('historial');
                }}
                className="flex min-h-16 w-full items-center gap-4 rounded-[var(--radius-card)] border border-[var(--border-ui)] bg-[var(--surface)] p-4 text-left [touch-action:manipulation]"
              >
                <Download size={22} color="var(--accent)" aria-hidden="true" />
                <span className="flex-1">
                  <span className="block text-base font-semibold">Descargar el historial</span>
                  <span className="block text-sm text-[var(--text-secondary)]">Archivo CSV: se abre en Excel o Google Sheets</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  descargar('mis-datos-la-doctora-perritos.json', JSON.stringify(e, null, 2), 'application/json');
                  setDescargado('todo');
                }}
                className="flex min-h-16 w-full items-center gap-4 rounded-[var(--radius-card)] border border-[var(--border-ui)] bg-[var(--surface)] p-4 text-left [touch-action:manipulation]"
              >
                <FileText size={22} color="var(--accent)" aria-hidden="true" />
                <span className="flex-1">
                  <span className="block text-base font-semibold">Descargar todos mis datos</span>
                  <span className="block text-sm text-[var(--text-secondary)]">Perros, cuidados, personas y registros</span>
                </span>
              </button>
            </div>
            <p role="status" className="mt-2 min-h-6 text-sm font-semibold">
              {descargado ? 'Listo: revisa tu carpeta de descargas.' : ''}
            </p>
            <Borrar
              etiqueta="Borrar todos mis datos"
              aviso="Se borran tus perros, cuidados, historial y personas de este aparato. Esto no se puede deshacer."
              onConfirmar={() => {
                reiniciarApp();
                reiniciarOnboarding();
                router.push('/');
              }}
            />
          </section>

          <nav aria-label="Información legal" className="flex flex-wrap gap-x-4 text-base text-[var(--text-secondary)]">
            <Link href="/privacidad" className="inline-flex min-h-11 items-center underline underline-offset-4">
              Privacidad
            </Link>
            <Link href="/terminos" className="inline-flex min-h-11 items-center underline underline-offset-4">
              Términos
            </Link>
            <Link href="/reembolsos" className="inline-flex min-h-11 items-center underline underline-offset-4">
              Reembolsos
            </Link>
            <a href={`mailto:${CONDICIONES.contacto}`} className="inline-flex min-h-11 items-center underline underline-offset-4">
              Ayuda
            </a>
          </nav>
        </main>

        <Hoja abierta={hoja?.kind === 'tutor'} titulo={hoja?.kind === 'tutor' ? (hoja.esYo ? 'Mi nombre' : hoja.tutor ? 'Editar persona' : 'Invitar a alguien') : ''} onCerrar={cerrar}>
          {hoja?.kind === 'tutor' && <FormTutor key={hoja.tutor?.id ?? 'nuevo'} tutor={hoja.tutor} esYo={hoja.esYo} onListo={cerrar} />}
        </Hoja>
        <Hoja abierta={hoja?.kind === 'limite'} titulo="Tu plan llegó a su límite" onCerrar={cerrar}>
          <p className="text-base text-[var(--text-secondary)]">
            El plan {plan.nombre} permite hasta {limitePersonas} personas cuidando. {e.plan === 'esencial' ? 'El plan Familia llega hasta 3 personas y 5 perros.' : 'Es el máximo por cuenta.'}
          </p>
          <div className="mt-6 flex flex-col gap-3">
            {e.plan === 'esencial' && (
              <Link href="/paywall" className={botonPrimario}>
                Ver el plan Familia
              </Link>
            )}
            <button type="button" onClick={cerrar} className={botonSecundario}>
              Ahora no
            </button>
          </div>
        </Hoja>
        <Menu activa="yo" />
      </div>
    </MotionConfig>
  );
}
