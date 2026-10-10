# VEREDICTO revisor-visual — Hoy
Fecha: 2026-10-09 00:00
Screenshot: docs/revisiones/hoy-375.png
Usabilidad: 28/40
Craft: 16/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. Banner de mascota (tarjeta teal "Toffee / Sus cuidados de hoy") muestra siempre al primer perro (e.perros[0]) cuando no hay filtro activo, pero la tarjeta "Siguiente cuidado" justo debajo es de Luna (Condroitina) — mezcla de mascotas sin explicación visible, confunde de qué perro trata la pantalla → mostrar el banner del perro dueño de `siguiente` (o quitar el banner cuando hay varias mascotas sin filtrar).
2. FICHA-ARTE.md especifica que `--font-serif` va en el titular de Home "Todo su cuidado, en un lugar"; el código actual lo renderiza como label sans-serif de 12px (línea ~580, sin font-serif) — desvío real entre ficha y pantalla, ficha no actualizada → sincronizar FICHA-ARTE.md con el tratamiento nuevo (o restaurar el serif a menor peso).
3. La pantalla sigue apilando 9+ bloques distintos (saludo, progreso, selector de mascotas, banner, siguiente cuidado, pendientes, urgencias, hecho hoy, próximamente) antes de terminar el recorrido — carga visual alta pese a la fusión de Atrasados/Siguientes → evaluar mover Urgencias a navegación fija o separar Hecho hoy/Próximamente de la vista principal.
4. Cero atajo para completar varios cuidados a la vez (solo tap uno por uno); eficiencia limitada en días con muchos pendientes, documentado como pendiente pero sigue sin resolver → agregar "marcar todos" o swipe-to-done en sesión futura.
5. Redundancia temática residual (no numérica): "3 por hacer hoy" (hero), "Sus cuidados de hoy" (banner) y "Siguiente cuidado" (tarjeta) repiten el mismo concepto en los primeros 700px → variar el copy del banner con información nueva (p. ej. nombre del próximo cuidado).
