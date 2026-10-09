# VEREDICTO revisor-visual — onboarding
Fecha: 2026-10-08 00:00
Screenshot: docs/revisiones/onboarding-1-nombre-375.png (serie: 1-nombre, 2-olvidos, 3-prioridad, 4-med-stock)
Usabilidad: 36/40
Craft: 18/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: LISTA

Top defectos:
1. [Onboarding.tsx paso "med", líneas 535-537] Sin indicador visual de que hay más contenido bajo el fold (chips de frecuencia/hora/stock) cuando el contenido excede el viewport → agregar una sombra/chevron sutil arriba de la barra sticky como pista de scroll.
2. [Onboarding.tsx, heurística 7 flexibilidad] Único atajo es Enter en el campo nombre; ninguna ficha preselecciona el valor más común (p. ej. "Noche" en momento del medicamento) → bajo impacto, mejora opcional para usuarios repetidores.
3. [Onboarding.tsx líneas 416-420, eje 2 profundidad] El mesh radial de fondo quedó al 8% de opacidad, casi imperceptible a simple vista en el screenshot → aporta menos profundidad real que el resto de la app; subir ligeramente la opacidad sin perder la calma.

Defectos de rondas anteriores confirmados RESUELTOS: título de "olvidos" ahora usa la misma clase `titulo` (text-3xl) que el resto de pasos (consistencia, antes defecto #1) · fondo con mesh radial sutil agregado (antes defecto #4, plano). Ambos verificados en código (líneas 505 y 416-420) y en el screenshot.
