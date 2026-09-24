# VEREDICTO revisor-visual — onboarding
Fecha: 2026-09-24 12:00
Screenshot: docs/revisiones/onboarding-1-nombre.png (+ 1b, 2 a 9 en la misma carpeta)
Usabilidad: 28/40
Craft: 14/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA

Detalle usabilidad: h1:3 h2:3 h3:3 h4:3 h5:3 h6:3 h7:2 h8:3 h9:3 h10:2
Detalle craft: jerarquía:3 profundidad:2 identidad:3 movimiento:3 encaje:3

## Gate de carga cognitiva
Fallas: (1) el resumen de reconocimiento lista 6 filas (>4-5) y su CTA queda bajo el pliegue; (2) sin indicador de progreso en reconocimiento/armando/resultado (02B regla 3); (3) "qué sigue" oculto en reconocimiento (el botón no se ve en la captura). 3 fallas: bajo el umbral crítico de 4, pero cuenta.

## Accesibilidad (verificada en código y con cálculo WCAG sobre tokens.css)
- Roles: radiogroup/radio y group/checkbox con aria-checked, progressbar con aria-label, h1 con foco al cambiar de paso, ayuda con role=status aria-live. OK.
- Contrastes: --border-ui #74847f = 3.64:1 sobre --bg y 3.85:1 sobre --surface (pasa 1.4.11). --text-secondary #5a6a65 = 5.3:1 sobre --bg. Texto --bg sobre --accent #0b5f5a = 7.0:1. Pasan.
- Áreas táctiles: opciones min-h-16, CTA h-14, atrás/editar size-11 (44px), Saltar h-12. OK.
- Reduced-motion: useReducedMotion elimina translate, pulso y autoavance. Al desactivar el autoavance el usuario debe pulsar Continuar. Es coherente, pero la barra de "armando" pasa a 100% de golpe y sigue esperando 5 s.

## Tabla pantalla -> resultado -> defecto
| Pantalla | Estado | Defecto accionable |
|---|---|---|
| 1 Nombre (captura 1) | ✅ | Flecha "Volver" desalineada del margen izquierdo del logo y del título (icono centrado en botón de 44px, queda ~14px adentro): alinear con -ml-2.5. |
| 1b Ayuda sin nombre | ✅ | Mensaje "Escribe su nombre..." aparece en negro semibold sin ícono ni color de error: correcto, pero sin borde de error en el input. Añadir borde/estado de error al campo. |
| 2 Cantidad | ❌ NO VERIFICABLE | El archivo onboarding-2-cantidad.png muestra la pantalla de etapa. La pantalla de cantidad no fue capturada. |
| 3 Etapa | ✅ | Etiqueta "Cachorro" y "Adulto/Senior" bien. El "Saltar por ahora" es texto gris sin contorno: aceptable. |
| 4 Cuidados | ✅ | Archivos desfasados: -3-etapa muestra cuidados, -4-cuidados muestra cuidados con selección. 4 opciones, límite OK. |
| 5 Cuidadores | ❌ NO VERIFICABLE | onboarding-5-cuidadores.png muestra la pantalla de momento. Cuidadores no fue capturada. |
| 6 Momento | ⚠️ | La captura es la de reconocimiento. Momento se ve en el archivo -5, así que el mapeo de nombres de archivos está corrido en toda la serie. Renombrar y recapturar. |
| 7 Reconocimiento | ❌ | 6 filas + foto + titular + párrafo: el CTA "Armar el Panel de Toffee" queda fuera de la vista; sin progreso. Acortar el resumen o fijar el CTA abajo (sticky). |
| 8 Armando | ⚠️ | Espera artificial fija de 5 s sin forma de saltarla; con reduced-motion la barra llega al 100% y aun así hace esperar. |
| 9 Resultado | ✅ | Primera victoria clara y CTA visible. "Ejemplo armado con tus 6 respuestas" es texto de 14px gris. Bajo peso, aceptable. |

## Verificación en código
- Autoavance 320 ms en cantidad/etapa/cuidadores/momento: confirmado (setTimeout(siguiente,320) en elegir). Defecto: `siguiente` captura `paso` del render, y el temporizador no se cancela al pulsar Continuar, Volver o Editar. Un Volver dentro de esos 320 ms te devuelve hacia adelante.
- Continuar nunca disabled: confirmado (muestra ayuda y enfoca el input solo en el paso del nombre; en los demás no se enfoca nada).
- Cuidados: "Solo controles" es excluyente. Correcto.
- Marca (logo) enlaza a "/" y saca del flujo sin confirmación (las respuestas persisten en localStorage, riesgo bajo).

## Ficha de arte
Paleta #F4F7F6/#FDFEFD/#22302C, acento #0B5F5A, DM Sans y radios 18/14 coinciden. Nota: --text-secondary es #5A6A65 y la ficha dice #5F706B (desvío menor, sí cumple AA). El duotone solo aparece en la pantalla de reconocimiento, 1 de 9 pantallas. Las otras se leen como un formulario limpio de plantilla.

## Top defectos
1. Reconocimiento (captura 7): lista de 6 filas + foto empujan el CTA fuera de la vista y no hay progreso. Reducir a 3 filas resumen o poner CTA sticky, y mantener la barra de progreso.
2. Evidencia incompleta: las capturas cantidad y cuidadores no existen y todo el resto está desfasado un puesto en sus nombres. Recapturar las 6 preguntas con el nombre correcto.
3. Identidad: el dispositivo de marca (duotone y logo de tres perros) casi no aparece en las 6 preguntas. Poner una miniatura duotone o el logo en el encabezado de las preguntas, no solo en reconocimiento.
4. Autoavance (Onboarding.tsx líneas 237-244): el temporizador de 320 ms no se limpia en Continuar/Volver/Editar y usa el `paso` viejo. Limpiar el temporizador en irAlPaso y atras.
5. Armando (8): espera fija de 5 s sin salida y profundidad plana en tarjetas blancas sobre fondo casi blanco. Permitir tocar para continuar y darle a la tarjeta hundido/elevado más marcado.
