'use client';

// Acceso: correo + enlace de acceso (sin contraseñas que recordar). El envío real se conecta con
// Supabase en la etapa de servicios externos; hasta entonces el estado es honesto (lib/auth.ts).

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CONDICIONES } from '@/lib/oferta';
import { correoValido, enviarEnlaceDeAcceso } from '@/lib/auth';

type Estado = { tipo: 'reposo' } | { tipo: 'enviando' } | { tipo: 'error'; texto: string } | { tipo: 'enviado' };

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [estado, setEstado] = useState<Estado>({ tipo: 'reposo' });

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correoValido(correo)) {
      setEstado({ tipo: 'error', texto: 'Revisa el correo: parece que falta algo.' });
      return;
    }
    setEstado({ tipo: 'enviando' });
    const r = await enviarEnlaceDeAcceso(correo);
    if (r.ok) setEstado({ tipo: 'enviado' });
    else
      setEstado({
        tipo: 'error',
        texto:
          r.motivo === 'no_configurado'
            ? `El acceso a la app se activa pronto. Si ya pagaste, escríbenos a ${CONDICIONES.contacto} y te avisamos apenas esté listo.`
            : 'Revisa el correo: parece que falta algo.',
      });
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-8 pt-4 text-[var(--text-primary)] [font-family:var(--font-body)]">
      <Link href="/" className="inline-flex size-11 items-center justify-center rounded-full text-[var(--text-secondary)]" aria-label="Volver al inicio">
        <ArrowLeft size={22} aria-hidden="true" />
      </Link>
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
            aria-invalid={estado.tipo === 'error'}
            aria-describedby="mensaje"
            placeholder="nombre@correo.com"
            className="h-14 w-full rounded-[var(--radius-card)] border-2 border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] bg-[var(--surface)] px-4 text-lg outline-none focus:border-[var(--accent)]"
          />
          <button
            type="submit"
            disabled={estado.tipo === 'enviando'}
            className="mt-2 inline-flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-lg font-semibold text-[var(--bg)] shadow-[var(--shadow-2)] disabled:opacity-40 [touch-action:manipulation]"
          >
            {estado.tipo === 'enviando' ? 'Enviando…' : 'Enviarme el enlace'}
          </button>
          <p id="mensaje" role="status" className={`text-base ${estado.tipo === 'error' ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
            {estado.tipo === 'error' && estado.texto}
            {estado.tipo === 'enviado' && 'Listo. Revisa tu correo y toca el enlace.'}
          </p>
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
