# VEREDICTO revisor-visual — landing
Fecha: 2026-09-23 12:00
Screenshot: docs/revisiones/landing-375-completa.png (secciones 01-13 en docs/revisiones/landing-375-NN.png)
Usabilidad: 30/40
Craft: 12/20
Copy (si vende): 14/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA

Detalle usabilidad: h1:3 h2:3 h3:3 h4:3 h5:3 h6:3 h7:2 h8:3 h9:2 h10:3 (h3/h7 verificados en código: sticky CTA en 2 estados, FAQ con un solo panel abierto y aria-expanded; sin atajos ni estado de error/enlace roto verificable; los CTA apuntan a /empezar provisional).
Detalle craft: jerarquía 3, profundidad 2, identidad 2, movimiento 3, encaje 2.
Detalle copy: idea 3, especificidad 2, emoción 3, oferta 3, acción 3.

Gate de carga cognitiva: 2 fallas (FAQ con 6 ítems > 4-5; 3 precios distintos a la vez: US$3,99 / US$2,92 / US$35). Por debajo de 4, no es sobrecarga crítica.
Verificaciones: CTA vivo OK (52px, whileTap 0.97, contraste ~7:1 sobre fondo claro) EXCEPTO en el CTA final. Paleta, DM Sans y radios 18/14 coinciden con FICHA-ARTE. Titular del hero con énfasis en "memoria": OK. Chips SVG sin emojis: OK.

## Tabla sección → estado → defecto accionable
| Sección | Estado | Defecto accionable |
|---|---|---|
| 01 Hero + header | ❌ | La prueba social ("+33 mil seguidores en TikTok · 7 días gratis") parte en 2 líneas y deja "7 / días gratis" huérfano; es débil y repite el CTA. El mockup del teléfono es idéntico al primer frame del carrusel (06). El subtítulo no nombra el mecanismo (Panel de Hoy). Falta el dispositivo ownable de la ficha (duotone del perro): no aparece ningún perro. |
| 02 Problema | ✅ | 5 dolores con ícono en chip y bloques de ≤3 líneas. Detalle: las tarjetas #F4F7F6 sobre fondo blanco casi no se distinguen. |
| 03 Agitación | ❌ | Los tres párrafos grandes van sin ícono y son la parte más textual de la página. Las cajas "Hoy / Si nada cambia" repiten la caja "Antes / Después" de la sección 04: mismo mensaje dos veces. Poco contraste entre las dos cajas. |
| 04 Solución | ❌ | La pastilla "el Panel de Hoy" va en minúscula y con hairline que se desvanece, y parece un botón sin acción. Las cajas Antes/Después usan el mismo fondo, sin diferencia visual entre ellas. El texto de "Antes" (gris sobre gris-verde) roza el límite AA. |
| 05 CTA intermedio | ✅ | Botón claro, 52px, mismo verbo que el hero. Flota solo entre bloques, sin contexto ni microcopy de riesgo. |
| 06 App por dentro | ❌ | Carrusel con la 2ª pantalla cortada (lo esperado), pero es una rejilla de pantallas de app sin una sola prueba social. Añade un CTA pegado al de la sección 05, y quedan dos botones idénticos a pocos scrolls de distancia. |
| 07 Oferta | ❌ | Confunde con tres cifras seguidas: "Hoy: US$3,99/mes (se cobra US$35/año)" contradice "Anual US$2,92/mes". Ambos planes llevan el badge "7 días gratis". El stack valora "12 meses" en US$48 y luego cobra US$35, sin que se entienda cuál es el precio. La garantía no aparece dentro de las cajas de precio. |
| 08 Garantía | ❌ | El título "la Garantía del Primer Aviso" empieza en minúscula. La fila del candado va desalineada (ícono a la izquierda, texto centrado). La garantía vive en una sección aparte, no junto a los CTAs de compra. |
| 09 CTA intermedio | ✅ | Igual que 05. Repetido dos veces solo con el botón, sin microcopy (garantía, cancelar). |
| 10 FAQ | ❌ | Es acordeón con el primero abierto (bien), pero tiene 6 ítems (>5). Y las respuestas de "otra suscripción más" y "datos" no llevan prueba concreta. |
| 11 CTA final | ❌ | DEFECTO CRÍTICO: el acento teal #0B5F5A sobre el fondo #22302C da ~1,9:1 en "tener todo claro" y ~1,8:1 el botón contra su fondo. El titular casi desaparece y el CTA final, que debería ser el de mayor contraste, es el más débil. El PS repite el texto de la garantía casi literal. |
| 12 Footer legal | ❌ | El logo en gris apagado parece deshabilitado. Los enlaces (Privacidad / Términos / Reembolsos) miden ~20px de alto, muy por debajo de 44-48px táctiles. El correo de soporte es provisional (ver ESTADO.md). |
| 13 Aviso legal | ❌ | El aviso "no es un servicio veterinario" está a 12px, separado del footer en su propia caja, muy fácil de pasar por alto. |

## Auditoría de escaneabilidad mobile
- Bloques >4 líneas seguidas: no. Solo el párrafo de la Big Idea (04) llega a 4 líneas, y el PS del CTA final también (4). Al límite.
- Íconos: dolores SÍ (5 chips); pasos NO llevan ícono (son números 01/02/03, aceptable); beneficios SÍ (checks SVG); agitación NO.
- Prueba "solo-titulares": PASA en parte. Leyendo solo los H2 ("¿Te suena?" → "Abres la app y ya sabes qué le toca hoy" → "Tu perro, todo en orden" → "Empieza gratis..." → "Lo que quizá te estás preguntando" → "Imagina abrir la app...") se entiende la historia, pero la garantía no tiene H2 real y "Tu perro, todo en orden" es genérico.
- Respiro entre bloques: SÍ (64px de padding vertical por sección).
- FAQ en acordeón: SÍ.
- Precios y garantía en cajas: SÍ (cards con hairline).
- Ritmo de fondos: alterna base/elevado, pero en varios cortes la diferencia es casi imperceptible (#F4F7F6 vs #FDFEFD), y solo el CTA final rompe con un fondo oscuro.

## Los 5 defectos más importantes (ordenados)
1. [11 CTA final] Acento teal sobre fondo #22302C: titular "tener todo claro" (~1,9:1) y botón (~1,8:1) casi ilegibles → sobre fondo invertido usa el acento aclarado (ej. #5FC7BF) para la palabra clave y un botón claro (fondo #F4F7F6, texto #0B5F5A) o con borde/halo visible; recalcula contraste ≥4,5:1 texto y ≥3:1 CTA.
2. [07 Oferta] Precio confuso (US$3,99 "hoy" vs US$2,92/mes vs US$35/año) y garantía fuera de las cajas → una sola cifra protagonista (anual: US$35/año = US$2,92/mes), quitar "Hoy: US$3,99/mes" del stack, y meter una línea "Garantía del Primer Aviso · 15 días" bajo cada botón de plan.
3. [01 Hero + 06 Carrusel] Sin identidad ownable ni prueba: ningún perro ni foto (la ficha exige duotone del perro) y el mismo mockup se repite en hero y carrusel → añadir foto de perro con duotone de marca en el hero (o en el CTA final) y cambiar el primer frame del carrusel; añadir una prueba concreta (testimonio real o dato verificable) en vez de "+33 mil seguidores".
4. [03/04 Agitación y Solución] Contenido repetido y sin ícono: "Hoy / Si nada cambia" y "Antes / Después" dicen lo mismo; agitación es solo texto grande → fusionar en un único comparativo con chips/íconos y diferenciar los fondos (dolor gris cálido con ícono coral vs. solución con check teal).
5. [08 Garantía / 12-13 Footer] Detalles de oficio: título en minúscula "la Garantía…", fila del candado desalineada, enlaces del footer de ~20px táctiles, aviso legal a 12px aislado → capitalizar, centrar/alinear la fila, dar ≥44px de alto a los enlaces y unir el aviso al footer con 14px.
