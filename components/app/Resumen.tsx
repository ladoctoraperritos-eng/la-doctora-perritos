'use client';

// «Resumen para el veterinario»: una hoja de una página con los datos del perro, su tratamiento actual, cuánto se ha
// cumplido en los últimos 14 días y sus fechas de salud. Se imprime o se guarda como PDF; lo que no sirve en papel se oculta.
// SPEC (PREFLIGHT): objeto_principal = la hoja (documento, no pantalla de app) · niveles 2xl/lg/base/sm ·
// acento_en = títulos de sección · estados: cargando, perro no encontrado, sin tratamiento · sin menú (es un documento).

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Download } from 'lucide-react';
import { diasHasta, edadTexto, obtenerApp, suscribirApp, type Cuidado, type EstadoApp, type Perro, type Tipo } from '@/lib/app';
import { NOMBRE_INTENSIDAD, TONO_INTENSIDAD } from './Bitacora';
import { tono } from './Hoy';

const TIPOS_TRATAMIENTO: Tipo[] = ['medicamento'];
const TIPOS_SUPLEMENTO: Tipo[] = ['suplemento', 'comida'];
const TIPOS_SALUD: Tipo[] = ['vacuna', 'antiparasitario', 'bano', 'control'];
const NOMBRE_TIPO: Record<Tipo, string> = { medicamento: 'Medicamento', suplemento: 'Suplemento', comida: 'Alimento', vacuna: 'Vacuna', antiparasitario: 'Antiparasitario', bano: 'Baño', control: 'Control' };
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

const fechaLarga = (d: Date) => `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
const fechaClave = (clave: string) => {
  const [a, m, d] = clave.split('-').map(Number);
  return `${d} de ${MESES[m - 1]} de ${a}`;
};

function Seccion({ titulo, accion, children }: { titulo: string; accion?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section aria-label={titulo} className="break-inside-avoid">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[var(--accent)] pb-1">
        <h2 className="text-lg font-semibold text-[var(--accent)]">{titulo}</h2>
        {accion}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor?: string | number | null }) {
  if (valor === undefined || valor === null || valor === '') return null;
  return (
    <div className="flex flex-col sm:flex-row sm:gap-2">
      <dt className="text-sm text-[var(--text-secondary)]">{etiqueta}</dt>
      <dd className="text-base font-semibold">{valor}</dd>
    </div>
  );
}

/** Cuántos de los últimos 14 días tiene al menos una marca (para los cuidados diarios). */
function cumplimiento(e: EstadoApp, c: Cuidado, ahora: Date): string {
  const dias = new Set(e.registros.filter((r) => r.cuidadoId === c.id && diasHasta(r.dia, ahora) > -14).map((r) => r.dia));
  return e.registros.some((r) => r.cuidadoId === c.id) ? `${dias.size} de 14 días` : 'Sin registros';
}

function frecuencia(c: Cuidado): string {
  if (c.hora) return `Todos los días · ${c.hora}`;
  if (c.proxima) {
    const d = diasHasta(c.proxima, new Date());
    return d >= 0 ? `Queda para ~${d} días` : 'Se acabó';
  }
  return '—';
}

/** Cada cuidado en un bloque (nombre y sus datos debajo): se lee bien en el celular y en papel. */
function Tabla({ filas, columnas }: { filas: string[][]; columnas: string[] }) {
  return (
    <ul className="flex flex-col">
      {filas.map((f, i) => (
        <li key={i} className="break-inside-avoid border-b border-[color-mix(in_oklab,var(--border-ui)_40%,transparent)] py-3 first:pt-0 last:border-b-0">
          <p className="text-base font-semibold">{f[0]}</p>
          <dl className="mt-1 grid gap-x-4 gap-y-1 sm:grid-cols-2">
            {f.slice(1).map((celda, j) => (
              <div key={j} className="flex gap-2 text-base">
                <dt className="shrink-0 text-sm text-[var(--text-secondary)]">{columnas[j + 1]}:</dt>
                <dd>{celda}</dd>
              </div>
            ))}
          </dl>
        </li>
      ))}
    </ul>
  );
}

export default function Resumen() {
  const e = useSyncExternalStore(suscribirApp, obtenerApp, () => null);
  const parametros = useSearchParams();
  const id = parametros.get('perro');
  const [rango, setRango] = useState(30);

  if (!e) {
    return (
      <div className="mx-auto min-h-dvh w-full max-w-md px-6 pt-6" aria-busy="true" aria-label="Preparando el resumen">
        <div className="h-8 w-56 rounded-[var(--radius-button)] bg-[var(--surface-2)] motion-safe:animate-pulse" />
        <div className="mt-4 h-40 rounded-[var(--radius-card)] bg-[var(--surface-2)] motion-safe:animate-pulse" />
      </div>
    );
  }

  const perro: Perro | undefined = e.perros.find((p) => p.id === id) ?? (e.perros.length === 1 ? e.perros[0] : undefined);
  if (!perro) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-4 px-6 pt-6 text-[var(--text-primary)] [font-family:var(--font-body)]">
        <h1 className="text-2xl font-semibold leading-tight tracking-[-0.01em]">No encontramos a ese perro</h1>
        <p className="text-base text-[var(--text-secondary)]">Abre el resumen desde la ficha de tu perro.</p>
        <Link href="/app/perros" className="inline-flex h-14 items-center justify-center rounded-[var(--radius-button)] bg-[image:var(--accent-gradient)] text-lg font-semibold text-[var(--bg)]">
          Ir a Perros
        </Link>
      </div>
    );
  }

  const ahora = new Date();
  const suyos = e.cuidados.filter((c) => c.perroId === perro.id);
  const tratamiento = suyos.filter((c) => TIPOS_TRATAMIENTO.includes(c.tipo) && c.hora);
  const suplementos = suyos.filter((c) => TIPOS_SUPLEMENTO.includes(c.tipo));
  const salud = suyos.filter((c) => TIPOS_SALUD.includes(c.tipo)).sort((a, b) => (a.proxima ?? '9999').localeCompare(b.proxima ?? '9999'));
  const edad = edadTexto(perro.nacimiento, ahora);
  const bitacora = e.notas
    .filter((n) => n.perroId === perro.id && (rango === 0 || diasHasta(n.dia, ahora) > -rango))
    .sort((a, b) => `${b.dia} ${b.hora}`.localeCompare(`${a.dia} ${a.hora}`));
  const totalBitacora = e.notas.filter((n) => n.perroId === perro.id).length;

  return (
    <div className="mx-auto w-full max-w-md px-6 pb-12 pt-4 text-[var(--text-primary)] [font-family:var(--font-body)] print:max-w-none print:px-0">
      <div className="mb-4 flex items-center justify-between gap-2 print:hidden">
        <Link href="/app/perros" className="-ml-3 inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-button)] px-3 text-base font-semibold text-[var(--text-secondary)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/accion-volver.png" alt="" width={20} height={20} className="object-contain" />
          Volver
        </Link>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center text-base font-semibold text-[var(--text-secondary)] underline underline-offset-4 [touch-action:manipulation]">
            Imprimir
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-button)] bg-[image:var(--accent-gradient)] px-4 text-base font-semibold text-[var(--bg)] [touch-action:manipulation]"
          >
            <Download size={18} aria-hidden="true" />
            Descargar PDF
          </button>
        </div>
      </div>

      <article className="flex flex-col gap-6 rounded-[var(--radius-card)] border border-[var(--border-suave)] bg-[var(--surface)] p-6 print:rounded-none print:border-0 print:p-0">
        <header>
          <p className="text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">Resumen para el veterinario</p>
          <h1 className="mt-1 text-3xl font-normal leading-tight tracking-[-0.01em] [font-family:var(--font-serif)]">{perro.nombre}</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Generado el {fechaLarga(ahora)} con La Doctora Perritos</p>
        </header>

        <Seccion titulo="Paciente">
          <dl className="grid gap-2">
            <Dato etiqueta="Raza" valor={perro.raza} />
            <Dato etiqueta="Edad" valor={edad} />
            <Dato etiqueta="Nacimiento" valor={perro.nacimiento ? fechaClave(perro.nacimiento) : null} />
            <Dato etiqueta="Peso" valor={perro.pesoKg !== undefined ? `${perro.pesoKg} kg` : null} />
            <Dato etiqueta="Microchip" valor={perro.chip?.replace(/(\d{3})(?=\d)/g, '$1 ')} />
          </dl>
        </Seccion>

        {(perro.responsable || perro.telefono) && (
          <Seccion titulo="Responsable">
            <dl className="grid gap-2">
              <Dato etiqueta="Nombre" valor={perro.responsable} />
              <Dato etiqueta="Teléfono" valor={perro.telefono} />
            </dl>
          </Seccion>
        )}

        {perro.notas && (
          <Seccion titulo="Datos importantes">
            <p className="text-base">{perro.notas}</p>
          </Seccion>
        )}

        <Seccion titulo="Tratamiento actual">
          {tratamiento.length > 0 ? (
            <Tabla columnas={['Medicamento', 'Dosis', 'Horario', 'Últimos 14 días']} filas={tratamiento.map((c) => [c.nombre, c.detalle || '—', c.hora ? `Todos los días · ${c.hora}` : '—', cumplimiento(e, c, ahora)])} />
          ) : (
            <p className="text-base text-[var(--text-secondary)]">Sin medicamentos registrados.</p>
          )}
        </Seccion>

        <Seccion titulo="Suplementos y alimentación">
          {suplementos.length > 0 ? (
            <Tabla columnas={['Nombre', 'Detalle', 'Horario o stock', 'Últimos 14 días']} filas={suplementos.map((c) => [`${c.nombre} (${NOMBRE_TIPO[c.tipo].toLowerCase()})`, c.detalle || '—', frecuencia(c), c.hora ? cumplimiento(e, c, ahora) : '—'])} />
          ) : (
            <p className="text-base text-[var(--text-secondary)]">Sin registros.</p>
          )}
        </Seccion>

        <Seccion titulo="Vacunas, antiparasitarios y controles">
          {salud.length > 0 ? (
            <Tabla
              columnas={['Cuidado', 'Última vez', 'Próxima']}
              filas={salud.map((c) => [c.nombre, c.ultima ? fechaClave(c.ultima) : 'Sin registro', c.proxima ? `${fechaClave(c.proxima)}${diasHasta(c.proxima, ahora) < 0 ? ' (vencida)' : ''}` : '—'])}
            />
          ) : (
            <p className="text-base text-[var(--text-secondary)]">Sin registros.</p>
          )}
        </Seccion>

        <Seccion
          titulo={`Bitácora: ${rango === 0 ? 'todo' : `últimos ${rango} días`}`}
          accion={
            totalBitacora > 0 ? (
              <div role="radiogroup" aria-label="Rango de la bitácora" className="flex gap-1 print:hidden">
                {[7, 15, 30, 0].map((d) => {
                  const on = rango === d;
                  return (
                    <button
                      key={d}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setRango(d)}
                      className={`inline-flex min-h-9 items-center rounded-full border px-3 text-sm font-semibold [touch-action:manipulation] ${on ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--bg)]' : 'border-[var(--border-ui)] bg-[var(--surface)]'}`}
                    >
                      {d === 0 ? 'Todo' : `${d} días`}
                    </button>
                  );
                })}
              </div>
            ) : undefined
          }
        >
          {totalBitacora > 0 && (
            <p className="mb-3 text-sm text-[var(--text-secondary)] print:hidden">
              Tu bitácora completa sigue guardada en la ficha del perro. Esto solo elige cuánto se imprime aquí.
            </p>
          )}
          {bitacora.length > 0 ? (
            <ul className="flex flex-col">
              {bitacora.map((n) => (
                <li key={n.id} className="break-inside-avoid border-b border-[color-mix(in_oklab,var(--border-ui)_40%,transparent)] py-3 first:pt-0 last:border-b-0">
                  <p className="flex flex-wrap items-center gap-2 text-base font-semibold">
                    {fechaClave(n.dia)} · {n.hora}
                    <span className="text-sm font-normal text-[var(--text-secondary)]">{n.tipo === 'sintoma' ? 'Síntoma' : 'Nota'} · {n.quien}</span>
                    {n.intensidad && <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-sm font-semibold ${tono[TONO_INTENSIDAD[n.intensidad]]}`}>{NOMBRE_INTENSIDAD[n.intensidad]}</span>}
                  </p>
                  <p className="mt-1 text-base">{n.texto}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-base text-[var(--text-secondary)]">Sin anotaciones en los últimos 30 días.</p>
          )}
        </Seccion>

        <footer className="border-t border-[var(--border-ui)] pt-3 text-sm text-[var(--text-secondary)]">
          Resumen informativo elaborado por el tutor a partir de sus propios registros. No es un documento clínico ni reemplaza la historia del veterinario.
        </footer>
      </article>
    </div>
  );
}
