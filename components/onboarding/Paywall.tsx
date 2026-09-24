'use client';

// Paywall: llega DESPUÉS del primer valor. Muestra el costo hundido («hecho con tus N respuestas»),
// el plan que corresponde a su cantidad de perros, y el resumen de cobro con fechas reales.
// El botón lleva al checkout de Hotmart de ese plan y periodo (lib/hotmart.ts).

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';
import { CONDICIONES, hayPrueba } from '@/lib/oferta';
import { urlCheckout, type PeriodoPago } from '@/lib/hotmart';
import { contarRespuestas, obtener, planRecomendado, suscribir, VACIAS, type IdPlan } from '@/lib/onboarding';
import { featuresPlan, PLANES } from '@/lib/planes';
import { ResumenCobro } from '@/components/landing/ResumenCobro';

const boton =
  'inline-flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-lg font-semibold text-[var(--bg)] shadow-[var(--shadow-2)] [touch-action:manipulation]';

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
            className={`min-h-14 rounded-[var(--radius-button)] px-3 py-2 text-base font-semibold [touch-action:manipulation] ${
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
  const nombre = r.nombre.trim() || 'tu perro';
  const n = contarRespuestas(r);
  const importe = periodo === 'anio' ? P.anualTotal : P.mensual;
  const checkout = urlCheckout(plan, periodo);
  const etiquetaBoton = hayPrueba() ? `Empezar mis ${CONDICIONES.prueba.dias} días gratis` : 'Empezar ahora';

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-8 pt-4 text-[var(--text-primary)] [font-family:var(--font-body)]">
      <Link href="/onboarding" className="inline-flex size-11 items-center justify-center rounded-full text-[var(--text-secondary)]" aria-label="Volver">
        <ArrowLeft size={22} aria-hidden="true" />
      </Link>

      <main className="flex flex-1 flex-col pt-4">
        <h1 className="text-balance text-3xl font-bold leading-tight">
          El Panel de Hoy de <span className="text-[var(--accent)]">{nombre}</span> está listo
        </h1>
        {n > 0 && (
          <p className="mt-2 flex items-center gap-2 text-base text-[var(--text-secondary)]">
            <Check size={18} color="var(--accent)" aria-hidden="true" />
            Hecho con tus {n} respuestas
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <Selector<IdPlan>
            etiqueta="Plan según cuántos perros tienes"
            activo={plan}
            onChange={setElegido}
            opciones={[
              { id: 'esencial', texto: '1 o 2 perros', detalle: 'Plan Esencial' },
              { id: 'familia', texto: '3 a 5 perros', detalle: 'Plan Familia' },
            ]}
          />
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

        <section aria-label="Tu plan" className="mt-6 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--accent)_30%,transparent)] bg-[var(--surface)] p-6 shadow-[var(--shadow-2)]">
          <p className="text-base font-semibold text-[var(--text-secondary)]">
            Plan {P.nombre} · {periodo === 'anio' ? 'Anual' : 'Mensual'}
          </p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="text-4xl font-bold tabular-nums">{importe}</span>
            <span className="text-base text-[var(--text-secondary)]">{periodo === 'anio' ? 'al año' : 'al mes'}</span>
          </p>
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

        <div className="mt-auto flex flex-col gap-3 pt-8">
          {checkout ? (
            <a href={checkout} className={boton}>
              {etiquetaBoton}
            </a>
          ) : (
            <>
              <button type="button" disabled className={`${boton} opacity-40`}>
                {etiquetaBoton}
              </button>
              <p role="status" className="text-center text-sm text-[var(--text-secondary)]">
                El pago se está conectando. Vuelve en unos días o escríbenos a {CONDICIONES.contacto}.
              </p>
            </>
          )}
          <p className="text-center text-sm text-[var(--text-secondary)]">El pago lo procesa Hotmart.</p>
          <div className="flex items-center justify-center gap-4 text-base">
            <Link href="/" className="inline-flex min-h-11 items-center font-medium text-[var(--text-secondary)]">
              Ahora no
            </Link>
            <Link href="/login" className="inline-flex min-h-11 items-center font-medium text-[var(--accent)]">
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
