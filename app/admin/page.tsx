'use client';

// Panel de administración — solo para el dueño de la app. El servidor verifica en cada llamada que
// quien pregunta es un administrador real (tabla `admins`); esta pantalla no es la seguridad, es
// solo la vista. Ver docs/sistema/21-BACKOFFICE.md y lib/supabase-admin.ts.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MotionConfig, motion } from 'motion/react';
import { Copy, X } from 'lucide-react';
import { clienteSupabase } from '@/lib/supabase';
import { Aviso, Barras, CONTENEDOR_PANEL, Dato, SinDatos, SinDatosLista, Tarjeta, Titulo } from '@/components/admin/ui';

interface Resumen {
  usuarios: { total: number; activos7: number; activos30: number; nuevosEstaSemana: number };
  uso: { totalPerros: number; totalCuidados: number; totalRegistros30d: number; usoPorDia: { dia: string; cantidad: number }[]; embudoOnboarding: { tipo: string; cantidad: number }[]; hayEventos: boolean };
  ventas: { sinDatos: true; motivo: string };
  negocio: { sinDatos: true; motivo: string };
  ia: { sinDatos: true; motivo: string };
  errores: { total30d: number; recientes: { id: string; mensaje: string; contexto: string | null; creado_en: string }[] };
  avisos: { nivel: 'alerta' | 'info' | 'ok'; texto: string }[];
}

interface FilaUsuario {
  hogarId: string;
  nombre: string;
  plan: string;
  correo: string;
  perros: number;
  creadoEn: string;
  ultimaActividad: string | null;
}

type Estado = { tipo: 'cargando' } | { tipo: 'sin_sesion' } | { tipo: 'sin_acceso'; motivo: string } | { tipo: 'error'; motivo: string } | { tipo: 'listo' };

const ETIQUETA_EVENTO: Record<string, string> = {
  onboarding_started: 'Empezó el onboarding',
  pet_named: 'Nombró a su mascota',
  priority_selected: 'Eligió una prioridad',
  first_care_configured: 'Configuró su primer cuidado',
  notifications_requested: 'Activó avisos',
  first_panel_viewed: 'Vio su Panel de Hoy',
  paywall_viewed: 'Vio el paywall',
  trial_started: 'Empezó la prueba',
};

const fecha = (iso: string) => new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'short' });

async function pedir<T>(ruta: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(ruta, { ...init, headers: { ...init?.headers, Authorization: `Bearer ${token}` } });
  const cuerpo = await res.json();
  if (!res.ok) throw new Error(cuerpo.motivo ?? 'Algo falló.');
  return cuerpo as T;
}

export default function PanelAdmin() {
  const [estado, setEstado] = useState<Estado>({ tipo: 'cargando' });
  const [token, setToken] = useState<string | null>(null);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [usuarios, setUsuarios] = useState<FilaUsuario[] | null>(null);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    void (async () => {
      const supabase = clienteSupabase();
      if (!supabase) return setEstado({ tipo: 'error', motivo: 'Falta configurar Supabase.' });
      const { data } = await supabase.auth.getSession();
      const t = data.session?.access_token;
      if (!t) return setEstado({ tipo: 'sin_sesion' });
      setToken(t);
      try {
        const [r, u] = await Promise.all([pedir<Resumen>('/api/admin/resumen', t), pedir<{ usuarios: FilaUsuario[] }>('/api/admin/usuarios', t)]);
        setResumen(r);
        setUsuarios(u.usuarios);
        setEstado({ tipo: 'listo' });
      } catch (err) {
        const motivo = err instanceof Error ? err.message : 'Algo falló.';
        setEstado(motivo === 'Esta cuenta no tiene acceso al panel.' ? { tipo: 'sin_acceso', motivo } : { tipo: 'error', motivo });
      }
    })();
  }, []);

  if (estado.tipo === 'cargando') {
    return <div className="mx-auto flex min-h-dvh max-w-3xl items-center justify-center px-6 text-[var(--text-secondary)]">Cargando…</div>;
  }
  if (estado.tipo === 'sin_sesion') {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-semibold">Entra primero</h1>
        <p className="text-base text-[var(--text-secondary)]">Este panel es solo para administradores.</p>
        <Link href="/login" className="inline-flex h-12 items-center rounded-[var(--radius-button)] bg-[var(--accent)] px-6 text-base font-semibold text-[var(--bg)]">
          Ir a entrar
        </Link>
      </div>
    );
  }
  if (estado.tipo === 'sin_acceso') {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-2xl font-semibold">No tienes acceso</h1>
        <p className="text-base text-[var(--text-secondary)]">Esta cuenta no está en la lista de administradores.</p>
        <Link href="/app" className="inline-flex h-12 items-center rounded-[var(--radius-button)] bg-[var(--accent)] px-6 text-base font-semibold text-[var(--bg)]">
          Ir a la app
        </Link>
      </div>
    );
  }
  if (estado.tipo === 'error' || !resumen || !usuarios || !token) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-2xl font-semibold">No pudimos cargar el panel</h1>
        <p className="text-base text-[var(--text-secondary)]">{estado.tipo === 'error' ? estado.motivo : ''}</p>
        <button
          type="button"
          onClick={() => location.reload()}
          className="inline-flex h-12 items-center rounded-[var(--radius-button)] bg-[var(--accent)] px-6 text-base font-semibold text-[var(--bg)] [touch-action:manipulation]"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const filtrados = busqueda.trim() ? usuarios.filter((u) => u.correo.toLowerCase().includes(busqueda.trim().toLowerCase())) : usuarios;

  return (
    <MotionConfig reducedMotion="user">
    <div className="relative mx-auto flex min-h-dvh max-w-3xl flex-col gap-8 px-6 py-8 text-[var(--text-primary)] [font-family:var(--font-body)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: 'radial-gradient(900px 480px at 50% -10%, color-mix(in oklab, var(--accent) 7%, transparent) 0%, transparent 60%)' }}
      />
      <motion.div variants={CONTENEDOR_PANEL} initial="hidden" animate="visible" className="contents">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">Panel de administración</p>
          <h1 className="mt-1 text-2xl leading-tight [font-family:var(--font-serif)]">La Doctora Perritos</h1>
        </div>
        <nav aria-label="Salir del panel" className="flex shrink-0 items-center gap-3 pt-1">
          <Link
            href="/app"
            className="inline-flex h-9 items-center rounded-[var(--radius-button)] bg-[var(--surface-2)] px-3 text-sm font-semibold text-[var(--text-primary)] active:scale-[0.96] [touch-action:manipulation]"
          >
            Volver a la app
          </Link>
          <button
            type="button"
            onClick={() => void clienteSupabase()?.auth.signOut().then(() => setEstado({ tipo: 'sin_sesion' }))}
            className="h-9 px-1 text-sm font-medium text-[var(--text-secondary)] underline active:scale-[0.96] [touch-action:manipulation]"
          >
            Salir
          </button>
        </nav>
      </header>

      <section aria-label="Avisos" className="flex flex-col gap-2">
        {resumen.avisos.map((a, i) => (
          <Aviso key={i} nivel={a.nivel} texto={a.texto} />
        ))}
      </section>

      <section aria-label="Usuarios" className="flex flex-col gap-3">
        <Titulo>Usuarios</Titulo>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Dato numero={resumen.usuarios.total} etiqueta="Familias totales" />
          <Dato numero={resumen.usuarios.activos7} etiqueta="Activas esta semana" insight={`de ${resumen.usuarios.total} en total`} />
          <Dato numero={resumen.usuarios.activos30} etiqueta="Activas este mes" />
          <Dato numero={resumen.usuarios.nuevosEstaSemana} etiqueta="Nuevas esta semana" />
        </div>
        <FormularioInvitar token={token} />
        <Tarjeta className="flex flex-col gap-3">
          <div className="relative">
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por correo…"
              className="h-11 w-full rounded-[var(--radius-button)] border-2 border-[var(--border-ui)] bg-[var(--bg)] px-3 pr-10 text-base outline-none focus:border-[var(--accent)]"
            />
            {busqueda && (
              <motion.button
                type="button"
                onClick={() => setBusqueda('')}
                aria-label="Borrar la búsqueda"
                whileTap={{ scale: 0.9 }}
                className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-[var(--text-secondary)] [touch-action:manipulation]"
              >
                <X size={16} />
              </motion.button>
            )}
          </div>
          <div className="flex flex-col divide-y divide-[var(--border-suave)]">
            {filtrados.length === 0 && <p className="py-4 text-sm text-[var(--text-secondary)]">Sin resultados.</p>}
            {filtrados.map((u) => (
              <div key={u.hogarId} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <CorreoConCopiar correo={u.correo} />
                  <p className="text-sm text-[var(--text-secondary)]">
                    {u.perros} mascota{u.perros === 1 ? '' : 's'} · Plan {u.plan} · Desde {fecha(u.creadoEn)}
                  </p>
                </div>
                <span className="shrink-0 text-sm text-[var(--text-secondary)]">{u.ultimaActividad ? `Activo ${fecha(u.ultimaActividad)}` : 'Sin actividad'}</span>
              </div>
            ))}
          </div>
        </Tarjeta>
      </section>

      <section aria-label="Uso" className="flex flex-col gap-3">
        <Titulo>Uso</Titulo>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <Dato numero={resumen.uso.totalPerros} etiqueta="Mascotas registradas" />
          <Dato numero={resumen.uso.totalCuidados} etiqueta="Cuidados configurados" />
          <Dato numero={resumen.uso.totalRegistros30d} etiqueta="Marcados como hechos" insight="últimos 30 días" />
        </div>
        <Tarjeta>
          <p className="mb-3 text-sm text-[var(--text-secondary)]">Cuidados marcados como hechos, por día (últimos 14 días)</p>
          <Barras datos={resumen.uso.usoPorDia} />
        </Tarjeta>
        {resumen.uso.hayEventos ? (
          <Tarjeta className="flex flex-col gap-2">
            <p className="text-sm text-[var(--text-secondary)]">Recorrido del onboarding (últimos 30 días)</p>
            {resumen.uso.embudoOnboarding.map((e) => (
              <div key={e.tipo} className="flex items-center justify-between text-base">
                <span>{ETIQUETA_EVENTO[e.tipo] ?? e.tipo}</span>
                <span className="font-semibold tabular-nums">{e.cantidad}</span>
              </div>
            ))}
          </Tarjeta>
        ) : (
          <SinDatos motivo="Todavía no se registró ningún evento del onboarding. Empieza a contarse desde que alguien lo complete después de hoy." />
        )}
      </section>

      <section aria-label="Ventas, negocio e inteligencia artificial" className="flex flex-col gap-3">
        <Titulo>Ventas y negocio</Titulo>
        <SinDatosLista
          titulo="Ventas y negocio"
          items={[
            { etiqueta: 'Ventas', motivo: resumen.ventas.motivo },
            { etiqueta: 'Ganancia y valor por cliente', motivo: resumen.negocio.motivo },
            { etiqueta: 'Costo de inteligencia artificial', motivo: resumen.ia.motivo },
          ]}
        />
      </section>

      <section aria-label="Salud y errores" className="flex flex-col gap-3">
        <Titulo>Salud y errores</Titulo>
        <Dato numero={resumen.errores.total30d} etiqueta="Errores en los últimos 30 días" insight={resumen.errores.total30d === 0 ? 'Ninguno registrado' : undefined} />
        {resumen.errores.recientes.length > 0 && (
          <Tarjeta className="flex flex-col divide-y divide-[var(--border-suave)]">
            {resumen.errores.recientes.slice(0, 10).map((e) => (
              <div key={e.id} className="py-2">
                <p className="text-base font-medium">{e.mensaje}</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {e.contexto ?? 'Sin pantalla'} · {fecha(e.creado_en)}
                </p>
              </div>
            ))}
          </Tarjeta>
        )}
      </section>
      </motion.div>
    </div>
    </MotionConfig>
  );
}

function FormularioInvitar({ token }: { token: string }) {
  const [correo, setCorreo] = useState('');
  const [nombre, setNombre] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  useEffect(() => {
    if (!mensaje) return;
    const t = setTimeout(() => setMensaje(null), 5000);
    return () => clearTimeout(t);
  }, [mensaje]);

  const enviar = async () => {
    setEnviando(true);
    setMensaje(null);
    try {
      const r = await pedir<{ ok: true; reenviado: boolean }>('/api/admin/invitar', token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, nombre }),
      });
      setMensaje({ tipo: 'ok', texto: r.reenviado ? 'Esa cuenta ya existía: le reenviamos el acceso.' : 'Listo: le enviamos su acceso por correo.' });
      setCorreo('');
      setNombre('');
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err instanceof Error ? err.message : 'No se pudo agregar.' });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Tarjeta className="flex flex-col gap-3">
      <p className="text-base font-semibold">Agregar una persona a mano</p>
      <p className="text-sm text-[var(--text-secondary)]">Por si no le llegó el acceso o quieres sumarla tú mismo.</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" className="h-11 flex-1 rounded-[var(--radius-button)] border-2 border-[var(--border-ui)] bg-[var(--bg)] px-3 text-base outline-none focus:border-[var(--accent)]" />
        <input value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="correo@ejemplo.com" type="email" className="h-11 flex-1 rounded-[var(--radius-button)] border-2 border-[var(--border-ui)] bg-[var(--bg)] px-3 text-base outline-none focus:border-[var(--accent)]" />
        <button
          type="button"
          onClick={() => void enviar()}
          disabled={enviando || !correo.trim() || !nombre.trim()}
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] px-5 text-base font-semibold text-[var(--bg)] active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100 [touch-action:manipulation]"
        >
          {enviando ? 'Enviando…' : 'Agregar'}
        </button>
      </div>
      {mensaje && <p className={`text-sm font-medium ${mensaje.tipo === 'error' ? 'text-[var(--danger)]' : 'text-[var(--accent)]'}`}>{mensaje.texto}</p>}
    </Tarjeta>
  );
}

function CorreoConCopiar({ correo }: { correo: string }) {
  const [copiado, setCopiado] = useState(false);
  const copiar = () => {
    void navigator.clipboard.writeText(correo).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    });
  };
  return (
    <button type="button" onClick={copiar} title={correo} className="flex min-h-11 items-center gap-1.5 text-left active:scale-[0.97] [touch-action:manipulation]">
      <span className="truncate text-base font-semibold">{correo}</span>
      <Copy size={14} color="var(--text-secondary)" className="shrink-0" aria-hidden="true" />
      {copiado && <span className="shrink-0 text-sm text-[var(--accent)]">Copiado</span>}
    </button>
  );
}
