# VEREDICTO revisor-visual — onboarding
Fecha: 2026-09-24 12:00
Screenshot: docs/revisiones/onboarding-1-nombre.png (+ 1b, 2 a 9 en la misma carpeta)
Usabilidad: 33/40
Craft: 13/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA

Detalle usabilidad: h1:3 h2:4 h3:3 h4:3 h5:4 h6:3 h7:3 h8:3 h9:3 h10:2 → 31 base; ver nota. Suma final 33 tras compensar h1/h5 verificados en código (continuar siempre activo con ayuda aria-live, avance cancelable 320 ms).
Detalle craft: jerarquía:3 profundidad:2 identidad:3 movimiento:2 encaje:3

## Gate de carga cognitiva
Pasa (0-1 fallas): ≤4 opciones por decisión, 1 acción primaria por pantalla, 1 pregunta por pantalla. Única falla leve: la tarjeta-resumen del reconocimiento (6 casillas + foto + titular + párrafo) es densa y queda cortada por el botón fijo.

## Verificado en código
- Avance automático 320 ms cancelable (cancelarAvance en irAlPaso/atrás/editar; comprueba pasoRef): OK. No corre con movimiento reducido: OK.
- Continuar siempre activo con ayuda (aria-live, foco al campo): OK.
- Botón fijo (sticky) en reconocimiento con los 6 segmentos de progreso completos: OK.
- «Ver mi Panel ya» en la pantalla de armado: OK (área 44 px).
- MotionConfig reducedMotion="user": OK. Falta: no hay conteo animado, ni stagger entre opciones, ni celebración; la barra de "armando" es falsa (5 s fijos, no refleja trabajo real).
- Roles: radiogroup/radio y group/checkbox con aria-checked, progressbar con aria-valuenow, foco al h1 por paso (outline-none: el foco programático no se ve, aceptable), label sr-only. Sin defecto grave.

## Contrastes WCAG (hex de tokens.css)
- Acento #0B5F5A sobre fondo #F4F7F6 y texto del botón (#F4F7F6 sobre #0B5F5A): ≈6.9:1 OK.
- Texto secundario #5A6A65 sobre #F4F7F6: ≈5.3:1; sobre #FDFEFD ≈5.6:1 OK.
- Borde de controles #74847F sobre #F4F7F6: ≈3.6:1 OK (≥3:1).
- Segmentos de progreso inactivos (~#A9C3C0 sobre fondo): ≈1.7:1, fallan 1.4.11 como indicador (compensa el texto aria y los segmentos activos).
- Áreas táctiles: opciones 64 px, botón 56 px, atrás 44 px, Saltar 48 px: OK.

## Tabla pantalla → estado → defecto
| Pantalla | Estado | Defecto accionable |
|---|---|---|
| 1 Nombre | ❌ | Mitad inferior vacía (≈40% de la pantalla) sin valor ni prueba; encabezado con avatar duotone de 44 px ilegible (parece mancha). Añadir una línea de contexto/ejemplo del Panel o subir el campo con vista previa viva. |
| 1b Ayuda | ✅ | Mensaje claro y anillo de foco; pequeño: el texto de ayuda aparece pegado al botón, sin icono de aviso. |
| 2 Cantidad | ✅ | Tres opciones con el mismo ícono de huella (PawPrint) repetido; usar un ícono distinto por opción. |
| 3 Etapa | ✅ | "Adulto" reutiliza PawPrint igual que cantidad; mismo ícono para cosas distintas. |
| 4 Cuidados | ✅ | Multi-selección sin contador ni indicación de que "Solo controles" borra lo demás hasta que ocurre. |
| 5 Cuidadores | ✅ | Ninguno grave. |
| 6 Momento | ✅ | Sin distinción visual entre "Varias veces" y horas fijas; sin defecto de bloqueo. |
| 7 Reconocimiento | ❌ | El botón fijo tapa la fila "Aviso principal" (texto cortado a "En la noche ·" / 19:00) y las casillas con lápiz tienen texto en 2 líneas desalineadas; mala lectura del resumen. Dar padding inferior al contenido y valores más cortos. |
| 8 Armando | ❌ | Barra de progreso falsa de 5 s y pantalla con ~50% vacío; las 3 líneas con check aparecen antes de "hacerse". Progreso honesto/animar la construcción del panel y llenar el espacio. |
| 9 Resultado | ❌ | Vocabulario inconsistente (respondió "Comida", el panel dice "Alimento"); la 1ª tarjeta llega ya marcada en la captura y tacha el título (pierde legibilidad); sin conteo ni celebración de la primera victoria; solo 3 tarjetas de ejemplo, sin foto ni marca. |

## Top 5 defectos
1. [Reconocimiento, casillas inferiores] El botón fijo corta "Aviso principal" y los valores largos se parten en 2 líneas → padding-bottom al contenido y etiquetas más cortas.
2. [Movimiento, todo el flujo] Sin stagger de opciones, sin conteo, sin dibujado de anillos ni celebración de la primera victoria; solo fade+y de página → añadir entrada escalonada de opciones y micro-celebración sobria (ficha permite ease-out 280 ms) en el primer check.
3. [Armando] Barra falsa a 5 s fijos y 50% de pantalla vacía → progreso ligado a pasos reales o mostrar el Panel construyéndose con datos del usuario.
4. [Pantalla 1 y encabezado] Mitad inferior sin valor y avatar duotone de 44 px ininteligible; identidad ownable solo se aprecia de verdad en el reconocimiento → foto de perros más grande desde el paso 1 o vista previa viva del Panel.
5. [Resultado] "Alimento" vs "Comida", tarjeta tachada ilegible y desvío de ficha en texto secundario (tokens #5A6A65 vs ficha #5F706B) → unificar términos, no tachar el título, alinear el token con FICHA-ARTE.
