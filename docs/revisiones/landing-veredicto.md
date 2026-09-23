# VEREDICTO revisor-visual — Landing (La Doctora Perritos)
Fecha: 2026-09-23 00:00
Screenshot: docs/revisiones/landing-375-01.png (más 02-13 y landing-375-completa.png)
Usabilidad: 30/40
Craft: 13/20
Copy (si vende): 15/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA

## Desglose
- Usabilidad: h1:3 h2:3 h3:3 h4:3 h5:3 h6:3 h7:3 h8:2 h9:2 h10:3 (h3/h7 verificados en código: acordeón con button+aria-expanded, carousel con dots aria-current, sticky CTA, reduced-motion en ui.tsx).
- Craft: jerarquía:3 profundidad:3 identidad:2 movimiento:3 encaje:2.
- Copy: idea:3 especificidad:2 emoción:3 oferta:4 acción:3 = 15/20. Eje especificidad <=2 => se corrige aunque el total pase; el total ya no llega a 16.
- Sub-checks: garantía nombrada y con plazo cerca del CTA (Garantía del Primer Aviso, 15 días): SÍ. Énfasis en titulares (bold + palabra en acento): SÍ. Message-match: NO VERIFICABLE (no hay dato del anuncio de origen).

## Contrastes medidos (WCAG, hex de tokens.css)
| Par | Ratio | Resultado |
|---|---|---|
| text-primary #22302c / bg #f4f7f6 | 12.76 | OK |
| text-secondary #5a6a65 / bg | 5.29 | OK |
| text-secondary / surface-2 #e6eeec | 4.83 | OK (justo) |
| text-tertiary #566661 / bg | 5.62 | OK |
| text-tertiary / surface-2 | 5.13 | OK |
| accent #0b5f5a / bg (texto y CTA) | 6.96 | OK, CTA >=3:1 |
| accent / surface-2 | 6.36 | OK |
| accent-on-dark #7cd1c6 / #22302c (CTA final) | 7.72 | OK |
| texto del botón final #22302c / #7cd1c6 | 7.72 | OK |
| coral #e8896b / bg (solo decorativo: ícono/check) | 2.37 | No se usa como texto; aceptable, no sirve para texto |
Nota de ficha: text-secondary en tokens (#5a6a65) difiere de la ficha (#5F706B); desvío leve y más oscuro (más legible), pero no coincide con la ficha.

## Gate de carga cognitiva / escaneabilidad (mobile 375)
- Bloques >4 líneas seguidas: Big Idea de Solución (4 líneas a 17px, borderline) y Garantía (4 líneas centradas). Ninguno pasa de 4. OK justo.
- Dolores con ícono (5, Problema), pasos con número 01-03, beneficios con check SVG: SÍ. Sin emojis.
- Agitación: 3 párrafos seguidos sin ícono ni visual (~8 líneas de texto suelto) antes de las cajas. Falla la regla de densidad visual.
- Prueba del solo-titulares: se entiende (problema, mecanismo, precio, garantía, FAQ); el flujo se sostiene.
- Respiro: correcto entre secciones. FAQ acordeón: SÍ. Pricing y garantía en cajas: SÍ. Ritmo de fondos: alterna bg/surface, pero Problema y Agitación se funden en el mismo plano blanco (02 y 03).
- Fallas del gate: 2 de 8 (CTAs repetidos que rozan "una acción primaria" y agitación sin visual); no llega a sobrecarga crítica.

## Tabla sección -> estado -> defecto accionable
| Sección | Estado | Defecto accionable |
|---|---|---|
| 01 Hero + header | ❌ | Logo del header es un cuadrado teal vacío (sin marca); la franja de prueba parte "7 días gratis" en una línea huérfana y repite lo que ya dice el CTA; "Entrar" va a /empezar, igual que el CTA (engaña a quien ya tiene cuenta). Corregir: logo real, franja en una línea o solo "+33 mil seguidores en TikTok", "Entrar" a /login. |
| 02 Problema | ✅ | 5 dolores con ícono, en lenguaje literal de la ficha. Funde su fondo con la sección 03. |
| 03 Agitación | ❌ | 3 párrafos de puro texto sin ícono/visual; misma "caja" gris tenue para Hoy que para el fondo. Añadir ícono por frase o convertir en 3 filas con chip; diferenciar el fondo de 02. |
| 04 Solución/mecanismo | ✅ | Bien: número 01-03, píldora del mecanismo, antes/después. Big Idea en 4 líneas: recortar a 3. |
| 05 CTA intermedio | ❌ | Botón suelto sin microcopy de riesgo (cancela cuando quieras / garantía) y a un scroll del CTA del carrusel: dos CTAs consecutivos. Quitar uno o añadir microcopy. |
| 06 App por dentro | ❌ | Primer frame repite la misma captura del hero (nada nuevo al ojo); los otros 3 quedan ocultos tras swipe con solo un borde asomado. Mostrar frame distinto primero o el hero con otra pantalla. |
| 07 Oferta | ✅ | Stack, ancla US$57 tachado, anual/mes/día, badge, cajas. Mejorable: 6 features en anual y 5 en mensual repiten lo mismo (recortar a 4); "3 meses gratis" flotando sin caja. |
| 08 Garantía | ✅ | Nombre + plazo + institución. La línea del candado queda desalineada (ícono a la izquierda, texto centrado). |
| 09 CTA intermedio | ❌ | Tercer CTA suelto, sin microcopy, pegado a la garantía y a la FAQ; el botón se repite 7 veces en la página (incluido sticky). |
| 10 FAQ | ✅ | Acordeón real con aria-expanded y filas táctiles altas. |
| 11 CTA final | ✅ | Bloque oscuro con contraste 7.7:1, future pacing, recap. El PS repite casi literal la garantía ya vista dos veces. |
| 12 Footer legal | ❌ | Los enlaces se parten en dos filas con un separador "·" huérfano al inicio de "Reembolsos"; logo del footer es un cuadrado gris vacío. Usar wrap con separadores CSS o lista vertical. |
| 13 Aviso legal | ✅ | Legible (13px+ y contraste OK), en caja. Pegado a un footer que ya dice algo similar. |

## Top 5 defectos
1. [Global] Identidad ownable ausente: la ficha promete "duotone de marca en la foto del perro" y no hay ni una foto de perro ni de persona en toda la página; solo teal + DM Sans + capturas de UI. Intercambiable con cualquier app de salud. Fix: fotografía duotone de Toffee en hero y CTA final.
2. [Footer 12 / Header 01] Marca vacía y separadores rotos: cuadrados teal/gris sin logo en header y footer, enlaces legales con "·" huérfano tras el salto de línea. Fix: logo real y enlaces sin separadores sueltos.
3. [Global CTAs 01/05/06/07/09/11 + sticky] El mismo botón aparece ~7 veces y en 05/09 sin microcopy de riesgo ni contexto; 05 y 06 son CTAs consecutivos. Fix: dejar hero, oferta, final y sticky; los intermedios con "Cancela cuando quieras" o eliminarlos.
4. [Copy, especificidad] Prueba mínima: solo "+33 mil seguidores" en 13px. Sin testimonio (prohibido inventar), sin número del producto; la Guía de US$9 se valora sin prueba. Fix: pedir frases reales en TikTok (como indica la ficha) y mostrarlas; mientras tanto reforzar con la demo de capturas.
5. [Agitación 03 / hero 06] Agitación es una pared de texto sin visual y comparte plano con el problema; el carrusel abre con la misma captura del hero. Fix: chips/íconos por frase, fondo distinto, y otra pantalla como primer frame.
