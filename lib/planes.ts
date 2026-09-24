// Planes por número de perros (decisión de precio en ESTADO.md, 2026-09-23). Mismas funciones; cambia el tope de perros.
import type { IdPlan } from './onboarding';

export const PLANES = {
  esencial: {
    etiqueta: '1 o 2 perros',
    nombre: 'Esencial',
    dia: 'US$0,08',
    mensual: 'US$2,99',
    anualTotal: 'US$29',
    anualMes: 'US$2,42',
    perros: 'Hasta 2 perros',
  },
  familia: {
    etiqueta: '3 a 5 perros',
    nombre: 'Familia',
    dia: 'US$0,13',
    mensual: 'US$4,99',
    anualTotal: 'US$49',
    anualMes: 'US$4,08',
    perros: 'Hasta 5 perros',
  },
} as const satisfies Record<IdPlan, object>;

export const featuresPlan = (perros: string) => [
  'Avisos de medicamentos, comida y vacunas',
  perros,
  'Hasta 3 tutores: quién hizo qué',
  'Resumen para el veterinario y datos exportables',
];
