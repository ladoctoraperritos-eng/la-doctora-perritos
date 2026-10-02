# VEREDICTO revisor-visual — SOS
Fecha: 2026-10-02 00:00
Screenshot: docs/revisiones/sos-375.png
Usabilidad: 30/40
Craft: 14/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [Lista y Detalle, CTA "Agregar teléfono de tu veterinario"] Ambas variantes dashed (TarjetaVeterinario en Sos.tsx L67-76, y el botón fallback de Detalle L243-251) NO tienen `active:scale`/`transition` como sí tiene el botón "Llamar a..." (L236) — es justo el estado que ve TODO usuario nuevo (sin teléfono guardado), y al tocarlo no se siente ninguna respuesta → agregar `transition-transform duration-150 active:scale-[0.97]` a los dos.
2. [Lista "¿Qué pasó?"] La pantalla obliga a leer el aviso legal + la tarjeta del veterinario + las 3 categorías de triage (con sus listas de ejemplos) ANTES de llegar a las 7 situaciones accionables — en un contexto de pánico/emergencia esto es scroll y lectura de más antes de tocar algo útil → colapsar el bloque de Triage en un acordeón cerrado por defecto o resumirlo a 1 línea con enlace "ver niveles".
3. [Tarjeta de veterinario sin teléfono, vista Lista] Usa borde punteado gris/teal tenue, de bajo contraste y sin urgencia — mismo propósito que el CTA del detalle (que sí quedó rojo y prominente) pero con tratamiento visual distinto → unificar: usar el mismo rojo prominente en la lista que en el detalle para la misma acción.
4. [Pantalla completa] Fondo totalmente plano (sin tinte/gradiente sutil) e íconos genéricos de librería Lucide en chips de color estándar — nada en esta pantalla distingue la app de cualquier otra app de salud hecha con shadcn+Lucide; el dispositivo ownable de la ficha (hairline degradado/duotone) no aparece acá → aplicar un tinte sutil al fondo y/o el hairline degradado en algún elemento clave (p.ej. el encabezado o el chip de nivel de triage).
5. [Formulario "Tu veterinario", Hoja] `CampoTelefono` soporta `error` pero `FormVeterinario` en Sos.tsx nunca lo usa ni valida formato antes de `guardarVeterinario` — se puede guardar un número inválido sin aviso, y en la emergencia real el botón `tel:` fallaría en silencio → validar formato al enviar y mostrar el error inline, igual que en el formulario de Perros.
