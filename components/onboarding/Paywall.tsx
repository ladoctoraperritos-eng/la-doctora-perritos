'use client';

// Paywall: llega DESPUÉS del primer valor. Muestra el costo hundido (lo que ya armó con sus respuestas),
// el plan que corresponde a su cantidad de perros, y el resumen de cobro con fechas reales.
// El botón (fijo abajo) lleva al checkout de Hotmart de ese plan y periodo (lib/hotmart.ts).

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, ShieldCheck } from 'lucide-react';
import { CONDICIONES, hayGarantia, hayPrueba } from '@/lib/oferta';
import { urlCheckout, type PeriodoPago } from '@/lib/hotmart';
import { armarPanel, contarRespuestas, obtener, planRecomendado, suscribir, VACIAS, type IdPlan } from '@/lib/onboarding';
import { featuresPlan, PLANES } from '@/lib/planes';
import { ResumenCobro } from '@/components/landing/ResumenCobro';
import Marca from './Marca';

const boton =
  'inline-flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-lg font-semibold text-[var(--bg)] shadow-[var(--shadow-2)] transition-colors active:scale-[0.98] disabled:bg-[var(--surface-2)] disabled:text-[var(--text-secondary)] disabled:shadow-none [touch-action:manipulation]';

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
  const checkout = urlCheckout(plan, periodo);
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

  const panel = armarPanel(r);
  const comparte = r.cuidadores !== null && r.cuidadores !== 'solo_yo';
  const armado = [
    ...panel.hoy.map((i) => `${i.titulo} a las ${i.etiqueta}, con aviso`),
    ...panel.proximo.map((i) => `${i.titulo}: ${i.etiqueta.toLowerCase()}`),
    comparte ? 'Cuidado compartido: quién hizo qué' : null,
    ...panel.siempre.map((i) => i.titulo),
  ]
    .filter((x): x is string => x !== null)
    .slice(0, 5);
  // El mensaje sigue lo que más le pesa a esta persona (lo que dijo en el onboarding).
  const promesa = r.olvidos.includes('medicamentos') ? (
    <>Mantén los medicamentos de {nombre || 'tu perro'} <strong className="font-semibold text-[var(--text-primary)]">bajo control</strong>.</>
  ) : comparte ? (
    <>Que todos sepan <strong className="font-semibold text-[var(--text-primary)]">qué ya se hizo</strong> y qué falta.</>
  ) : (
    <>Para que su cuidado <strong className="font-semibold text-[var(--text-primary)]">no dependa de tu memoria</strong>.</>
  );

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pt-4 text-[var(--text-primary)] [font-family:var(--font-body)]">
      <div className="flex items-center gap-2">
        <Link href="/onboarding" className="inline-flex size-11 items-center justify-center rounded-full text-[var(--text-secondary)]" aria-label="Volver">
          <ArrowLeft size={22} aria-hidden="true" />
        </Link>
        <Marca />
      </div>

      <main className="flex flex-1 flex-col pt-4">
        <h1 className="text-balance text-3xl font-bold leading-tight">
          El Panel de Hoy de <span className="text-[var(--accent)]">{nombre || 'tu perro'}</span> está listo
        </h1>
        <p className="mt-2 text-lg text-[var(--text-secondary)]">{promesa}</p>
        <ul className="mt-4 flex flex-col gap-2" aria-label="Lo que ya armaste">
          {armado.map((a) => (
            <li key={a} className="flex items-center gap-3 text-base">
              <Check size={18} color="var(--accent)" aria-hidden="true" />
              {a}
            </li>
          ))}
          <li className="flex items-center gap-3 text-base text-[var(--text-secondary)]">
            <Check size={18} color="var(--accent)" aria-hidden="true" />
            Hecho con tus {n} respuestas
          </li>
        </ul>

        <div className="mt-6 flex flex-col gap-3">
          <p className="text-lg font-bold">¿Cuántos perros cuidas?</p>
          <Selector<IdPlan>
            etiqueta="Plan según cuántos perros tienes"
            activo={plan}
            onChange={setElegido}
            opciones={[
              { id: 'esencial', texto: '1 o 2 perros', detalle: 'Plan Esencial' },
              { id: 'familia', texto: '3 a 5 perros', detalle: 'Plan Familia' },
            ]}
          />
          <p className="mt-2 text-lg font-bold">¿Cómo prefieres pagar?</p>
          <Selector<PeriodoPago>
            etiqueta="Cada cuánto pagas"
            activo={periodo}
            onChange={setPeriodo}
            opciones={[
              { id: 'anio', texto: 'Anual', detalle: '2 meses gratis' },
              { id: 'mes', texto: 'Mensual' },
            ]}
          />
        </div>

        <section aria-label="Tu plan" className="mt-4 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--accent)_30%,transparent)] bg-[var(--surface)] p-6 shadow-[var(--shadow-2)]">
          <p className="text-base font-semibold text-[var(--text-secondary)]">
            Plan {P.nombre} · {P.etiqueta} · {periodo === 'anio' ? 'Anual' : 'Mensual'}
          </p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="text-4xl font-bold tabular-nums">{importe}</span>
            <span className="text-base text-[var(--text-secondary)]">{periodo === 'anio' ? 'al año' : 'al mes'}</span>
          </p>
          {periodo === 'anio' && (
            <p className="mt-1 text-base font-semibold">
              Equivale a {P.anualMes} al mes <span className="font-normal text-[var(--text-secondary)]">(mensual: {P.mensual})</span>
            </p>
          )}
          <ul className="mt-4 flex flex-col gap-2">
            {featuresPlan(P.perros).map((f) => (
              <li key={f} className="flex items-start gap-3 text-base">
                <Check size={18} color="var(--accent)" className="mt-1 shrink-0" aria-hidden="true" />
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <ResumenCobro
              periodo={periodo === 'anio' ? 'anio' : 'mes'}
              importe={importe}
              equivalente={periodo === 'anio' ? `${P.anualMes} al mes` : undefined}
            />
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
        <p className="text-center text-sm text-[var(--text-secondary)]">El pago lo procesa Hotmart. Cancela cuando quieras.</p>

        {!checkout && (
          <p role="status" className="mt-4 rounded-[var(--radius-button)] bg-[var(--surface-2)] p-3 text-center text-sm text-[var(--text-secondary)]">
            El pago se está conectando. Escríbenos a{' '}
            <a href={`mailto:${CONDICIONES.contacto}`} className="font-semibold text-[var(--accent)] underline underline-offset-4">
              {CONDICIONES.contacto}
            </a>
            .
          </p>
        )}
        {/* Espacio para que la barra fija no tape el final */}
        <div className="h-4" />
      </main>

      <div className="sticky bottom-0 -mx-6 flex flex-col gap-2 border-t border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)] bg-[var(--bg)] px-6 pb-4 pt-3">
        {hayGarantia() && (
          <p className="flex items-center justify-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
            <ShieldCheck size={18} color="var(--accent)" aria-hidden="true" />
            Garantía del Primer Aviso · {CONDICIONES.garantia.dias} días sobre tu primer pago
          </p>
        )}
        <ResumenCobro
          compacto
          periodo={periodo === 'anio' ? 'anio' : 'mes'}
          importe={importe}
        />
        {checkout ? (
          <a href={checkout} className={boton}>
            {etiquetaBoton}
          </a>
        ) : (
          <button type="button" disabled className={boton}>
            {etiquetaBoton}
          </button>
        )}
      </div>
    </div>
  );
}
