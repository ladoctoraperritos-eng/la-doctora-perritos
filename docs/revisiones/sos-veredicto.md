# VEREDICTO revisor-visual — SOS
Fecha: 2026-10-02 00:00
Screenshot: docs/revisiones/sos-375.png
Usabilidad: 27/40
Craft: 14/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [TarjetaVeterinario con teléfono guardado, Sos.tsx L95 y L102] Los botones circulares de "editar" y, sobre todo, "llamar" al veterinario (los que se usan cuando YA hay teléfono guardado, el camino normal tras la primera vez) NO tienen `transition`/`active:scale` — a diferencia del CTA "Llamar a..." del Detalle (L260) que sí lo tiene. Justo el botón de llamar en una emergencia real no da ninguna señal al tocarlo → agregar `transition-transform duration-150 active:scale-[0.95]` a ambos círculos (L95 y L102).
2. [Triage toggle L51 y botón "SOS" de volver en Detalle L194] Mismo patrón de inconsistencia: ningún `active:scale` pese a que otros botones de la MISMA pantalla sí lo tienen (FilaSituacion, CTA de llamar, CTA dashed) — un usuario que toca varios controles en la misma vista percibe que unos responden y otros no → unificar la transición de tap en TODOS los elementos tocables del archivo, no solo en los 2 que señaló la ronda anterior.
3. [Cobertura de verificación] Ambos screenshots entregados muestran la tarjeta de veterinario en estado "SIN teléfono" (dashed) — ninguno muestra el estado "CON teléfono" que es donde viven el fix de identidad (`borde-degradado`, L89) y los botones de editar/llamar del defecto #1. No se pudo confirmar visualmente ese fix, solo por código → recapturar un screenshot con un veterinario ya guardado antes de la próxima ronda.
4. [Barra de navegación inferior] El ícono activo "SOS" (sirena ilustrada a color, con detalle y sombreado) tiene mucho más peso visual que los íconos de línea simple de Hoy/Mascotas/Historial/Yo → mismo componente, tratamientos gráficos distintos; nivelar el estilo de los 5 íconos de nav.
5. [FilaSituacion, tarjetas de "¿Qué pasó?"] El borde izquierdo grueso de acento (`border-l-4`) sobre el radio general de la tarjeta recorta visualmente las esquinas izquierdas de forma distinta a las derechas — el radio no se percibe idéntico en las 4 esquinas de la misma tarjeta (ojo entrenado).

Progreso vs. ronda anterior: los 5 defectos de la ronda 2 están resueltos tal como se describieron (triage colapsado, CTA dashed unificado en rojo, validación de teléfono, active:scale en los 2 botones señalados, borde-degradado agregado en código). Pero la corrección de "active:scale" se aplicó de forma puntual a los 2 botones citados y no se extendió al resto de controles tocables de la misma pantalla, generando una inconsistencia de feedback que un usuario nota sin buscarla (defectos 1 y 2 de esta ronda). Usabilidad y craft se mantienen por debajo del gate de cierre (36/40 y 16/20).
