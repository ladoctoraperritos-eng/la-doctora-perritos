export const metadata = { title: "Términos · La Doctora Perritos" };

export default function Terminos() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 leading-relaxed text-[var(--text-primary)]">
      <h1 className="text-3xl font-bold">Términos y condiciones</h1>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        Borrador · pendiente de revisión legal antes del lanzamiento.
      </p>
      <h2 className="mt-6 text-lg font-semibold">Qué es el servicio</h2>
      <p className="mt-2">
        La Doctora Perritos es una herramienta para organizar y recordar los cuidados de tu perro. No es un servicio
        veterinario, no diagnostica ni receta, y no reemplaza a tu veterinario. Ante una duda de salud o una emergencia,
        consulta a un profesional.
      </p>
      <h2 className="mt-6 text-lg font-semibold">Prueba, renovación y cancelación</h2>
      <p className="mt-2">
        Empiezas con 7 días gratis. Te avisamos antes de cobrarte y puedes cancelar cuando quieras.
      </p>
      <h2 className="mt-6 text-lg font-semibold">Avisos</h2>
      <p className="mt-2">
        Hacemos lo posible para que los avisos lleguen a tiempo, pero pueden fallar por factores del teléfono o la
        conexión. No dependas solo de ellos para tratamientos críticos.
      </p>
    </main>
  );
}
