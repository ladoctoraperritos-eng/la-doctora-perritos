# VEREDICTO revisor-visual — landing
Fecha: 2026-09-24
Screenshot: docs/revisiones/landing-375-completa.png (+ landing-375-01..13.png)
Usabilidad: 34/40
Craft: 15/20
Copy: 14/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA

## Puntajes
- Usabilidad 34/40 (h1:3 h2:4 h3:3 h4:3 h5:3 h6:4 h7:3 h8:3 h9:3 h10:3). h3/h7/h9 verificados en código: sin salida ni error propios en la landing; el acordeón FAQ y el selector de plan son el único control; el sticky se anima y respeta reduced-motion.
- Craft 15/20 (jerarquía:3 profundidad:2 identidad:3 movimiento:3 encaje:4 → ajustado a 3; ante la duda se baja).
- Copy 14/20 (idea:3 especificidad:2 emoción:3 oferta:4 acción:2).

## Contrastes WCAG (hex de tokens.css)
| Par | Ratio | Resultado |
|---|---|---|
| text-primary #22302c / bg | 12.76 | AA |
| text-secondary #5a6a65 / bg | 5.29 | AA |
| text-secondary / surface-2 | 4.83 | AA (justo) |
| text-tertiary #566661 / surface-2 | 5.13 | AA |
| accent #0b5f5a / bg | 6.96 | AA |
| accent / surface-2 | 6.36 | AA |
| Botón: bg sobre accent | 6.96 | AA (>=3:1 UI) |
| accent-on-dark #7cd1c6 / text-primary | 7.72 | AA (CTA final) |

## Gate de carga cognitiva
- Bloque >4 líneas seguidas: ninguno (Big Idea del mecanismo = 4 líneas, en el límite). OK.
- Dolores con ícono (3, chips SVG), pasos numerados 01-03, beneficios con check SVG: OK.
- Prueba del solo-titulares: se entiende (Te suena → Abres la app → Tu perro todo en orden → cuántos perros → oferta → preguntas). OK.
- FAQ acordeón (6, una abierta): OK. Pricing en cajas (selector + 2 cards): OK. Decisión <=4 opciones: OK.
- Fallas: hero con DOS imágenes apiladas (foto + captura, ~1000px) retrasa el resto; 5 repeticiones del mismo CTA. Gate: 1-2 fallas, no crítico.
- Ritmo de fondos: FALLA. bg #f4f7f6 vs surface #fdfefd son casi idénticos; en la captura completa Problema, Mecanismo, App, Plan, Oferta y FAQ se funden en un mismo plano casi blanco; solo el CTA final oscuro rompe el ritmo. Sin respiro tonal entre secciones.

## Botón fijo vs resumen de cobro (código, ui.tsx StickyCtaMobile)
El sticky se oculta cuando #hero, #oferta o #cta-final tienen >=10% visible (IntersectionObserver threshold 0.1), así que no tapa el resumen mientras se lee. Riesgo menor: la sección #oferta es muy alta (dos cards), y con <10% visible (cola de la card Mensual, donde está su resumen y botón) la barra de 48px+padding reaparece y puede tapar el final de esa card. Además, el ResumenCobro es texto pequeño y el sticky pre-oferta dice «Ver plan y precios» (correcto, no salta la oferta).

## Resumen de cobro (honestidad)
Claro y honesto: «Hoy pagas: US$29 / Próxima renovación: 24 de septiembre de 2027, y luego cada año» + nota de que el equivalente mensual se cobra una vez al año. Cálculos verificados: 2 meses gratis (29 vs 35,88; 49 vs 59,88) y US$2,42 = 29/12. No promete prueba ni garantía. Defecto leve: jerarquía plana (etiqueta y valor del mismo peso), el «Hoy pagas» no destaca sobre la renovación.

## Sección → estado → defecto accionable
| Sección | Estado | Defecto accionable |
|---|---|---|
| 01 Hero + header | ❌ | Dos imágenes apiladas (foto + captura) alargan el hero; CTA «Empezar ahora» y microcopy «Cancela cuando quieras» genéricos. Dejar solo captura o solo foto; CTA en 1ª persona con beneficio («Quiero ver qué le toca hoy a mi perro») |
| 02 Problema | ✅ | 3 escenas con ícono, correcto. Chips y tarjetas casi del mismo tono que el fondo: subir contraste de superficie |
| 03 Mecanismo | ✅ | Pasos numerados y antes/después claros; párrafo Big Idea al límite de 4 líneas; «el Panel de Hoy» como pill parece botón (elemento no interactivo) |
| 04 CTA intermedio | ❌ | Botón flotando sobre fondo idéntico, sin contexto; el mismo verbo genérico |
| 05 App por dentro | ✅ | Carrusel con puntos y captura real; solo 1 de 4 frames visible, sin indicio de swipe más que el borde |
| 06 Selector de plan | ✅ | Segmented control claro; fondo y separación casi nulos respecto a la sección previa |
| 07 Oferta + resumen | ✅ | Claro y honesto; plano en jerarquía; sin lista «qué recibes» con valor total (solo ebook US$9 aparte) |
| 08 Regalo ebook | ✅ | Mockup bien; «Valor US$9 · hoy, gratis» ok; solo con plan anual, aclarar antes de la card |
| 09 CTA intermedio | ❌ | Segundo CTA intermedio casi pegado al FAQ, redundante con el final |
| 10 FAQ | ✅ | Acordeón bien; sin ninguna prueba real (testimonios pendientes) — dejar hueco de prueba mínima con dato verificable |
| 11 CTA final | ✅ | Bloque oscuro con contraste 7.72:1, buen cierre; PS repite lo dicho |
| 12 Footer | ❌ | Enlaces legales en texto pequeño, altura táctil probablemente <44px y colapsados en dos filas |
| 13 Aviso legal | ❌ | Caja suelta bajo el footer, separada de él; unificar con el footer |

## 5 defectos principales
1. [Toda la página, fondos] Ritmo de fondos casi nulo: --bg #f4f7f6 y --surface #fdfefd son prácticamente iguales, las secciones se funden en un plano blanco, sin respiro ni profundidad (craft profundidad 2). Fix: alternar base / surface-2 / bloque tintado de acento y separadores, con diferencia de luminosidad visible.
2. [Copy, especificidad] Casi ninguna claim con número o prueba verificable (solo precios y «un minuto»); sin testimonios, sin cifra de uso ni demo de resultado. Fix: sumar datos verificables del producto (p. ej. «5 lugares → 1 pantalla», tiempo de alta) y una prueba mínima honesta sin inventar.
3. [CTA, 5 repeticiones] «Empezar ahora» genérico en todos los CTAs, sin beneficio en 1ª persona, más 2 CTAs intermedios repetidos. Fix: «Quiero saber qué le toca hoy a mi perro» (o similar) y eliminar un intermedio.
4. [Hero] Dos imágenes apiladas empujan el contenido y compiten; el mensaje está bien pero el hero pesa ~1000px. Fix: una sola imagen dominante o captura recortada.
5. [Oferta, resumen de cobro] Jerarquía plana en «Hoy pagas / Próxima renovación» y sticky que puede reaparecer sobre la cola de la card Mensual. Fix: destacar el importe de hoy (más grande/negrita) y ocultar el sticky con el umbral sobre #oferta por posición, no por 10% de una sección tan alta.
