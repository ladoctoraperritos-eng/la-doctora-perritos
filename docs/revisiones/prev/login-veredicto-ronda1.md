# VEREDICTO revisor-visual — login
Fecha: 2026-09-24 01:05
Screenshot: docs/revisiones/login-375.png
Usabilidad: 28/40
Craft: 9/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA

Detalle usabilidad: h1:3 h2:3 h3:3 h4:3 h5:3 h6:3 h7:3 h8:3 h9:2 h10:2
Detalle craft: jerarquía:3 profundidad:2 identidad:1 movimiento:0 encaje:3

Nota de contexto respetada: el envío no está conectado a un servicio de correo y el estado honesto es intencional; no se castiga la desconexión, sí cómo se presenta al usuario.

## Gate de carga cognitiva
Pasa 8/8: un campo, una acción primaria, texto corto, qué sigue obvio. (Con matiz: tras el envío el «qué sigue» es escribir a un correo que no se puede tocar.)

## Contraste WCAG (tokens.css)
| Par | Ratio | Resultado |
|---|---|---|
| Titular #22302C / fondo | 12,76 | ok |
| Mensaje de estado (text-primary) / fondo | 12,76 | ok |
| Texto secundario #5A6A65 / fondo | 5,29 | AA ok |
| CTA (texto #F4F7F6 / acento #0B5F5A) | 6,96 | ok |
| Enlace «Empieza aquí» acento / fondo | 6,96 | ok, subrayado (no solo color) |
| Borde del input (tertiary 35 %) / surface | 1,66 | FALLA 1.4.11 (≥3:1) |
Áreas táctiles: input 56 px, CTA 56 px, atrás 44 px: ok. «Empieza aquí» es un enlace en línea de ~24 px de alto: bajo el objetivo de 44/48 px.
Anclas «CTA vivo»: contraste ok · habilitado por defecto y valida al enviar (ok, único CTA de las tres pantallas que cumple) · área táctil ok · estado :active NO definido (falla 1).

## Reglas
| Regla | Estado |
|---|---|
| Salida visible | ✅ atrás al inicio y «Empieza aquí» |
| Lenguaje controlador | ✅ «Sin contraseñas que recordar» |
| Estado honesto | ✅ nunca finge éxito |
| Errores con solución | ❌ ver defectos |

## Tabla pantalla → estado → defecto
| Zona | ✅/❌ | Defecto accionable |
|---|---|---|
| Titular + subtítulo | ✅ | Claros; sin logo ni marca: la pantalla podría ser de cualquier app. Añadir el logo |
| Campo de correo | ⚠️ | Borde 1,66:1; `aria-invalid` se activa también cuando el error es del sistema (no_configurado), así que un lector de pantalla dice «correo inválido» a quien lo escribió bien. Marcar invalid solo con `correoValido()` falso |
| Botón «Enviarme el enlace» | ✅ | Habilitado, 56 px; estado «Enviando…» presente, sin :active |
| Mensaje de estado | ❌ | Mismo peso y color que el texto de ayuda (sin icono ni énfasis): el error de validación y el aviso «se activa pronto» no se distinguen como error; `role=status` (no `alert`) no interrumpe. Añadir icono + borde/fondo de aviso |
| Correo de contacto | ❌ | «contacto@ladoctoraperritos.com» va como texto plano dentro del párrafo: el usuario que pagó y no puede entrar no puede tocarlo. Convertirlo en `mailto:` de ≥44 px |
| «¿Aún no tienes cuenta? Empieza aquí» | ⚠️ | Enlace en línea pequeño; además es un callejón: lleva a un onboarding que termina en un pago aún no disponible |

## Usabilidad: dónde baja
- h9 (2): el mensaje de sistema no dice qué pasó con el correo del usuario, ni si su compra quedó registrada; el error de formato dice «parece que falta algo» (sin decir qué: @ o dominio).
- h10 (2): no hay ayuda posterior al envío (revisar spam, reenviar, cambiar correo, tiempo de vigencia) porque el estado `enviado` es una sola línea; no hay opción de «avisarme cuando esté listo» con el correo ya escrito (el usuario ya lo tecleó).

## Accesibilidad (código)
Bien: `<label htmlFor>`, `type=email`, `inputMode`, `autoComplete=email`, `<form>` con `noValidate`, aria-describedby al mensaje, foco visible por defecto en el botón. Mal: `aria-invalid` mal usado (arriba); sin `:active`; sin `autoFocus` (aceptable en móvil); sin límite de intentos (pendiente declarado).

## Movimiento (eje 4)
Login.tsx no usa motion: 0/4.

## Fidelidad a FICHA-ARTE
Paleta, DM Sans y radios coinciden con la ficha; sin dispositivo ownable ni logo (identidad 1).

## Top 5 defectos
1. [Mensaje bajo el botón] Estado del sistema sin diferenciar del texto de ayuda y `aria-invalid` incorrecto → icono + contenedor de aviso, `role=alert` para errores, `aria-invalid` solo si el correo es inválido.
2. [Texto «escríbenos a contacto@…»] El correo de soporte no es tocable → `mailto:` con área ≥44 px (o botón «Escribirnos»).
3. [Cabecera] Sin logo ni identidad: pantalla intercambiable → logo de marca sobre el titular y fondo/detalle propio.
4. [Campo de correo] Borde a 1,66:1 (WCAG 1.4.11) → borde ≥3:1 (p. ej. text-secondary al 60 %) o fondo hundido.
5. [Sin feedback ni movimiento] Cero animación y sin estado :active; en el estado no_configurado el usuario que ya pagó no tiene camino → añadir `active:scale-[0.97]`, entrada suave y ofrecer «Avísame cuando esté listo» que reutilice el correo ya escrito.
