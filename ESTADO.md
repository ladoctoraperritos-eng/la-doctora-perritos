# ESTADO — La Doctora Perritos · Cuida y Recuerda

## Fase actual
Sesión 1 (validación + avatar). Flujo B. Fuente: PDF del usuario (investigación propia, no es el bloque "RESUMEN FINAL" formal).

## Idea base
- Marca: La Doctora Perritos (ya asociada a contenido canino del usuario → canal de audiencia propio, por confirmar).
- Promesa: "Te avisamos qué necesita tu perro, cuándo lo necesita y antes de que algo importante se te acabe u olvide."
- Propuesta de valor: "Ayudo a tutores de perros con medicamentos, controles o cuidados frecuentes a saber qué necesita su perro y cuándo, sin depender de su memoria ni arriesgarse a olvidar algo importante."
- Segmento inicial: tutor de perro con medicamentos, senior, en tratamiento o con cuidado compartido. Luego cachorros/perros sanos.
- Pantalla principal: "Hoy con [perro]" (qué toca, stock, quién hizo qué, próximo control), no menús de historial.
- 5 preguntas: ¿Qué toca hoy? · ¿Qué se está acabando? · ¿Quién hizo qué? · ¿Qué pasó? · ¿Qué hago si pasa algo? (emergencia educativa, sin diagnosticar).
- Avatar: Carolina, 38, trabaja jornada completa, pareja, 2 perros (uno de 10 años con medicación diaria).
- Dolor central: carga mental / miedo a olvidar o duplicar dosis. Razón de compra #1: escapar del dolor mental; #2 comodidad; #3 tiempo.
- Objeciones: "pongo una alarma", "otra suscripción", "qué lata ingresar datos", notificaciones que fallan, pérdida de datos si dejo de pagar.
- Referencias/competencia: DogLog (US$3,99/mes, +100k descargas), Bitpet Chile ($3.990 CLP/mes, 3 cuidadores), 11pets (quejas por pérdida de datos).
- Frases reales del cliente: ver PDF (guardar en copy).
- Restricción de producto: no diagnosticar ni sustituir al veterinario; onboarding corto; recordatorios confiables; datos exportables.

## Mercado y canal
- Chile + México. Audiencia propia: TikTok 33.851 · Instagram 1.951 (fuente: usuario, 2026-09-23). Canal principal = TikTok orgánico.

## Decisiones tomadas (SO: 02C, 02 Paso 0)
- Modelo: onboarding-first (nicho productividad/tracking): landing → onboarding con preview "Hoy con [perro]" sin cuenta → paywall con trial → login → app. Motivo: el valor se ve en 1 minuto y se acumula con uso.
- Trial: 7 días mensual / 14 anual (patrón Headspace; el valor —stock, coordinación— tarda días en verse). Renovación con aviso previo de fecha y monto.
- Precio PROPUESTO: US$4,99/mes o ~US$49/año (≈2 meses gratis); equivalente local en CLP/MXN a fijar con Hotmart. Motivo: mercado US$3,99 (DogLog) / $3.990 CLP (Bitpet), dentro de ±30%. Costo por usuario bajo (sin IA en el núcleo). Suelo 3 (canal): a este precio NO se paga publicidad → crecer orgánico TikTok + afiliados; revisar antes de ads.
- Funciones núcleo: Hoy con [perro] · recordatorios de medicamentos/vacunas/controles · stock con aviso · registro compartido "quién hizo qué" (hasta 3 cuidadores) · historial/documentos · modo emergencia educativo. NO: diagnóstico, marketplace, teleconsulta, IA veterinaria.
- ⚠️ Riesgo técnico: en web app, la notificación push en iPhone solo funciona si la app se instala en pantalla de inicio (iOS 16.4+). Mitigación: instalar como PWA guiada + respaldo por email/WhatsApp. Decidir en arquitectura.
- ⚠️ Comisión Hotmart en precios bajos: verificar con 18 antes de fijar precio final.

## GATE DE DEMANDA (mini-gate fake-door en paralelo a la construcción — 02 Paso 0)
- Método: landing con pre-compra real (oferta de fundador), tráfico orgánico de TikTok.
- Umbral: ≥300 visitas y ≥8% clic-a-checkout (≥24 clics) o ≥3 pagos de desconocidos.
- KILL CRITERIA: plazo 14 días desde publicar la landing. Si <8% clic o 0 pagos con 300+ visitas → reformular ángulo (máx. 2 veces); a la 3ª sin señal, se mata la idea. Sin señal NO se gasta en ads.
- Riesgo asumido: se construye la app en paralelo, sin señal de pago previa (informado al usuario).

## Pendiente
- FICHA-AVATAR: BORRADOR, faltan ≥2 frases reales de la audiencia (comentarios/DMs) y aprobación del usuario.
- Referencia visual (Sesión 2), nombre de perro de ejemplo (Toffee), stack/arquitectura (decisión interna).

## VALIDACIÓN DE MERCADO (2026-09-23, búsqueda web) — VEREDICTO: VIABLE CON AJUSTES
- Tesis "nadie lo hace en español" REFUTADA. Existen: Bitpet (Chile; Free 1 mascota/1 usuario; Premium $3.990 CLP/mes, 3 mascotas, 3 familiares; App Store sin reseñas suficientes = poca tracción), Ruffo (Premium US$1,99/mes o 14,99/año con compartir familia; Superhéroe 4,99/39,99; usa créditos IA/teleconsulta), 11pets (3,0★ con 95 reseñas; pierde datos tras actualizaciones), Pet Care Reminder (genérica), DogLog (inglés, US$3,99/mes, +100k descargas, comprada por "evitar duplicar dosis").
- Tesis reescrita: existen apps, pero ninguna verificada se posiciona como "el sistema del perro con tratamiento" (hoy + quién hizo qué + stock) en español y con una marca con audiencia de 34k. La ventaja es enfoque + distribución (TikTok), no tecnología.
- Señales: dolor confirmado (DogLog: reseñas sobre no duplicar alimentación/medicación entre varias personas; 11pets: quejas de pérdida de datos). Pago: hay disposición (competidores cobran US$2-5). NO verificado: volumen de búsquedas en Chile/México, rating en Google Play.
- Precio: mercado US$1,99–4,99; mediana ~US$3,99. PRECIO AJUSTADO: US$3,99/mes o US$35/año (antes 4,99/49). Motivo: 4,99 quedaba en el techo frente a Bitpet/DogLog y Ruffo a 1,99.
- Riesgos: (1) competidores son apps nativas con push confiable; nuestra web app depende de PWA → objeción "¿y si falla el aviso?" es la #1: probar con ≥10 usuarios reales antes de vender anual; (2) competidores tienen plan gratis → el trial debe mostrar valor en 1 minuto; (3) comisión Hotmart en precio bajo; (4) "Doctora": no dar consejo clínico.
- Ajustes al producto: hero = perro con tratamiento; resumen 1-toque para el veterinario (PDF/enlace) como diferenciador y gancho viral; stock que se descuenta solo; promesa "tus datos siempre exportables, nunca se borran"; primer registro del onboarding: solo 1 medicamento (pendiente de construir).

## Problemas conocidos
- Ninguna pantalla (landing, onboarding, paywall, app) está construida todavía: pendiente, aún en Sesión 1 de validación.
