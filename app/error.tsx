'use client';

// Error Boundary de Next.js: si algo se rompe en cualquier pantalla, esto se muestra en vez de una
// pantalla en blanco, y el error queda registrado en `error_log` para que el panel de administración
// lo vea (docs/sistema/21-BACKOFFICE.md). El cliente solo puede INSERTAR su propio error (RLS).

import { useEffect } from 'react';
import { clienteSupabase } from '@/lib/supabase';

export default function ErrorBoundary({ error }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    const supabase = clienteSupabase();
    if (!supabase) return;
    void supabase.auth.getUser().then(({ data }) => {
      void supabase.from('error_log').insert({
        mensaje: error.message || 'Error sin mensaje',
        contexto: typeof window !== 'undefined' ? window.location.pathname : undefined,
        user_id: data.user?.id ?? null,
      });
    });
  }, [error]);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-4 px-6 text-center text-[var(--text-primary)] [font-family:var(--font-body)]">
      <h1 className="text-2xl font-semibold leading-tight">Algo no cargó bien</h1>
      <p className="text-base text-[var(--text-secondary)]">No fue tu culpa. Ya quedó anotado para revisarlo.</p>
      <button
        type="button"
        onClick={() => location.reload()}
        className="inline-flex h-12 items-center rounded-[var(--radius-button)] bg-[var(--accent)] px-6 text-base font-semibold text-[var(--bg)] [touch-action:manipulation]"
      >
        Volver a intentar
      </button>
    </div>
  );
}
