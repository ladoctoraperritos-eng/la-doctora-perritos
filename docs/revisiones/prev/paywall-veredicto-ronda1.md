# VEREDICTO revisor-visual — paywall
Fecha: 2026-09-24 01:05
Screenshot: docs/revisiones/paywall-375.png
Usabilidad: 24/40
Craft: 10/20
Copy (si vende): 13/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA

Detalle usabilidad: h1:2 h2:3 h3:3 h4:3 h5:2 h6:3 h7:2 h8:2 h9:2 h10:2
Detalle craft: jerarquía:3 profundidad:3 identidad:1 movimiento:0 encaje:3
Detalle copy: idea:3 especificidad:3 emoción:2 oferta:3 acción:2 (ningún eje ≤2 se tolera: emoción y acción están en 2, se corrigen aunque el total pasara)

Nota de contexto respetada: el botón desactivado por falta de enlaces de Hotmart es intencional y honesto; se puntúa lo que el usuario VE (un botón ilegible y una página sin CTA alcanzable), no la falta de enlaces en sí. Prueba de 7 días y garantía de 15 días activadas por declaración de la creadora; no verificadas por el revisor.

## Gate de carga cognitiva
[ ] Listas ≤4-5 ítems: ok (4 beneficios) · [x] ≤4 opciones por decisión (2+2) · [x] una acción primaria · [ ] No recordar entre pantallas: se vuelve a preguntar cuántos perros tiene · [x] campos · [ ] texto por bloque ≤3-4 líneas: la caja de cobro tiene 7 líneas de texto · [x] qué sigue obvio · [ ] CTA no alcanzable sin scroll: la página mide ~1.245 px CSS y el botón queda hacia y≈1.020-1.076 px, fuera de un viewport de 812 px; sin CTA fijo. 3 fallas: no es sobrecarga crítica (≥4), pero es el defecto de estructura más caro.

## Contraste WCAG (cálculo sobre tokens.css)
| Par | Ratio | Resultado |
|---|---|---|
| Titular #22302C / fondo | 12,76 | ok |
| Texto secundario #5A6A65 / fondo | 5,29 · sobre surface-2 4,83 · sobre surface 5,64 | AA ok |
| Acento #0B5F5A / fondo | 6,96 · sobre surface 7,42 · sobre surface-2 6,36 | ok |
| CTA activo (texto #F4F7F6 sobre acento) | 6,96 | ok |
| CTA DESHABILITADO (opacity-40) texto/fondo | 1,94 | FALLA: «Empezar mis 7 días gratis» casi ilegible; el botón se funde con el fondo |
| Borde de la tarjeta del plan (acento 30 %) | bajo 3:1 (no medido en píxel) | débil |
Áreas táctiles: CTA 56 px, selectores 56 px, links inferiores 44 px de alto, atrás 44 px: ok.
Anclas «CTA vivo»: contraste (activo) ok · estado tap/hover NO definido (sin :active) · deshabilitado por defecto (FALLA la regla; aquí por causa externa) · área táctil ok. Falla 2 de 4.

## Reglas de 02B
| Regla | Estado |
|---|---|
| Costo hundido | ⚠️ solo una línea «Hecho con tus 6 respuestas»; no muestra lo construido (medicamento 19:00, nombre, etapa) |
| Personalización visible | ⚠️ solo el nombre en el titular; los beneficios son iguales para todos («Hasta 3 tutores» aunque respondió «Solo yo») |
| Lenguaje controlador / reactancia | ✅ sin urgencia falsa ni culpa |
| Salida visible | ✅ atrás, «Ahora no», «Ya tengo cuenta» |
| Transparencia de cobro | ✅ «Hoy pagas US$0 / Primer cobro US$29 el 1 de octubre de 2026» (24-sep + 7 días: correcto) |
| Cancelación de la prueba | ❌ no dice cómo/hasta cuándo cancelar ni si se pide tarjeta |

## Tabla pantalla → estado → defecto
| Zona | ✅/❌ | Defecto accionable |
|---|---|---|
| Titular + costo hundido | ✅ | Bien personalizado; añadir qué contiene el panel (p. ej. «Medicamento a las 19:00») |
| Selector de plan (1 o 2 / 3 a 5 perros) | ❌ | Re-pregunta un dato ya dado en el onboarding y permite elegir el plan equivocado. Mostrar solo el plan recomendado con «¿Tienes más perros? Cambiar» |
| Selector Anual/Mensual | ⚠️ | Correcto, pero sin mostrar el ahorro en dinero; el badge «2 meses gratis» usa acento (la ficha reserva coral para badges de ahorro) |
| Tarjeta de plan y precio | ✅ | US$29 dominante y honesto («no una sola vez al mes»); sin ancla contra alternativa (consulta veterinaria, dosis perdida) |
| Caja de cobro | ⚠️ | 7 líneas grises pequeñas; la garantía va enterrada al fondo, sin nombre («Garantía de 15 días» sin nombre propio) y a ~150 px del botón |
| CTA | ❌ | Fuera del primer viewport, sin CTA fijo; deshabilitado con texto a 1,94:1 y sin estado :active. Hacer el CTA sticky y mostrar en él el mensaje honesto al tocar (sin opacity-40) |
| Microcopy bajo CTA | ⚠️ | «El pago se está conectando. Vuelve en unos días» en producción mata la confianza: ofrecer «Avísame cuando esté listo» (correo) en lugar de una salida muerta. No responde a objeción de seguridad/medios de pago LATAM (solo «lo procesa Hotmart») |
| Links «Ahora no / Ya tengo cuenta» | ✅ | Separados 16 px, objetivo ≥44 px |

## Copy de venta (rúbrica 4, trazado a FICHA-AVATAR)
- Idea única (3): «Panel de Hoy» bautizado en titular y caja; falta el mecanismo «quién ya se encargó».
- Especificidad y prueba (3): precios, fechas y plazo de garantía verificables; sin testimonio (correcto, no existen); sin claim de salud ni ingresos.
- Emoción/dolor (2): ninguna línea del paywall nombra la escena del avatar («¿le di ya la pastilla?», «pensé que se lo habías dado tú»). Las 4 viñetas son features, no alivio.
- Oferta (3): qué recibo y cuánto está claro; sin ancla («precio < una consulta», objeción 2 de la ficha marcada «→ paywall»), sin «tus datos nunca se borran» (objeción 5 marcada «→ paywall»; solo aparece «datos exportables»), ebook regalo del anual ausente aquí.
- Acción (2): un CTA en primera persona («Empezar mis 7 días gratis») pero inalcanzable/ilegible.
- Sub-checks: Message-match (dato de anuncio: no existe: no verificable). Garantía nombrada cerca del CTA: NO (sin nombre y lejos del botón).
- Total 13/20, por debajo de 16 y con eje ≤2.

## Accesibilidad (código)
- Bien: `role=group` con `aria-label` en selectores, `aria-pressed`, `role=status` en el aviso, `<dl>` en el cobro, h1 único.
- Mal: seleccionar un plan/periodo no anuncia el cambio de precio (sin aria-live); botón deshabilitado con `disabled` sin `aria-describedby` al aviso; sin :active; el enlace atrás va a /onboarding que reinicia en la pregunta 1 (se pierde el resultado); ninguna comprobación si se entra a /paywall sin respuestas: muestra «El Panel de Hoy de tu perro está listo» aunque no se hizo nada.

## Movimiento (eje 4)
Cero: Paywall.tsx no usa motion; no hay entrada, ni cambio animado de precio, ni tap. 0/4.

## Fidelidad a FICHA-ARTE
Paleta/tipografía/radios coinciden. Desvíos menores: badge de ahorro en acento y no coral; titular con acento en un nombre propio. Sin dispositivo ownable ni hairline degradé; chips de beneficio son checks Lucide sueltos, no chips (eje identidad 1).

## Top 5 defectos
1. [CTA, bajo la tarjeta] Botón fuera del primer viewport, deshabilitado a 1,94:1 y sin estado de tap → CTA fijo al pie; en el estado sin enlace, botón legible que al tocar muestra el aviso honesto y ofrece «Avísame por correo».
2. [Selector de plan] Re-pregunta la cantidad de perros ya respondida → mostrar solo el plan recomendado con enlace «Cambiar».
3. [Contenido bajo el titular] Cero dolor del avatar y costo hundido pobre → reemplazar «Hecho con tus 6 respuestas» por el resumen real del panel de Toffee (medicamento 19:00, etapa) y una línea del dolor literal («Sin preguntarte si ya se lo diste»).
4. [Caja de cobro] Garantía sin nombre y lejos del CTA, sin política de cancelación de la prueba, sin respuesta a «¿otra suscripción?» ni a seguridad de pago → mover «Garantía de 15 días» junto al botón, añadir «Cancela antes del 1 de octubre y no pagas» y una línea de ancla de precio.
5. [Identidad/movimiento] Sin dispositivo ownable ni movimiento, y /paywall sin respuestas muestra un titular falso → añadir logo/dog duotone y entrada/cambio de precio animado; redirigir a /onboarding si `contarRespuestas` es 0.
