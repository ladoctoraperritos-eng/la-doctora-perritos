'use client';

// Acceso: correo + enlace de acceso (sin contraseñas que recordar). El envío real se conecta con
// Supabase en la etapa de servicios externos; hasta entonces el estado es honesto (lib/auth.ts).

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CONDICIONES } from '@/lib/oferta';
import Marca from './Marca';
import { correoValido, enviarEnlaceDeAcceso } from '@/lib/auth';

type Estado =
  | { tipo: 'reposo' }
  | { tipo: 'enviando' }
  | { tipo: 'correo_invalido'; texto: string }
  | { tipo: 'sistema'; texto: string }
  | { tipo: 'enviado' };

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [estado, setEstado] = useState<Estado>({ tipo: 'reposo' });
  const [aceptaLegal, setAceptaLegal] = useState(false);
  const [intento, setIntento] = useState(false);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correoValido(correo)) {
      setEstado({ tipo: 'correo_invalido', texto: 'Revisa el correo: parece que falta algo.' });
      return;
    }
    if (!aceptaLegal) {
      setIntento(true);
      return;
    }
    setEstado({ tipo: 'enviando' });
    const r = await enviarEnlaceDeAcceso(correo);
    if (r.ok) setEstado({ tipo: 'enviado' });
    else if (r.motivo === 'no_configurado')
      setEstado({ tipo: 'sistema', texto: 'El acceso a la app se activa pronto. Todavía no podemos enviarte el enlace.' });
    else if (r.motivo === 'error_envio')
      setEstado({ tipo: 'sistema', texto: 'No pudimos enviar el enlace en este momento. Intenta de nuevo en unos minutos.' });
    else setEstado({ tipo: 'correo_invalido', texto: 'Revisa el correo: parece que falta algo.' });
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-8 pt-4 text-[var(--text-primary)] [font-family:var(--font-body)]">
      <div className="flex items-center gap-2">
        <Link href="/" className="inline-flex size-11 items-center justify-center rounded-full text-[var(--text-secondary)]" aria-label="Volver al inicio">
          <ArrowLeft size={22} aria-hidden="true" />
        </Link>
        <Marca />
      </div>
      <main className="flex flex-1 flex-col pt-8">
        <h1 className="text-3xl font-bold leading-tight">Entrar a tu cuenta</h1>
        <p className="mt-2 text-base text-[var(--text-secondary)]">Te enviamos un enlace al correo. Sin contraseñas que recordar.</p>

        <form onSubmit={enviar} noValidate className="mt-8 flex flex-col gap-3">
          <label htmlFor="correo" className="text-base font-semibold">
            Tu correo
          </label>
          <input
            id="correo"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            aria-invalid={estado.tipo === 'correo_invalido'}
            aria-describedby="mensaje"
            placeholder="nombre@correo.com"
            className="h-14 w-full rounded-[var(--radius-card)] border-2 border-[color-mix(in_oklab,var(--text-tertiary)_70%,transparent)] bg-[var(--surface)] px-4 text-lg outline-none focus:border-[var(--accent)]"
          />
          <label className="flex items-start gap-3">
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
          {intento && !aceptaLegal && <p role="alert" className="text-sm font-semibold text-[var(--text-primary)]">Marca la casilla para continuar.</p>}
          <button
            type="submit"
            disabled={estado.tipo === 'enviando'}
            className="mt-2 inline-flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] bg-[image:var(--accent-gradient)] text-lg font-semibold text-[var(--bg)] shadow-[var(--shadow-2)] active:scale-[0.98] disabled:bg-[image:none] disabled:bg-[var(--surface-2)] disabled:text-[var(--text-secondary)] disabled:shadow-none [touch-action:manipulation]"
          >
            {estado.tipo === 'enviando' ? 'Enviando…' : 'Enviarme el enlace'}
          </button>
          <div id="mensaje" role={estado.tipo === 'reposo' || estado.tipo === 'enviando' ? undefined : 'alert'} aria-live="polite">
            {estado.tipo === 'correo_invalido' && (
              <p className="rounded-[var(--radius-button)] border-2 border-[var(--accent)] bg-[var(--surface)] p-3 text-base font-semibold">{estado.texto}</p>
            )}
            {estado.tipo === 'sistema' && (
              <p className="rounded-[var(--radius-button)] bg-[var(--surface-2)] p-3 text-base">
                {estado.texto} Para cualquier duda escríbenos a{' '}
                <a href={`mailto:${CONDICIONES.contacto}`} className="font-semibold text-[var(--accent)] underline underline-offset-4">
                  {CONDICIONES.contacto}
                </a>
                .
              </p>
            )}
            {estado.tipo === 'enviado' && <p className="text-base text-[var(--text-secondary)]">Listo. Revisa tu correo y toca el enlace. Si no lo ves, mira en spam.</p>}
          </div>
        </form>

        <p className="mt-auto pt-8 text-center text-base text-[var(--text-secondary)]">
          ¿Aún no tienes cuenta?{' '}
          <Link href="/onboarding" className="font-semibold text-[var(--accent)] underline underline-offset-4">
            Empieza aquí
          </Link>
        </p>
      </main>
    </div>
  );
}
