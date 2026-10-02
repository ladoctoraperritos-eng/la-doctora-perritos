# VEREDICTO revisor-visual — SOS
Fecha: 2026-10-02 00:00
Screenshot: docs/revisiones/sos-375.png
Usabilidad: 31/40
Craft: 15/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [Pantalla de detalle, p.ej. "Golpe de calor"] Sin teléfono de veterinario guardado, el botón "Llamar a tu veterinario" directamente NO EXISTE en el detalle (Sos.tsx L216-225 renderiza condicional a `telefono`) — en una emergencia real el usuario queda sin salida rápida y debe volver a la lista para cargarlo → mostrar siempre un CTA de llamada (al vet guardado si existe, o a una línea de emergencia/CTA "Agregar teléfono" con el mismo peso visual) en el detalle.
2. [Lista "¿Qué pasó?"] 7 situaciones en una sola lista sin agrupar por nivel de urgencia, mientras la sección "¿Qué tan urgente es?" (con esa misma clasificación) vive aparte y más abajo — el usuario en pánico no puede escanear qué es más grave de un vistazo → ordenar/agrupar las tarjetas por nivel de triage (emergencia primero) o agregar un indicador de color por card.
3. [Card "Qué hacer" en detalle] El `borde-degradado` (hairline) declarado en código no se percibe en el screenshot — la tarjeta se ve como una card blanca más, igual a "Señales de alarma" — pierde la jerarquía de "esto es lo más importante" que el copy ya le da con el color de acento en el título → subir el contraste del degradado o reforzar con un fondo ligeramente teñido.
4. [Lista, arriba del fold] Banner de aviso legal (rosa) + card punteada "Guarda el teléfono…" compiten por atención antes de llegar al contenido accionable ("¿Qué pasó?") — dos bloques de igual peso visual sin jerarquía entre sí → bajar el peso del aviso legal (más chico/gris) y dejar el acento solo en la acción de guardar el teléfono.
5. [Íconos de las tarjetas de situación] El ícono (sirena) es el mismo para las 7 situaciones — no ayuda a diferenciar/reconocer de un vistazo cuál es cuál (heurística 6, reconocer vs recordar) → usar un ícono distinto por tipo de emergencia (asfixia, convulsión, intoxicación, herida, calor, paro, atasco).
