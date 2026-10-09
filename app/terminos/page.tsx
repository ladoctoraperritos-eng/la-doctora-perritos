import { CONDICIONES, hayPrueba } from "@/lib/oferta";

export const metadata = { title: "Términos · La Doctora Perritos" };

const ACTUALIZADO = "9 de octubre de 2026";
const RESPONSABLE = "C&D GROUP SPA";

export default function Terminos() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 leading-relaxed text-[var(--text-primary)]">
      <h1 className="text-3xl font-bold">Términos y condiciones</h1>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">Última actualización: {ACTUALIZADO}</p>
      <p className="mt-4">
        Estos términos los ofrece {RESPONSABLE} (Chile). Al crear tu cuenta o empezar tu prueba gratis, los aceptas
        junto con nuestra{" "}
        <a href="/privacidad" className="underline underline-offset-4">
          Política de privacidad
        </a>
        .
      </p>

      <h2 className="mt-8 text-lg font-semibold">Qué es el servicio</h2>
      <p className="mt-2">
        La Doctora Perritos es una herramienta para organizar y recordar los cuidados de tu perro: medicamentos,
        alimento, vacunas y controles, compartido entre quienes lo cuidan. No es un servicio veterinario, no
        diagnostica ni receta, y no reemplaza a tu veterinario. Ante cualquier duda de salud o una emergencia,
        consulta siempre a un profesional — la sección SOS de la app es una guía orientativa, no un consejo médico.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Quién puede usar la app</h2>
      <p className="mt-2">
        Debes ser mayor de 18 años para crear una cuenta. La cuenta es personal: puedes invitar a otras personas a
        cuidar contigo (hasta el límite de tu plan), pero no puedes revender ni transferir tu acceso a terceros.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Tus datos siguen siendo tuyos</h2>
      <p className="mt-2">
        La información que ingresas sobre tu perro es tuya. Puedes descargarla completa en cualquier momento desde Yo
        → Tus datos, y puedes pedir que la borremos (ver nuestra{" "}
        <a href="/privacidad" className="underline underline-offset-4">
          Política de privacidad
        </a>
        ).
      </p>

      <h2 className="mt-8 text-lg font-semibold">Cobro, renovación y cancelación</h2>
      <p className="mt-2">
        {hayPrueba()
          ? `Empiezas con ${CONDICIONES.prueba.dias} días de prueba gratis. Al terminar la prueba, tu suscripción se renueva automáticamente y se cobra el precio del plan elegido; te avisamos por correo antes de ese primer cobro. Después, la suscripción se sigue renovando automáticamente cada mes o cada año, según el plan que elijas.`
          : "El primer cobro se hace al contratar. La suscripción se renueva automáticamente cada mes o cada año, según el plan que elijas."}{" "}
        Puedes cancelar cuando quieras desde Yo → Tu plan → "Cambiar o cancelar mi suscripción"; cancelar es tan
        simple como contratar. Al cancelar, mantienes el acceso hasta el final del período ya pagado y no se te
        vuelve a cobrar.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Avisos y recordatorios</h2>
      <p className="mt-2">
        Hacemos lo posible para que los avisos lleguen a tiempo, pero pueden fallar por factores del teléfono, del
        sistema operativo o de la conexión a internet que están fuera de nuestro control. No dependas únicamente de
        la app para tratamientos críticos de tu perro.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Suspensión de cuentas</h2>
      <p className="mt-2">
        Podemos suspender o cerrar una cuenta que use la app de forma indebida (por ejemplo, para fines distintos al
        cuidado de perros, o de forma que dañe a otros usuarios o a la plataforma). Te avisaremos por correo cuando
        sea posible.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Límite de responsabilidad</h2>
      <p className="mt-2">
        La app es una herramienta de organización, no un servicio médico. En la medida permitida por la ley, no nos
        hacemos responsables por decisiones de salud tomadas con base en los recordatorios de la app, ni por daños
        indirectos derivados de un aviso que no llegó a tiempo. Nuestra responsabilidad, si la hay, se limita al
        monto que hayas pagado por la suscripción en los últimos 3 meses.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Ley aplicable</h2>
      <p className="mt-2">Estos términos se rigen por las leyes de Chile. Cualquier disputa se resuelve ante los tribunales chilenos.</p>

      <h2 className="mt-8 text-lg font-semibold">Cambios a estos términos</h2>
      <p className="mt-2">
        Si hacemos un cambio importante, te avisamos por correo antes de que entre en vigor. La fecha de arriba
        siempre indica la última actualización.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Contacto</h2>
      <p className="mt-2">
        Para cualquier duda sobre estos términos, escribe a{" "}
        <a href={`mailto:${CONDICIONES.contacto}`} className="underline underline-offset-4">
          {CONDICIONES.contacto}
        </a>
        .
      </p>
    </main>
  );
}
