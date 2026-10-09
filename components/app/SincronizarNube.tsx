'use client';

// Enciende la sincronización con la base de datos al abrir la app. Sin sesión no hace nada: la app
// sigue funcionando con los datos del navegador.

import { useEffect } from 'react';
import { arrancarNube } from '@/lib/sincronizar';

export default function SincronizarNube() {
  useEffect(() => {
    void arrancarNube();
  }, []);
  return null;
}
