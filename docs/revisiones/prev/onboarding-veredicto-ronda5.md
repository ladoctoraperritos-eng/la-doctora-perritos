# VEREDICTO revisor-visual — Onboarding (La Doctora Perritos)
Fecha: 2026-09-24 12:00
Screenshot: docs/revisiones/onboarding-1-nombre.png (+ 1b, 2 a 9 en la misma carpeta, todos a 375px dpr 2)
Usabilidad: 30/40
Craft: 14/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA

## Desglose usabilidad (suma 30)
h1 estado del sistema: 3 · h2 lenguaje: 3 · h3 control y libertad: 3 · h4 consistencia: 3 · h5 prevención de errores: 3 · h6 reconocer vs recordar: 3 · h7 flexibilidad: 3 · h8 minimalismo: 3 · h9 errores claros: 3 · h10 ayuda contextual: 3
(3+3+3+3+3+3+3+3+3+3 = 30)

## Desglose craft (suma 14)
jerarquía: 3 · profundidad: 3 · identidad: 2 · movimiento: 3 · encaje: 3
(3+3+2+3+3 = 14)

## Gate de carga cognitiva (2 fallas, bajo el umbral crítico de 4)
- Listas ≤4 ítems: OK. Decisiones ≤4 opciones: OK. Una acción primaria por pantalla: OK. Campos: 1 por pantalla, OK.
- FALLA: en «Reconocimiento» hay cinco tamaños de texto (3xl, lg, base, sm, más el botón lg) y 6 chips editables además del titular y la foto; es la pantalla más densa del flujo.
- FALLA: «Resultado» con 3 filas de 2-4 líneas cada una + banner + nota + CTA; el usuario debe leer bastante para entender que puede tocar.
- «Qué sigue» obvio: OK. Elementos falsamente interactivos: ninguno.

## Contraste WCAG (cálculo sobre hex de tokens.css)
- Texto blanco-hueso (--bg #F4F7F6) sobre CTA (--accent #0B5F5A): 6.96:1 OK.
- --text-secondary #5A6A65 sobre --bg: 5.29:1 OK (sobre el degradé superior más oscuro ~4.9:1, OK).
- --border-ui #74847F sobre --bg: 3.64:1; sobre --surface: 3.85:1 OK (1.4.11).
- Acento sobre --surface (hora 19:00, edición): ~7.3:1 OK.
- Segmentos de progreso vacíos (mezcla border-ui 55% / surface-2 ≈ #A7B4B0) sobre --bg: ≈1.99:1, bajo 3:1. Lo compensa el segmento lleno (≈3.5:1 contra el vacío), pero la pista vacía es tenue.
- Áreas táctiles: opciones min-h 64px, Continuar 56px, Volver 44px, chips 56px, Saltar 48px, «Ver mi Panel ya» 44px: OK.
- Foco: no hay :focus-visible global; solo «Saltar» lo define. Opciones y Continuar dependen del outline por defecto del navegador; el input usa outline-none y solo cambia el color del borde (gris 3.6:1 a teal).

## Verificación en código
- MotionConfig reducedMotion="user" envuelve todo: OK. Entrada escalonada de opciones (delay 0.05·i, 250ms): OK. Con movimiento reducido no hay avance automático (`!reduce`): OK.
- Avance automático cancelable: se cancela con Volver, Saltar, Continuar, Editar, o al elegir otra opción; no hay cancelación explícita ni aviso de que avanzará solo. Es un cambio de contexto al seleccionar un radio (WCAG 3.2.2) sin advertencia previa.
- Roles: radiogroup/radio y group/checkbox con aria-checked: OK, pero sin navegación por flechas (patrón radiogroup incompleto). role="status" para el mensaje de ayuda: OK. Foco al h1 al cambiar de paso: OK.
- Botón Continuar siempre activo con ayuda: OK, implementado. La ayuda aparece a ~250 px del campo inválido, pegada al botón, sin color ni icono de error.
- Progreso por etapas y checks de «Armando»: OK (barra 25/50/75/100 %, spinner→check por línea, «Ver mi Panel ya» como salida). Sin role progressbar en «Armando» (barra aria-hidden).
- Micro-celebración: banner «¡Eso es!» + pulso de escala 1.15 del check, sin confeti ni springs grandes: cumple la ficha.
- Movimiento baseline: entrada escalonada SÍ; conteo de números N/A (no hay número héroe); barra que se dibuja SÍ; tap con `active:scale-[.98]` pero con `transition-colors` (el escalado salta sin easing); transición entre pasos solo entra (sin salida); celebración leve SÍ.
- Reglas de 02B: pregunta con razón-porque en cada subtítulo OK; registro después del valor OK; primera victoria activa OK; costo hundido (contarRespuestas) alimenta el paywall OK; etiquetado pre-paywall presente pero genérico («alguien que quiere hacerlo bien»), sin el dolor literal de la ficha (miedo a olvidar). Escalera con 6 preguntas frente al ESTADO.md («onboarding pide solo nombre + 1 cosa»): desvío de alcance no documentado.

## Tabla pantalla → estado → defecto accionable
| Pantalla | Estado | Defecto accionable |
|---|---|---|
| 1 nombre | ✅ (con reservas) | Ayuda «Escribe su nombre para seguir» queda lejos del campo y sin señal de error; ponerla bajo el input con borde/ícono de aviso. Sin `enterKeyHint="next"`. |
| 1b nombre con ayuda | ❌ | El aviso está en el pie junto al botón, no en el campo; el usuario con teclado abierto puede no verlo. Moverlo al lado del input y color de error. |
| 2 cantidad | ✅ | Los tres íconos son la misma huella: no aportan información. Usar 1/2/3 huellas o quitar. |
| 3 etapa | ✅ | Ícono Adulto = huella genérica; Senior = reloj (no comunica edad). Cambiar por íconos que distingan etapas. |
| 4 cuidados | ✅ | Multi-selección sin contador ni indicación visual distinta a la de radio (mismo círculo con check); usar casilla cuadrada para elección múltiple. |
| 5 cuidadores | ✅ | Avanza sola en 320 ms sin aviso: un toque errado te saca de la pregunta. Mostrar la selección ≥600 ms o quitar el auto-avance. |
| 6 momento | ✅ | La última pregunta avanza sola al reconocimiento; «Varias veces al día» guarda 08:00 sin decirlo. |
| 7 reconocimiento | ❌ | Cinco tamaños de texto y 6 chips; titular con acento en «bien» (palabra sin valor) y sin el dolor literal de la ficha. Recortar a 3 tamaños y acentuar «Toffee» o «contigo». |
| 8 armando | ✅ (con reservas) | «Ver mi Panel ya» queda entre la barra y los checks (orden ilógico) y la línea 3 dice «quién hizo qué» aunque eligió «Solo yo». Mover la salida debajo de la lista y condicionar la línea. |
| 9 resultado | ❌ | Al marcar el primer cuidado aparece el banner y empuja toda la lista ~72 px: el objetivo táctil se mueve bajo el dedo. Reservar el espacio o mostrar el mensaje dentro de la fila. Además el CTA queda pegado al borde inferior (sin aire) y la fila 3 con 4 líneas se ve desigual. |

## TOP 5 DEFECTOS
1. [Resultado, banner «¡Eso es!»] Aparece tras el primer toque y desplaza toda la lista, moviendo los objetivos táctiles (y desaparece al desmarcar) → reservar altura fija o poner la confirmación dentro de la propia fila, sin cambiar el layout.
2. [Pasos 2, 3, 5, 6, avance automático] Cambia de pantalla a los 320 ms de elegir, sin aviso ni forma explícita de cancelar (WCAG 3.2.2, mala tolerancia a toques erróneos) → quitar el auto-avance o alargarlo a ≥700 ms con indicador visible y «Cambiar» en la propia pantalla.
3. [Pasos 1/1b, ayuda de validación] El aviso vive en el pie, ~250 px lejos del campo, sin color ni icono de error → renderizarlo directamente bajo el input con estilo de error y aria-describedby a ese nodo.
4. [Identidad en pasos 2-6] Cinco de nueve pantallas son listas de tarjetas con íconos Lucide intercambiables con cualquier app; el duotone y el logo solo pesan en 1 y 7 → llevar el duotone o el trío de perros como detalle recurrente (fondo, ícono de opción, estado de «Armando») y usar íconos distintos por etapa/cantidad.
5. [Reconocimiento, jerarquía y etiquetado] Cinco tamaños de texto + 6 chips, y el titular «tiene a alguien que quiere hacerlo bien» no usa el dolor literal del avatar ni etiqueta con identidad clara → reducir a titular / subtítulo / chips y reescribir con la frase de la ficha (miedo a olvidar → «no se te olvida nada»).

Otros: pista de progreso vacía a ≈2:1; sin :focus-visible propio en opciones y Continuar; escalado del tap sin transición; desvío del alcance del ESTADO.md (6 preguntas vs «nombre + 1 cosa») sin documentar.
