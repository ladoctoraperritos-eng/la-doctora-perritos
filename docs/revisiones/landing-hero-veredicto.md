# VEREDICTO revisor-visual — landing-hero
Fecha: 2026-10-08 00:00
Screenshot: docs/revisiones/landing-hero-375.png
Usabilidad: 33/40
Craft: 16/20
Copy (si vende): 19/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA

Detalle usabilidad: h1:3 h2:4 h3:3 h4:4 h5:3 h6:4 h7:2 h8:4 h9:3 h10:3
Detalle craft: jerarquía:4 profundidad:3 identidad:3 movimiento:3 encaje:3
Detalle copy: idea:4 especificidad:3 emoción:4 oferta:4 acción:4

Gate: requiere ≥36/40 usabilidad Y ≥16/20 craft. Usabilidad 33/40 no alcanza el umbral → NO LISTA (craft sí pasa, 16/20).

Top defectos:
1. [Hero.tsx L121-134, marco del teléfono en el screenshot] El radio del frame del producto es 32px hardcodeado, mientras el resto de la landing usa --radius-card (22px) → mismo radio en toda la pantalla roto (eje encaje). Fix: usar var(--radius-card) o escalar el borde del frame a ≤26px para quedar dentro de ±4px de la familia.
2. [Hero.tsx L102, titular en el screenshot] El H1 sigue en 3 líneas a 375px tras el ajuste a 32px — sigue empujando el CTA hacia abajo del primer vistazo. Fix: recortar el copy marcado a ≤7 palabras antes del acento o bajar a 28px/leading 1.05 en mobile para forzar 2 líneas.
3. [components/landing/ui.tsx L160-169 + Hero.tsx, flujo completo] No hay mecanismo de flexibilidad/atajo (ej. recordar plan elegido, anclas de teclado) verificable en el código de la landing — aceptable para una página de venta, pero mantiene h7 bajo (2/4) y arrastra el total de usabilidad por debajo del gate de 36/40 junto con h1/h3/h5/h9/h10 en 3.
4. [Header del hero, screenshot] El único dispositivo ownable visible fuera del marco del teléfono es el avatar circular de 40px junto al nombre; no hay hairline degradé ni textura en el propio hero (solo dentro del mockup) → identidad se siente intercambiable en la mitad superior de la pantalla. Fix: agregar 1 hairline degradé bajo el header o un detalle de textura cerca del CTA.
5. [Hero.tsx L106-108, subtítulo] Subtítulo correcto en contenido pero su contraste secundario (#5A6A65) frente al bold del H1 crea un salto de peso visual brusco entre nivel 2 y 3 — no es roto, pero un ojo entrenado lo nota (afecta eje jerarquía marginalmente, no bajó el puntaje esta vez).
