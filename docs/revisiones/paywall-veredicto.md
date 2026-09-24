# VEREDICTO revisor-visual — paywall
Fecha: 2026-09-24 12:00
Screenshot: docs/revisiones/paywall-375.png (y paywall-completo.png)
Usabilidad: 27/40
Craft: 11/20
Copy (si vende): 14/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA

Detalle usabilidad (0-4): h1:3 h2:3 h3:3 h4:3 h5:2 h6:3 h7:2 h8:2 h9:3 h10:3
Detalle craft: jerarquía:3 profundidad:2 identidad:2 movimiento:1 encaje:3
Detalle copy: idea:3 especificidad:3 emoción:2 oferta:3 acción:3
Nota de método: el botón desactivado y el aviso son intencionales (faltan enlaces de Hotmart). Puntúo el estado real renderizado, sin castigar más la ausencia de enlace; aun con enlace activo los defectos de abajo bloquean. En el «completo» la barra fija aparece a mitad de página: es artefacto de captura, no se puntúa.

## Gate de carga cognitiva
Pasa con reservas: 1 acción primaria, ≤4 ítems por lista. Reservas: dos listas con el mismo ícono de check (4 de «lo armado» + 4 de features) que dicen casi lo mismo; tres enlaces secundarios (plan, «Ahora no», «Ya tengo cuenta») + toggle + CTA. 1 falla leve; el «qué sigue» es claro.

## Contraste WCAG (hex reales)
| Par | Ratio | Resultado |
|---|---|---|
| acento #0B5F5A / fondo #F4F7F6 (Toffee, «Ya tengo cuenta», enlaces) | 6.96 | OK |
| acento / superficie (badge «2 meses gratis» sobre blanco) | 7.42 | OK |
| secundario #5A6A65 / fondo (subtítulo, «Ahora no», garantía) | 5.29 | OK |
| secundario / surface-2 (texto «Mensual», resumen de cobro) | 4.83 | OK |
| CTA #F4F7F6 sobre #0B5F5A (con enlace) | 6.96 | OK |
| CTA disabled #5A6A65 / #E6EEEC | 4.83 | Legible pero pill «muerto» |
| tamaño mínimo de texto | 14px (text-sm) en garantía, cobro, Hotmart | Aceptable, pero lo más importante de la confianza va en el tamaño más pequeño |

## Anclas de CTA héroe vivo
- Contraste ≥3:1: sí (con enlace). Tap definido: sí (`active:scale`). Nunca disabled por defecto: FALLA hoy (intencional, sin enlaces). Área ≥48px: sí, 56px ancho completo.
- Barra fija con el botón desactivado ocupa ≈181 de 812px (22% del viewport) y tapa la tarjeta del plan a media lectura.

## Reglas de 02B / 50
| Regla | Estado | Nota |
|---|---|---|
| Costo hundido visible | ✅ pero débil | «Hecho con tus 6 respuestas» es la última línea, en gris, sin énfasis. |
| Personalización | ✅ | Nombre en acento, hora del aviso, cuidados contados. |
| Sin lenguaje controlador | ✅ | |
| Salida visible | ✅ | Flecha, «Ahora no», «Ya tengo cuenta» (esta lleva a un login que aún no envía nada). |
| Precio con ancla (anual como $/mes, total visible) | ❌ | Display grande US$29 al año; el «US$2,42 al mes» está enterrado abajo; no se muestra el mensual como referencia. |
| Fecha exacta de cobro si hay prueba | ⚠ | Existe («1 de octubre de 2026») pero debajo del pliegue y tapada por la barra; el CTA dice «gratis» sin el cobro cerca. |
| Verdad bajo el CTA (50 C4bis) | ❌ | Bajo el botón solo hay garantía y aviso de pago; falta «Después US$29/año, cancela antes del 1 oct». |
| Timeline del trial (50 C4) | ❌ | No existe. |
| Prueba social | ❌ | Ninguna (la creadora es anónima; no se pueden inventar testimonios). Sustituir con prueba real cuando exista. |

## Tabla pantalla → estado → defecto accionable
| Pantalla | Estado | Defecto accionable |
|---|---|---|
| Primer viewport (375) | ❌ | Se ven titular, checklist, toggle y precio, pero el cobro (Hoy US$0 / primer cobro / renovación) queda fuera y bajo la barra; el CTA promete «7 días gratis» sin decir cuánto vale después. Poner línea «Luego US$29 al año desde el 1 oct» dentro de la barra sobre el botón. |
| Tarjeta de plan | ❌ | Ícono check plano de 18px repetido (no chips 40-48px ni hairline degradé); dos checklists redundantes. Fusionar las listas y usar chips de marca. |
| Selector Anual/Mensual | ❌ | «2 meses gratis» en teal, no en coral (ficha); Mensual no muestra su precio, sin ancla. Mostrar «US$2,99/mes» tachado o de referencia y el badge en coral. |
| Resumen de cobro | ✅ | Claro y honesto, fechas reales calculadas (1 oct 2026 = hoy + 7). Falta subirlo. |
| Pie | ❌ | «Cancela cuando quieras» está sin verificar en Hotmart (ESTADO: «NO verificado»); afirmarlo es riesgo legal. Quitar o confirmar antes de publicar. «El pago lo procesa Hotmart» no dice medios de pago LATAM (tarjeta, cuotas, OXXO) que pide FICHA-AVATAR objeción 6. |
| Barra fija (estado sin checkout) | ❌ | Botón disabled + aviso ocupa 22% del alto. Aceptado como pendiente, pero mientras tanto colapsar el aviso a una línea. |

## Ficha de arte y movimiento
Paleta/tipo/radios coinciden con la ficha; el badge de ahorro debía ir en coral y va en teal; el dispositivo ownable (duotone) no aparece. Movimiento: solo `active:scale`; sin transición de precio al cambiar de plan/periodo, sin entrada escalonada, sin aria-live al cambiar el importe.

## Copy (traza a la ficha)
- Titular «El Panel de Hoy de Toffee está listo» + «no dependa de tu memoria»: traza al deseo 3 y al mecanismo «Panel de Hoy» (idea 3, pero no nombra «quién hizo qué» en el hero).
- Especificidad 3: precios, 7 días, 15 días, fecha; sin prueba/testimonio → no sube.
- Emoción 2: no nombra la escena («¿le di la pastilla?», «pensé que se lo habías dado tú»); el paywall solo dice el resultado.
- Oferta 3: stack corto y claro; la garantía se llama «del Primer Aviso» (nombre propio pero sin explicar), plazo desde «tu primer pago» sin fijar inicio.
- Acción 3: CTA en 1ª persona con beneficio; compite con 3 enlaces secundarios de peso similar.
- Sub-checks: Garantía nombrada cerca del CTA: sí. Message-match con anuncio: sin dato (34).

## Top 5 defectos
1. [Barra fija / bajo el CTA] «7 días gratis» sin el cobro posterior a la vista (US$29 el 1 oct queda bajo el pliegue y tapado) → línea «Luego US$29/año, primer cobro el 1 oct» sobre el botón + timeline breve.
2. [Selector y precio] sin ancla: no se ve el mensual ni el $/mes anual en grande; badge de ahorro fuera de ficha (coral) → US$2,42/mes en display con «se cobra US$29 al año» en label.
3. [Tarjeta y checklist] dos listas de checks planos casi duplicadas, sin chips ni hairline, profundidad casi plana, movimiento nulo → una sola lista con chips 40px y una transición de precio.
4. [Pie] «Cancela cuando quieras» sin verificar y medios de pago LATAM ausentes → verificar en Hotmart o quitar; añadir «tarjeta, cuotas u otros según tu país» solo si es cierto.
5. [Copy] emoción 2 y costo hundido gris al final → mover «Hecho con tus 6 respuestas» junto al titular y usar la frase del avatar («¿le di ya la pastilla?») en el subtítulo.
