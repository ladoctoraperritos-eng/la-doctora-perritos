'use client';

// Selector de plan por número de perros: la pregunta natural del cliente ("¿cuántos perros tienes?")
// decide el plan. Debajo, la sección Oferta muestra anual y mensual del plan elegido.

export interface OpcionPlan {
  id: string;
  /** Lo que el cliente reconoce: "1 o 2 perros". */
  etiqueta: string;
  /** Nombre del plan: "Esencial". */
  nombre: string;
}

export function PlanSelector({
  titulo,
  opciones,
  activo,
  onChange,
}: {
  titulo: string;
  opciones: OpcionPlan[];
  activo: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="mx-auto w-full max-w-md px-6 pt-16 text-center md:pt-24">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">Tu plan</p>
      <h2 className="text-balance text-3xl font-bold leading-tight text-[var(--text-primary)] [font-family:var(--font-display)]">
        {titulo}
      </h2>
      <div
        role="group"
        aria-label={titulo}
        className="mt-6 grid grid-cols-2 gap-2 rounded-[var(--radius-card)] bg-[var(--surface-2)] p-2"
      >
        {opciones.map((o) => {
          const seleccionado = o.id === activo;
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={seleccionado}
              onClick={() => onChange(o.id)}
              className={`min-h-14 rounded-[var(--radius-button)] px-3 py-2 text-base font-semibold transition-colors [touch-action:manipulation] ${
                seleccionado
                  ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-[var(--shadow-1)] outline outline-2 outline-[var(--accent)]'
                  : 'text-[var(--text-secondary)]'
              }`}
            >
              <span className="block">{o.etiqueta}</span>
              <span className={`block text-sm font-medium ${seleccionado ? 'text-[var(--accent)]' : ''}`}>
                Plan {o.nombre}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
