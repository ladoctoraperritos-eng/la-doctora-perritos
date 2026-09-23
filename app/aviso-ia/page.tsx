export const metadata = { title: "Aviso de IA · La Doctora Perritos" };

export default function AvisoIA() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 leading-relaxed text-[var(--text-primary)]">
      <h1 className="text-3xl font-bold">Aviso sobre el chat de emergencias</h1>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        Borrador · pendiente de revisión legal antes del lanzamiento.
      </p>
      <h2 className="mt-6 text-lg font-semibold">Qué es</h2>
      <p className="mt-2">
        El chat de La Doctora Perritos usa inteligencia artificial para orientarte con pasos generales de primeros
        auxilios mientras buscas atención veterinaria.
      </p>
      <h2 className="mt-6 text-lg font-semibold">Lo que NO es</h2>
      <p className="mt-2">
        No es un veterinario, no diagnostica, no receta ni indica dosis de medicamentos, y puede equivocarse. Nunca
        sustituye la atención de un profesional.
      </p>
      <h2 className="mt-6 text-lg font-semibold">Ante una emergencia</h2>
      <p className="mt-2">
        Llama o acude de inmediato a tu veterinario o a una clínica de urgencias. Usa el chat solo como apoyo mientras
        llegas.
      </p>
    </main>
  );
}
