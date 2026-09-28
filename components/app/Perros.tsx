'use client';

// Pestaña «Perros»: una misión — tener la ficha de cada perro al día. Lista de perros → ficha con
// «Salud» (vacunas, antiparasitarios, baños, controles) y «Botiquín» (medicamentos, suplementos, comida),
// todo con fechas y alertas, y lo que se agrega aquí aparece en «Hoy».
// SPEC (PREFLIGHT):
//   objeto_principal: la ficha del perro (foto, datos y sus fechas en orden de urgencia)
//   niveles: display 3xl (nombre) · title xl/lg (secciones) · body base · label sm
//   acento_en: fechas y estados, botón principal del formulario, pestaña activa
//   baseline: entrada escalonada · tap con escala · hoja con transición · estados vacío/carga/límite del plan
//   estados: cargando (esqueleto) · vacío por sección · límite de plan · error de validación · confirmación al borrar

import { useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { motion, MotionConfig } from 'motion/react';
import { AlertCircle, ArrowLeft, Camera, Check, ChevronRight, Copy, Cpu, FileText, Phone, Pencil, Plus, Trash2, User } from 'lucide-react';
import { Hoja } from './Hoja';
import { FilaNota, FormNota } from './Bitacora';
import { Avatar, ChipIcono, entrada, Menu, textoDias, tono } from './Hoy';
import {
  claveDia,
  diasHasta,
  edadTexto,
  eliminarCuidado,
  eliminarPerro,
  guardarCuidado,
  guardarPerro,
  hoy,
  LIMITE_PERROS,
  nuevoId,
  obtenerApp,
  quienSoy,
  registrarSalud,
  suscribirApp,
  type Cuidado,
  type EstadoApp,
  type Nota,
  type Perro,
  type Tipo,
} from '@/lib/app';
import { PLANES } from '@/lib/planes';

const TIPOS_SALUD: Tipo[] = ['vacuna', 'antiparasitario', 'bano', 'control'];
const TIPOS_BOTIQUIN: Tipo[] = ['medicamento', 'suplemento', 'comida'];
const NOMBRE_TIPO: Record<Tipo, string> = {
  medicamento: 'Medicamento',
  suplemento: 'Suplemento',
  comida: 'Alimento',
  vacuna: 'Vacuna',
  antiparasitario: 'Antiparasitario',
  bano: 'Baño',
  control: 'Control',
};
const REPETIR: { valor: number; texto: string }[] = [
  { valor: 0, texto: 'No se repite' },
  { valor: 30, texto: 'Cada mes' },
  { valor: 90, texto: 'Cada 3 meses' },
  { valor: 180, texto: 'Cada 6 meses' },
  { valor: 365, texto: 'Cada año' },
];

const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];
const fechaCorta = (clave: string) => {
  const [a, m, d] = clave.split('-').map(Number);
  return `${d} ${meses[m - 1]} ${a}`;
};
const sumarDias = (desde: Date, n: number) => {
  const d = new Date(desde);
  d.setDate(d.getDate() + n);
  return d;
};

export const campo =
  'mt-2 h-14 w-full rounded-[var(--radius-card)] border-2 border-[var(--border-ui)] bg-[var(--surface)] px-4 text-lg font-semibold outline-none placeholder:font-normal placeholder:text-[var(--text-secondary)] focus:border-[var(--accent)]';
export const botonPrimario =
  'inline-flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-lg font-semibold text-[var(--bg)] shadow-[var(--shadow-2)] transition-transform duration-150 active:scale-[0.97] [touch-action:manipulation]';
export const botonSecundario =
  'inline-flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] border-2 border-[var(--accent)] text-lg font-semibold text-[var(--accent)] transition-transform duration-150 active:scale-[0.97] [touch-action:manipulation]';

export function Campo({ id, etiqueta, opcional, error, children }: { id: string; etiqueta: string; opcional?: boolean; error?: string | null; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <label htmlFor={id} className="block text-base font-semibold">
        {etiqueta} {opcional && <span className="font-normal text-[var(--text-secondary)]">(opcional)</span>}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-2 flex items-center gap-2 text-base font-semibold">
          <AlertCircle size={18} color="var(--accent)" className="shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

/** Países de habla hispana (+ Brasil y EE. UU. por vecindad de audiencia), para no asumir el código del dispositivo. */
export const CODIGOS_PAIS: { codigo: string; pais: string }[] = [
  { codigo: '+56', pais: 'Chile' },
  { codigo: '+52', pais: 'México' },
  { codigo: '+57', pais: 'Colombia' },
  { codigo: '+54', pais: 'Argentina' },
  { codigo: '+51', pais: 'Perú' },
  { codigo: '+34', pais: 'España' },
  { codigo: '+58', pais: 'Venezuela' },
  { codigo: '+593', pais: 'Ecuador' },
  { codigo: '+502', pais: 'Guatemala' },
  { codigo: '+591', pais: 'Bolivia' },
  { codigo: '+1', pais: 'Rep. Dominicana / Puerto Rico / EE. UU.' },
  { codigo: '+503', pais: 'El Salvador' },
  { codigo: '+504', pais: 'Honduras' },
  { codigo: '+505', pais: 'Nicaragua' },
  { codigo: '+506', pais: 'Costa Rica' },
  { codigo: '+507', pais: 'Panamá' },
  { codigo: '+598', pais: 'Uruguay' },
  { codigo: '+595', pais: 'Paraguay' },
  { codigo: '+53', pais: 'Cuba' },
  { codigo: '+55', pais: 'Brasil' },
];

/** Separa «+52 55 1234 5678» en código y número; si no reconoce el código, usa Chile por defecto. */
function separarTelefono(valor: string): { codigo: string; numero: string } {
  const t = valor.trim();
  const porLargo = [...CODIGOS_PAIS].sort((a, b) => b.codigo.length - a.codigo.length);
  for (const { codigo } of porLargo) {
    if (t.startsWith(codigo)) return { codigo, numero: t.slice(codigo.length).trim() };
  }
  return { codigo: '+56', numero: t };
}

/** Teléfono con código de país explícito: nadie asume el país de quien escribe (se vende en toda Latinoamérica y España). */
export function CampoTelefono({ id, valor, onCambiar, error }: { id: string; valor: string; onCambiar: (v: string) => void; error?: string | null }) {
  const { codigo, numero } = separarTelefono(valor);
  return (
    <Campo id={id} etiqueta="Teléfono de contacto" opcional error={error}>
      <select
        id={`${id}-codigo`}
        aria-label="País"
        value={codigo}
        onChange={(e) => onCambiar(`${e.target.value} ${numero}`.trim())}
        className={`${campo} text-base`}
      >
        {CODIGOS_PAIS.map((c) => (
          <option key={c.codigo + c.pais} value={c.codigo}>
            {c.pais} ({c.codigo})
          </option>
        ))}
      </select>
      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="off"
        value={numero}
        maxLength={15}
        placeholder="9 1234 5678"
        onChange={(e) => onCambiar(`${codigo} ${e.target.value}`.trim())}
        className={`${campo}`}
      />
    </Campo>
  );
}

function Fichas<T extends string | number>({ titulo, opciones, valor, onElegir }: { titulo: string; opciones: { valor: T; texto: string }[]; valor: T | null; onElegir: (v: T) => void }) {
  return (
    <div role="radiogroup" aria-label={titulo} className="mt-2 flex flex-wrap gap-2">
      {opciones.map((o) => {
        const on = valor === o.valor;
        return (
          <button
            key={String(o.valor)}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onElegir(o.valor)}
            className={`inline-flex min-h-11 items-center rounded-full border-2 px-4 text-base font-semibold [touch-action:manipulation] ${
              on ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--bg)]' : 'border-[var(--border-ui)] bg-[var(--surface)] text-[var(--text-primary)]'
            }`}
          >
            {o.texto}
          </button>
        );
      })}
    </div>
  );
}

/** Confirmación en dos pasos para borrar: nada se pierde con un toque. */
export function Borrar({ etiqueta, aviso, onConfirmar }: { etiqueta: string; aviso: string; onConfirmar: () => void }) {
  const [seguro, setSeguro] = useState(false);
  if (!seguro) {
    return (
      <button type="button" onClick={() => setSeguro(true)} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 text-base font-semibold text-[var(--danger)] [touch-action:manipulation]">
        <Trash2 size={18} aria-hidden="true" />
        {etiqueta}
      </button>
    );
  }
  return (
    <div role="alert" className="mt-4 rounded-[var(--radius-card)] border-2 border-[var(--danger)] p-4">
      <p className="text-base font-semibold">{aviso}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button type="button" onClick={() => setSeguro(false)} className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-button)] border-2 border-[var(--border-ui)] text-base font-semibold [touch-action:manipulation]">
          Cancelar
        </button>
        <button type="button" onClick={onConfirmar} className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-button)] bg-[var(--danger)] text-base font-semibold text-[var(--bg)] [touch-action:manipulation]">
          Sí, borrar
        </button>
      </div>
    </div>
  );
}

// ── Formulario de cuidado ──
function FormCuidado({ perroId, cuidado, tipoInicial, onListo }: { perroId: string; cuidado?: Cuidado; tipoInicial: Tipo; onListo: () => void }) {
  const ahora = new Date();
  const [tipo, setTipo] = useState<Tipo>(cuidado?.tipo ?? tipoInicial);
  const [nombre, setNombre] = useState(cuidado?.nombre ?? '');
  const [detalle, setDetalle] = useState(cuidado?.detalle ?? '');
  const [hora, setHora] = useState(cuidado?.hora ?? '08:00');
  const [dias, setDias] = useState(cuidado?.proxima ? String(Math.max(diasHasta(cuidado.proxima, ahora), 0)) : '');
  const [proxima, setProxima] = useState(cuidado?.proxima ?? '');
  const [ultima, setUltima] = useState(cuidado?.ultima ?? '');
  const [cada, setCada] = useState<number>(cuidado?.cada ?? 0);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const diario = tipo === 'medicamento' || tipo === 'suplemento';
  const comida = tipo === 'comida';
  const salud = TIPOS_SALUD.includes(tipo);
  const bano = tipo === 'bano';

  const guardar = () => {
    const e: Record<string, string> = {};
    if (!bano && !nombre.trim()) e.nombre = 'Escribe cómo se llama.';
    if (diario && !hora) e.hora = 'Elige la hora del aviso.';
    if (comida && !(Number(dias) >= 1 && Number(dias) <= 365)) e.dias = 'Escribe un número de días entre 1 y 365.';
    if (diario && dias !== '' && !(Number(dias) >= 1 && Number(dias) <= 365)) e.dias = 'Escribe un número de días entre 1 y 365.';
    if (salud && !proxima) e.proxima = 'Elige la próxima fecha.';
    setErrores(e);
    if (Object.keys(e).length) return;
    const base: Cuidado = { id: cuidado?.id ?? nuevoId('c'), perroId, tipo, nombre: bano ? 'Baño' : nombre.trim(), detalle: detalle.trim() };
    if (diario) {
      base.hora = hora;
      if (dias !== '') base.proxima = claveDia(sumarDias(ahora, Number(dias)));
    } else if (comida) {
      base.proxima = claveDia(sumarDias(ahora, Number(dias)));
    } else {
      base.proxima = proxima;
      if (ultima) base.ultima = ultima;
      if (cada) base.cada = cada;
    }
    guardarCuidado(base);
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
      {!cuidado && (
        <div className="mt-3">
          <p className="text-base font-semibold">¿Qué es?</p>
          <div role="radiogroup" aria-label="Tipo de cuidado" className="mt-2 flex flex-wrap gap-2">
            {[...TIPOS_BOTIQUIN, ...TIPOS_SALUD].map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={tipo === t}
                onClick={() => setTipo(t)}
                className={`inline-flex min-h-11 items-center rounded-full border-2 px-4 text-base font-semibold [touch-action:manipulation] ${
                  tipo === t ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--bg)]' : 'border-[var(--border-ui)] bg-[var(--surface)]'
                }`}
              >
                {NOMBRE_TIPO[t]}
              </button>
            ))}
          </div>
        </div>
      )}
      {!bano && (
        <Campo id="nombre-cuidado" etiqueta={comida ? '¿Qué alimento es?' : tipo === 'control' ? '¿Qué tipo de control es?' : '¿Cómo se llama?'} error={errores.nombre}>
          <input
            id="nombre-cuidado"
            value={nombre}
            maxLength={40}
            autoComplete="off"
            onChange={(e) => { setNombre(e.target.value); setErrores((x) => ({ ...x, nombre: '' })); }}
            placeholder={comida ? 'Por ejemplo, Croquetas adulto' : tipo === 'control' ? 'Por ejemplo, Chequeo general' : 'Por ejemplo, Apoquel'}
            className={campo}
          />
        </Campo>
      )}
      <Campo id="detalle-cuidado" etiqueta={diario ? 'Dosis o indicación' : bano ? '¿Dónde fue?' : 'Detalle'} opcional>
        <input
          id="detalle-cuidado"
          value={detalle}
          maxLength={60}
          autoComplete="off"
          onChange={(e) => setDetalle(e.target.value)}
          placeholder={diario ? 'Por ejemplo, 1 comprimido' : bano ? 'Peluquería, veterinaria, en casa…' : ''}
          className={campo}
        />
      </Campo>
      {diario && (
        <>
          <Campo id="hora-cuidado" etiqueta="¿A qué hora se lo das?" error={errores.hora}>
            <input id="hora-cuidado" type="time" value={hora} onChange={(e) => { setHora(e.target.value); setErrores((x) => ({ ...x, hora: '' })); }} className={campo} />
          </Campo>
          <Campo id="dias-cuidado" etiqueta="¿Para cuántos días queda?" opcional error={errores.dias}>
            <input id="dias-cuidado" type="number" inputMode="numeric" min={1} max={365} value={dias} onChange={(e) => { setDias(e.target.value); setErrores((x) => ({ ...x, dias: '' })); }} placeholder="Por ejemplo, 15" className={campo} />
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Te avisamos antes de que se acabe.</p>
          </Campo>
        </>
      )}
      {comida && (
        <Campo id="dias-cuidado" etiqueta="¿Para cuántos días queda?" error={errores.dias}>
          <input id="dias-cuidado" type="number" inputMode="numeric" min={1} max={365} value={dias} onChange={(e) => { setDias(e.target.value); setErrores((x) => ({ ...x, dias: '' })); }} placeholder="Por ejemplo, 7" className={campo} />
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Un cálculo a ojo basta. Te avisamos antes de que se acabe.</p>
        </Campo>
      )}
      {salud && (
        <>
          <Campo id="proxima-cuidado" etiqueta="¿Cuándo toca?" error={errores.proxima}>
            <input id="proxima-cuidado" type="date" value={proxima} onChange={(e) => { setProxima(e.target.value); setErrores((x) => ({ ...x, proxima: '' })); }} className={campo} />
          </Campo>
          <Campo id="ultima-cuidado" etiqueta="¿Cuándo fue la última vez?" opcional>
            <input id="ultima-cuidado" type="date" max={claveDia(ahora)} value={ultima} onChange={(e) => setUltima(e.target.value)} className={campo} />
          </Campo>
          <div className="mt-5">
            <p className="text-base font-semibold">¿Se repite?</p>
            <Fichas titulo="Repetición" opciones={REPETIR} valor={cada} onElegir={setCada} />
          </div>
        </>
      )}
      <div className="mt-8 flex flex-col gap-3">
        <button type="submit" className={botonPrimario}>
          {cuidado ? 'Guardar cambios' : 'Agregar'}
        </button>
        {cuidado && salud && (
          <button
            type="button"
            className={botonSecundario}
            onClick={() => {
              registrarSalud(cuidado.id, new Date());
              onListo();
            }}
          >
            Lo hice hoy
          </button>
        )}
      </div>
      {cuidado && (
        <Borrar
          etiqueta="Borrar este cuidado"
          aviso="Se borra también su historial. Esto no se puede deshacer."
          onConfirmar={() => {
            eliminarCuidado(cuidado.id);
            onListo();
          }}
        />
      )}
    </form>
  );
}

/** Recorta la foto al centro en cuadrado y la reduce (480 px): liviana para guardar y rápida de mostrar. */
export async function procesarFoto(archivo: File): Promise<string> {
  if (!archivo.type.startsWith('image/')) throw new Error('Elige una imagen (JPG, PNG o WEBP).');
  if (archivo.size > 15 * 1024 * 1024) throw new Error('La foto pesa demasiado. Elige una de menos de 15 MB.');
  const url = URL.createObjectURL(archivo);
  try {
    const img = await new Promise<HTMLImageElement>((ok, mal) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = () => mal(new Error('No pudimos abrir esa foto. Prueba con otra.'));
      i.src = url;
    });
    const lado = Math.min(img.naturalWidth, img.naturalHeight);
    const lienzo = document.createElement('canvas');
    lienzo.width = 480;
    lienzo.height = 480;
    const ctx = lienzo.getContext('2d');
    if (!ctx) throw new Error('No pudimos procesar esa foto. Prueba con otra.');
    ctx.drawImage(img, (img.naturalWidth - lado) / 2, (img.naturalHeight - lado) / 2, lado, lado, 0, 0, 480, 480);
    return lienzo.toDataURL('image/jpeg', 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}

// ── Formulario de perro ──
function FormPerro({ perro, onListo }: { perro?: Perro; onListo: (id: string) => void }) {
  const hoyClave = claveDia(new Date());
  const [nombre, setNombre] = useState(perro?.nombre ?? '');
  const [raza, setRaza] = useState(perro?.raza ?? '');
  const [nacimiento, setNacimiento] = useState(perro?.nacimiento ?? '');
  const [peso, setPeso] = useState(perro?.pesoKg !== undefined ? String(perro.pesoKg) : '');
  const [notas, setNotas] = useState(perro?.notas ?? '');
  const [chip, setChip] = useState(perro?.chip ?? '');
  const [responsable, setResponsable] = useState(perro?.responsable ?? '');
  const [telefono, setTelefono] = useState(perro?.telefono ?? '');
  const [foto, setFoto] = useState<string | undefined>(perro?.foto);
  const [cargandoFoto, setCargandoFoto] = useState(false);
  const entradaFoto = useRef<HTMLInputElement>(null);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const limpiar = (k: string) => setErrores((x) => ({ ...x, [k]: '' }));

  const elegirFoto = async (archivo: File | undefined) => {
    if (!archivo) return;
    setCargandoFoto(true);
    limpiar('foto');
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
    if (!nombre.trim()) e.nombre = 'Escribe su nombre.';
    if (peso !== '' && !(Number(peso) > 0 && Number(peso) < 120)) e.peso = 'Escribe un peso en kilos, por ejemplo 12,5.';
    const soloChip = chip.replace(/[\s-]/g, '');
    if (soloChip && !/^\d{9,15}$/.test(soloChip)) e.chip = 'El chip tiene entre 9 y 15 números. Revisa el que sale en su carné.';
    const soloTel = telefono.replace(/[\s()-]/g, '');
    if (soloTel && !/^\+?\d{7,15}$/.test(soloTel)) e.telefono = 'Escribe un teléfono válido, por ejemplo +56 9 1234 5678.';
    setErrores(e);
    if (Object.keys(e).length) return;
    const id = perro?.id ?? nuevoId('p');
    guardarPerro({
      ...perro,
      id,
      nombre: nombre.trim(),
      raza: raza.trim() || undefined,
      nacimiento: nacimiento || undefined,
      pesoKg: peso !== '' ? Number(peso) : undefined,
      notas: notas.trim() || undefined,
      chip: soloChip || undefined,
      responsable: responsable.trim() || undefined,
      telefono: telefono.trim() || undefined,
      foto,
    });
    onListo(id);
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
        <Avatar perro={{ id: 'vista', nombre: nombre || 'Tu perro', foto }} grande />
        <div className="flex flex-col items-start gap-1">
          <input ref={entradaFoto} id="foto-perro" type="file" accept="image/*" className="sr-only" onChange={(ev) => { void elegirFoto(ev.target.files?.[0]); ev.target.value = ''; }} />
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
      <Campo id="nombre-perro" etiqueta="Nombre" error={errores.nombre}>
        <input id="nombre-perro" value={nombre} maxLength={30} autoComplete="off" onChange={(e) => { setNombre(e.target.value); setErrores((x) => ({ ...x, nombre: '' })); }} placeholder="Por ejemplo, Toffee" className={campo} />
      </Campo>
      <Campo id="raza-perro" etiqueta="Raza" opcional>
        <input id="raza-perro" value={raza} maxLength={40} autoComplete="off" onChange={(e) => setRaza(e.target.value)} placeholder="Por ejemplo, Golden retriever" className={campo} />
      </Campo>
      <Campo id="nacimiento-perro" etiqueta="Fecha de nacimiento" opcional>
        <input id="nacimiento-perro" type="date" max={hoyClave} value={nacimiento} onChange={(e) => setNacimiento(e.target.value)} className={campo} />
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Si no la sabes, una fecha aproximada sirve.</p>
      </Campo>
      <Campo id="peso-perro" etiqueta="Peso en kilos" opcional error={errores.peso}>
        <input id="peso-perro" type="number" inputMode="decimal" step="0.1" min={0} value={peso} onChange={(e) => { setPeso(e.target.value); setErrores((x) => ({ ...x, peso: '' })); }} placeholder="Por ejemplo, 12,5" className={campo} />
      </Campo>
      <Campo id="chip-perro" etiqueta="Número de microchip" opcional error={errores.chip}>
        <input id="chip-perro" inputMode="numeric" value={chip} maxLength={20} autoComplete="off" onChange={(e) => { setChip(e.target.value); limpiar('chip'); }} placeholder="Por ejemplo, 985112345678901" className={campo} />
      </Campo>
      <Campo id="responsable-perro" etiqueta="Responsable" opcional>
        <input id="responsable-perro" value={responsable} maxLength={50} autoComplete="name" onChange={(e) => setResponsable(e.target.value)} placeholder="Nombre de quien responde por él" className={campo} />
      </Campo>
      <CampoTelefono id="telefono-perro" valor={telefono} onCambiar={(v) => { setTelefono(v); limpiar('telefono'); }} error={errores.telefono} />
      <Campo id="notas-perro" etiqueta="Datos importantes" opcional>
        <textarea id="notas-perro" value={notas} maxLength={300} rows={4} onChange={(e) => setNotas(e.target.value)} placeholder="Alergias, cirugías, condiciones, cuidados especiales…" className={`${campo} h-auto py-3`} />
      </Campo>
      <div className="mt-8">
        <button type="submit" className={botonPrimario}>
          {perro ? 'Guardar cambios' : 'Agregar perro'}
        </button>
      </div>
      {perro && (
        <Borrar
          etiqueta={`Borrar a ${perro.nombre}`}
          aviso={`Se borran también sus cuidados y su historial. Esto no se puede deshacer.`}
          onConfirmar={() => {
            eliminarPerro(perro.id);
            onListo('');
          }}
        />
      )}
    </form>
  );
}

// ── Filas ──
function FilaCuidado({ c, i, onAbrir }: { c: Cuidado; i: number; onAbrir: () => void }) {
  const ahora = new Date();
  const dias = c.proxima ? textoDias(diasHasta(c.proxima, ahora)) : null;
  const linea = c.hora ? `Todos los días · ${c.hora}` : c.ultima ? `Última vez: ${fechaCorta(c.ultima)}` : c.detalle || 'Sin registro previo';
  return (
    <motion.li {...entrada(i)}>
      <button
        type="button"
        onClick={onAbrir}
        aria-label={`Abrir ${c.nombre}`}
        className="flex min-h-16 w-full items-center gap-4 rounded-[var(--radius-card)] border border-[var(--border-ui)] bg-[var(--surface)] p-4 text-left shadow-[var(--shadow-1)] transition-transform duration-150 active:scale-[0.98] [touch-action:manipulation]"
      >
        <ChipIcono tipo={c.tipo} />
        <span className="min-w-0 flex-1">
          <span className="block text-base font-semibold">{c.nombre}</span>
          <span className="block text-sm text-[var(--text-secondary)]">{linea}</span>
          {dias && (
            <span className={`mt-1 inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-sm font-semibold ${tono[dias.tono]}`}>
              {c.hora ? `Reponer: ${dias.texto.toLowerCase()}` : dias.texto}
            </span>
          )}
        </span>
        <ChevronRight size={20} color="var(--text-secondary)" aria-hidden="true" />
      </button>
    </motion.li>
  );
}

function Identificacion({ perro, onEditar }: { perro: Perro; onEditar: () => void }) {
  const [copiado, setCopiado] = useState(false);
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(perro.chip ?? '');
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // sin permiso de portapapeles: el número sigue visible para copiarlo a mano
    }
  };
  if (!perro.chip && !perro.responsable && !perro.telefono) {
    return (
      <button type="button" onClick={onEditar} className="flex min-h-16 w-full items-center gap-3 rounded-[var(--radius-card)] border-2 border-dashed border-[var(--border-ui)] p-4 text-left text-base text-[var(--text-secondary)] [touch-action:manipulation]">
        <Plus size={20} color="var(--accent)" aria-hidden="true" />
        Agrega el chip y un teléfono de contacto por si se pierde
      </button>
    );
  }
  return (
    <section aria-label="Identificación" className="borde-degradado rounded-[var(--radius-card)] p-4 shadow-[var(--shadow-1)]">
      <h2 className="mb-3 text-lg font-bold">Identificación</h2>
      <dl className="flex flex-col gap-3">
        {perro.chip && (
          <div className="flex items-center gap-3">
            <ChipDato icono={Cpu} />
            <div className="min-w-0 flex-1">
              <dt className="text-sm text-[var(--text-secondary)]">Microchip</dt>
              <dd className="text-base font-semibold tabular-nums">{perro.chip.replace(/(\d{3})(?=\d)/g, '$1 ')}</dd>
            </div>
            <button type="button" onClick={copiar} aria-label={copiado ? 'Número copiado' : 'Copiar número de microchip'} className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-[var(--accent)] text-[var(--accent)] [touch-action:manipulation]">
              {copiado ? <Check size={20} aria-hidden="true" /> : <Copy size={20} aria-hidden="true" />}
            </button>
          </div>
        )}
        {perro.responsable && (
          <div className="flex items-center gap-3">
            <ChipDato icono={User} />
            <div>
              <dt className="text-sm text-[var(--text-secondary)]">Responsable</dt>
              <dd className="text-base font-semibold">{perro.responsable}</dd>
            </div>
          </div>
        )}
        {perro.telefono && (
          <div className="flex items-center gap-3">
            <ChipDato icono={Phone} />
            <div className="min-w-0 flex-1">
              <dt className="text-sm text-[var(--text-secondary)]">Teléfono</dt>
              <dd className="text-base font-semibold tabular-nums">{perro.telefono}</dd>
            </div>
            <a href={`tel:${perro.telefono.replace(/[\s()-]/g, '')}`} aria-label={`Llamar al ${perro.telefono}`} className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-[var(--accent)] text-[var(--accent)]">
              <Phone size={20} aria-hidden="true" />
            </a>
          </div>
        )}
      </dl>
    </section>
  );
}

function ChipDato({ icono: Icono }: { icono: typeof Cpu }) {
  return (
    <span aria-hidden="true" className="inline-flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-[var(--chip-bg)]">
      <Icono size={20} color="var(--accent)" />
    </span>
  );
}

function Seccion({ titulo, onAgregar, vacio, destacada, children }: { titulo: string; onAgregar: () => void; vacio?: string; destacada?: boolean; children: React.ReactNode }) {
  return (
    <section aria-label={titulo} className={destacada ? 'borde-degradado rounded-[var(--radius-card)] p-4 shadow-[var(--shadow-2)]' : undefined}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className={destacada ? 'text-lg font-bold text-[var(--accent)]' : 'text-lg font-bold'}>{titulo}</h2>
        <button type="button" onClick={onAgregar} className="inline-flex min-h-11 items-center gap-1 rounded-[var(--radius-button)] px-3 text-base font-semibold text-[var(--accent)] [touch-action:manipulation]">
          <Plus size={18} aria-hidden="true" />
          Agregar
        </button>
      </div>
      {vacio ? (
        <button
          type="button"
          onClick={onAgregar}
          className="flex min-h-16 w-full items-center gap-3 rounded-[var(--radius-card)] border-2 border-dashed border-[var(--border-ui)] p-4 text-left text-base text-[var(--text-secondary)] [touch-action:manipulation]"
        >
          <Plus size={20} color="var(--accent)" aria-hidden="true" />
          {vacio}
        </button>
      ) : (
        <ul className="flex flex-col gap-2">{children}</ul>
      )}
    </section>
  );
}

type HojaEstado = null | { kind: 'cuidado'; perroId: string; cuidado?: Cuidado; tipo: Tipo } | { kind: 'perro'; perro?: Perro } | { kind: 'nota'; perroId: string; nota?: Nota } | { kind: 'limite' };

export default function Perros() {
  const e = useSyncExternalStore(suscribirApp, obtenerApp, () => null);
  const [perroId, setPerroId] = useState<string | null>(null);
  const [hoja, setHoja] = useState<HojaEstado>(null);
  const cerrar = () => setHoja(null);

  if (!e) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col [font-family:var(--font-body)]">
        <main className="flex flex-1 flex-col gap-4 px-6 pt-6" aria-busy="true" aria-label="Cargando tus perros">
          <div className="h-10 w-48 rounded-[var(--radius-button)] bg-[var(--surface-2)] motion-safe:animate-pulse" />
          <div className="h-24 rounded-[var(--radius-card)] bg-[var(--surface-2)] motion-safe:animate-pulse" />
          <div className="h-24 rounded-[var(--radius-card)] bg-[var(--surface-2)] motion-safe:animate-pulse" />
        </main>
        <Menu activa="perros" />
      </div>
    );
  }

  const ahora = new Date();
  const perro = e.perros.find((p) => p.id === perroId) ?? null;
  const limite = LIMITE_PERROS[e.plan];

  const agregarPerro = () => (e.perros.length >= limite ? setHoja({ kind: 'limite' }) : setHoja({ kind: 'perro' }));

  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col text-[var(--text-primary)] [font-family:var(--font-body)]">
        <main className="flex flex-1 flex-col gap-6 px-6 pb-24 pt-6">
          {!perro ? <Lista e={e} ahora={ahora} limite={limite} onAbrir={setPerroId} onAgregar={agregarPerro} /> : <Ficha e={e} perro={perro} ahora={ahora} onVolver={() => setPerroId(null)} onHoja={setHoja} />}
        </main>

        <Hoja abierta={hoja?.kind === 'cuidado'} titulo={hoja?.kind === 'cuidado' && hoja.cuidado ? 'Editar cuidado' : 'Agregar cuidado'} onCerrar={cerrar}>
          {hoja?.kind === 'cuidado' && <FormCuidado key={hoja.cuidado?.id ?? hoja.tipo} perroId={hoja.perroId} cuidado={hoja.cuidado} tipoInicial={hoja.tipo} onListo={cerrar} />}
        </Hoja>
        <Hoja abierta={hoja?.kind === 'perro'} titulo={hoja?.kind === 'perro' && hoja.perro ? 'Datos del perro' : 'Agregar perro'} onCerrar={cerrar}>
          {hoja?.kind === 'perro' && (
            <FormPerro
              key={hoja.perro?.id ?? 'nuevo'}
              perro={hoja.perro}
              onListo={(id) => {
                setPerroId(id || null);
                cerrar();
              }}
            />
          )}
        </Hoja>
        <Hoja abierta={hoja?.kind === 'nota'} titulo={hoja?.kind === 'nota' && hoja.nota ? 'Editar anotación' : 'Nueva anotación'} onCerrar={cerrar}>
          {hoja?.kind === 'nota' && <FormNota key={hoja.nota?.id ?? 'nueva'} perroId={hoja.perroId} nota={hoja.nota} quien={quienSoy(e)} onListo={cerrar} />}
        </Hoja>
        <Hoja abierta={hoja?.kind === 'limite'} titulo="Tu plan llegó a su límite" onCerrar={cerrar}>
          <p className="text-base text-[var(--text-secondary)]">
            El plan {PLANES[e.plan].nombre} permite hasta {limite} perros. {e.plan === 'esencial' ? 'El plan Familia llega hasta 5 perros, con las mismas funciones.' : 'Es el máximo de perros por cuenta.'}
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
        <Menu activa="perros" />
      </div>
    </MotionConfig>
  );
}

function Lista({ e, ahora, limite, onAbrir, onAgregar }: { e: EstadoApp; ahora: Date; limite: number; onAbrir: (id: string) => void; onAgregar: () => void }) {
  return (
    <>
      <header>
        <h1 className="text-3xl font-bold leading-tight">Tus perros</h1>
        <p className="mt-1 text-base text-[var(--text-secondary)]">
          {e.perros.length} de {limite} · Plan {PLANES[e.plan].nombre}
        </p>
      </header>
      <ul className="flex flex-col gap-3">
        {e.perros.map((p, i) => {
          const { pendientes } = hoy(e, p.id, ahora);
          const vencidos = e.cuidados.filter((c) => c.perroId === p.id && c.proxima && diasHasta(c.proxima, ahora) < 0).length;
          const edad = edadTexto(p.nacimiento, ahora);
          return (
            <motion.li key={p.id} {...entrada(i)}>
              <button
                type="button"
                onClick={() => onAbrir(p.id)}
                className="borde-degradado flex min-h-24 w-full items-center gap-4 rounded-[var(--radius-card)] p-4 text-left shadow-[var(--shadow-1)] transition-transform duration-150 active:scale-[0.98] [touch-action:manipulation]"
              >
                <Avatar perro={p} />
                <span className="min-w-0 flex-1">
                  <span className="block text-xl font-bold">{p.nombre}</span>
                  <span className="block text-sm text-[var(--text-secondary)]">{[p.raza, edad].filter(Boolean).join(' · ') || 'Completa su ficha'}</span>
                  <span className="mt-1 flex flex-wrap gap-2">
                    <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-sm font-semibold ${tono.normal}`}>{pendientes.length === 0 ? 'Al día hoy' : `${pendientes.length} por hacer hoy`}</span>
                    {vencidos > 0 && <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-sm font-semibold ${tono.atrasado}`}>{vencidos === 1 ? '1 vencido' : `${vencidos} vencidos`}</span>}
                  </span>
                </span>
                <ChevronRight size={22} color="var(--text-secondary)" aria-hidden="true" />
              </button>
            </motion.li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={onAgregar}
        className="flex min-h-16 w-full items-center justify-center gap-2 rounded-[var(--radius-card)] border-2 border-dashed border-[var(--accent)] text-lg font-semibold text-[var(--accent)] [touch-action:manipulation]"
      >
        <Plus size={22} aria-hidden="true" />
        Agregar perro
      </button>
    </>
  );
}

function Ficha({ e, perro, ahora, onVolver, onHoja }: { e: EstadoApp; perro: Perro; ahora: Date; onVolver: () => void; onHoja: (h: HojaEstado) => void }) {
  const [verTodo, setVerTodo] = useState(false);
  const notas = e.notas.filter((n) => n.perroId === perro.id).sort((a, b) => `${b.dia} ${b.hora}`.localeCompare(`${a.dia} ${a.hora}`));
  const suyos = e.cuidados.filter((c) => c.perroId === perro.id);
  const porFecha = (a: Cuidado, b: Cuidado) => (a.proxima ?? '9999').localeCompare(b.proxima ?? '9999');
  const salud = suyos.filter((c) => TIPOS_SALUD.includes(c.tipo)).sort(porFecha);
  const botiquin = suyos.filter((c) => TIPOS_BOTIQUIN.includes(c.tipo)).sort((a, b) => (a.hora ?? '99').localeCompare(b.hora ?? '99'));
  const edad = edadTexto(perro.nacimiento, ahora);
  const datos = [edad, perro.pesoKg !== undefined ? `${perro.pesoKg} kg` : null].filter(Boolean);
  return (
    <>
      <button type="button" onClick={onVolver} className="-ml-3 inline-flex min-h-11 w-fit items-center gap-2 rounded-[var(--radius-button)] px-3 text-base font-semibold text-[var(--text-secondary)] [touch-action:manipulation]">
        <ArrowLeft size={20} aria-hidden="true" />
        Perros
      </button>
      <motion.header {...entrada(0)} className="flex items-center gap-4">
        <Avatar perro={perro} grande />
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold leading-tight">{perro.nombre}</h1>
          {perro.raza && <p className="mt-1 text-base text-[var(--text-secondary)]">{perro.raza}</p>}
          <p className={`${perro.raza ? '' : 'mt-1 '}text-base text-[var(--text-secondary)]`}>{datos.length ? datos.join(' · ') : perro.raza ? '' : 'Completa sus datos'}</p>
        </div>
        <button
          type="button"
          onClick={() => onHoja({ kind: 'perro', perro })}
          aria-label={`Editar datos de ${perro.nombre}`}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-[var(--border-ui)] [touch-action:manipulation]"
        >
          <Pencil size={18} aria-hidden="true" />
        </button>
      </motion.header>
      {perro.notas && (
        <section aria-label="Datos importantes" className="rounded-[var(--radius-card)] bg-[var(--elevated)] p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">Datos importantes</h2>
          <p className="mt-1 text-base">{perro.notas}</p>
        </section>
      )}
      <Identificacion perro={perro} onEditar={() => onHoja({ kind: 'perro', perro })} />

      <Link href={`/app/resumen?perro=${perro.id}`} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-[var(--radius-card)] border-2 border-[var(--accent)] text-base font-semibold text-[var(--accent)] active:scale-[0.98]">
        <FileText size={20} aria-hidden="true" />
        Resumen para el veterinario
      </Link>

      <Seccion titulo="Salud" onAgregar={() => onHoja({ kind: 'cuidado', perroId: perro.id, tipo: 'vacuna' })} vacio={salud.length === 0 ? 'Agrega su próxima vacuna, antiparasitario, baño o control' : undefined}>
        {salud.map((c, i) => (
          <FilaCuidado key={c.id} c={c} i={i} onAbrir={() => onHoja({ kind: 'cuidado', perroId: perro.id, cuidado: c, tipo: c.tipo })} />
        ))}
      </Seccion>
      <Seccion titulo="Botiquín" onAgregar={() => onHoja({ kind: 'cuidado', perroId: perro.id, tipo: 'medicamento' })} vacio={botiquin.length === 0 ? 'Agrega un medicamento, suplemento o su alimento' : undefined}>
        {botiquin.map((c, i) => (
          <FilaCuidado key={c.id} c={c} i={i} onAbrir={() => onHoja({ kind: 'cuidado', perroId: perro.id, cuidado: c, tipo: c.tipo })} />
        ))}
      </Seccion>
      <Seccion titulo="Bitácora" destacada onAgregar={() => onHoja({ kind: 'nota', perroId: perro.id })} vacio={notas.length === 0 ? 'Anota síntomas o cambios para contárselos al veterinario' : undefined}>
        {(verTodo ? notas : notas.slice(0, 3)).map((n, i) => (
          <FilaNota key={n.id} n={n} i={i} onAbrir={() => onHoja({ kind: 'nota', perroId: perro.id, nota: n })} />
        ))}
      </Seccion>
      {notas.length > 3 && (
        <button type="button" onClick={() => setVerTodo((v) => !v)} className="-mt-3 inline-flex min-h-11 w-fit items-center rounded-[var(--radius-button)] px-3 text-base font-semibold text-[var(--accent)] [touch-action:manipulation]">
          {verTodo ? 'Ver menos' : `Ver toda la bitácora (${notas.length})`}
        </button>
      )}
    </>
  );
}
