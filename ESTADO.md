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
- FICHA-MODELO en BORRADOR: falta verificar ≥2 señales de revenue de DogLog (Sensor Tower, Meta Ads Library); posponer hasta antes de la landing (Sesión 3).

## Decisión legal/copy
- La creadora NO es veterinaria (2026-09-23). La app organiza, no diagnostica. Modo emergencia solo educativo con aviso "no reemplaza al veterinario". Copy sin autoridad clínica ni promesas de salud; la marca "La Doctora Perritos" se usa como marca de contenido, con descargo visible en la landing y la app (ver 47-LEGAL). Riesgo a revisar: que el nombre "Doctora" no induzca a creer que hay atención veterinaria.

## Ajuste de alcance (pedido del usuario, 2026-09-23)
- Se registran TRES tipos de "cosas del perro": medicamentos, suplementos y comida. Los tres comparten el mismo mecanismo: horario/dosis o ración, recordatorio, "quién lo dio" y stock que se descuenta con aviso anticipado antes de acabarse.
- Comida: ración diaria (gramos/tazas) × cantidad del saco → días restantes ("quedan ~8 días") y aviso de reposición. Es lo que hoy ya muestra "Alimento — quedan aprox. 8 días" en la pantalla Hoy.
- Onboarding sigue corto: se pide primero 1 cosa (medicamento o comida, a elección); el resto se agrega después.
- Copy: ampliar de "medicamentos" a "medicamentos, suplementos y comida" sin perder el foco en el perro con tratamiento (hero sigue en medicamentos).

## Ajuste de alcance 2 (pedido del usuario, 2026-09-23)
- Ficha del perro (perfil): datos personales (nombre, foto, raza, nacimiento/edad, peso, sexo, esterilizado, chip, alergias, veterinario y contacto) + cuidados periódicos con fecha y alerta: vacunas, antiparasitarios (interno/externo), baños/grooming, controles. Cada uno guarda última fecha, próxima fecha calculada y alerta anticipada.
- Modelo unificado: todo es un "cuidado" con tipo (medicamento | suplemento | comida | vacuna | antiparasitario | baño | control), frecuencia, recordatorio, quién lo hizo y (si aplica) stock. Así el "Hoy con [perro]" y el resumen para el vet salen de una sola fuente.
- Riesgo de alcance: es mucho para el onboarding. Regla: el onboarding pide solo nombre + 1 cosa; la ficha completa se llena después con progreso visible ("ficha 60% completa"). Estado: pendiente de construir.

## Sesión 2 — Identidad visual (en curso)
- Sin captura de referencia del usuario → protocolo A/B/C. Archivo: direcciones-abc.html (copia en docs/revisiones/). Pantalla clave: "Hoy con Toffee".
- A Clínica humana (banco 5, DM Sans, teal #0F766E + coral) · B Cítrica utilitaria (banco 11, Unbounded+Familjen, #D97E00 + verde) · C Nocturna (banco 6, Nunito, #E0B458 sobre #14121B). Esperando elección del usuario.
- Elegida A "Clínica humana" con verde más oscuro (acento #0B5F5A). Tour vista-previa-app.html construido; FICHA-ARTE.md en borrador hasta OK del usuario.
- Contexto de negocio: la creadora ya vende el ebook "Primeros Auxilios Caninos" (US$9, landing con urgencia/miedo, 6 bonos). Compradores del ebook = audiencia caliente para el fake-door; el modo emergencia de la app puede enlazar al ebook. Ojo: el tono de miedo del ebook contrasta con la promesa de tranquilidad de la app.

## Estilo APROBADO (2026-09-23) y multi-perro
- FICHA-ARTE.md aprobada (Clínica humana, DM Sans, acento #0B5F5A). Cosa juzgada.
- Varios perros (decisión): un selector de perros en la parte superior de "Hoy" (Todos · Toffee · Luna · +) y "Todos" agrupa los cuidados por perro. La pestaña "Perros" reemplaza a "Toffee" y lista las fichas. Un solo precio: hasta 4 perros y 3 cuidadores por cuenta, sin cobro por perro (competidores: Bitpet 3, Ruffo 5). Onboarding: tras el primer perro se ofrece "¿Tienes otro perro?" como paso opcional. Cada cuidado, stock y alerta pertenece a UN perro; "quién hizo qué" es por cuenta.
- Siguiente: cerrar Sesión 1 pendiente (aprobación de FICHA-AVATAR + 2 frases reales) y pasar a Sesión 3 (página de ventas).

## Avatar aprobado (2026-09-23) — riesgos
- Usuario confirmó a Carolina. No tiene comentarios de su audiencia sobre olvidar medicamentos: su contenido hasta hoy es de primeros auxilios caninos. RIESGO: la audiencia puede no coincidir con "perro medicado". Mitigación: publicar una pregunta en TikTok/Stories ("¿Alguna vez olvidaste darle su medicamento a tu perro?") para conseguir frases reales y medir el tamaño del segmento; NO inventar testimonios en la landing.

## Sesión 3 — Página de ventas (en revisión)
- Stack: Next.js 16 (App Router) + Tailwind 4 + motion + lucide (scaffold de 51). Raíz del proyecto = esta carpeta. Dev: `npm run dev` (launch.json "web"). Build y lint pasan.
- Kit de landing copiado a components/landing (tokens.css tematizado con FICHA-ARTE). Copy en docs/copy/landing.md, trazado a FICHA-AVATAR. Página: components/landing/LandingPage.tsx → app/page.tsx. Rutas: /empezar (provisional), /privacidad, /terminos, /reembolsos (borradores).
- Capturas reales de la app en public/screens (script scripts/capturar-pantallas.mjs, desde vista-previa-app.html).
- Decisión: trial unificado a 7 días en mensual y anual (el kit muestra un solo N y la landing debe coincidir con el paywall). La pantalla 3 del tour dice 14 días para anual: corregir al construir el paywall real.
- Decisión: bonus del plan anual = ebook «Primeros Auxilios Caninos» (valor US$9) en el stack. La creadora puede vetarlo.
- Estado del gate: pendiente el veredicto del revisor visual independiente (docs/revisiones/landing-veredicto.md) y captura a 375px archivada; la landing no se da por terminada hasta entonces.

## Problemas conocidos
- audit-conversion.sh marca críticos que vienen del propio kit (falsos positivos en comentarios/clases de components/landing/*.tsx y la prop `animate` de motion leída como voseo) y el test de similitud de DOM del comparador A/B/C. El copy visible pasa todas las comprobaciones. Pendiente: reportar al mantenedor del SO.
- Soporte: el correo del footer (soporte@ladoctoraperritos.com) es provisional; falta un correo real que alguien lea y dominio propio.
- CTA provisional: /empezar no tiene onboarding ni checkout; pendiente Hotmart (cuenta + producto con garantía de 7 días) y onboarding (Sesión 4). Sin eso la prueba de demanda aún no puede medir pagos.
- Páginas legales son borradores pendientes de revisión con 47.
- Garantía prometida de 15 días (prueba 7): configurar Hotmart en 15 días ANTES de publicar; el inicio del plazo no está confirmado.
- CORRECCIÓN DE DECISIÓN (2026-09-23): la garantía pasó de 7 a 15 días. Regla dura de 18: la garantía debe durar MÁS que la prueba (7). Hotmart admite 7/15/21/30 y en suscripciones cubre solo el primer cobro (FICHA-MERCADO §4). Copy y páginas legales actualizados.
- REVISIÓN INDEPENDIENTE DE LA LANDING: 1ª pasada (docs/revisiones/landing-revision-1-no-lista.md) 30/40 · 12/20 · 14/20 → NO LISTA. 2ª pasada (docs/revisiones/landing-veredicto.md) 30/40 · 13/20 · 15/20 → NO LISTA. Corregido tras ellas: contraste del CTA final, precios/garantía en las cajas, textos repetidos, logo, footer, íconos en la agitación, microcopy en CTAs intermedios. La landing NO se da por terminada.
- BLOQUEO PARA APROBAR (requiere al usuario): foto real del perro/creadora para el duotone de marca y prueba visual; sin ella el revisor puntúa la identidad en 2/5. Prueba social real (testimonios) = 0 hasta que existan usuarios.

## Cambios pedidos por la creadora (2026-09-23)
- Landing: sin cifra de seguidores de TikTok; «tutores» (hasta 3) en vez de «pareja»; agitación con el dolor en negrita y más grande; mecanismo con voz cercana y empática; ebook fuera de la oferta.
- NUEVA FUNCIÓN PROMETIDA: chat de emergencias con IA «de La Doctora Perritos» (pasos a seguir ante una emergencia; no sustituye al veterinario). Está en ambos planes. Aviso legal: /aviso-ia (borrador).
  · PENDIENTE (claim sin construir — ledger de 61): el chat no existe aún; la landing no debe publicarse con tráfico hasta construirlo o quitarlo.
  · PENDIENTE (40/30): gate de viabilidad unitaria con costo REAL por mensaje; regla: costo de IA ≤ 20% del precio (≤ US$0,80/mes al plan mensual). Fijar cupo mensual justo por plan con la fórmula de 02C antes de prometer «ilimitado». Kill-switch de gasto (31).
  · RIESGO DE SALUD: guardrails obligatorios (nunca diagnosticar ni dosificar, siempre derivar al veterinario, mensajes de alarma → «acude ya a una clínica»), evals con casos de emergencia (31) y base de conocimiento propia de la creadora (su ebook de primeros auxilios como fuente) — decidir en Sesión 6.
- Decisión: funciones IGUALES en mensual y anual (solo cambia el precio). La diferencia en exportación de datos y resumen para el veterinario era un descuido de copy y quedó corregida.

## Ebook como regalo (2026-09-23)
- La creadora agregó el ebook «Primeros Auxilios Caninos» (PDF de 90 páginas, ~77 KB de texto; se mantiene FUERA del repo por peso; portada en public/brand/portada-ebook.jpg). Se entrega como REGALO del plan anual (decisión propuesta; si lo quiere en ambos planes, cambiar). Landing: sección RegaloEbook tras la oferta.
- Valor mostrado: US$9 = precio real de venta (no se infla; un valor mayor solo es válido si el ebook se vende de verdad a ese precio en Hotmart). Su landing del ebook usa un «Antes US$97» tachado: ancla inflada, revisar (47/policies de ads).
- El ebook es la base de conocimiento natural para el chat de emergencias (Sesión 6, RAG 33): fuente propia, con derechos de la creadora.
- ⚠️ Portada: muestra a una mujer con uniforme quirúrgico y estetoscopio y tres perros; parece imagen generada por IA. La creadora NO es veterinaria: usar esa figura como cara de la marca sugiere profesión veterinaria. Se usa solo como miniatura del producto; pendiente aclarar si es foto real y decidir el hero (foto real de su perro o ilustración).

## Anonimato de la creadora y logo (2026-09-23)
- La creadora confirma que las fotos de la portada del ebook (mujer con uniforme y perros) están generadas con IA y que quiere permanecer ANÓNIMA. Decisión: la marca no lleva rostro humano ni figura de «doctora». Se retiró la portada del ebook de la landing (mostraba una persona con uniforme y estetoscopio que no existe) y se reemplazó por una portada de marca con el logo.
- ⚠️ Riesgo a resolver: el ebook y su landing usan una persona generada con IA vestida de profesional médico, y la marca dice «Doctora». Recomendación: declarar en el ebook y en la app que la marca es una guía educativa (no un veterinario) y cambiar la portada por el logo. Anotar en 47.
- Logo propuesto (3 perritos) en public/brand y como favicon; en el header/footer de la landing. Pendiente OK.
- Logo (2026-09-23): la creadora prefiere su propia imagen de los tres perros (public/brand/logo-base.webp) y quiere cambiar el símbolo del corazón con cruz (connota servicio médico). Se compusieron 4 variantes con badge teal: campana, reloj, pastilla, calendario (public/brand/logo-*.png, script scripts/logo-simbolos.mjs). Pendiente su elección; el logo vectorial provisional (logo-trio.svg) queda hasta entonces. La imagen base es generada por IA (la aportó la creadora): para producción conviene vectorizarla o rehacerla en vector y anotar la autoría/derechos.
- Logo APROBADO (2026-09-23): campana. Aplicado en header/footer/regalo de la landing y como favicon (app/icon.png). Scripts: scripts/logo-simbolos.mjs y scripts/logo-final.mjs. Pendiente a futuro: vectorizar el logo para tamaños chicos.

## Chat de emergencias RETIRADO de la landing (2026-09-23)
- La creadora pide sacar el chat de IA porque aún no está implementado (claim sin capacidad). Eliminado de features, FAQ, footer y términos; borrada la página /aviso-ia. El chat queda como idea futura (base de conocimiento: su ebook). Los pendientes de IA (costo, guardrails, evals) se reactivan solo si se decide construirlo.
## Propuesta de precios en revisión (2026-09-23)
- Propuesta de la creadora: Esencial (1 perro, hasta 2 tutores) US$2,99/mes o US$29/año · Familia (hasta 5 perros, hasta 3 tutores) US$4,99/mes o US$49/año. Reemplazaría al plan único US$3,99/US$35 (4 perros, 3 tutores). Pendiente de decisión.
- PRECIOS APLICADOS (2026-09-23, opción 2 elegida por la creadora): Esencial (hasta 2 perros) US\$2,99/mes o US\$29/año · Familia (hasta 5 perros) US\$4,99/mes o US\$49/año · 3 tutores en ambos · mismas funciones · 7 días gratis · garantía 15 días. Reemplaza el plan único US\$3,99/US\$35. Landing: selector «¿Cuántos perros tienes?».
  · PENDIENTE: verificar comisión Hotmart a US\$2,99 (fija+%) y crear 4 ofertas (2 planes × mensual/anual) con prueba de 7 días; la pantalla 3 del tour (paywall) aún muestra el plan anterior y se rehace al construir el paywall real; prueba de demanda: medir qué plan eligen.
- 3ª REVISIÓN INDEPENDIENTE de la landing (docs/revisiones/landing-veredicto.md): 33/40 · 14/20 · 16/20 → NO LISTA (usabilidad y craft bajo umbral; copy cumple). Corregido después: nombres cortos de plan, regalo listado dentro del anual, mensual sin repetir la lista, «Se cobra US$29/año» más visible, título propio en la agitación (2 frases), puntos del carrusel con área táctil de 44px. Pendiente para ≥36/16: dispositivo ownable (duotone sobre foto real del perro — la creadora tiene fotos reales de sus perros), animaciones de números/barras y transición al cambiar de plan, CTA con checkout real que lleve el plan elegido, correo de soporte real.
- Foto de perros en el hero (autorizada por la creadora, 2026-09-23): public/brand/perros-hero.jpg (foto real de dos de sus perros) con el duotone de marca (.foto-duotone en globals.css) tras el que asoma la pantalla «Hoy». Transición animada al cambiar de plan (respeta reduced-motion). Se pide 4ª revisión independiente.
- 4ª REVISIÓN (docs/revisiones/landing-veredicto.md): 31/40 · 14/20 · 15/20 → NO LISTA. Tras ella: foto de los perros separada de la captura (ya no la tapa). Puntos abiertos según el revisor: oferta con precios solo en USD para Chile/México (falta respuesta a «¿puedo pagar en pesos?» → Hotmart), fondo/superficie casi idénticos (#F4F7F6/#FDFEFD, valores de la ficha), CTA muy repetidos (se mantienen por instrucción del curso), sin conteo de números en la demo, sin prueba real (correcto hasta tener usuarios). Decisión: no seguir iterando la landing sin datos; el siguiente aprendizaje viene de la prueba de demanda real. Volver a la landing tras Sesión 4 con checkout real, plan elegido en el botón y métricas.

## Datos reales de contacto y precio (2026-09-24)
- Correo real: contacto@ladoctoraperritos.com · Sitio: www.ladoctoraperritos.com (metadataBase en app/layout.tsx; footer actualizado). Ya no está pendiente el correo de soporte.
- Moneda: precios en USD para todos los países de habla hispana (decisión de la creadora); nota visible bajo el selector de plan. La pregunta del revisor sobre pago en moneda local se responde con esa nota; medios de pago reales de Hotmart siguen sin verificar (FICHA-MERCADO §3).
- Hero: se reemplazó la foto de los perros por la imagen de una mujer con su perro golden (public/brand/hero-mujer-golden.jpg). Ver FICHA-ARTE.

## Condiciones comerciales: prueba y garantía DESACTIVADAS en la web (2026-09-24)
- Verificación: no existe ningún sistema de pagos configurado (sin cuenta/producto/ofertas de Hotmart, sin código de checkout ni webhook). Por tanto ni la prueba de 7 días, ni la garantía de 15 días, ni desde cuándo cuenta esa garantía están aplicadas ni verificadas.
- lib/oferta.ts es la fuente única: prueba.verificada=false, garantia.verificada=false, garantia.desde=null. Con eso la landing NO muestra «7 días gratis», «Hoy pagas: US$0» ni la sección/menciones de Garantía; las páginas /terminos y /reembolsos se adaptan. Al configurar Hotmart: comprobar prueba y garantía (y desde cuándo corre), cambiar los flags y verificar el resumen de cobro.
- Resumen de cobro junto a cada botón (components/landing/ResumenCobro.tsx + resumenCobro() en lib/oferta.ts): fechas calculadas con la fecha real del visitante en el navegador; probado con scripts/probar-oferta.mts (fin de mes, año bisiesto, ambos planes).
- «Cancela cuando quieras» sigue en la web: NO verificado aún en Hotmart (normalmente el comprador puede cancelar; confirmar).
- Landing: eliminada la sección «Lo que cuesta seguir así» (Agitación, con «Hoy / Si nada cambia») y reducido «¿Te suena?» a 3 situaciones. Desviación DELIBERADA de la estructura canónica de 19 (10 secciones), pedida por la creadora para reducir la repetición de la carga mental.
- 5ª REVISIÓN INDEPENDIENTE (docs/revisiones/landing-veredicto.md): 34/40 · 15/20 · 14/20 → NO LISTA. Tras ella: fondos de secciones elevadas con token --elevated (más ritmo), CTA «Quiero mi Panel de Hoy» (primera persona + beneficio; sin prueba verificada), un CTA intermedio menos, hero más compacto, botón fijo se oculta con cualquier parte de la oferta visible. Copy 14/20: bajó al quitar la Agitación y la garantía (decisiones de la creadora); sube con prueba real, garantía verificada y datos propios. Decisión: cerrar la iteración de landing hasta tener Hotmart configurado y datos de la prueba de demanda.

## Restauración y condiciones activas (2026-09-24)
- Estructura canónica RESTAURADA: se vuelve a incluir la sección de Agitación, pero corta y distinta (consecuencias: dosis repetida/saltada, tratamiento que se acaba en fin de semana, fecha de vacuna que nadie recuerda); sin tarjetas «Hoy / Si nada cambia». Problema queda en 3 síntomas. Se quitó un CTA intermedio (el del mecanismo, pegado al carrusel).
- Prueba de 7 días y garantía de 15 días ACTIVADAS (lib/oferta.ts) por declaración de la creadora («ya tengo configurado Hotmart»). Yo no puedo abrir su panel: NO verificado por mí. Pendiente confirmar: (a) que la prueba sea de 7 días en mensual y anual; (b) desde cuándo cuenta la garantía (compra o primer cobro): mientras no se confirme, la web dice «15 días de garantía sobre tu primer pago» sin fijar fecha de inicio.
- Eliminada la frase «Precios en dólares (US$), iguales en todos los países de habla hispana» bajo el selector, a pedido de la creadora.

## Sesión 4 — Onboarding, paywall y login (implementados; en revisión)
- Modelo 2 (onboarding-first): la landing lleva a /onboarding (CTA_HREF); el onboarding vende el pago. Rutas: /onboarding, /paywall, /login (se borró /empezar).
- Onboarding (components/onboarding/Onboarding.tsx, lib/onboarding.ts): 6 preguntas, una por pantalla, con progreso y volver; cada respuesta cambia el Panel: nombre · cuántos perros (decide el plan) · etapa (saltable; cambia controles) · qué necesita cada día (multi) · quién más lo cuida (saltable) · cuándo le da lo importante (fija la hora del aviso). Luego: reconocimiento (etiqueta positiva) → «armando el Panel» (2,7 s) → Panel de Hoy con datos de la persona y PRIMERA VICTORIA (marca un cuidado como hecho) → /paywall. Respuestas en localStorage (nada sale del dispositivo).
- Paywall (components/onboarding/Paywall.tsx): «Hecho con tus N respuestas» (costo hundido), plan recomendado por cantidad de perros (cambiable), anual/mensual, importe destacado, ResumenCobro con fechas reales, botón al checkout de Hotmart según plan y periodo (lib/hotmart.ts). Salidas visibles: «Ahora no» y «Ya tengo cuenta».
- Login (components/onboarding/Login.tsx, lib/auth.ts): correo + enlace de acceso. El envío NO está conectado (Supabase pendiente): responde con mensaje honesto, nunca un éxito falso.
- PENDIENTE del usuario: los 4 enlaces de checkout de Hotmart (esencial/familia × mensual/anual) → .env.local y hosting (NEXT_PUBLIC_HOTMART_*, ver .env.example). Mientras falten, el botón del paywall aparece desactivado con aviso.
- PENDIENTE: cuenta de Supabase (auth + datos), webhook de Hotmart que cree/actualice al usuario, rate limit de login, app interna. Capturas a 375px en docs/revisiones/onboarding-*.png, paywall-375.png, login-375.png.
- Revisiones independientes del embudo (docs/revisiones/onboarding|paywall|login-veredicto.md): ronda 1 → 29/10, 24/10, 28/9; ronda 2 → 28/12, 27/11 (copy 14), 29/11; todas bajo el umbral (36/40 y 16/20). Corregido tras la ronda 2: autofocus del nombre, volver en todas las fases, pantalla «Armando» de 4 s (sin pulso con reduced-motion), texto del resultado sin afirmar lo que aún no ocurre, línea «Hoy pagas… Primer cobro…» dentro de la barra del botón, ancla «equivale a…(mensual…)», aviso de pago fuera de la barra, ayuda de spam en el login. Pendiente para subir puntaje: duotone/foto de perro en el embudo, movimiento del progreso, ficha de contraste de bordes (≥3:1), prueba social real, y el checkout de Hotmart conectado. Decisión: no iterar más el diseño hasta tener el flujo real de pago y datos de la prueba de demanda.
