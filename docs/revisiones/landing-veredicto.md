# VEREDICTO revisor-visual — Landing
Fecha: 2026-09-23 12:00
Screenshot: docs/revisiones/landing-375-01.png ... landing-375-15.png + landing-375-completa.png
Usabilidad: 33/40
Craft: 14/20
Copy (si vende): 16/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA

Detalle usabilidad: h1:3 h2:3 h3:3 h4:3 h5:3 h6:3 h7:3 h8:3 h9:3 h10:3 (0 con 4: nada es ejemplar; un 4 es raro)
Detalle craft: jerarquia:3 profundidad:3 identidad:3 movimiento:2 encaje:3
Detalle copy: idea:3 especificidad:3 emocion:3 oferta:3 accion:4 (ningun eje <=2; umbral copy cumplido)

## Contrastes WCAG medidos (hex de tokens.css)
| Par | Ratio | Resultado |
|---|---|---|
| text-primary #22302c / bg | 12.76 | AA |
| text-secondary #5a6a65 / bg | 5.29 | AA |
| text-secondary / surface-2 #e6eeec | 4.83 | AA (margen corto) |
| text-tertiary #566661 / bg y surface-2 | 5.62 / 5.13 | AA |
| accent #0b5f5a / bg y surface-2 | 6.96 / 6.36 | AA |
| blanco #fdfefd sobre accent (CTA) | 7.42 | AA/AAA |
| accent-on-dark #7cd1c6 / text-primary (CTA final) | 7.72 | AA/AAA |
| coral #e8896b / surface | 2.53 | FALLA como texto/icono informativo (solo decorativo: check del "Camila dio..." en el mockup) |

## Gate de carga cognitiva (escaneabilidad mobile)
- Listas <=5 items (problema 5, features 5, FAQ 6 en acordeon): OK. Decisiones <=4 opciones: OK.
- Bloques >4 lineas seguidas: Big Idea de solucion (4 lineas, limite), garantia (4 lineas centradas, limite); ninguno >4. OK justo.
- Dolores con icono (5), pasos numerados 01-03, beneficios con chip check: OK.
- Prueba del solo-titulares: se entiende (Te suena / Abres la app / Tu perro todo en orden / Cuantos perros / Empieza gratis / Garantia / Imagina...). OK.
- Respiro y ritmo de fondos: alterna bien bg/surface/surface-2 y cierra con bloque oscuro; OK. Secciones 02 y 03 (problema/agitacion) comparten fondo claro casi blanco y se funden (agitacion sin encabezado propio).
- FAQ acordeon con aria-expanded: OK. Pricing y garantia en cajas: OK.
- Fallas del gate: 1 de 8 (duplicacion de features y cajas Antes/Despues + Hoy/Si nada cambia en dos secciones seguidas = densidad). No es sobrecarga critica.

## Tabla por seccion
| Seccion | Estado | Defecto accionable |
|---|---|---|
| 01 Hero + header | ✅ | Titular con acento, CTA 52px, mockup real. "Entrar" en text-secondary es pequeno y debil como salida; agrandar area o darle peso. |
| 02 Problema | ✅ | 5 tarjetas con icono, bien. Los iconos gris sobre gris no aportan acento; usar acento en el icono de la pregunta estrella (dosis). |
| 03 Agitacion | ❌ | Sin titulo de seccion ni separador respecto a 02 (fondo casi identico): se funde y parece continuacion. Anadir eyebrow/titulo y cambiar fondo a surface-2. Dos cajas Hoy/Si nada cambia repiten el mismo mensaje que los 3 items de arriba. |
| 04 Solucion/mecanismo | ✅ | Bien (01-03, Antes/Despues, mecanismo en pill). La pill "el Panel de Hoy" tiene su degradado cortado y parece un boton no interactivo; aclararla o quitar borde. |
| 05 CTA intermedio | ✅ | Correcto, pero flota sobre el mismo fondo sin contexto; funciona. |
| 06 App por dentro | ❌ | Carrusel: el segundo frame asoma cortado y los 4 puntos son diminutos (<12px); solo se ve un frame sin flechas ni nombre de pantalla real; el CTA repetido justo despues del carrusel y antes del selector compite con el flujo de compra. |
| 07 Selector de plan | ✅ | Claro y con 2 opciones. Falta indicar que cambia el precio de abajo (la oferta esta en otra seccion y hay que hacer scroll para ver el efecto). |
| 08 Oferta | ❌ | Las 5 features se repiten identicas en anual y mensual (pared de texto, ~20 lineas); solo cambia el titulo del plan. La tarjeta mensual rompe el encaje: titulo "Mensual · Esencial" parte en 2 lineas y el badge "7 DIAS GRATIS" tambien; badge "MEJOR VALOR" solapa el borde. "Se cobra US$29/año" en letra de ~12px demasiado pequena para el dato mas sensible. |
| 09 Regalo ebook | ❌ | Aparece DESPUES de la tarjeta mensual, no dentro de la anual: parece regalo de ambos o de nada; la tarjeta anual no lo menciona. Mover dentro/adyacente a la tarjeta anual. Portada muestra el logo, no el ebook real (placeholder honesto pero no verificable). |
| 10 Garantia | ✅ | Caja con nombre, plazo y piso legal Hotmart. Condicion en 4 lineas centradas; acortar. |
| 11 CTA intermedio | ✅ | Repite el CTA; tres CTAs iguales seguidos en pocas pantallas empiezan a saturar. |
| 12 FAQ | ✅ | Acordeon accesible, 6 objeciones de la ficha. Contenido cerrado por defecto salvo la 1a; ok. |
| 13 CTA final | ✅ | Bloque oscuro, contraste 7.7:1, future pacing. El PS repite la garantia por tercera vez (redundante). |
| 14 Footer legal | ✅ | Enlaces con area tactil 44px. Los enlaces se parten en 2 filas desalineados (Reembolsos huerfano). |
| 15 Aviso legal | ✅ | Presente y legible; tarjeta con borde degradado. |
| Completa (17556px alto) | ❌ | ~17.5k px de alto a 750: pagina muy larga para trafico frio/mobile; la oferta queda a ~60% de scroll (aceptable por diseno, pero la parte 06-09 concentra decisiones sin CTA propio claro). |

## Top 5 defectos
1. [08 Oferta] Features duplicadas 5+5 y tarjeta mensual desencajada (titulo y badge parten linea) + "Se cobra US$29/año" diminuto → mostrar la lista una sola vez (comparativa compacta), corregir el layout del encabezado mensual con `whitespace-nowrap`/badge abreviado, y subir el cobro real a >=14px.
2. [09 Regalo ebook] El regalo del plan anual queda fuera de la tarjeta anual y despues de la mensual → integrarlo en la tarjeta anual (miniatura + linea "Regalo: ebook, valor US$9") y quitar la seccion suelta.
3. [03 Agitacion] Sin encabezado, mismo fondo que 02 y mensaje redundante (3 items + 2 cajas) → poner titulo/eyebrow, fondo surface-2 y reducir a 3 items o a las 2 cajas.
4. [Movimiento, codigo ui.tsx/Faq/Solucion] Solo hay reveal escalonado, whileTap 0.97 en CTA y sticky con reduced-motion; no hay conteo de numeros, barras/progreso que se dibujen ni transicion entre planes al cambiar el selector → animar cambio de precio/plan y una barra o numero heroe; eje movimiento 2/4.
5. [06 Carrusel + 07 Selector] Carrusel con puntos diminutos y frames cortados, y el efecto del selector de plan no se ve hasta hacer scroll → agrandar puntos/anadir flechas y hacer que el selector y la oferta compartan viewport (selector sticky o dentro de la seccion de oferta).

## Verificaciones en codigo
- CTA vivo: >=52px, whileTap 0.97, nunca disabled, contraste 7.42: cumple los 4 puntos.
- Todos los CTA apuntan a `/empezar` (provisional, comentado en LandingPage.tsx): el plan elegido en el selector NO viaja al CTA ni al checkout, y "Elegir mensual" lleva al mismo destino que el anual (no hay diferenciacion real de compra). Falla de flujo hasta que exista Hotmart.
- Correo de soporte `soporte@ladoctoraperritos.com` marcado PENDIENTE: no publicar sin correo real (la garantia depende de el).
- Copy: sin testimonios ni cifras inventadas (correcto). "cinco sistemas" y "menos que un antiparasitario" son afirmaciones no probadas en la pagina (eje especificidad 3, no 4). Sub-checks: garantia nombrada cerca del CTA: PASA; message-match: N/A (sin dato de anuncio); enfasis titular: PASA.
- FICHA-ARTE: hex, DM Sans, radios 18/14 y sombras coinciden. Nota: FICHA-ARTE da texto 2o #5F706B y tokens usan #5A6A65 (desvio menor, mejora el contraste). El dispositivo ownable declarado (duotone en foto del perro) NO se ve en la landing; la identidad depende solo del logo de tres perros y la paleta teal + DM Sans.
