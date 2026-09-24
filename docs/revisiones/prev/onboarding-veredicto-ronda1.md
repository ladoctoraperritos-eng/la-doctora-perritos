# VEREDICTO revisor-visual — onboarding
Fecha: 2026-09-24 01:05
Screenshot: docs/revisiones/onboarding-375.png (más onboarding-1-nombre, -2-cantidad, -4-cuidados, -6-momento, -7-reconocimiento, -8-armando, -9-resultado)
Usabilidad: 29/40
Craft: 10/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA

Detalle usabilidad: h1:3 h2:3 h3:3 h4:3 h5:3 h6:3 h7:2 h8:3 h9:3 h10:3
Detalle craft: jerarquía:3 profundidad:2 identidad:1 movimiento:1 encaje:3

## Alcance y límites de la evidencia
- No existen capturas de los pasos 3 (etapa) y 5 (cuidadores): esas 2 pantallas se puntuaron solo por código.
- Las capturas 2 (cantidad) y 6 (momento) muestran una opción marcada pero el botón «Continuar» aparece a medio opacidad y el borde de la tarjeta elegida más claro que en la captura 4. El código (`valido.cantidad`, `valido.momento`) dice que ya debería estar activo, así que son capturas tomadas a mitad de `transition-opacity`/`transition-colors`. No se puede afirmar qué ve el usuario en reposo: se baja el puntaje y se pide recapturar tras esperar 400 ms.
- Captura 8 (armando): solo 2 de 3 líneas visibles (mitad de la animación). Aceptable, pero no verifica la 3ª línea.

## Gate de carga cognitiva
[x] Listas ≤4-5 ítems · [x] ≤4 opciones por decisión · [x] una acción primaria · [x] ≤7 campos · [x] texto ≤3-4 líneas · [x] qué sigue obvio · [x] nada interactivo que no haga nada. Pasa (0 fallas), salvo lo dicho sobre las capturas ausentes. El flujo total son 9 pantallas antes del paywall (6 preguntas + reconocimiento + armando + resultado), tolerable pero en el límite de la promesa «onboarding de 1 minuto» de FICHA-AVATAR (objeción 3).

## Contraste WCAG (cálculo sobre hex de tokens.css)
| Par | Ratio | Resultado |
|---|---|---|
| Texto primario #22302C / fondo #F4F7F6 | 12,76 | AA ok |
| Texto secundario #5A6A65 / fondo | 5,29 | AA ok |
| Texto secundario / surface-2 #E6EEEC | 4,83 | AA ok |
| Acento #0B5F5A / fondo | 6,96 | AA ok |
| Texto del botón (#F4F7F6) sobre acento | 6,96 | ok |
| Botón «Continuar» deshabilitado (acento al 40 %) texto/fondo | 1,94 | FALLA (ilegible; además el botón mide 1,94 contra el fondo) |
| Borde de input (tertiary 35 %) sobre surface | 1,66 | FALLA 1.4.11 (3:1) |
| Borde de tarjeta de opción (25 %) | 1,43 | FALLA 1.4.11 (casi invisible) |
| Aro del radio sin marcar (45 %) | 1,96 | FALLA 1.4.11 |
| Segmentos de progreso inactivos (acento 16 %) | 1,28 | FALLA (los activos sí: 6,96) |
Áreas táctiles: opciones min-h 64 px, CTA 56 px, atrás 44 px, «Saltar» 48 px: ok. El placeholder no tiene color definido en CSS (default del navegador): no verificado.

## Reglas de 02B
| Regla | Estado |
|---|---|
| Una pregunta por pantalla | ✅ |
| Progreso visible | ✅ 6 segmentos + progressbar con aria (sin animar el llenado; desaparece en las 3 fases finales, sin indicar que faltan 3 pantallas) |
| Personalización visible | ❌ parcial: nombre, hora y etapa se ven en el Panel; la respuesta de «quién más cuida» NO cambia nada (armarPanel no usa `cuidadores`) aunque el comentario del código dice que cada respuesta cambia algo |
| Primera victoria | ✅ tocar un cuidado lo marca (tachado + «Listo») y guarda `primeraVictoria`; sin micro-feedback de movimiento |
| Skip en pasos no críticos | ⚠️ solo etapa y cuidadores; momento tiene default posible (08:00) y no se puede saltar |
| Lenguaje controlador / reactancia | ✅ tuteo, «Elige lo que quieras», «El resto lo agregas después» |
| Salida visible | ⚠️ atrás en preguntas y reconocimiento; en el resultado y en armando no hay atrás ni salida |
| Costo hundido | n/a aquí (se usa en el paywall) |

## Tabla pantalla → estado → defecto
| Pantalla | ✅/❌ | Defecto accionable |
|---|---|---|
| 1 Nombre | ❌ | Borde del input 1,66:1 y «Continuar» deshabilitado con texto a 1,94:1: el usuario no ve qué falta. Subir borde a ≥3:1 y dar al botón deshabilitado un estilo legible (sin opacity-40) o dejarlo activo y validar al tocar con hint |
| 2 Cantidad | ❌ | Ícono de huella idéntico en las 3 opciones (decoración sin información); borde de tarjeta 1,43:1. Quitar íconos repetidos o usar 1/2/3 huellas; borde ≥3:1 |
| 3 Etapa (sin captura) | ❌ | No verificable visualmente; ícono Clock para «Senior» es genérico. Capturar y revisar |
| 4 Cuidados | ✅ | Legible y multi-selección clara; falta aviso de que «Solo vacunas…» vacía lo demás |
| 5 Cuidadores (sin captura) | ❌ | La respuesta no produce ningún efecto visible; «Un cuidador o paseador» y «Mi pareja y yo» comparten ícono Users. Usarla en el Panel (badge de quién hizo qué) o eliminar la pregunta |
| 6 Momento | ⚠️ | Captura a mitad de transición; «Varias veces al día» cae a 08:00 sin decirlo |
| 7 Reconocimiento | ⚠️ | Pantalla puramente emocional entre el último dato y el valor; no aporta información nueva y retrasa la primera victoria. Fundirla en el resultado o acortar |
| 8 Armando | ⚠️ | 2,7 s automáticos sin control ni salida; checks aparecen antes de terminar (`…` + ✓); `animate-pulse` no respeta reduced-motion |
| 9 Resultado | ⚠️ | «tu familia lo ve al instante» es falso si respondió «Solo yo»; sin atrás/salida; el CTA «Seguir con Toffee» no dice que lo siguiente es el pago |

## Accesibilidad (código)
- Bien: `role=radiogroup/checkbox`, `aria-checked`, `aria-pressed`, `progressbar` con etiqueta, `aria-live` en armando, label sr-only en el nombre, `useReducedMotion` en la entrada.
- Mal: no se gestiona el foco al cambiar de paso (`motion.main key={actual}` desmonta y el foco se pierde al body); `radiogroup`/`group` sin `aria-label`/`aria-labelledby` (no dice a qué pregunta responde); los radios son botones sin navegación con flechas; sin `document.title` por paso; sin `:active`/hover definidos en el CTA (el «CTA vivo» exige estado de tap visible); el paso actual no se guarda: al recargar vuelve a la pregunta 1.
- `outline-none` en el input compensado con cambio de borde a acento (6,96:1): ok.

## Movimiento (eje 4, código)
Solo fade + 12 px de entrada (280 ms aprox., respeta reduced-motion). Faltan: stagger, transición del progreso, tap con escala, animación del check de primera victoria (la ficha prohíbe confeti, no un micro-feedback), transición entre pasos de salida. 1/4.

## Fidelidad a FICHA-ARTE
Paleta y DM Sans coinciden; el texto secundario del token (#5A6A65) es más oscuro que la ficha (#5F706B) — desvío menor a favor del contraste, actualizar la ficha. El acento aparece también en palabras del titular («bien») y en íconos de opciones, más allá de «CTA, hora/fecha clave, estado activo, progreso». El dispositivo ownable de la ficha (duotone de foto de perro / los tres perritos del logo) NO aparece en ninguna pantalla: identidad intercambiable con cualquier app de salud con íconos Lucide.

## Top 5 defectos
1. [Identidad, todas las pantallas] Ningún dispositivo ownable: ni logo, ni perro, ni duotone; solo DM Sans + teal + Lucide → poner el logo/los tres perritos en el reconocimiento y el resultado, y un avatar/duotone del perro en el Panel.
2. [Contraste, todos los pasos] Bordes de input, tarjetas, aros de radio y segmentos inactivos entre 1,28 y 1,96:1, y «Continuar» deshabilitado a 1,94:1 → bordes ≥3:1 y botón deshabilitado legible (o activo con validación al tocar).
3. [Paso 5 y Resultado] La pregunta «¿Quién más cuida?» no cambia nada visible y el Resultado afirma «tu familia lo ve al instante» aunque respondió «Solo yo» → usar la respuesta (mostrar quién hizo qué) o condicionar/quitar el texto.
4. [Foco/teclado, transición entre pasos] El foco se pierde al cambiar de paso, grupos de opciones sin nombre accesible, sin :active en el CTA → mover foco al h1 (tabIndex -1) en cada paso, `aria-labelledby` al h1, `:active:scale-[0.97]`.
5. [Movimiento y evidencia] Solo fade de entrada; capturas 2 y 6 tomadas a mitad de transición y faltan las de los pasos 3 y 5 → añadir stagger, progreso animado y micro-feedback del check, y recapturar los 6 pasos en reposo antes de re-revisar.
