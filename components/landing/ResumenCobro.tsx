'use client';

// Resumen de cobro junto al botón de cada plan: qué se paga hoy, cuándo es el primer cobro,
// cuánto y cada cuánto se renueva. La fecha sale del momento real en que la persona mira la
// página (se calcula en el navegador, nunca es una fecha fija); antes de eso se muestra sin fecha.

import { useSyncExternalStore } from 'react';
import { CONDICIONES, hayPrueba, resumenCobro, type Periodo } from '@/lib/oferta';

const suscribirse = (avisar: () => void) => {
  const id = setInterval(avisar, 60000);
  return () => clearInterval(id);
};
const minutoActual = () => Math.floor(Date.now() / 60000);

export function ResumenCobro({
  periodo,
  importe,
  equivalente,
  compacto = false,
}: {
  periodo: Periodo;
  importe: string;
  equivalente?: string;
  /** Una sola línea (para la barra del botón): qué pagas hoy y cuándo es el primer cobro. */
  compacto?: boolean;
}) {
  // Minuto actual en el navegador; en el servidor es null (así no hay desajuste de hidratación).
  const minuto = useSyncExternalStore(suscribirse, minutoActual, () => null);
  const inicio = minuto === null ? null : new Date(minuto * 60000);

  if (!inicio) {
    // Antes de hidratar: sin fecha, pero con el importe y la frecuencia ya correctos.
    if (compacto) return <p className="text-center text-sm text-[var(--text-secondary)]">{hayPrueba() ? 'Hoy pagas: US$0' : `Hoy pagas: ${importe}`}</p>;
    return (
      <div className="rounded-[var(--radius-button)] bg-[var(--surface-2)] p-4 text-sm text-[var(--text-secondary)]">
        <p className="text-base font-semibold text-[var(--text-primary)]">
          {hayPrueba() ? 'Hoy pagas: US$0' : `Hoy pagas: ${importe}`}
        </p>
        <p className="mt-1">
          {importe} {periodo === 'anio' ? 'cada año' : 'cada mes'}
          {hayPrueba() ? `, desde el día ${CONDICIONES.prueba.dias + 1}` : ''}
        </p>
      </div>
    );
  }

  const r = resumenCobro({ inicio, periodo, importe, equivalente });
  if (compacto) {
    const hoy = r.lineas[0];
    const siguiente = r.lineas[1];
    return (
      <p className="text-center text-sm text-[var(--text-secondary)]">
        <strong className="font-semibold text-[var(--text-primary)]">{hoy.etiqueta}: {hoy.valor}</strong> · {siguiente.etiqueta}: {siguiente.valor}
      </p>
    );
  }
  return (
    <div className="rounded-[var(--radius-button)] bg-[var(--surface-2)] p-4 text-sm text-[var(--text-secondary)]">
      <dl className="flex flex-col gap-1">
        {r.lineas.map((l) => (
          <div key={l.etiqueta} className="flex flex-col sm:flex-row sm:gap-2">
            <dt className={l.destacada ? 'text-base font-semibold text-[var(--text-primary)]' : 'font-semibold text-[var(--text-primary)]'}>
              {l.etiqueta}:
            </dt>
            <dd className={l.destacada ? 'text-base font-semibold text-[var(--text-primary)]' : ''}>{l.valor}</dd>
          </div>
        ))}
      </dl>
      {r.nota && <p className="mt-2">{r.nota}</p>}
      {r.garantia && <p className="mt-2">{r.garantia}</p>}
    </div>
  );
}
