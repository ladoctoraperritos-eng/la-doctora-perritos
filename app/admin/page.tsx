'use client';

// Panel de administración — solo para el dueño de la app. El servidor verifica en cada llamada que
// quien pregunta es un administrador real (tabla `admins`); esta pantalla no es la seguridad, es
// solo la vista. Ver docs/sistema/21-BACKOFFICE.md y lib/supabase-admin.ts.
// Diseño: referencia visual del usuario (dashboard premium de escritorio, barra lateral + tarjetas
// + gráficos) — es un CONTRATO. Las secciones sin datos reales (Ventas, Suscripciones, IA,
// Marketing) se ven con el mismo nivel de diseño pero NUNCA inventan números: la referencia traía
// cifras de ejemplo, aquí solo se usan donde hay datos de verdad.

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, MotionConfig, motion, type Variants } from 'motion/react';
import { AlertTriangle, Copy, CreditCard, Megaphone, Sparkles, Receipt, X } from 'lucide-react';
import { clienteSupabase } from '@/lib/supabase';
import { Aviso, BannerEstado, CONTENEDOR_PANEL, Dato, ITEM_PANEL, Tarjeta, Titulo, VacioPremium } from '@/components/admin/ui';
import { Embudo, GraficoAreaUso, GraficoBarrasUso } from '@/components/admin/charts';
import { Sidebar } from '@/components/admin/Sidebar';
import type { Seccion } from '@/components/admin/secciones';

interface Resumen {
  admin: { nombre: string | null; correo: string | null };
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
const fechaHoy = () => {
  const d = new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });
  return d.charAt(0).toUpperCase() + d.slice(1);
};

// Variants con ETIQUETAS (no objetos literales) para que la propagación de Motion siga llegando a
// las tarjetas internas (`variants={ITEM_PANEL}` en ui.tsx) — un wrapper con animate={{...}} literal
// corta esa cadena y las tarjetas se quedan invisibles (opacity:0) para siempre.
const SECCION_TRANSICION: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.05 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
};

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
  const [seccion, setSeccion] = useState<Seccion>('inicio');
  const buscadorRef = useRef<HTMLInputElement>(null);

  // Atajo "/": salta directo al buscador de usuarios, como en la mayoría de paneles. Se ignora si
  // ya se está escribiendo en otro campo (para no robarle la tecla "/" a lo que esté tipeando).
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== '/') return;
      const activo = document.activeElement;
      const yaEscribiendo = activo instanceof HTMLInputElement || activo instanceof HTMLTextAreaElement;
      if (yaEscribiendo) return;
      e.preventDefault();
      setSeccion('usuarios');
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

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
    return <EsqueletoPanel />;
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

  const nombre = resumen.admin.nombre ?? 'Hola';
  const hayAlertas = resumen.avisos.some((a) => a.nivel === 'alerta');

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-dvh flex-col text-[var(--text-primary)] [font-family:var(--font-body)] md:flex-row">
        <Sidebar activa={seccion} onCambiar={setSeccion} />

        <div className="relative flex-1 overflow-x-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10"
            style={{ background: 'radial-gradient(900px 480px at 50% -10%, color-mix(in oklab, var(--accent) 6%, transparent) 0%, transparent 60%)' }}
          />
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-6 md:px-10 md:py-8">
            <motion.div variants={CONTENEDOR_PANEL} initial="hidden" animate="visible" className="contents">
              <header className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl leading-tight [font-family:var(--font-serif)] md:text-3xl">¡Hola, {nombre}!</h1>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">Resumen de tu app · Hoy es {fechaHoy()}</p>
                </div>
                <nav aria-label="Salir del panel" className="flex shrink-0 items-center gap-3">
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

              <AnimatePresence mode="wait">
                <motion.div
                  key={seccion}
                  variants={SECCION_TRANSICION}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onAnimationComplete={() => {
                    if (seccion === 'usuarios') buscadorRef.current?.focus();
                  }}
                  className="flex flex-col gap-6"
                >
                  {seccion === 'inicio' && <SeccionInicio resumen={resumen} hayAlertas={hayAlertas} />}
                  {seccion === 'ventas' && <SeccionVentas resumen={resumen} />}
                  {seccion === 'usuarios' && <SeccionUsuarios resumen={resumen} usuarios={usuarios} token={token} busqueda={busqueda} setBusqueda={setBusqueda} buscadorRef={buscadorRef} />}
                  {seccion === 'mascotas' && <SeccionMascotas resumen={resumen} />}
                  {seccion === 'suscripciones' && <SeccionSuscripciones />}
                  {seccion === 'uso' && <SeccionUso resumen={resumen} />}
                  {seccion === 'ia' && <SeccionIa resumen={resumen} />}
                  {seccion === 'marketing' && <SeccionMarketing />}
                  {seccion === 'errores' && <SeccionErrores resumen={resumen} />}
                  {seccion === 'configuracion' && <SeccionConfiguracion resumen={resumen} token={token} />}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}

function EsqueletoPanel() {
  return (
    <div className="flex min-h-dvh text-[var(--text-primary)]" aria-busy="true" aria-label="Cargando el panel">
      <div className="hidden w-64 shrink-0 border-r border-[var(--border-suave)] bg-[var(--surface)] p-4 md:block">
        <div className="h-8 w-40 animate-pulse rounded-[var(--radius-button)] bg-[var(--surface-2)]" />
        <div className="mt-6 flex flex-col gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-9 w-full animate-pulse rounded-[var(--radius-button)] bg-[var(--surface-2)]" />
          ))}
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-8 md:px-10">
        <div className="h-9 w-64 animate-pulse rounded-[var(--radius-button)] bg-[var(--surface-2)]" />
        <div className="h-20 w-full animate-pulse rounded-[var(--radius-card)] bg-[var(--surface-2)]" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-[var(--radius-card)] bg-[var(--surface-2)]" />
          ))}
        </div>
        <div className="h-64 w-full animate-pulse rounded-[var(--radius-card)] bg-[var(--surface-2)]" />
      </div>
    </div>
  );
}

function SeccionInicio({ resumen, hayAlertas }: { resumen: Resumen; hayAlertas: boolean }) {
  return (
    <>
      <BannerEstado
        bien={!hayAlertas}
        titulo={hayAlertas ? 'Hay algo que revisar' : 'Todo en orden este mes.'}
        texto={hayAlertas ? resumen.avisos.find((a) => a.nivel === 'alerta')?.texto ?? '' : 'Tus métricas se mantienen estables y dentro de lo esperado.'}
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Dato numero={resumen.usuarios.total} etiqueta="Familias totales" />
        <Dato numero={resumen.usuarios.activos7} etiqueta="Activas esta semana" insight={`de ${resumen.usuarios.total} en total`} />
        <Dato numero={resumen.uso.totalPerros} etiqueta="Mascotas registradas" />
        <Dato numero={resumen.uso.totalRegistros30d} etiqueta="Marcados como hechos" insight="últimos 30 días" />
      </div>
      <motion.div variants={ITEM_PANEL} className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Tarjeta>
          <Titulo>Uso de la app</Titulo>
          <p className="mb-3 mt-1 text-sm text-[var(--text-secondary)]">Cuidados marcados como hechos por día, últimos 14 días</p>
          <GraficoAreaUso datos={resumen.uso.usoPorDia} />
        </Tarjeta>
        <Tarjeta className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <Titulo>Avisos</Titulo>
            <div className="flex flex-col gap-2">
              {resumen.avisos.map((a, i) => (
                <Aviso key={i} nivel={a.nivel} texto={a.texto} />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2 border-t border-[var(--border-suave)] pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">En resumen</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Cuidados configurados</span>
              <span className="font-semibold tabular-nums">{resumen.uso.totalCuidados}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Errores este mes</span>
              <span className="font-semibold tabular-nums">{resumen.errores.total30d}</span>
            </div>
          </div>
        </Tarjeta>
      </motion.div>
    </>
  );
}

function SeccionVentas({ resumen }: { resumen: Resumen }) {
  return (
    <section aria-label="Ventas" className="flex flex-col gap-4">
      <Titulo>Ventas</Titulo>
      <div className="grid gap-4 md:grid-cols-2">
        <VacioPremium icono={Receipt} titulo="Todavía no hay ventas registradas" texto={resumen.ventas.motivo} />
        <VacioPremium icono={Receipt} titulo="Ganancia y valor por cliente" texto={resumen.negocio.motivo} />
      </div>
    </section>
  );
}

function SeccionUsuarios({
  resumen,
  usuarios,
  token,
  busqueda,
  setBusqueda,
  buscadorRef,
}: {
  resumen: Resumen;
  usuarios: FilaUsuario[];
  token: string;
  busqueda: string;
  setBusqueda: (v: string) => void;
  buscadorRef: React.RefObject<HTMLInputElement | null>;
}) {
  const filtrados = busqueda.trim() ? usuarios.filter((u) => u.correo.toLowerCase().includes(busqueda.trim().toLowerCase())) : usuarios;
  return (
    <section aria-label="Usuarios" className="flex flex-col gap-4">
      <Titulo>Usuarios</Titulo>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Dato numero={resumen.usuarios.total} etiqueta="Familias totales" />
        <Dato numero={resumen.usuarios.activos7} etiqueta="Activas esta semana" insight={`de ${resumen.usuarios.total} en total`} />
        <Dato numero={resumen.usuarios.activos30} etiqueta="Activas este mes" />
        <Dato numero={resumen.usuarios.nuevosEstaSemana} etiqueta="Nuevas esta semana" />
      </div>
      <FormularioInvitar token={token} />
      <Tarjeta className="flex flex-col gap-3">
        <div className="relative max-w-sm">
          <input
            ref={buscadorRef}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por correo… (atajo: /)"
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
  );
}

function SeccionMascotas({ resumen }: { resumen: Resumen }) {
  return (
    <section aria-label="Mascotas" className="flex flex-col gap-4">
      <Titulo>Mascotas</Titulo>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Dato numero={resumen.uso.totalPerros} etiqueta="Mascotas registradas" />
        <Dato numero={resumen.uso.totalCuidados} etiqueta="Cuidados configurados" insight={`${(resumen.uso.totalCuidados / Math.max(1, resumen.uso.totalPerros)).toFixed(1)} por mascota en promedio`} />
      </div>
      <p className="text-sm text-[var(--text-secondary)]">
        El detalle por raza, edad o tipo de cuidado todavía no se calcula aquí — por ahora este panel solo cuenta el total.
      </p>
    </section>
  );
}

function SeccionSuscripciones() {
  return (
    <section aria-label="Suscripciones" className="flex flex-col gap-4">
      <Titulo>Suscripciones</Titulo>
      <VacioPremium
        icono={CreditCard}
        titulo="Todavía no hay suscripciones conectadas"
        texto="Cuando conectes el aviso automático de Hotmart, aquí vas a ver las suscripciones nuevas, las canceladas y cuánta gente se da de baja cada mes."
      />
    </section>
  );
}

function SeccionUso({ resumen }: { resumen: Resumen }) {
  return (
    <section aria-label="Uso de la app" className="flex flex-col gap-4">
      <Titulo>Uso de la app</Titulo>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Dato numero={resumen.uso.totalPerros} etiqueta="Mascotas registradas" />
        <Dato numero={resumen.uso.totalCuidados} etiqueta="Cuidados configurados" />
        <Dato numero={resumen.uso.totalRegistros30d} etiqueta="Marcados como hechos" insight="últimos 30 días" />
      </div>
      <Tarjeta>
        <p className="mb-3 text-sm text-[var(--text-secondary)]">Cuidados marcados como hechos, por día (últimos 14 días)</p>
        <GraficoBarrasUso datos={resumen.uso.usoPorDia} />
      </Tarjeta>
      {resumen.uso.hayEventos ? (
        <Tarjeta>
          <Titulo>Recorrido del onboarding</Titulo>
          <p className="mb-4 mt-1 text-sm text-[var(--text-secondary)]">Últimos 30 días</p>
          <Embudo pasos={resumen.uso.embudoOnboarding.map((e) => ({ ...e, etiqueta: ETIQUETA_EVENTO[e.tipo] ?? e.tipo }))} />
        </Tarjeta>
      ) : (
        <VacioPremium
          icono={Sparkles}
          titulo="El recorrido del onboarding todavía no tiene datos"
          texto="En cuanto alguien complete el onboarding de hoy en adelante, vas a ver aquí cuántos llegan a cada paso."
        />
      )}
    </section>
  );
}

function SeccionIa({ resumen }: { resumen: Resumen }) {
  return (
    <section aria-label="IA y costos" className="flex flex-col gap-4">
      <Titulo>IA y costos</Titulo>
      <VacioPremium icono={Sparkles} titulo="La app no usa inteligencia artificial todavía" texto={resumen.ia.motivo} />
    </section>
  );
}

function SeccionMarketing() {
  return (
    <section aria-label="Marketing y canales" className="flex flex-col gap-4">
      <Titulo>Marketing y canales</Titulo>
      <VacioPremium
        icono={Megaphone}
        titulo="Todavía no hay gasto de adquisición cargado"
        texto="Cuando empieces a invertir en afiliados, anuncios o contenido, aquí vas a ver de dónde viene cada cliente nuevo y cuánto cuesta conseguirlo."
      />
    </section>
  );
}

function SeccionErrores({ resumen }: { resumen: Resumen }) {
  return (
    <section aria-label="Errores y alertas" className="flex flex-col gap-4">
      <Titulo>Errores y alertas</Titulo>
      <Dato numero={resumen.errores.total30d} etiqueta="Errores en los últimos 30 días" insight={resumen.errores.total30d === 0 ? 'Ninguno registrado' : undefined} />
      {resumen.errores.recientes.length > 0 ? (
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
      ) : (
        <VacioPremium icono={AlertTriangle} titulo="Sin errores registrados" texto="Cuando algo se rompa en la app, va a quedar anotado aquí automáticamente." />
      )}
    </section>
  );
}

function SeccionConfiguracion({ resumen, token }: { resumen: Resumen; token: string }) {
  return (
    <section aria-label="Configuración" className="flex flex-col gap-4">
      <Titulo>Configuración</Titulo>
      <Tarjeta className="flex flex-col gap-1">
        <p className="text-sm text-[var(--text-secondary)]">Tu cuenta de administradora</p>
        <p className="text-base font-semibold">{resumen.admin.correo}</p>
      </Tarjeta>
      <PanelAdministradores token={token} />
      <PanelProbarCorreos token={token} />
      <div>
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Acceso manual a la app</p>
        <p className="mb-3 text-sm text-[var(--text-secondary)]">
          Esto NO da acceso al panel de administración — solo crea o reenvía el acceso a la app para una clienta a la que no le llegó el correo de Hotmart.
        </p>
        <FormularioInvitar token={token} />
      </div>
    </section>
  );
}

const TIPOS_CORREO: { valor: string; etiqueta: string }[] = [
  { valor: 'acceso', etiqueta: 'Acceso post-compra' },
  { valor: 'ebook', etiqueta: 'Regalo (ebook)' },
  { valor: 'pago_fallido', etiqueta: 'Pago fallido' },
  { valor: 'cancelacion', etiqueta: 'Cancelación' },
  { valor: 'carrito', etiqueta: 'Carrito abandonado' },
  { valor: 'bienvenida_d1', etiqueta: 'Bienvenida día 1' },
  { valor: 'bienvenida_d3', etiqueta: 'Bienvenida día 3' },
  { valor: 'bienvenida_d7', etiqueta: 'Bienvenida día 7' },
];

/** Manda cualquier correo del negocio a la casilla de la propia administradora — para probar
 * que se vean bien y que lleguen, sin tocar datos de ningún cliente real. */
function PanelProbarCorreos({ token }: { token: string }) {
  const [enviando, setEnviando] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  const probar = async (tipo: string) => {
    setEnviando(tipo);
    setMensaje(null);
    try {
      const r = await pedir<{ correo: string }>('/api/admin/probar-correo', token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo }),
      });
      setMensaje({ tipo: 'ok', texto: `Enviado a ${r.correo}. Revisa tu correo (y spam).` });
    } catch (e) {
      setMensaje({ tipo: 'error', texto: e instanceof Error ? e.message : 'No se pudo enviar.' });
    } finally {
      setEnviando(null);
    }
  };

  return (
    <div>
      <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Probar correos</p>
      <p className="mb-3 text-sm text-[var(--text-secondary)]">
        Te manda cualquiera de los correos del negocio a tu propia casilla, para que confirmes que se ven bien y que llegan.
      </p>
      <div className="flex flex-wrap gap-2">
        {TIPOS_CORREO.map((t) => (
          <button
            key={t.valor}
            type="button"
            disabled={enviando !== null}
            onClick={() => void probar(t.valor)}
            className="inline-flex min-h-11 items-center rounded-full border-2 border-[var(--border-ui)] bg-[var(--surface)] px-4 text-sm font-semibold disabled:opacity-50 [touch-action:manipulation]"
          >
            {enviando === t.valor ? 'Enviando…' : t.etiqueta}
          </button>
        ))}
      </div>
      {mensaje && (
        <p role="status" className={`mt-3 text-sm font-semibold ${mensaje.tipo === 'ok' ? 'text-[var(--accent)]' : 'text-[var(--danger)]'}`}>
          {mensaje.texto}
        </p>
      )}
    </div>
  );
}

interface FilaAdmin {
  userId: string;
  nombre: string;
  correo: string;
  creadoEn: string;
}

/** Quién puede entrar a ESTE panel (distinto de quién puede usar la app). Pensado para que la
 * dueña pueda sumar un puesto de administradora si en el futuro contrata a alguien. */
function PanelAdministradores({ token }: { token: string }) {
  const [administradores, setAdministradores] = useState<FilaAdmin[] | null>(null);
  const [soyYo, setSoyYo] = useState<string | null>(null);
  const [correo, setCorreo] = useState('');
  const [nombre, setNombre] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  const cargar = () => {
    void pedir<{ administradores: FilaAdmin[]; soyYo: string }>('/api/admin/administradores', token).then((r) => {
      setAdministradores(r.administradores);
      setSoyYo(r.soyYo);
    });
  };
  useEffect(cargar, [token]);

  useEffect(() => {
    if (!mensaje) return;
    const t = setTimeout(() => setMensaje(null), 5000);
    return () => clearTimeout(t);
  }, [mensaje]);

  const agregar = async () => {
    setEnviando(true);
    setMensaje(null);
    try {
      await pedir('/api/admin/administradores', token, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ correo, nombre }) });
      setMensaje({ tipo: 'ok', texto: `Listo: ${nombre} ya puede entrar al panel. Le mandamos su acceso por correo.` });
      setCorreo('');
      setNombre('');
      cargar();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err instanceof Error ? err.message : 'No se pudo agregar.' });
    } finally {
      setEnviando(false);
    }
  };

  const quitar = async (userId: string, nombreAdmin: string) => {
    if (!confirm(`¿Quitarle el acceso al panel a ${nombreAdmin}? Podrá seguir usando la app normalmente, pero ya no va a ver este panel.`)) return;
    try {
      await pedir('/api/admin/administradores', token, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }) });
      cargar();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err instanceof Error ? err.message : 'No se pudo quitar.' });
    }
  };

  return (
    <Tarjeta className="flex flex-col gap-4">
      <div>
        <p className="text-base font-semibold">Quién administra el panel</p>
        <p className="text-sm text-[var(--text-secondary)]">Hoy eres tú. Si más adelante contratas a alguien para que te ayude, agrégala aquí — va a ver exactamente este mismo panel.</p>
      </div>
      <div className="flex flex-col divide-y divide-[var(--border-suave)]">
        {administradores === null && <p className="py-2 text-sm text-[var(--text-secondary)]">Cargando…</p>}
        {administradores?.map((a) => (
          <div key={a.userId} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="text-base font-semibold">
                {a.nombre} {a.userId === soyYo && <span className="font-normal text-[var(--text-secondary)]">(tú)</span>}
              </p>
              <p className="truncate text-sm text-[var(--text-secondary)]">{a.correo}</p>
            </div>
            {a.userId !== soyYo && (
              <button type="button" onClick={() => void quitar(a.userId, a.nombre)} className="shrink-0 text-sm font-medium text-[var(--danger)] underline [touch-action:manipulation]">
                Quitar acceso
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2 border-t border-[var(--border-suave)] pt-4 sm:flex-row">
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" className="h-11 flex-1 rounded-[var(--radius-button)] border-2 border-[var(--border-ui)] bg-[var(--bg)] px-3 text-base outline-none focus:border-[var(--accent)]" />
        <input value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="correo@ejemplo.com" type="email" className="h-11 flex-1 rounded-[var(--radius-button)] border-2 border-[var(--border-ui)] bg-[var(--bg)] px-3 text-base outline-none focus:border-[var(--accent)]" />
        <button
          type="button"
          onClick={() => void agregar()}
          disabled={enviando || !correo.trim() || !nombre.trim()}
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] px-5 text-base font-semibold text-[var(--bg)] active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100 [touch-action:manipulation]"
        >
          {enviando ? 'Agregando…' : 'Agregar administradora'}
        </button>
      </div>
      {mensaje && <p className={`text-sm font-medium ${mensaje.tipo === 'error' ? 'text-[var(--danger)]' : 'text-[var(--accent)]'}`}>{mensaje.texto}</p>}
    </Tarjeta>
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
