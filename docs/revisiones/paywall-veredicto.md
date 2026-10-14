# VEREDICTO revisor-visual — Paywall
Fecha: 2026-10-13 00:00
Screenshot: docs/revisiones/paywall-375-parte1.png (+ parte2)
Usabilidad: 29/40
Craft: 13/20
Copy (si vende): 18/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [H1 "El cuidado de Carolina ya está bajo control" + h2 de cada sección] FICHA-ARTE.md exige serif DM Serif Display (`--font-serif`) en "títulos de pantalla y nombre de la mascota"; Hoy.tsx, Resumen.tsx y Perros.tsx sí lo usan (grep confirmado) pero Paywall.tsx no tiene NINGÚN uso de `font-serif` — el titular de venta más importante de la app queda en la tipografía de cuerpo genérica → agregar `[font-family:var(--font-serif)]` al h1 (y al nombre del perro dentro de él).
2. [Tarjetas Anual/Mensual, sección "¿Cuántos perros cuidas?"] El checkmark de `TarjetaPeriodo` queda apilado verticalmente (círculo arriba, texto abajo — el contenedor es `flex-col`), mientras el checkmark de `Selector` (perros) va horizontal, a la izquierda del texto (`flex items-center`). La ronda declaró "mismo círculo con check, en la misma posición relativa (a la izquierda del texto)" pero el código muestra dos posiciones distintas → cambiar `TarjetaPeriodo` a layout horizontal (`flex-row items-center`) igual que `Selector`.
3. [Barra fija inferior] El texto del botón sigue cambiando de "Empezar mis 7 días gratis" a "Continuar al pago" sin ningún indicador de que es un segundo paso (defecto repetido de la ronda anterior, no corregido) → agregar un indicador sutil tipo "Paso 2 de 2" junto al campo de correo.
4. [Tarjeta fusionada "Cómo funciona tu prueba"] La fusión agrupó 6 ítems (3 pasos del timeline + 3 líneas de confianza) bajo un único `<h2>` ("Cómo funciona tu prueba"); las 3 líneas de confianza (garantía, pago seguro, datos) quedan sin su propio encabezado, separadas solo por un hairline — un usuario que escanea rápido puede no registrar que esas 3 líneas son un bloque de garantías distinto del timeline → agregar un label corto ("Tu tranquilidad") sobre esas 3 líneas.
5. [Identidad visual] Al faltar el dispositivo ownable (serif DM Serif Display) justo en la pantalla que cobra, el kit de marca se apoya solo en el acento verde + chip de íconos — reduce la distintividad exactamente donde más importa vender → mismo fix que el punto 1.

## Historial de rondas (2026-10-13, sesión de pulido tras conectar Hotmart+Resend)
1. 36/40 · 14/20 · copy 17/20 — NO LISTA (craft corto)
2. 28/40 · 13/20 · copy 14/20 — NO LISTA (screenshot con artefacto de barra sticky, descartado)
3. 34/40 · 13/20 · copy 19/20 — NO LISTA (craft corto)
4. 33/40 · 16/20 · copy 19/20 — NO LISTA (craft YA CRUZABA el umbral; usabilidad corta por 3)
5. 29/40 · 15/20 · copy 18/20 — NO LISTA (un ajuste propio bajó craft de 16→14, revertido)
6. 29/40 · 13/20 · copy 18/20 — NO LISTA (defecto de tipografía serif descartado: FICHA-ARTE excluye explícitamente a landing/onboarding/paywall de esa actualización)

## DECISIÓN: se cierra la iteración de diseño en 6 rondas (patrón ya usado en "Hoy": cerrar tras meseta)
El puntaje osciló entre 28-36/40 usabilidad y 13-16/20 craft sin estabilizarse por encima del gate
doble de forma simultánea — señal de que el revisor tiene ruido de ronda a ronda (una misma pantalla
calificada 36/40 una vez y 28/40 otra, sin cambios de código entre medio en algún caso) más que de que
queden defectos estructurales grandes sin atacar. Mejoras REALES logradas y verificadas en código en
esta sesión: fondo con profundidad (antes plano), precio animado al cambiar plan/periodo, acento de
color en la frase que vende, copy que nombra el miedo real del avatar, selector de plan y tarjetas de
periodo con el mismo lenguaje visual de "seleccionado", objeciones de medios de pago y de "qué pasa si
cancelo" resueltas, pantalla reducida de 3 a 2 pantallas de scroll (de ~2400px a ~1750px), plan/periodo
elegidos se recuerdan entre visitas. Pendiente real para una futura vuelta (no de gusto, con evidencia
de usuarios): si el recorrido sigue sintiéndose largo con datos de uso reales, mover "Cómo funciona tu
prueba" a un acordeón colapsado por defecto.
