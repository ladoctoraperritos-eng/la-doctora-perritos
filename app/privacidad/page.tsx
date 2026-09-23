export const metadata = { title: "Privacidad · La Doctora Perritos" };

export default function Privacidad() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 leading-relaxed text-[var(--text-primary)]">
      <h1 className="text-3xl font-bold">Política de privacidad</h1>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        Borrador · pendiente de revisión legal antes del lanzamiento.
      </p>
      <h2 className="mt-6 text-lg font-semibold">Qué datos recogemos</h2>
      <p className="mt-2">
        Tu correo, los datos de tu perro (nombre, edad, peso, medicamentos, comida, vacunas y controles) y los registros
        de quién realizó cada cuidado.
      </p>
      <h2 className="mt-6 text-lg font-semibold">Para qué los usamos</h2>
      <p className="mt-2">
        Para mostrarte qué necesita tu perro, enviarte avisos y compartir el registro con las personas que invites. No
        vendemos tus datos.
      </p>
      <h2 className="mt-6 text-lg font-semibold">Quiénes los procesan</h2>
      <p className="mt-2">
        Usamos proveedores para alojar la app y la base de datos, enviar correos y procesar pagos. Solo reciben lo
        necesario para prestar el servicio.
      </p>
      <h2 className="mt-6 text-lg font-semibold">Tus datos son tuyos</h2>
      <p className="mt-2">Puedes descargarlos o pedir su eliminación escribiéndonos.</p>
    </main>
  );
}
