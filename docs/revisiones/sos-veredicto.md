# VEREDICTO revisor-visual — SOS
Fecha: 2026-10-02 00:00
Screenshot: docs/revisiones/sos-375.png
Usabilidad: 36/40
Craft: 17/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: LISTA
Top defectos:
1. [TarjetaVeterinario, Sos.tsx linea 92-99] Borde-gradiente de la tarjeta "Tu veterinario" usa un estilo inline a mano (60% acento) en vez de la clase compartida .borde-degradado (40%) que usa el resto de la app (Hoy, Perros, Yo, Historial, Paywall, Landing) -> extraer una variante con nombre (ej. .borde-degradado-fuerte) en globals.css y reutilizarla, para que quede como variante deliberada del sistema y no como un valor suelto.
2. [Lista de situaciones, card "Atragantamiento"] El borde rojo izquierdo (border-l-4 border-l-[--danger]) en las 7 tarjetas es decorativo y constante en todas -> no transmite distinto nivel de urgencia entre situaciones (ej. convulsiones vs intoxicacion leve); usarlo para codificar el nivel de triage de cada situacion le daria funcion ademas de ornamento.
3. [Detalle de situacion, seccion "Qué evitar"] Esta seccion no tiene borde ni sombra (solo fondo ambar tenue), mientras "Señales de alarma" sí tiene borde+sombra y "Ve al veterinario si..." solo fondo -> tres tratamientos de "superficie" distintos para secciones del mismo nivel jerarquico; unificar si llevan borde o no.
4. [Card veterinario sin telefono, borde punteado] El dash pattern se ve ligeramente irregular en las esquinas redondeadas (rounded-[var(--radius-card)] con border-dashed) -> validar en navegador real que el dash no se deforme en las esquinas a 24px de radio.
5. [Dato menor] El ícono "avanzar" (flecha verde) en las tarjetas de situaciones y el ícono "Ver niveles" (chevron teal) comunican la misma idea ("hay más/avanzar") con dos estilos visuales distintos (circulo relleno vs chevron solo) -> no es un error pero es una pequeña divergencia de vocabulario visual entre afordances similares.
