# VEREDICTO revisor-visual — Panel de administración
Fecha: 2026-10-08 00:00
Screenshot: docs/revisiones/admin-375.png
Usabilidad: 29/40
Craft: 13/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [Carga inicial, toda la pantalla] Solo texto "Cargando…" centrado, sin skeleton con la forma de las tarjetas → construir skeleton de Dato/Tarjeta mientras llega /api/admin/resumen y /usuarios.
2. [Sección Usuarios y Sección Salud y errores] Listas sin paginación, orden ni exportación (código: usuarios.filter sin límite, errores.recientes.slice(0,10) fijo) → agregar orden por fecha/actividad y paginación antes de que pase de ~15-20 filas.
3. [Header y toda la pantalla] Identidad apoyada solo en DM Serif Display + color de acento, sin el dispositivo ownable de la ficha (hairline degradado, campana del logo) → sumar un hairline degradé o el ícono de campana en el header.
4. [Sección "Ventas y negocio" vs. los 3 avisos iniciales] El bloque SinDatosLista repite palabra por palabra lo que ya dicen los avisos de arriba ("no usa inteligencia artificial todavía, así que no hay costo que medir" aparece dos veces) → unificar en un solo lugar, no repetir el mismo texto en avisos y en la sección.
5. [Los 3 avisos antes de las cifras reales] La dueña tiene que leer 3 cajas de aviso (ok + 2 info) antes de llegar a cualquier número real de Usuarios → colapsar los avisos informativos no urgentes en una sola línea o moverlos bajo las cifras.
