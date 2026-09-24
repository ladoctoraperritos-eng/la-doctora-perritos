# VEREDICTO revisor-visual — login
Fecha: 2026-09-24 12:00
Screenshot: docs/revisiones/login-375.png
Usabilidad: 29/40
Craft: 11/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA

Detalle usabilidad (0-4): h1:3 h2:3 h3:3 h4:3 h5:3 h6:3 h7:3 h8:3 h9:3 h10:2
Detalle craft: jerarquía:3 profundidad:2 identidad:2 movimiento:1 encaje:3
Nota: el estado «acceso pronto» (Supabase pendiente) es intencional y honesto; se puntúa como está, sin penalizar que el envío no exista.

## Gate de carga cognitiva
Pasa: 1 campo, 1 acción primaria, qué-sigue obvio, sin elementos falsamente interactivos.

## Contraste WCAG (hex reales)
| Par | Ratio | Resultado |
|---|---|---|
| texto #22302C / fondo | 12.76 | OK |
| secundario #5A6A65 / fondo (subtítulo, «¿Aún no tienes cuenta?») | 5.29 | OK |
| acento #0B5F5A / fondo (enlaces) | 6.96 | OK |
| texto #22302C sobre caja surface-2 #E6EEEC | ≈11 | OK |
| CTA #F4F7F6 / #0B5F5A | 6.96 | OK |
| borde del input (mezcla 70% de #566661) | ≈2.8 estimado | Justo por debajo de 3:1 (1.4.11) |
| placeholder «nombre@correo.com» (color por defecto, no visible en la captura porque hay dato de prueba) | ~2.8 estimado | No verificable en imagen; en código no está tokenizado |

## Accesibilidad
Bien: label visible enlazado, `type=email`, `inputMode`, `autoComplete`, `aria-invalid`, `aria-describedby`, `role=alert` en errores, botón habilitado por defecto con validación al enviar y hint, CTA 56px, «Enviando…» con disabled. Mal: tras el mensaje de sistema no se mueve el foco ni se anuncia la causa junto al campo (solo `alert` bajo el botón); enlaces de texto «Empieza aquí» y el correo de contacto con área táctil solo de la altura de la línea (<44px); la flecha vuelve a `/` aunque se llegó desde el paywall.

## Reglas
Salida visible ✅ (flecha, logo, «Empieza aquí»). Lenguaje sin control ✅. Errores con solución ✅ («Revisa el correo…», y contacto). Estado honesto ✅ (nunca éxito falso).

## Tabla pantalla → estado → defecto accionable
| Pantalla | Estado | Defecto accionable |
|---|---|---|
| Formulario (correo + CTA) | ✅ | Correcto y consistente con el resto. |
| Mensaje de estado «acceso pronto» | ❌ | Dice «Si ya pagaste, escríbenos» cuando el pago aún no existe (botón del paywall desactivado): contradice el flujo. Cambiar a «Aún no hay cuentas activas; te avisamos» o ofrecer dejar el correo. |
| Después del envío (enviado) | ❌ | Solo «Listo. Revisa tu correo y toca el enlace»: sin «revisa spam», sin reenviar ni tiempo de espera (heurística 10). |
| Vacío central (≈500px sin nada) y pie | ❌ | Pantalla casi muda: el «¿Aún no tienes cuenta? Empieza aquí» pegado abajo lejos de la acción; sin elemento de marca más allá del logo. Subir el pie o añadir un rasgo firma. |
| Cabecera | ❌ | La flecha (icono en x≈76) queda sangrada frente al margen de 48px del título y de los campos; logo en tercera posición. Alinear la flecha al margen. |

## Ficha de arte y movimiento
Paleta/tipo/radios de la ficha respetados; dispositivo ownable ausente; profundidad casi plana. Movimiento: solo `active:scale`; el mensaje aparece sin transición, sin `aria-live` fiable (el contenedor cambia de role al vuelo).

## Top 5 defectos
1. [Mensaje «acceso pronto»] «Si ya pagaste» contradice que aún no se puede pagar → texto coherente con el estado real del producto.
2. [Estado enviado] sin spam/reenvío/espera → añadir «Revisa spam» y «Reenviar en 30 s».
3. [Cabecera] flecha sangrada 28px frente al margen del contenido → alinear al margen de 24px o quitar el padding del botón.
4. [Composición] gran vacío y pie lejano; identidad sin rasgo propio ni movimiento → acercar el pie y agregar entrada escalonada / detalle de marca.
5. [Input] borde ≈2.8:1 y placeholder sin token → subir contraste del borde y tokenizar el placeholder.
