# VEREDICTO revisor-visual — onboarding
Fecha: 2026-09-24 12:00
Screenshot: docs/revisiones/onboarding-1-nombre.png (y -2 a -9; 375px, dpr 2)
Usabilidad: 28/40
Craft: 12/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA

Detalle usabilidad (0-4): h1:3 h2:3 h3:3 h4:3 h5:3 h6:3 h7:2 h8:3 h9:2 h10:3
Detalle craft: jerarquía:3 profundidad:2 identidad:2 movimiento:2 encaje:3

## Gate de carga cognitiva
Pasa (0-1 fallas): grupos de 3-4 opciones, una acción primaria, un qué-sigue obvio, 1 campo por pantalla. Única duda: el CTA «Continuar» nace disabled (falla el ancla «CTA héroe vivo»).

## Contraste WCAG (hex reales de tokens.css)
| Par | Ratio | Resultado |
|---|---|---|
| texto #22302C / fondo #F4F7F6 | 12.76 | OK |
| secundario #5A6A65 / fondo | 5.29 | OK |
| secundario / superficie #FDFEFD | 5.64 | OK |
| secundario / opción seleccionada (#EAF1F0) | 4.98 | OK |
| secundario / surface-2 (CTA disabled) | 4.83 | OK (exento por disabled, pero se lee «muerto») |
| CTA #F4F7F6 sobre #0B5F5A | 6.96 | OK |
| borde de opción NO seleccionada (mezcla 60% de #566661) sobre fondo / superficie | 2.50 / 2.67 | FALLA 1.4.11 (UI ≥3:1) |
| segmentos de progreso apagados (#A9C6C3) / fondo | 1.69 (activo vs apagado 4.13) | Estado dependiente casi solo de color claro; el progressbar lleva aria, aceptable pero débil |
| placeholder «Por ejemplo, Toffee» (color por defecto del navegador, no tokenizado; se ve gris claro) | ~2.8 estimado | FALLA 4.5:1 |

## Accesibilidad
- Bien: h1 con foco al cambiar de paso, role radiogroup/radio y group/checkbox con aria-checked, progressbar con valuenow, label sr-only del input, aria-live en «Armando», botones ≥44px (opciones 64px, CTA 56px), `active:scale`, `touch-action`.
- Mal: `autoFocus` del input de nombre choca con el `useEffect` que enfoca el h1 (corre después): en el paso 1 el foco termina en el título, el teclado del móvil no se abre y hay un toque extra. Los radios no tienen navegación por flechas (son botones sueltos). «Saltar por ahora» y «Cambiar una respuesta» son 48px de alto pero sin foco visible propio definido. `animate-pulse` en «Armando» no respeta reduced-motion.

## Reglas de 02B
| Regla | Estado | Nota |
|---|---|---|
| Una pregunta por pantalla | ✅ | 6 pasos, nombre solo. |
| Progreso visible | ✅ | 6 segmentos + aria; sin animación de avance. |
| Personalización visible | ✅ | Nombre en títulos, hora del aviso, control por etapa. |
| Primera victoria | ✅ | Marcar «Medicamento» en el Panel; sin feedback animado del check. |
| Skip en no críticos | ✅ | Etapa y cuidadores saltables; nombre/cantidad/cuidados/momento no. |
| Costo hundido | n/a aquí | Se cobra en el paywall. |
| Sin lenguaje controlador | ✅ | Ningún «debes». |
| Salida visible | ✅ | Flecha atrás en pasos, logo a inicio; el Resultado no tiene volver. |

## Tabla pantalla → estado → defecto accionable
| Pantalla | Estado | Defecto accionable |
|---|---|---|
| 1 Nombre | ❌ | CTA disabled por defecto (pill muerto) y placeholder gris claro; foco robado por el h1 (autoFocus inútil). Habilitar el botón y validar al toque con hint; quitar el foco al h1 en el paso 1; placeholder con color de token ≥4.5:1. |
| 2 Cantidad | ✅ | Sin auto-avance (50 pide 250-400ms tras marcar). Opcional. |
| 3 Etapa | ✅ | Título «¿En qué etapa está Toffee?» con «Senior» puede sentirse duro; ok. |
| 4 Cuidados | ❌ | Cards de altura desigual («Solo vacunas y controles» 3 líneas, «Comida» 2); ritmo roto y botón queda pegado al borde inferior sin aire. Acortar textos a 1 línea de detalle. |
| 5 Cuidadores | ✅ | Íconos duplicados (Users para «pareja» y «cuidador»): distinguir. |
| 6 Momento | ❌ | «¿Cuándo le das lo importante?» es vago (¿qué es lo importante?). Reformular: «¿A qué hora le das su cuidado principal?». |
| 7 Reconocimiento | ❌ | «Cambiar una respuesta» te devuelve al paso 6, no permite elegir cuál; pantalla sin flecha volver ni progreso; único reconocimiento tras las 6 preguntas (02B/50: cada 3-5). |
| 8 Armando | ❌ | 2,7 s (50 pide 4-6 s) y los 3 checks aparecen ya «hechos» aunque no haya proceso real; sin stagger animado ni barra; animate-pulse ignora reduced-motion. |
| 9 Resultado | ❌ | Afirma «los demás tutores lo ven al instante» aunque es una simulación; sin volver; CTA «Seguir con Toffee» vago sobre qué sigue (paywall) ; «Alimento» sin hora rompe el patrón de filas. |

## Ficha de arte
Paleta, DM Sans y radios 18/14 coinciden. Desvíos: texto secundario en tokens (#5A6A65) difiere de la ficha (#5F706B); el badge de ahorro debería ir en coral #E8896B según la ficha y va en teal (paywall); el dispositivo ownable declarado (duotone de foto de los perros) no aparece en ninguna pantalla del onboarding. Anti-clon: no coincide con «Capítulo» ni «Umbral» (pasa), pero es teal-clínico genérico con logo pequeño como único rasgo propio.

## Movimiento (código)
Presente: entrada fade+y12 en 250ms con reduced-motion, tap scale .98, transición de color. Ausente: animación del progreso, stagger de opciones, conteo, celebración leve del primer check (la ficha prohíbe confeti, no un micro-feedback), transición entre tabs n/a.

## Top 5 defectos
1. [Paso 1, botón Continuar y placeholder] CTA disabled de nacimiento + foco robado por h1 + placeholder <4.5:1 → botón activo con validación al tocar, quitar `autoFocus`/dejar el foco en el input, placeholder tokenizado.
2. [Bordes de opciones, pasos 2-6] borde no seleccionado 2.5:1 <3:1 → subir a ≥3:1 (p. ej. #7A8985 sobre blanco) o sombra/relleno.
3. [Armando] pantalla de 2,7 s con checks falsos, sin stagger ni reduced-motion en el pulso → 4-6 s, checks que aparecen por línea con animación y `motion-safe:animate-pulse`.
4. [Reconocimiento y Resultado] sin volver ni elegir qué respuesta cambiar; simulación que promete «los demás tutores lo ven» → botón atrás en ambas, «Cambiar una respuesta» con lista, texto «así se verá» honesto.
5. [Identidad de todo el flujo] sin dispositivo ownable ni hairline/chips de marca, profundidad casi plana, sin motion de progreso → añadir un rasgo firma (duotone de sus perros/hairline degradé), animar la barra de progreso.
