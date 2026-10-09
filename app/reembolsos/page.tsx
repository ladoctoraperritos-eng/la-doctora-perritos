import { CONDICIONES, hayGarantia } from "@/lib/oferta";

export const metadata = { title: "Reembolsos · La Doctora Perritos" };

const ACTUALIZADO = "9 de octubre de 2026";

export default function Reembolsos() {
  const d = CONDICIONES.garantia.desde;
  const desde = d === "compra" ? ", contados desde el día de tu compra" : d === "primer_cobro" ? ", contados desde tu primer cobro" : "";
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 leading-relaxed text-[var(--text-primary)]">
      <h1 className="text-3xl font-bold">Política de reembolsos</h1>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">Última actualización: {ACTUALIZADO}</p>

      {hayGarantia() ? (
        <>
          <h2 className="mt-8 text-lg font-semibold">Garantía de tu primer pago</h2>
          <p className="mt-2">
            Tu primer pago tiene {CONDICIONES.garantia.dias} días de garantía{desde}. Si en ese plazo la app no te
            quita el peso de recordar, escribe a{" "}
            <a href={`mailto:${CONDICIONES.contacto}`} className="underline underline-offset-4">
              {CONDICIONES.contacto}
            </a>{" "}
            y te devolvemos ese primer pago completo, sin preguntas.
          </p>
          <h2 className="mt-8 text-lg font-semibold">Qué cubre y qué no</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>La garantía cubre el primer cobro de tu suscripción, no las renovaciones posteriores.</li>
            <li>Pasado el plazo de {CONDICIONES.garantia.dias} días, los cobros ya hechos no son reembolsables, pero puedes cancelar cuando quieras para que no se te vuelva a cobrar.</li>
            <li>Si compraste a través de Hotmart, el reembolso se procesa por esa misma plataforma y puede tardar algunos días hábiles en reflejarse en tu medio de pago.</li>
          </ul>
          <h2 className="mt-8 text-lg font-semibold">Cómo pedir el reembolso</h2>
          <p className="mt-2">
            Escríbenos a{" "}
            <a href={`mailto:${CONDICIONES.contacto}`} className="underline underline-offset-4">
              {CONDICIONES.contacto}
            </a>{" "}
            con el correo que usaste para comprar, dentro del plazo de garantía. Te confirmamos y gestionamos el
            reembolso con Hotmart; cuando esté conectado el proceso automático de Hotmart, esta página se
            actualizará para reflejarlo.
          </p>
          <h2 className="mt-8 text-lg font-semibold">Cómo cancelar tu suscripción</h2>
          <p className="mt-2">
            Puedes cancelar en cualquier momento desde Yo → Tu plan → "Cambiar o cancelar mi suscripción", o
            escribiéndonos directamente. Al cancelar, mantienes el acceso hasta el final del período que ya pagaste,
            sin cobros adicionales.
          </p>
          <p className="mt-2">
            <strong className="font-semibold">Ojo:</strong> el cobro lo hace Hotmart, no esta app. Borrar tu cuenta
            desde "Tus datos" o desinstalar la app NO cancela la suscripción — si no la cancelas en Hotmart, se te
            sigue cobrando aunque ya no uses la app. Escríbenos y te ayudamos a cancelarla ahí.
          </p>
        </>
      ) : (
        <>
          <h2 className="mt-8 text-lg font-semibold">Reembolsos</h2>
          <p className="mt-2">
            La política de reembolsos se publicará aquí antes del lanzamiento, una vez definida y configurada en la
            plataforma de pagos. Mientras tanto no ofrecemos ninguna garantía. Para cualquier consulta escribe a{" "}
            <a href={`mailto:${CONDICIONES.contacto}`} className="underline underline-offset-4">
              {CONDICIONES.contacto}
            </a>
            .
          </p>
        </>
      )}
    </main>
  );
}
