'use client';

// Paywall: llega DESPUÉS del primer valor y funciona como la conclusión del onboarding.
// Orden: resultado personalizado → plan (cuántos perros, anual/mensual) → línea de tiempo honesta de la
// prueba (hoy → aviso → cobro, con fechas reales) → garantía y pago seguro. El botón (fijo abajo) lleva
// al checkout de Hotmart de ese plan y periodo (lib/hotmart.ts).

import { useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { MotionConfig, motion } from 'motion/react';
import { ArrowLeft, Bell, Check, CreditCard, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import { addDays, CONDICIONES, formatFecha, hayGarantia, hayPrueba } from '@/lib/oferta';
import { urlCheckout, type PeriodoPago } from '@/lib/hotmart';
import { actualizar, armarPanel, contarRespuestas, obtener, planRecomendado, suscribir, VACIAS, type IdPlan, type Respuestas } from '@/lib/onboarding';
import { PLANES } from '@/lib/planes';
import { correoValido } from '@/lib/auth';
import Marca from './Marca';

/** Solo para probar el recorrido antes de conectar Hotmart: NEXT_PUBLIC_MODO_DEMO=1. En producción NO se define. */
const MODO_DEMO = process.env.NEXT_PUBLIC_MODO_DEMO === '1';

const boton =
  'inline-flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] bg-[image:var(--accent-gradient)] text-lg font-semibold text-[var(--bg)] shadow-[var(--shadow-2)] transition-colors active:scale-[0.98] disabled:bg-[image:none] disabled:bg-[var(--surface-2)] disabled:text-[var(--text-secondary)] disabled:shadow-none [touch-action:manipulation]';

function Selector<T extends string>({
  etiqueta,
  opciones,
  activo,
  onChange,
}: {
  etiqueta: string;
  opciones: { id: T; texto: string; detalle?: string }[];
  activo: T;
  onChange: (id: T) => void;
}) {
  return (
    <div role="group" aria-label={etiqueta} className="grid grid-cols-2 gap-2 rounded-[var(--radius-card)] bg-[var(--surface-2)] p-2">
      {opciones.map((o) => {
        const on = o.id === activo;
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.id)}
            className={`min-h-14 rounded-[var(--radius-button)] px-3 py-2 text-base font-semibold active:scale-[0.98] [touch-action:manipulation] ${
              on ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-[var(--shadow-1)] outline outline-2 outline-[var(--accent)]' : 'text-[var(--text-secondary)]'
            }`}
          >
            <span className="block">{o.texto}</span>
            {o.detalle && <span className={`block text-sm font-medium ${on ? 'text-[var(--accent)]' : ''}`}>{o.detalle}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** Tarjeta de plan (anual / mensual): el importe REAL que se cobra es lo más grande. */
function TarjetaPeriodo({
  activa,
  onElegir,
  titulo,
  importe,
  unidad,
  nota,
  insignia,
}: {
  activa: boolean;
  onElegir: () => void;
  titulo: string;
  importe: string;
  unidad: string;
  nota?: string;
  insignia?: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={activa}
      onClick={onElegir}
      className={`relative flex w-full flex-col items-start gap-2 rounded-[var(--radius-card)] border-2 p-4 pt-5 text-left transition-colors duration-200 active:scale-[0.98] [touch-action:manipulation] ${
        activa ? 'border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_8%,var(--surface))] shadow-[var(--shadow-2)]' : 'border-[var(--border-ui)] bg-[var(--surface)]'
      }`}
    >
      {insignia && (
        <span className="absolute -top-3 left-3 inline-flex items-center gap-1 rounded-full bg-[var(--accent-2)] px-3 py-1 text-sm font-bold text-[var(--text-primary)]">
          <Sparkles size={14} aria-hidden="true" />
          {insignia}
        </span>
      )}
      <span
        aria-hidden="true"
        className={`inline-flex size-6 shrink-0 items-center justify-center rounded-full border-2 ${activa ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--border-ui)]'}`}
      >
        {activa && <Check size={14} color="var(--bg)" strokeWidth={3} />}
      </span>
      <span className="flex-1">
        <span className="block text-base font-semibold text-[var(--text-secondary)]">{titulo}</span>
        <span className="flex flex-wrap items-baseline gap-x-1">
          <span aria-live="polite" className="text-2xl font-bold tabular-nums">{importe}</span>
          <span className="text-base text-[var(--text-secondary)]">{unidad}</span>
        </span>
        {nota && <span className="block text-sm text-[var(--text-secondary)]">{nota}</span>}
      </span>
    </button>
  );
}

const suscribirReloj = (avisar: () => void) => {
  const id = setInterval(avisar, 60000);
  return () => clearInterval(id);
};
const minutoActual = () => Math.floor(Date.now() / 60000);

/** «Cómo funciona tu prueba»: hoy → aviso → cobro. Las fechas salen de la fecha real (solo en el navegador). */
function LineaTiempo({ importe, unidad }: { importe: string; unidad: string }) {
  const minuto = useSyncExternalStore(suscribirReloj, minutoActual, () => null);
  const inicio = minuto === null ? null : new Date(minuto * 60000);
  const dias = CONDICIONES.prueba.dias;
  const avisoDia = Math.max(dias - 2, 1);
  const pasos = [
    { icono: Sparkles, cuando: 'Hoy · US$0', texto: 'Acceso completo al cuidado de tu perro.' },
    {
      icono: Bell,
      cuando: `Día ${avisoDia} · Te avisamos`,
      texto: `Te recordamos que tu prueba está por terminar${inicio ? ` (${formatFecha(addDays(inicio, avisoDia))})` : ''}.`,
    },
    {
      icono: CreditCard,
      cuando: `${inicio ? formatFecha(addDays(inicio, dias)) : `Día ${dias + 1}`} · ${importe}${unidad}`,
      texto: 'Solo si decides continuar. Si cancelas antes, no pagas nada.',
    },
  ];
  return (
    <section aria-label="Cómo funciona tu prueba" className="mt-6">
      <h2 className="text-lg font-bold">Cómo funciona tu prueba</h2>
      <ol className="mt-3 flex flex-col">
        {pasos.map((p, i) => {
          const Icono = p.icono;
          return (
            <li key={p.cuando} className="relative flex gap-4 pb-4 last:pb-0">
              {i < pasos.length - 1 && <span aria-hidden="true" className="absolute left-5 top-11 bottom-1 w-0.5 bg-[var(--border-ui)]" />}
              <span className="relative inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--chip-bg)]">
                <Icono size={20} color="var(--accent)" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-base font-semibold">{p.cuando}</span>
                <span className="block text-sm text-[var(--text-secondary)]">{p.texto}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** Lo que armó, en máximo 4 líneas; si respondió poco se completa con lo esencial del producto. */
function beneficios(r: Respuestas, comparte: boolean): string[] {
  const panel = armarPanel(r);
  const hecho: string[] = [];
  for (const i of panel.hoy) hecho.push(`${i.titulo} hoy a las ${i.etiqueta}`);
  for (const i of panel.proximo) {
    const aprox = i.etiqueta.startsWith('~');
    if (i.id === 'com') hecho.push(aprox ? `Alimento para ${i.etiqueta}, con aviso` : 'Aviso antes de que se acabe el alimento');
    else if (i.id === 'rep') hecho.push(aprox ? `${i.titulo} en ${i.etiqueta}` : i.titulo);
    else hecho.push(`${i.titulo}: ${i.etiqueta.toLowerCase()}`);
  }
  if (comparte) hecho.push('Todos sabrán quién hizo qué');
  for (const i of panel.siempre) hecho.push(i.titulo);
  const relleno = ['Recordatorios de medicamentos, vacunas y controles', 'Avisos antes de que se acabe lo importante', 'Historial y documentos siempre a mano'];
  for (const x of relleno) if (hecho.length < 4) hecho.push(x);
  return hecho.slice(0, 4);
}

export default function Paywall() {
  const r = useSyncExternalStore(suscribir, obtener, () => VACIAS);
  const recomendado = planRecomendado(r);
  const [elegido, setElegido] = useState<IdPlan | null>(null);
  const [periodo, setPeriodo] = useState<PeriodoPago>('anio');
  const plan: IdPlan = elegido ?? recomendado;
  const P = PLANES[plan];
  const nombre = r.nombre.trim();
  const n = contarRespuestas(r);
  const importe = periodo === 'anio' ? P.anualTotal : P.mensual;
  const unidad = periodo === 'anio' ? '/año' : '/mes';
  const [correo, setCorreo] = useState<string | null>(null);
  const [intento, setIntento] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const campoCorreo = useRef<HTMLInputElement>(null);
  const correoActual = correo ?? r.correo;
  const correoOk = correoValido(correoActual);
  const empezar = () => {
    setGuardado(false);
    if (!correoOk) {
      // El botón nunca queda «muerto»: dice qué falta y lleva al campo.
      setIntento(true);
      campoCorreo.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      campoCorreo.current?.focus();
      return;
    }
    actualizar({ correo: correoActual.trim() });
    const destino = urlCheckout(plan, periodo, correoActual);
    if (destino) window.location.assign(destino);
    else setGuardado(true);
  };
  const etiquetaBoton = hayPrueba() ? `Empezar mis ${CONDICIONES.prueba.dias} días gratis` : 'Empezar ahora';

  // Sin respuestas no hay Panel que proteger: se le lleva a armarlo primero.
  if (n === 0) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-8 pt-4 text-[var(--text-primary)] [font-family:var(--font-body)]">
        <Marca />
        <main className="flex flex-1 flex-col justify-center gap-4">
          <h1 className="text-3xl font-bold leading-tight">Primero cuéntanos de tu perro</h1>
          <p className="text-base text-[var(--text-secondary)]">Unas preguntas rápidas y armamos su Panel de Hoy.</p>
          <Link href="/onboarding" className={boton}>
            Armar el Panel de mi perro
          </Link>
        </main>
      </div>
    );
  }

  const comparte = r.cuidadores !== null && r.cuidadores !== 'solo_yo';
  const lista = beneficios(r, comparte);

  return (
    <MotionConfig reducedMotion="user">
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pt-4 text-[var(--text-primary)] [font-family:var(--font-body)]">
      <div className="flex items-center gap-2">
        <Link href="/onboarding" className="inline-flex size-11 items-center justify-center rounded-full text-[var(--text-secondary)]" aria-label="Volver">
          <ArrowLeft size={22} aria-hidden="true" />
        </Link>
        <Marca />
      </div>

      <main className="flex flex-1 flex-col pt-4">
        <h1 className="text-balance text-3xl font-bold leading-tight">
          El cuidado de <span className="text-[var(--accent)]">{nombre || 'tu perro'}</span> ya está bajo control
        </h1>
        <p className="mt-2 text-lg text-[var(--text-secondary)]">
          {hayPrueba()
            ? `Durante los próximos ${CONDICIONES.prueba.dias} días, deja que La Doctora Perritos recuerde por ti.`
            : 'Deja que La Doctora Perritos recuerde por ti.'}
        </p>
        <ul className="mt-4 flex flex-col gap-3" aria-label="Lo que ya armaste">
          {lista.map((a, i) => (
            <motion.li
              key={a}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.06 * i, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-start gap-3 text-base font-medium"
            >
              <span aria-hidden="true" className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--chip-bg)]">
                <Check size={14} color="var(--accent)" strokeWidth={3} />
              </span>
              {a}
            </motion.li>
          ))}
        </ul>

        <section aria-label="Elige tu plan" className="mt-8 flex flex-col gap-3">
          <h2 className="text-lg font-bold">¿Cuántos perros cuidas?</h2>
          <Selector<IdPlan>
            etiqueta="Plan según cuántos perros tienes"
            activo={plan}
            onChange={setElegido}
            opciones={[
              { id: 'esencial', texto: '1 o 2 perros', detalle: 'Plan Esencial' },
              { id: 'familia', texto: '3 a 5 perros', detalle: 'Plan Familia' },
            ]}
          />
          <div role="radiogroup" aria-label="Cada cuánto pagas" className="mt-4 grid grid-cols-2 gap-3">
            <TarjetaPeriodo
              activa={periodo === 'anio'}
              onElegir={() => setPeriodo('anio')}
              titulo="Anual"
              importe={P.anualTotal}
              unidad="/año"
              nota={`Equivale a ${P.anualMes} al mes. Ahorras ${P.ahorroAnual}`}
              insignia="Mejor valor"
            />
            <TarjetaPeriodo activa={periodo === 'mes'} onElegir={() => setPeriodo('mes')} titulo="Mensual" importe={P.mensual} unidad="/mes" nota="Sin compromiso anual" />
          </div>
        </section>

        <section aria-label="Tu correo de acceso" className="mt-8">
          <h2 className="text-lg font-bold">¿A qué correo te enviamos tu acceso?</h2>
          <p className="mt-1 text-base text-[var(--text-secondary)]">Con este correo entras al Panel de {nombre || 'tu perro'}. Sin contraseñas: te mandamos un enlace.</p>
          <label htmlFor="correo" className="sr-only">
            Tu correo
          </label>
          <input
            id="correo"
            ref={campoCorreo}
            type="email"
            inputMode="email"
            autoComplete="email"
            value={correoActual}
            placeholder="tucorreo@ejemplo.com"
            aria-describedby="ayuda-correo"
            aria-invalid={intento && !correoOk}
            onChange={(e) => {
              setCorreo(e.target.value);
              setIntento(false);
            }}
            className={`mt-3 h-14 w-full rounded-[var(--radius-card)] border-2 bg-[var(--surface)] px-4 text-lg font-semibold outline-none placeholder:font-normal placeholder:text-[var(--text-secondary)] focus:border-[var(--accent)] ${
              intento && !correoOk ? 'border-[var(--accent)] ring-4 ring-[color-mix(in_oklab,var(--accent)_25%,transparent)]' : 'border-[var(--border-ui)]'
            }`}
          />
          <p id="ayuda-correo" role="status" aria-live="polite" className={`mt-2 text-sm ${intento && !correoOk ? 'font-semibold text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
            {intento && !correoOk ? 'Escribe un correo válido, por ejemplo nombre@correo.com.' : 'Solo lo usamos para tu acceso y los avisos de tu prueba.'}
          </p>
        </section>

        {hayPrueba() && <LineaTiempo importe={importe} unidad={unidad} />}

        <section aria-label="Tu tranquilidad" className="borde-degradado mt-6 flex flex-col gap-3 rounded-[var(--radius-card)] p-4 shadow-[var(--shadow-1)]">
          {hayGarantia() && (
            <div className="flex items-start gap-3">
              <ShieldCheck size={24} color="var(--accent)" className="mt-0.5 shrink-0" aria-hidden="true" />
              <p className="text-base">
                <strong className="font-semibold">
                  {hayPrueba() ? `${CONDICIONES.prueba.dias} días gratis + ` : ''}
                  {CONDICIONES.garantia.dias} días de garantía
                </strong>
                <span className="block text-sm text-[var(--text-secondary)]">
                  Si continúas y no estás conforme, tienes {CONDICIONES.garantia.dias} días de garantía sobre tu primer pago.
                </span>
              </p>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Lock size={20} color="var(--accent)" className="shrink-0" aria-hidden="true" />
            <p className="text-base font-medium">Pago seguro procesado por Hotmart</p>
          </div>
        </section>

        <div className="mt-6 flex items-center justify-center gap-6 text-base">
          <Link href="/" className="inline-flex min-h-11 items-center font-medium text-[var(--text-secondary)]">
            Ahora no
          </Link>
          <Link href="/login" className="inline-flex min-h-11 items-center font-medium text-[var(--accent)]">
            Ya tengo cuenta
          </Link>
        </div>
        {/* Espacio para que la barra fija no tape el final */}
        <div className="h-4" />
      </main>

      <div className="sticky bottom-0 -mx-6 flex flex-col gap-2 border-t border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)] bg-[var(--bg)] px-6 pb-4 pt-3">
        <p className="text-center text-sm font-medium text-[var(--text-secondary)]">
          {hayPrueba() ? 'Hoy US$0' : `Hoy ${importe}`} · Luego {importe}
          {unidad} 
        </p>
        <button type="button" onClick={empezar} className={boton}>
          {etiquetaBoton}
        </button>
        {guardado && (
          <div role="status" className="flex flex-col items-center gap-1 text-center">
            <p className="text-sm font-semibold">Guardamos tu correo. El pago se activa muy pronto.</p>
            {MODO_DEMO && (
              <Link href="/app" className="inline-flex min-h-11 items-center text-base font-semibold text-[var(--accent)] underline underline-offset-4">
                Ver la app de demostración
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
    </MotionConfig>
  );
}
