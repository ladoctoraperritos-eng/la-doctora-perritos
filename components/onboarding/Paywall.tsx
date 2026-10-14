'use client';

// Paywall: llega DESPUÉS del primer valor y funciona como la conclusión del onboarding.
// Orden: resultado personalizado → plan (cuántos perros, anual/mensual) → línea de tiempo honesta de la
// prueba (hoy → aviso → cobro, con fechas reales) → garantía y pago seguro. El botón (fijo abajo) lleva
// al checkout de Hotmart de ese plan y periodo (lib/hotmart.ts).

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { animate, MotionConfig, motion, useReducedMotion } from 'motion/react';
import { Check } from 'lucide-react';
import { track } from '@vercel/analytics';
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
            className={`flex min-h-14 items-center gap-1.5 rounded-[var(--radius-button)] px-2.5 py-2 text-left text-base font-semibold active:scale-[0.98] [touch-action:manipulation] ${
              on ? 'borde-destacado text-[var(--text-primary)] shadow-[var(--shadow-1)]' : 'border border-transparent text-[var(--text-secondary)]'
            }`}
          >
            <span
              aria-hidden="true"
              className={`inline-flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${on ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--border-ui)]'}`}
            >
              {on && <Check size={11} color="var(--bg)" strokeWidth={3} />}
            </span>
            <span>
              <span className="block">{o.texto}</span>
              {o.detalle && <span className={`block text-sm font-medium ${on ? 'text-[var(--accent)]' : ''}`}>{o.detalle}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** El precio es el dato héroe de una pantalla de venta: cuenta animado al cargar y al cambiar
 * de plan/periodo, nunca aparece estático (baseline obligatoria de animación — DESIGN-CORE). */
function ImporteAnimado({ texto }: { texto: string }) {
  const reduce = useReducedMotion();
  const conDecimales = texto.includes(',');
  const destino = parseFloat(texto.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
  const [valor, setValor] = useState(reduce ? destino : 0);
  const previo = useRef(reduce ? destino : 0);
  useEffect(() => {
    if (reduce) {
      setValor(destino);
      previo.current = destino;
      return;
    }
    const controles = animate(previo.current, destino, { duration: 0.45, ease: 'easeOut', onUpdate: setValor });
    previo.current = destino;
    return () => controles.stop();
  }, [destino, reduce]);
  return <>US${conDecimales ? valor.toFixed(2).replace('.', ',') : Math.round(valor)}</>;
}

/** Cuenta animada simple (sin decimales) — reutilizada aquí para el número de respuestas,
 * igual que ya hace el resultado del onboarding (efecto IKEA: recordar la inversión en el
 * momento del precio, regla del 02B). */
function ContadorAnimado({ n }: { n: number }) {
  const reduce = useReducedMotion();
  const [valor, setValor] = useState(reduce ? n : 0);
  const previo = useRef(reduce ? n : 0);
  useEffect(() => {
    if (reduce) {
      setValor(n);
      previo.current = n;
      return;
    }
    const controles = animate(previo.current, n, { duration: 0.5, ease: 'easeOut', onUpdate: (v) => setValor(Math.round(v)) });
    previo.current = n;
    return () => controles.stop();
  }, [n, reduce]);
  return <>{valor}</>;
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
      className={`relative flex w-full flex-col items-start gap-2 rounded-[var(--radius-card)] p-4 pt-5 text-left transition-colors duration-200 active:scale-[0.98] [touch-action:manipulation] ${
        activa ? 'borde-destacado shadow-[var(--shadow-2)]' : 'border border-[var(--border-ui)] bg-[var(--surface)]'
      }`}
    >
      {insignia && (
        <span className="absolute -top-3 left-3 inline-flex items-center gap-1 rounded-full bg-[var(--accent-2)] px-3 py-1 text-sm font-bold text-[var(--text-primary)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/destello.png" alt="" width={14} height={14} className="object-contain" />
          {insignia}
        </span>
      )}
      <span
        aria-hidden="true"
        className={`inline-flex size-6 shrink-0 items-center justify-center rounded-full border-2 ${activa ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--border-ui)]'}`}
      >
        {activa && <Check size={14} color="var(--bg)" strokeWidth={3} />}
      </span>
      <span className="flex flex-1 flex-col justify-center gap-1">
        <span className="block text-base font-semibold text-[var(--text-secondary)]">{titulo}</span>
        <span className="flex flex-wrap items-baseline gap-x-1">
          <span aria-live="polite" className="text-lg font-bold tabular-nums">
            <ImporteAnimado texto={importe} />
          </span>
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
    { imagen: '/brand/destello.png', cuando: 'Hoy · US$0', texto: 'Acceso completo a la app.' },
    {
      imagen: '/brand/aviso.png',
      cuando: `Día ${avisoDia} · Te avisamos`,
      texto: `Antes de que termine tu prueba${inicio ? ` (${formatFecha(addDays(inicio, avisoDia))})` : ''}.`,
    },
    {
      imagen: '/brand/tarjeta.png',
      cuando: `${inicio ? formatFecha(addDays(inicio, dias)) : `Día ${dias + 1}`} · ${importe}${unidad}`,
      texto: 'Solo si sigues. Cancela antes y no pagas.',
    },
  ];
  return (
    <ol className="flex flex-col">
      {pasos.map((p, i) => {
        return (
          <li key={p.cuando} className="relative flex gap-4 pb-4 last:pb-0">
            {i < pasos.length - 1 && <span aria-hidden="true" className="absolute left-5 top-11 bottom-1 w-0.5 bg-[var(--border-ui)]" />}
            <span className="relative inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--chip-bg)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.imagen} alt="" width={20} height={20} className="object-contain" />
            </span>
            <span>
              <span className="block text-base font-semibold">{p.cuando}</span>
              <span className="block text-sm text-[var(--text-secondary)]">{p.texto}</span>
            </span>
          </li>
        );
      })}
    </ol>
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
  // Si ya habías elegido plan/periodo en una visita anterior, lo recordamos (heurística de
  // reconocimiento: no hacer que alguien que ya decidió vuelva a decidir de cero).
  const [elegido, setElegido] = useState<IdPlan | null>(null);
  const [periodo, setPeriodo] = useState<PeriodoPago>('anio');
  // Carga lo guardado DESPUÉS de montar (nunca en el render inicial, que debe coincidir con el
  // del servidor) para no pelear con la elección real del usuario. Los refs evitan que el efecto
  // de guardado reescriba encima en el primer disparo, antes de que termine de cargar.
  const planMontado = useRef(false);
  const periodoMontado = useRef(false);
  useEffect(() => {
    try {
      const planGuardado = window.localStorage.getItem('ldp-paywall-plan');
      if (planGuardado === 'esencial' || planGuardado === 'familia') setElegido(planGuardado);
      const periodoGuardado = window.localStorage.getItem('ldp-paywall-periodo');
      if (periodoGuardado === 'mes') setPeriodo('mes');
    } catch {}
  }, []);
  useEffect(() => {
    if (!planMontado.current) {
      planMontado.current = true;
      return;
    }
    if (!elegido) return;
    try {
      window.localStorage.setItem('ldp-paywall-plan', elegido);
    } catch {}
  }, [elegido]);
  useEffect(() => {
    if (!periodoMontado.current) {
      periodoMontado.current = true;
      return;
    }
    try {
      window.localStorage.setItem('ldp-paywall-periodo', periodo);
    } catch {}
  }, [periodo]);
  const plan: IdPlan = elegido ?? recomendado;
  const P = PLANES[plan];
  const nombre = r.nombre.trim();
  const n = contarRespuestas(r);
  const importe = periodo === 'anio' ? P.anualTotal : P.mensual;
  const unidad = periodo === 'anio' ? '/año' : '/mes';
  const [correo, setCorreo] = useState<string | null>(null);
  // El correo se pide DESPUÉS de decidir («Empezar mis 7 días gratis»), nunca antes: primero elige
  // plan y decide, recién ahí se le pregunta el correo para activar el acceso.
  const [decidido, setDecidido] = useState(false);
  const [intento, setIntento] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [aceptaLegal, setAceptaLegal] = useState(false);
  const [yendoAlPago, setYendoAlPago] = useState(false);
  const campoCorreo = useRef<HTMLInputElement>(null);
  const correoActual = correo ?? r.correo;
  const correoOk = correoValido(correoActual);
  const decidir = () => {
    setDecidido(true);
    // El campo aparece recién ahora: le damos un instante a React para montarlo antes de enfocarlo.
    setTimeout(() => {
      campoCorreo.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      campoCorreo.current?.focus();
    }, 80);
  };
  const empezar = () => {
    setGuardado(false);
    if (!correoOk) {
      // El botón nunca queda «muerto»: dice qué falta y lleva al campo.
      setIntento(true);
      campoCorreo.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      campoCorreo.current?.focus();
      return;
    }
    if (!aceptaLegal) {
      setIntento(true);
      return;
    }
    actualizar({ correo: correoActual.trim() });
    const destino = urlCheckout(plan, periodo, correoActual);
    if (destino) {
      track('checkout_click', { plan, periodo });
      setYendoAlPago(true);
      window.location.assign(destino);
    } else {
      setGuardado(true);
    }
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
    <div
      className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pt-4 text-[var(--text-primary)] [font-family:var(--font-body)]"
      style={{
        backgroundImage:
          'radial-gradient(720px 480px at 50% -10%, color-mix(in oklab, var(--accent) 18%, transparent) 0%, transparent 60%), ' +
          'radial-gradient(560px 380px at 100% 15%, color-mix(in oklab, var(--accent-2) 14%, transparent) 0%, transparent 55%)',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="flex items-center gap-2">
        <Link href="/onboarding" className="inline-flex size-11 items-center justify-center rounded-full text-[var(--text-secondary)]" aria-label="Volver">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/accion-volver.png" alt="" width={22} height={22} className="object-contain" />
        </Link>
        <Marca />
      </div>

      <main className="flex flex-1 flex-col pt-4">
        <h1 className="text-balance text-3xl font-bold leading-tight">
          El cuidado de {nombre || 'tu perro'} ya está <span className="text-[var(--accent)]">bajo control</span>
        </h1>
        <p className="mt-2 text-lg text-[var(--text-secondary)]">
          Se acabó el <span className="font-semibold text-[var(--text-primary)]">&ldquo;¿ya le di el medicamento, o no?&rdquo;</span>
        </p>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Armado con tus <ContadorAnimado n={n} /> respuestas sobre {nombre || 'tu perro'}.
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

        <section aria-label="Elige tu plan" className="mt-8 flex flex-col gap-3 rounded-[var(--radius-card)] bg-[var(--elevated)] p-4">
          <h2 className="text-lg font-bold">¿Cuántos perros cuidas?</h2>
          <Selector<IdPlan>
            etiqueta="Plan según cuántos perros tienes"
            activo={plan}
            onChange={setElegido}
            opciones={[
              { id: 'esencial', texto: '1-2 perros', detalle: 'Esencial' },
              { id: 'familia', texto: '3-5 perros', detalle: 'Familia' },
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

        {decidido && (
          <motion.section
            aria-label="Tu correo de acceso"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8"
          >
            <p className="text-sm font-semibold text-[var(--accent)]">Último paso</p>
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

            <label className="mt-4 flex items-start gap-3">
              <input
                type="checkbox"
                checked={aceptaLegal}
                onChange={(e) => {
                  setAceptaLegal(e.target.checked);
                  setIntento(false);
                }}
                aria-invalid={intento && !aceptaLegal}
                className="mt-0.5 size-5 shrink-0 accent-[var(--accent)]"
              />
              <span className={`text-sm ${intento && !aceptaLegal ? 'font-semibold text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                Autorizo el tratamiento de mis datos personales según la{' '}
                <Link href="/privacidad" className="underline underline-offset-4">
                  Política de privacidad
                </Link>{' '}
                y acepto los{' '}
                <Link href="/terminos" className="underline underline-offset-4">
                  Términos
                </Link>
                .
              </span>
            </label>
            {intento && !aceptaLegal && <p role="alert" className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Marca la casilla para continuar.</p>}
          </motion.section>
        )}

        <section aria-label="Cómo funciona tu prueba y tu tranquilidad" className="borde-degradado mt-6 flex flex-col gap-4 rounded-[var(--radius-card)] p-4 shadow-[var(--shadow-1)]">
          {hayPrueba() && (
            <>
              <h2 className="text-lg font-bold">Cómo funciona tu prueba</h2>
              <LineaTiempo importe={importe} unidad={unidad} />
              <div aria-hidden="true" className="h-px bg-[var(--border-ui)]" />
            </>
          )}
          <h2 className="text-lg font-bold">Tu tranquilidad</h2>
          {hayGarantia() && (
            <div className="flex items-center gap-4">
              <span className="relative inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--chip-bg)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/garantia.png" alt="" width={20} height={20} className="object-contain" />
              </span>
              <p className="text-base">
                <strong className="font-semibold">
                  {hayPrueba() ? `${CONDICIONES.prueba.dias} días gratis + ` : ''}
                  {CONDICIONES.garantia.dias} días de garantía
                </strong>
                <span className="block text-sm text-[var(--text-secondary)]">Sobre tu primer pago, sin preguntas.</span>
              </p>
            </div>
          )}
          <div className="flex items-center gap-4">
            <span className="relative inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--chip-bg)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/candado.png" alt="" width={18} height={18} className="object-contain" />
            </span>
            <p className="text-base">
              <span className="font-medium">Pago seguro por Hotmart</span>
              <span className="block text-sm text-[var(--text-secondary)]">Tarjeta de crédito o débito</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="relative inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--chip-bg)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/accion-descargar.png" alt="" width={18} height={18} className="object-contain" />
            </span>
            <p className="text-base">
              <span className="font-medium">Tus datos nunca se borran</span>
              <span className="block text-sm text-[var(--text-secondary)]">Aunque canceles, los descargas cuando quieras</span>
            </p>
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
        <button type="button" onClick={decidido ? empezar : decidir} disabled={yendoAlPago} className={boton}>
          {yendoAlPago ? (
            <span className="inline-flex items-center gap-2">
              <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-[var(--bg)] border-t-transparent" />
              Te llevamos al pago…
            </span>
          ) : decidido ? (
            'Continuar al pago'
          ) : (
            etiquetaBoton
          )}
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
