# VEREDICTO revisor-visual — admin
Fecha: 2026-10-08 00:00
Screenshot: docs/revisiones/admin-375.png
Usabilidad: 36/40
Craft: 17/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): FIEL
Veredicto: LISTA
Top defectos:
1. [Formulario "Agregar una persona a mano"] el input de correo solo valida con type="email" del navegador, sin mensaje de error inline antes del submit → agregar validación visible al perder foco con mensaje "Escribe un correo válido".
2. [Mensajes de error genéricos, ej. pedir()] el fallback "Algo falló." no dice qué hacer más allá de "Reintentar" → dar 1 línea de causa probable (ej. "No se pudo conectar. Revisa tu internet y vuelve a intentar").
3. [Atajo "/"] solo cubre saltar a Usuarios+foco en buscador; no hay atajo de "Escape" para volver/cerrar ni indicio visible del atajo fuera del placeholder del input → opcional, documentarlo también en un tooltip o pie de página si se amplía el set de atajos.
4. [Sección Inicio, header] "Volver a la app" y "Salir" conviven con el contenido de la sección sin separación visual fuerte del resto de acciones de cada tarjeta → bajo impacto, mantener vigilancia si se agregan más acciones de header.
5. [Nav mobile] el scroll horizontal con 10 secciones depende del degradé lateral para insinuar que hay más — un usuario apurado podría no notar "Configuración" al final → considerar un indicador de página (dots) o flecha explícita en mobile.
