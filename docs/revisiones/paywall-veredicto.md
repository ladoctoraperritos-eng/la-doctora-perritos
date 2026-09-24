# VEREDICTO revisor-visual — paywall
Fecha: 2026-09-24 18:00
Screenshot: docs/revisiones/paywall-375.png
Usabilidad: 28/40
Craft: 11/20
Copy (si vende): 14/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos: 1) La barra fija inferior (~130px, 16% del viewport) tapa la tarjeta Mensual en el primer viewport: solo se ve la opción Anual y el usuario no sabe que existe otra; en scroll la barra sigue tapando contenido. Fix: colapsar la barra o dar padding-bottom/scroll-margin para que Mensual quede visible sobre ella, o mostrar ambos periodos como toggle compacto arriba. 2) Movimiento casi nulo (solo active:scale y transition-colors): sin entrada escalonada, sin conteo/transición del precio al cambiar plan o periodo, sin aria-live en el importe, sin reduced-motion, sin ninguna animación de la línea de tiempo. Fix: motion/react con stagger 60ms, transición del importe, aria-live="polite" en el precio. 3) Identidad y profundidad flojas: ningún dispositivo ownable visible (sin duotone, sin hairline degradé, sin textura), checks planos de 24px, fondo casi plano; podría ser cualquier paywall teal. Fix: chips de 40px, un hairline degradé en la tarjeta Anual, foto/ilustración firma en el hero. 4) Copy de venta bajo umbral (emoción 2, garantía sin nombre propio, sin objeciones de la ficha: medios de pago LATAM, datos exportables, 'otra suscripción'): el titular dice resultado pero no la escena ("¿le di ya la pastilla?"). Fix: usar frase del avatar en el subtítulo, nombrar la garantía, añadir línea 'tarjeta u otros medios según tu país' solo si es cierto y 'tus datos siempre exportables'. 5) Promesas a alinear con la realidad: 'Cancela cuando quieras' y la prueba de 7 días figuran como verificadas en lib/oferta.ts aunque su propio encabezado dice que Hotmart no está configurado; y el texto de garantía afirma 'después de tu primer cobro' mientras el código declara desde='sin_confirmar'. Fix: dejar verificada=false hasta configurar Hotmart o redactar la garantía sin fijar el inicio.

## Detalle
Usabilidad (0-4): h1:3 h2:3 h3:3 h4:3 h5:2 h6:3 h7:3 h8:3 h9:2 h10:3
Craft: jerarquía:3 profundidad:2 identidad:2 movimiento:1 encaje:3
Copy: idea:3 especificidad:3 emoción:2 oferta:3 acción:3

## Comparación con el veredicto anterior (27/40 · 11/20 · 14/20)
Mejoró la usabilidad (+1): ya existe la línea de tiempo con fechas reales (29 sept aviso, 1 oct cobro), la verdad bajo el CTA ('Hoy US$0 · Luego US$29/año'), el ancla US$2,42/mes, el badge en coral, una sola lista de beneficios personalizada y garantía + Hotmart en un bloque. Craft y copy sin cambio neto: movimiento sigue en 1, identidad en 2 y la emoción del copy en 2. Regresión nueva: la barra fija oculta Mensual.

## Gate de carga cognitiva
Pasa: 1 acción primaria, listas de 4 ítems, 2 decisiones (perros, periodo) de 2 opciones. Reservas: dos selectores con estilos distintos (segmentado y tarjetas radio) y dos enlaces secundarios de peso similar; el 'qué sigue' es claro.

## Anclas CTA héroe vivo
Contraste: con enlace 6.96:1, OK (deshabilitado 4.83:1, se ve como pill muerto). Tap: active:scale definido. Nunca disabled por defecto: FALLA hoy (pendiente de Hotmart, no se penaliza más), sin hint al pulsarlo. Área: 56px de alto, ancho completo, OK.

## Ficha de arte
Paleta (#F4F7F6, #0B5F5A, coral en badge), DM Sans y radios coinciden con la ficha. Falta el dispositivo ownable. El badge coral ya cumple la regla de la ficha.

## Copy (traza a la ficha)
Idea 3: 'deja que La Doctora Perritos recuerde por ti' traza al deseo 3. Especificidad 3: hora, días, fechas, importes correctos (US$2,99x12-29 = 6,88); sin prueba social, correcto no inventar. Emoción 2: no nombra la escena del dolor 1. Oferta 3: precio, ahorro, cobro y garantía claros; garantía de 15 días sin nombre propio; no lista qué incluye el plan (3 tutores, exportar). Acción 3: CTA en 1ª persona con beneficio. Sub-check garantía nombrada: FALLA (tiene plazo, no nombre). Message-match: sin dato. Copy 14/20 < 16.
