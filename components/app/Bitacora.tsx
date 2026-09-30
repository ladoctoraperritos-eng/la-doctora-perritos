'use client';

// Bitácora del perro: síntomas y notas con fecha e intensidad. Sirve de seguimiento durante un tratamiento y se
// incluye en el resumen para el veterinario. Formulario (hoja) + fila de la lista.

import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';

// Ilustraciones propias del usuario (2026-09-29): reemplazan los íconos de línea de síntoma/nota.
export const IMAGEN_NOTA: Record<Nota['tipo'], string> = {
  sintoma: '/brand/bitacora-sintoma.png',
  nota: '/brand/bitacora-nota.png',
};
import { Borrar, botonPrimario, Campo, campo } from './Perros';
import { entrada, tono } from './Hoy';
import { claveDia, diasHasta, eliminarNota, guardarNota, horaTexto, nuevoId, type Intensidad, type Nota } from '@/lib/app';

export const NOMBRE_INTENSIDAD: Record<Intensidad, string> = { leve: 'Leve', moderado: 'Moderado', fuerte: 'Fuerte' };
export const TONO_INTENSIDAD: Record<Intensidad, keyof typeof tono> = { leve: 'normal', moderado: 'pronto', fuerte: 'atrasado' };
const COMUNES = ['Vómito', 'Diarrea', 'Picazón', 'Cojera', 'Sin apetito', 'Decaído', 'Tos'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];

export function diaCorto(clave: string, ahora: Date): string {
  const d = diasHasta(clave, ahora);
  if (d === 0) return 'Hoy';
  if (d === -1) return 'Ayer';
  const [, m, n] = clave.split('-').map(Number);
  return `${n} ${MESES[m - 1]}`;
}

export function FormNota({ perroId, nota, quien, onListo }: { perroId: string; nota?: Nota; quien: string; onListo: () => void }) {
  const ahora = new Date();
  const [tipo, setTipo] = useState<Nota['tipo']>(nota?.tipo ?? 'sintoma');
  const [texto, setTexto] = useState(nota?.texto ?? '');
  const [intensidad, setIntensidad] = useState<Intensidad>(nota?.intensidad ?? 'leve');
  const [dia, setDia] = useState(nota?.dia ?? claveDia(ahora));
  const [hora, setHora] = useState(nota?.hora ?? horaTexto(ahora));
  const [errores, setErrores] = useState<Record<string, string>>({});
  const areaTexto = useRef<HTMLTextAreaElement>(null);

  const guardar = () => {
    const e: Record<string, string> = {};
    if (texto.trim().length < 3) e.texto = tipo === 'sintoma' ? 'Cuenta qué notaste, por ejemplo «Vomitó una vez».' : 'Escribe tu nota.';
    if (!dia) e.dia = 'Elige el día.';
    setErrores(e);
    if (Object.keys(e).length) return;
    guardarNota({
      id: nota?.id ?? nuevoId('n'),
      perroId,
      dia,
      hora: hora || horaTexto(ahora),
      tipo,
      texto: texto.trim(),
      intensidad: tipo === 'sintoma' ? intensidad : undefined,
      quien: nota?.quien ?? quien,
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
      <div role="radiogroup" aria-label="Tipo de anotación" className="mt-3 flex gap-2">
        {([
          ['sintoma', 'Síntoma'],
          ['nota', 'Nota'],
        ] as const).map(([v, t]) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={tipo === v}
            onClick={() => setTipo(v)}
            className={`inline-flex min-h-11 items-center rounded-full border-2 px-4 text-base font-semibold [touch-action:manipulation] ${tipo === v ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--bg)]' : 'border-[var(--border-ui)] bg-[var(--surface)]'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tipo === 'sintoma' && !nota && (
        <div className="mt-4">
          <p className="text-sm text-[var(--text-secondary)]">Toca uno para empezar:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {COMUNES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setTexto((t) => (t.trim() ? t : `${c}. `));
                  setErrores((x) => ({ ...x, texto: '' }));
                }}
                className="inline-flex min-h-11 items-center rounded-full border border-[var(--border-ui)] bg-[var(--surface)] px-4 text-base [touch-action:manipulation]"
              >
                {c}
              </button>
            ))}
            <button
              type="button"
              onClick={() => areaTexto.current?.focus()}
              className="inline-flex min-h-11 items-center rounded-full border border-dashed border-[var(--border-ui)] bg-[var(--surface)] px-4 text-base text-[var(--text-secondary)] [touch-action:manipulation]"
            >
              Otro
            </button>
          </div>
        </div>
      )}

      <Campo id="texto-nota" etiqueta={tipo === 'sintoma' ? '¿Qué notaste?' : 'Tu nota'} error={errores.texto}>
        <textarea
          ref={areaTexto}
          id="texto-nota"
          value={texto}
          maxLength={400}
          rows={4}
          onChange={(e) => {
            setTexto(e.target.value);
            setErrores((x) => ({ ...x, texto: '' }));
          }}
          placeholder={tipo === 'sintoma' ? 'Cuándo empezó, cuántas veces, qué hacía antes…' : 'Cambios, dudas para el veterinario, cómo respondió al tratamiento…'}
          className={`${campo} h-auto py-3`}
        />
      </Campo>

      {tipo === 'sintoma' && (
        <div className="mt-5">
          <p className="text-base font-semibold">¿Qué tan fuerte fue?</p>
          <div role="radiogroup" aria-label="Intensidad" className="mt-2 flex gap-2">
            {(['leve', 'moderado', 'fuerte'] as const).map((i) => (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={intensidad === i}
                onClick={() => setIntensidad(i)}
                className={`inline-flex min-h-11 items-center rounded-full border-2 px-4 text-base font-semibold [touch-action:manipulation] ${intensidad === i ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--bg)]' : 'border-[var(--border-ui)] bg-[var(--surface)]'}`}
              >
                {NOMBRE_INTENSIDAD[i]}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 grid grid-cols-5 gap-3">
        <div className="col-span-3">
        <Campo id="dia-nota" etiqueta="Día" error={errores.dia}>
          <input id="dia-nota" type="date" max={claveDia(ahora)} value={dia} onChange={(e) => setDia(e.target.value)} className={campo} />
        </Campo>
        </div>
        <div className="col-span-2">
        <Campo id="hora-nota" etiqueta="Hora">
          <input id="hora-nota" type="time" value={hora} onChange={(e) => setHora(e.target.value)} className={campo} />
        </Campo>
        </div>
      </div>

      <div className="mt-8">
        <button type="submit" className={botonPrimario}>
          {nota ? 'Guardar cambios' : 'Guardar en la bitácora'}
        </button>
      </div>
      {nota && (
        <Borrar
          etiqueta="Borrar esta anotación"
          aviso="Se borra de la bitácora y del resumen para el veterinario."
          onConfirmar={() => {
            eliminarNota(nota.id);
            onListo();
          }}
        />
      )}
    </form>
  );
}

export function FilaNota({ n, i, onAbrir }: { n: Nota; i: number; onAbrir: () => void }) {
  const ahora = new Date();
  const urgente = n.intensidad === 'fuerte' || n.intensidad === 'moderado';
  const bordeIzq = n.intensidad === 'fuerte' ? 'border-l-[var(--danger)]' : n.intensidad === 'moderado' ? 'border-l-[var(--warn)]' : 'border-l-[var(--border-ui)]';
  return (
    <motion.li {...entrada(i)}>
      <button
        type="button"
        onClick={onAbrir}
        aria-label={`Abrir ${n.tipo === 'sintoma' ? 'síntoma' : 'nota'} del ${diaCorto(n.dia, ahora)}`}
        className={`flex min-h-16 w-full items-start gap-4 rounded-[var(--radius-card)] border border-l-4 border-[var(--border-ui)] ${bordeIzq} bg-[var(--surface)] p-4 text-left ${urgente ? 'shadow-[var(--shadow-2)]' : 'shadow-[var(--shadow-1)]'} transition-transform duration-150 active:scale-[0.98] [touch-action:manipulation]`}
      >
        <span className="inline-flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-button)] bg-[var(--surface-2)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMAGEN_NOTA[n.tipo]} alt="" width={40} height={40} className="size-[80%] object-contain" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-[var(--text-secondary)]">
              {diaCorto(n.dia, ahora)} · {n.hora} · {n.quien}
            </span>
            {n.intensidad && <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-sm font-semibold ${tono[TONO_INTENSIDAD[n.intensidad]]}`}>{NOMBRE_INTENSIDAD[n.intensidad]}</span>}
          </span>
          <span className="mt-1 block text-base">{n.texto}</span>
        </span>
        <ChevronRight size={20} color="var(--text-secondary)" className="mt-1 shrink-0" aria-hidden="true" />
      </button>
    </motion.li>
  );
}
