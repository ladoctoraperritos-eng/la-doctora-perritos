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
import { Hoja } from './Hoja';
import { Borrar, botonPrimario, botonSecundario, Campo, campo, ENCUADRE_INICIAL, EncuadreFoto, type Encuadre, leerFoto, recortarFoto } from './Perros';
import { entrada, LogoMarca, PersonaCirculo } from './Hoy';
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
import { correoValido, enviarEnlaceDeAcceso } from '@/lib/auth';
import { CONDICIONES } from '@/lib/oferta';
import { reiniciar as reiniciarOnboarding } from '@/lib/onboarding';
import { PLANES } from '@/lib/planes';
import { invitarCuidador } from '@/lib/sincronizar';
import { clienteSupabase } from '@/lib/supabase';

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
      className="flex min-h-16 w-full items-center gap-4 rounded-[var(--radius-card)] border border-[var(--border-suave)] bg-[var(--surface)] p-4 text-left [touch-action:manipulation]"
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
  const [original, setOriginal] = useState<string | undefined>(undefined);
  const [enfoque, setEnfoque] = useState<Encuadre>(ENCUADRE_INICIAL);
  const [cargandoFoto, setCargandoFoto] = useState(false);
  const entradaFoto = useRef<HTMLInputElement>(null);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [invitando, setInvitando] = useState(false);

  const elegirFoto = async (archivo: File | undefined) => {
    if (!archivo) return;
    setCargandoFoto(true);
    setErrores((x) => ({ ...x, foto: '' }));
    try {
      setOriginal(await leerFoto(archivo));
      setEnfoque(ENCUADRE_INICIAL);
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
    void (async () => {
      let fotoFinal = foto;
      if (original) {
        try {
          fotoFinal = await recortarFoto(original, enfoque);
        } catch {
          setErrores((x) => ({ ...x, foto: 'No pudimos recortar la foto. Prueba con otra.' }));
          return;
        }
      }
      guardarTutor({
        ...tutor,
        id: tutor?.id ?? nuevoId('t'),
        nombre: nombre.trim(),
        correo: esYo ? tutor?.correo : correo.trim() || undefined,
        pendiente: esYo ? undefined : tutor ? tutor.pendiente : true,
        foto: fotoFinal,
      });
      if (!esYo && correo.trim()) {
        setInvitando(true);
        try {
          await invitarCuidador(correo.trim());
          await enviarEnlaceDeAcceso(correo.trim());
        } catch {
          // La persona ya quedó guardada en «Quienes cuidan contigo»; si el correo de acceso falla,
          // se reintenta solo al volver a guardar (el upsert de la invitación no duplica nada).
        } finally {
          setInvitando(false);
        }
      }
    onListo();
    })();
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/accion-camara.png" alt="" width={20} height={20} className="object-contain" />
            {cargandoFoto ? 'Preparando…' : foto || original ? 'Cambiar foto' : 'Agregar foto'}
          </button>
          {(foto || original) && (
            <button type="button" onClick={() => { setFoto(undefined); setOriginal(undefined); }} className="inline-flex min-h-11 items-center px-2 text-base font-medium text-[var(--text-secondary)] [touch-action:manipulation]">
              Quitar foto
            </button>
          )}
        </div>
      </div>
      {original && <EncuadreFoto fuente={original} enfoque={enfoque} onCambiar={setEnfoque} nombre={nombre || (esYo ? 'tu foto' : 'esta persona')} />}
      {errores.foto && (
        <p role="alert" className="mt-2 flex items-center gap-2 text-base font-semibold">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/accion-alerta.png" alt="" width={18} height={18} className="shrink-0 object-contain" />
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
        <button type="submit" disabled={invitando} className={`${botonPrimario} disabled:opacity-60`}>
          {invitando ? 'Enviando su acceso…' : tutor ? 'Guardar cambios' : 'Agregar persona'}
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
  const [borrando, setBorrando] = useState(false);
  const [errorBorrar, setErrorBorrar] = useState<string | null>(null);
  const router = useRouter();
  const cerrar = () => setHoja(null);

  // Borra la cuenta de VERDAD: si hay sesión en la nube, primero borra los datos sincronizados
  // (y la cuenta de acceso) en el servidor — antes esto solo limpiaba el aparato, y los datos
  // seguidos sincronizados a la nube quedaban vivos pese al botón "Borrar todos mis datos".
  const borrarTodo = async () => {
    setBorrando(true);
    setErrorBorrar(null);
    try {
      const supabase = clienteSupabase();
      const sesion = supabase ? (await supabase.auth.getSession()).data.session : null;
      if (supabase && sesion) {
        const res = await fetch('/api/cuenta/eliminar', { method: 'POST', headers: { Authorization: `Bearer ${sesion.access_token}` } });
        const cuerpo = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(cuerpo.motivo ?? 'No pudimos borrar tu cuenta. Intenta de nuevo.');
        await supabase.auth.signOut();
      }
      reiniciarApp();
      reiniciarOnboarding();
      router.push('/');
    } catch (err) {
      setErrorBorrar(err instanceof Error ? err.message : 'No pudimos borrar tu cuenta. Intenta de nuevo.');
      setBorrando(false);
    }
  };

  if (!e) {
    return (
      <main className="flex flex-1 flex-col gap-4 px-6 pt-6" aria-busy="true" aria-label="Cargando tu cuenta">
        <div className="h-10 w-32 rounded-[var(--radius-button)] bg-[var(--surface-2)] motion-safe:animate-pulse" />
        <div className="h-24 rounded-[var(--radius-card)] bg-[var(--surface-2)] motion-safe:animate-pulse" />
        <div className="h-16 rounded-[var(--radius-card)] bg-[var(--surface-2)] motion-safe:animate-pulse" />
      </main>
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
      <>
        <main className="flex flex-1 flex-col gap-8 px-6 pb-6 pt-6">
          <header className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-semibold leading-tight tracking-[-0.01em]">Yo</h1>
            <LogoMarca />
          </header>

          <motion.section {...entrada(0)} aria-label="Mi cuenta" className="borde-degradado flex items-center gap-4 rounded-[var(--radius-card)] p-4 shadow-[var(--shadow-2)]">
            <PersonaCirculo nombre={yo.nombre} foto={yo.foto} esYo tam="size-14" textoTam="text-2xl" />
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold leading-tight">{yo.nombre}</p>
              <p className="mt-1 break-words text-base text-[var(--text-secondary)]">{e.correo ?? 'Sin correo de acceso todavía'}</p>
            </div>
            <button type="button" onClick={() => setHoja({ kind: 'tutor', tutor: yo, esYo: true })} aria-label="Cambiar mi nombre" className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-[var(--border-ui)] [touch-action:manipulation]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/accion-editar.png" alt="" width={18} height={18} className="object-contain" />
            </button>
          </motion.section>

          <section aria-label="Quienes cuidan contigo">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">Quienes cuidan contigo</h2>
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
                      className="flex min-h-16 w-full items-center gap-4 rounded-[var(--radius-card)] border border-[var(--border-suave)] bg-[var(--surface)] p-4 text-left shadow-[var(--shadow-1)] active:scale-[0.98] [touch-action:manipulation]"
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
                      {!esYo && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src="/brand/accion-editar.png" alt="" width={18} height={18} className="shrink-0 object-contain" />
                      )}
                    </button>
                  </motion.li>
                );
              })}
            </ul>
            <button type="button" onClick={invitar} className="mt-3 flex min-h-14 w-full items-center justify-center gap-2 rounded-[var(--radius-card)] border-2 border-dashed border-[var(--accent)] text-base font-semibold text-[var(--accent)] [touch-action:manipulation]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/personas.png" alt="" width={20} height={20} className="object-contain" />
              Invitar a alguien
            </button>
          </section>

          <section aria-label="Avisos" className="flex flex-col gap-4">
            <div>
              <h2 className="mb-2 text-lg font-semibold">Avisos</h2>
              <Interruptor activo={e.ajustes.avisoHora} onCambiar={(v) => ajuste({ avisoHora: v })} etiqueta="A la hora de cada cuidado" detalle="Medicamentos y suplementos, justo a la hora que fijaste" />
            </div>
            <div className="rounded-[var(--radius-card)] border border-[var(--border-suave)] p-3">
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
            <p className="text-sm text-[var(--text-secondary)]">Por ahora los avisos llegan por correo, una vez al día con todo lo pendiente.</p>
          </section>

          <section aria-label="Tu plan">
            <h2 className="mb-2 text-lg font-semibold">Tu plan</h2>
            <div className="rounded-[var(--radius-card)] border border-[var(--border-suave)] bg-[var(--surface)] p-4 shadow-[var(--shadow-1)]">
              <div className="flex items-center justify-between gap-2">
                <p className="text-lg font-semibold">Plan {plan.nombre}</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/garantia.png" alt="" width={24} height={24} className="object-contain" />
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/accion-correo.png" alt="" width={18} height={18} className="object-contain" />
                Cambiar o cancelar mi suscripción
              </a>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Tu pago lo procesa Hotmart, no esta app. Escríbenos y te ayudamos, pero el cobro solo se detiene cuando
                la suscripción queda cancelada en Hotmart — mientras no la canceles ahí, se te sigue cobrando aunque
                dejes de usar la app o borres tu cuenta.
              </p>
            </div>
          </section>

          <section aria-label="Tus datos">
            <h2 className="mb-2 text-lg font-semibold">Tus datos</h2>
            <p className="mb-3 text-base text-[var(--text-secondary)]">Son tuyos: llévatelos cuando quieras.</p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  descargar('historial-la-doctora-perritos.csv', historialCsv(e), 'text/csv;charset=utf-8');
                  setDescargado('historial');
                }}
                className="flex min-h-16 w-full items-center gap-4 rounded-[var(--radius-card)] border border-[var(--border-suave)] bg-[var(--surface)] p-4 text-left [touch-action:manipulation]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/accion-descargar.png" alt="" width={22} height={22} className="object-contain" />
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
                className="flex min-h-16 w-full items-center gap-4 rounded-[var(--radius-card)] border border-[var(--border-suave)] bg-[var(--surface)] p-4 text-left [touch-action:manipulation]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/documentos.png" alt="" width={22} height={22} className="object-contain" />
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
              etiqueta={borrando ? 'Borrando…' : 'Borrar todos mis datos'}
              aviso="Se borran tus perros, cuidados, historial y personas — de este aparato y de la nube. Esto no se puede deshacer. Importante: esto NO cancela tu suscripción en Hotmart. Si sigues pagando, cancélala primero ahí (o escríbenos) para que no se te vuelva a cobrar."
              onConfirmar={() => void borrarTodo()}
            />
            {errorBorrar && (
              <p role="alert" className="mt-2 text-sm font-semibold text-[var(--danger)]">
                {errorBorrar}
              </p>
            )}
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
      </>
    </MotionConfig>
  );
}
