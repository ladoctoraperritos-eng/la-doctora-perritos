export const metadata = { title: "Reembolsos · La Doctora Perritos" };

export default function Reembolsos() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 leading-relaxed text-[var(--text-primary)]">
      <h1 className="text-3xl font-bold">Política de reembolsos</h1>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        Borrador · debe coincidir con lo configurado en Hotmart antes de publicar.
      </p>
      <h2 className="mt-6 text-lg font-semibold">Garantía del Primer Aviso</h2>
      <p className="mt-2">
        Tu primer pago tiene 15 días de garantía. Si la app no te quita el peso de recordar, escríbenos dentro de ese plazo y te devolvemos ese primer pago, sin preguntas. La garantía cubre el primer cobro de la suscripción, no las renovaciones.
      </p>
    </main>
  );
}
