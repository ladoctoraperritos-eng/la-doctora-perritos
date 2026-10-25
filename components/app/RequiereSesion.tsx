'use client';

// Puerta de entrada a la app: sin sesión real, manda a /login en vez de dejar ver la cuenta de
// ejemplo (datos inventados, pero usable como si fuera una cuenta de verdad) — nadie debería poder
// abrir la app completa sin haber iniciado sesión, pagado o no.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clienteSupabase } from '@/lib/supabase';

export default function RequiereSesion({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [estado, setEstado] = useState<'revisando' | 'con_sesion'>('revisando');

  useEffect(() => {
    let vivo = true;
    const c = clienteSupabase();
    if (!c) {
      // Sin Supabase configurado (solo pasa en desarrollo local sin claves): se deja pasar.
      setEstado('con_sesion');
      return;
    }
    void c.auth.getSession().then(({ data }) => {
      if (!vivo) return;
      if (data.session) setEstado('con_sesion');
      else router.replace('/login');
    });
    return () => {
      vivo = false;
    };
  }, [router]);

  if (estado === 'revisando') return null;
  return <>{children}</>;
}
