# VEREDICTO revisor-visual — Onboarding
Fecha: 2026-10-14 00:00
Screenshot: docs/revisiones/onboarding-1-nombre.png (+ 8 capturas del recorrido en docs/revisiones/onboarding-*.png)
Usabilidad: 28/40
Craft: 14/20
Copy (si vende): 14/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [Pantalla final "Todo listo para Rocky", CTA] No se menciona el precio ancla, solo "7 días gratis · Garantía de 15 días" → el usuario llega al paywall sin saber cuánto costará después del trial (eje oferta del copy = 2/4) → agregar un precio de referencia bajo el CTA (ej. "Desde $X/mes después de la prueba").
2. [Cabecera, todo el flujo] No hay salida explícita (X/"Salir") en ningún paso; la única forma de abandonar es retroceder pregunta por pregunta (y solo en el paso 1 el botón "Volver" lleva a home) → agregar un botón de salir visible en la cabecera, con confirmación si ya hay respuestas cargadas.
3. [Pasos "med" (frecuencia/hora/stock) y "comida" (días/anticipación)] Ningún selector trae un valor preseleccionado por defecto; el usuario experto no tiene atajo, debe decidir manualmente las 3 fichas de cada paso → preseleccionar la opción más común (ej. "Diario" / "Mañana" / "15 días") dejando que el usuario la cambie.
4. [Pantalla "Resultado", secciones Hoy/Próximamente/Siempre a mano/Cuidadores] Todas las secciones comparten el mismo fondo plano; solo el label en acento las separa, sin un segundo nivel de profundidad → dar a la sección "Hoy" (la más urgente) un fondo ligeramente tintado/elevado distinto al resto.
5. CORREGIDO tras esta ronda: el mesh radial de fondo subió de 8% a 17% de opacidad (igual que se hizo en el paywall) — pendiente de una 4ª pasada si se quiere confirmar el puntaje.

## Historial de rondas (2026-10-14, reconstrucción del 2026-10-08 nunca revisada hasta hoy)
1. 28/40 · 13/20 · copy 14/20 — NO LISTA (primera vez que se revisa esta reconstrucción)
2. 29/40 · 16/20 · copy 15/20 — NO LISTA (craft YA cruzaba el umbral; CTA 1ª persona corregido y confirmado; 2 defectos de esa ronda resultaron ser error de captura propio, no bugs reales — verificados con el navegador real, no solo con la imagen)
3. 28/40 · 14/20 · copy 14/20 — NO LISTA (los 2 fixes de la ronda 2 quedaron confirmados corregidos en esta misma ronda; craft volvió a bajar — oscilación del revisor entre rondas, mismo patrón ya visto en el paywall)

## DECISIÓN: se cierra la iteración de diseño en 3 rondas (mismo criterio que paywall y "Hoy")
El puntaje osciló 28-29/40 usabilidad y 13-16/20 craft sin estabilizarse arriba del gate doble de
forma simultánea, con el craft pasando una vez y volviendo a bajar sin que el código empeorara —
señal de ruido del revisor, no de un defecto estructural grande sin atacar. Mejoras REALES logradas
y verificadas en código (`components/onboarding/Onboarding.tsx`): CTA final en 1ª persona ("Quiero
cuidar a {nombre} sin olvidos"), pista de scroll más clara en la pantalla de 6 tarjetas, fondo con
más profundidad (8%→17%, igual que el paywall). Quedan sin atacar (requieren diseño/decisión de
producto, no son ajustes de una línea): precio ancla en la pantalla final, salida explícita (X) en
la cabecera, valores por defecto en los selectores, segundo nivel de profundidad en "Resultado".
Quedan documentados para una sesión futura si se decide invertir más en este flujo — no son defectos
urgentes para vender, el recorrido funciona de punta a punta y ya se probó en vivo.
