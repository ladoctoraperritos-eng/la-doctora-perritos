# VEREDICTO revisor-visual — landing
Fecha: 2026-09-23 12:00
Screenshot: docs/revisiones/landing-375-completa.png (+ landing-375-01 … 15)
Usabilidad: 31/40
Craft: 14/20
Copy (si vende): 15/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA

Detalle usabilidad: h1:3 h2:3 h3:3 h4:3 h5:3 h6:3 h7:3 h8:2 h9:3 h10:3
Detalle craft: jerarquía:3 profundidad:2 identidad:3 movimiento:3 encaje:3 (total 14)
Detalle copy: idea:3 especificidad:3 emoción:3 oferta:3 acción:3
(Craft desglose corregido: jerarquia 3 + profundidad 2 + identidad 3 + movimiento 3 + encaje 3 = 14.)

## Mediciones WCAG (hex de tokens.css)
- Texto primario #22302C / bg #F4F7F6: 12,76:1 OK
- Texto secundario #5A6A65 / bg: 5,29:1; / surface-2 #E6EEEC: 4,83:1 (OK AA, margen mínimo; es el texto de cuerpo de agitación, mecanismo, garantía, FAQ)
- Texto terciario #566661 / surface-2: 5,13:1 OK
- Acento #0B5F5A / bg: 6,96:1; / surface-2: 6,36:1 OK
- Texto CTA (#F4F7F6) sobre acento: 6,96:1 OK
- CTA final: texto #22302C sobre menta #7CD1C6: 7,72:1 OK
- Desvío vs FICHA-ARTE: tokens.css usa text-secondary #5A6A65, la ficha dice #5F706B (desvío menor, en dirección más oscura; ficha sin actualizar o token sin justificar).
- Diferencia bg #F4F7F6 vs surface #FDFEFD = casi imperceptible (ver defecto 3).

## Gate de carga cognitiva (fallos: 2 de 8, no crítico)
- [falla] Sección oferta: 6 features en el anual + 4 en el mensual + 2 planes x 2 tarjetas = demasiadas piezas antes de una sola decisión.
- [falla] 3 CTAs idénticos en ~2 pantallas (05 intermedio, 06 dentro de "app por dentro", 08 oferta) y "Elegir mensual" compite en la oferta.
- Resto OK: listas <=5 ítems, <=2 opciones por decisión, bloques de texto de 2-4 líneas, sin campos, "qué sigue" obvio.

## Escaneabilidad mobile
Los titulares en bold con palabra clave en acento (memoria / qué le toca hoy / todo en orden / tener todo claro) se escanean bien; el hero cumple: CTA de 52px visible sin scroll. Cuerpo secundario en gris fino resulta débil a ritmo de scroll (agitación, mecanismo).

## Movimiento (verificado en código)
- Stagger de entrada: useReveal (ui.tsx), whileInView una vez, reduced-motion respetado. OK
- whileTap 0.97 en CtaButton y sticky. OK
- Sticky CTA de 2 estados, safe-area, se oculta en hero/oferta/CTA final. OK
- Transición al cambiar plan: motion.div key={plan}, fade+y 12, 280ms, reduced-motion respetado. OK. Efecto secundario: también anima al montar.
- Ausentes: conteo de número héroe, hitos. No aplican del todo a landing, pero no hay ninguna animación de la demo del producto.
- Hero: solo un motion.div; el hero no hace stagger propio de titular/CTA (verificado solo por grep).

## Tabla por sección
| Sección | Estado | Defecto accionable |
|---|---|---|
| 01 Hero + header | ❌ | Composición confusa: el teléfono tapa a los perros (la foto duotone queda como franja de ~140px con los perros recortados) y en la base del teléfono aparecen esquinas negras del mockup cortado. La foto ownable, el único rostro de la marca, no se disfruta. Separar foto y captura, o recortar la captura limpia sin las esquinas negras. El hero tampoco nombra el mecanismo "Panel de Hoy". |
| 02 Problema | ✅ | Chips grises apagados y cards casi del mismo tono que el fondo (superficie #FDFEFD vs #F4F7F6): funciona, pero plano. |
| 03 Agitación | ❌ | Fondo blanco continuo con 02 (flush): las dos secciones se funden. Texto secundario gris sobre blanco, débil. La 3ª frase del copy ("Mientras sigas así...") se eliminó en código respecto a docs/copy/landing.md: copy y código desincronizados. |
| 04 Mecanismo | ✅ | Bien estructurado (pasos 01-03, antes/después). Los recuadros antes/después son ambos grises; "Después" no se distingue lo bastante del "Antes". |
| 05 CTA intermedio | ❌ | Aparece 2 pantallas antes del CTA de "app por dentro" (06): dos botones idénticos casi seguidos. Quitar uno. |
| 06 App por dentro | ✅ | Carrusel con puntos y captura real; el segundo frame asoma, invita a deslizar. El CTA propio repite al 05. |
| 07 Selector de plan | ❌ | Dos H2 seguidos ("¿Cuántos perros tienes?" y luego "Empieza gratis. Sigue por US$0,08 al día") rompen la jerarquía; el precio llega tras 6 pantallas. Estado no seleccionado en gris #5A6A65 sobre #E6EEEC (4,83:1, mínimo). |
| 08 Oferta | ❌ | Dos tarjetas largas con 6 y 4 ítems; mensual repite "7 DÍAS GRATIS" y la garantía; solo USD (avatar de Chile/México: objeción 6 de la ficha, pago/moneda local, sin respuesta en la página). Sin ancla externa junto al precio salvo el FAQ. |
| 09 Regalo ebook | ✅ | Portada de marca clara. "Valor US$9 · hoy, gratis": valor real, sin tachado inventado; bien. La tarjeta se corta a la derecha por el hairline degradado (parece un borde roto a las 3 pm). |
| 10 Garantía | ✅ | Nombrada, con plazo (15 días) y cerca del CTA. Fricción: "escribes un correo" en lugar de un botón; y "Hotmart" es jerga externa para Carolina. |
| 11 CTA intermedio | ❌ | Tercer CTA idéntico, ahora antes del FAQ; el sticky ya cumple esa función. |
| 12 FAQ | ✅ | 6 preguntas, todas trazadas a objeciones de la ficha; el primero abierto por defecto. Falta la objeción 6 (pago LATAM/cuotas/OXXO). |
| 13 CTA final | ✅ | Bloque oscuro invertido, contraste 7,72:1, future pacing en 1ª persona. El PS repite garantía por tercera vez. |
| 14 Footer | ✅ | Enlaces con área táctil correcta; texto legal pequeño; email soporte aún pendiente de ser real (ESTADO.md). |
| 15 Aviso legal | ✅ | Presente y visible. |

## Top 5 defectos
1. [Hero, 01] Foto duotone y captura de app compiten: los perros (el dispositivo ownable y el rostro de marca) quedan tapados por el teléfono, y el teléfono muestra esquinas negras cortadas. Fix: foto en su propio bloque con los perros completos; captura recortada limpia debajo o eliminada del hero.
2. [Oferta, 07-08] Decisión de precio sobrecargada y en USD para un público CLP/MXN: dos H2 seguidos, dos tarjetas de 6 y 4 ítems, sin respuesta a moneda local/forma de pago. Fix: un solo H2, tarjeta anual con 3-4 ítems, mensual compacta (precio + botón), y una línea "Pagas en tu moneda con tarjeta, cuotas u OXXO" solo si Hotmart lo confirma (si no, no prometer) + entrada de FAQ.
3. [03/02 y 04, profundidad] Secciones adyacentes casi indistinguibles: #F4F7F6 vs #FDFEFD, y 02-03 fundidas por flush. Fix: separador o alternancia con --surface-2 real en agitación; dar más contraste a antes/después.
4. [05, 06, 11 CTAs] Botón idéntico tres veces en ~5 pantallas más el sticky, y "Elegir mensual" compitiendo. Fix: eliminar los CTA intermedios 05 y 11 (el sticky cubre), y convertir "Elegir mensual" en enlace de texto.
5. [Copy, prueba] Cero prueba real más allá de la demo; el hero no bautiza "Panel de Hoy" (aparece recién en 04). Fix: mencionar "el Panel de Hoy" en el subtítulo del hero; pedir la pregunta de VoC en TikTok para insertar citas reales; sincronizar copy/código (frase 3 de agitación).

## Notas de honestidad
- 31/40 es mi puntaje con la regla "ante la duda baja". Estar por debajo del umbral 36 no es fallo de una sola sección sino de acumulación en h8 (carga/CTAs repetidos) y varias 3 sin 4.
- Copy 15/20 por 4 ejes con 3 (nada llega a 4: sin prueba real y sin claim medible de resultado, aunque eso es honesto por diseño; oferta sin moneda local).
