# VEREDICTO revisor-visual — hoy
Fecha: 2026-10-06 00:00
Screenshot: docs/revisiones/hoy-375.png
Usabilidad: 26/40
Craft: 13/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): FIEL
Veredicto: NO LISTA

Detalle usabilidad: h1:3 h2:3 h3:2 h4:2 h5:3 h6:3 h7:2 h8:2 h9:3 h10:3
Detalle craft: jerarquia:2 profundidad:3 identidad:3 movimiento:2 encaje:3

Fidelidad: 1 desvio de 6 como maximo (no alcanza el umbral de INFIEL). Coinciden marfil, petroleo, sage, serif DM Serif en titulo y nombre, radios de tarjeta y sombra suave. Los 5 destinos de navegacion, el relleno rosado de Urgencias y la presencia de «Siguiente cuidado» son decision de la usuaria o estructura aprobada y no cuentan.

Top defectos (priorizados; archivo: components/app/Hoy.tsx):
1. [Atrasados, fila «Vacuna anual» (vencida)] Marcar como hecho pasa por hacerVencida (linea 397) y el deshacer solo vive 6 s en el toast (linea 390). Pasado ese tiempo la vacuna no se puede revertir desde la pantalla. Fix: incluir las vencidas en «Hecho hoy» con su boton Deshacer persistente, igual que el resto de cuidados.
2. [Atrasados, filas 1-3] Conviven dos componentes con layouts distintos en la misma lista: FilaPendiente (lineas 238-264, casilla dentro de todo el boton) y FilaFutura (lineas 313-333, casilla de 44 px separada, sin hora). Visualmente no se leen como una misma familia. Fix: un unico componente de fila para Atrasados con casilla circular a la derecha y la misma geometria en ambos casos.
3. [Acciones rapidas, bajo la tarjeta de Urgencias] «Historial» y «Mascotas» en pildoras (lineas 530-539) duplican los destinos de la barra inferior y usan rounded-full, mientras los controles de la ficha son de 16 px (lineas 531 y 535). Fix: eliminar la fila de pildoras o dejarla solo como enlace de contexto con radius-button.
4. [Tarjeta «Siguiente cuidado», linea 229] El CTA usa bg-[image:var(--accent-gradient)] y la ficha de la actualizacion 2026-10-06 pide acento petroleo plano, sin degradé. Fix: cambiar a bg-[var(--accent)] y quitar el degradé del CTA.
5. [Cabecera y tarjeta, lineas 447, 214, 222, 373] La jerarquia usa mas tamanos de los tres permitidos (text-3xl, text-xl, text-lg, text-base y text-sm). El progreso es una barra (linea 459), no un anillo, y la cifra heroe «3 por hacer hoy» no tiene conteo animado. Fix: reducir a tres niveles (display, title, body/label) y animar el conteo y el progreso.

Descartados como defecto (decision de la usuaria o artefacto de captura): relleno rosado de Urgencias; barra inferior fija que aparece sobre la tarjeta en la captura de pagina completa (se evalua en telefono real); ausencia de «Atrasados» en los datos de ejemplo (se evalua el codigo).

Verificado en codigo: undo con toast y «Deshacer» en «Hecho hoy»; role=status en el toast y role=alert en el fallo de guardado; reduced-motion via MotionConfig (linea 424); estados vacio, cargando, sin conexion y fallo de guardado presentes. Atajos de teclado: no hay (h7 bajo).
