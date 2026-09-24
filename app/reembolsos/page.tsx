import { CONDICIONES, hayGarantia } from "@/lib/oferta";

export const metadata = { title: "Reembolsos · La Doctora Perritos" };

export default function Reembolsos() {
  const d = CONDICIONES.garantia.desde;
  const desde = d === "compra" ? ", contados desde el día de tu compra" : d === "primer_cobro" ? ", contados desde tu primer cobro" : "";
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 leading-relaxed text-[var(--text-primary)]">
      <h1 className="text-3xl font-bold">Política de reembolsos</h1>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        Borrador · debe coincidir con lo configurado en Hotmart antes de publicar.
      </p>
      {hayGarantia() ? (
        <>
          <h2 className="mt-6 text-lg font-semibold">Garantía del Primer Aviso</h2>
          <p className="mt-2">
            Tu primer pago tiene {CONDICIONES.garantia.dias} días de garantía{desde}. Si la app no te
            quita el peso de recordar, escribe a {CONDICIONES.contacto} dentro de ese plazo y te devolvemos ese primer
            pago, sin preguntas. La garantía cubre el primer cobro de la suscripción, no las renovaciones.
          </p>
        </>
      ) : (
        <>
          <h2 className="mt-6 text-lg font-semibold">Reembolsos</h2>
          <p className="mt-2">
            La política de reembolsos se publicará aquí antes del lanzamiento, una vez definida y configurada en la
            plataforma de pagos. Mientras tanto no ofrecemos ninguna garantía. Para cualquier consulta escribe a{" "}
            {CONDICIONES.contacto}.
          </p>
        </>
      )}
    </main>
  );
}
