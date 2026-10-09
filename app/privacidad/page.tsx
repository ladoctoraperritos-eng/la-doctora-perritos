export const metadata = { title: "Privacidad · La Doctora Perritos" };

const ACTUALIZADO = "9 de octubre de 2026";
const RESPONSABLE = "C&D GROUP SPA";
const CONTACTO = "contacto@ladoctoraperritos.com";

export default function Privacidad() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 leading-relaxed text-[var(--text-primary)]">
      <h1 className="text-3xl font-bold">Política de privacidad</h1>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">Última actualización: {ACTUALIZADO}</p>

      <h2 className="mt-8 text-lg font-semibold">Quién es responsable de tus datos</h2>
      <p className="mt-2">
        {RESPONSABLE}, con sede en Chile, es responsable de los datos personales que recoge La Doctora Perritos. Para
        cualquier duda sobre tus datos o para ejercer tus derechos, escribe a{" "}
        <a href={`mailto:${CONTACTO}`} className="underline underline-offset-4">
          {CONTACTO}
        </a>
        .
      </p>

      <h2 className="mt-8 text-lg font-semibold">Qué datos recogemos</h2>
      <p className="mt-2">
        Tu correo (para que puedas entrar a tu cuenta) y los datos de tu perro: nombre, edad, peso, raza, foto, número
        de microchip (si lo tiene), nombre y teléfono de su responsable, medicamentos, comida, vacunas, controles, y
        los registros de quién hizo cada cuidado y cuándo. Si invitas a alguien a cuidar contigo, guardamos su nombre
        y correo para darle acceso. Si guardas el teléfono de tu veterinario, también lo guardamos.
      </p>
      <p className="mt-2">No te pedimos ni guardamos contraseñas: entras con un enlace que te mandamos al correo.</p>

      <h2 className="mt-8 text-lg font-semibold">Para qué los usamos</h2>
      <p className="mt-2">
        Para mostrarte qué necesita tu perro y cuándo, enviarte avisos, y compartir el registro de cuidados con las
        personas que invites a cuidar contigo. No vendemos tus datos, ni los usamos para publicidad, ni se los
        entregamos a nadie para fines distintos a hacer funcionar la app.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Con quién los compartimos</h2>
      <p className="mt-2">Solo con las empresas que necesitamos para que la app funcione — cada una recibe únicamente lo necesario para su tarea:</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>
          <strong className="font-semibold">Supabase</strong> — guarda la base de datos, gestiona el acceso a tu cuenta y almacena las fotos que subes.
        </li>
        <li>
          <strong className="font-semibold">Vercel</strong> — aloja la aplicación web para que puedas entrar desde tu navegador.
        </li>
        <li>
          <strong className="font-semibold">Hotmart</strong> — procesa el pago de tu suscripción (nombre, correo y datos de pago los recibe directamente Hotmart; nosotros nunca vemos ni guardamos el número de tu tarjeta).
        </li>
      </ul>
      <p className="mt-2">
        Supabase y Vercel operan con servidores fuera de Chile (principalmente en Estados Unidos). Al usar la app,
        aceptas que tus datos se procesen en esos servidores bajo los términos de privacidad de esos proveedores. No
        usamos ningún servicio de inteligencia artificial: tus datos no se envían a ninguna IA.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Cookies y analítica</h2>
      <p className="mt-2">
        No usamos cookies de publicidad ni herramientas de analítica de terceros (como Google Analytics o píxeles de
        redes sociales). Solo guardamos en tu navegador lo mínimo para que tu sesión funcione y recuerde tus datos
        entre visitas.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Tus derechos sobre tus datos</h2>
      <p className="mt-2">Puedes, en cualquier momento:</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>Descargar una copia de tus datos: en la app, ve a Yo → Tus datos → "Descargar todos mis datos".</li>
        <li>Corregir cualquier dato: edita la ficha de tu perro o tu cuenta directamente en la app.</li>
        <li>
          Eliminar tu cuenta y todos tus datos: en la app, ve a Yo → Tus datos → "Borrar todos mis datos". Esto borra
          tus perros, cuidados, historial, fotos y tu cuenta de acceso, tanto de tu teléfono como de nuestros
          servidores. No se puede deshacer. Si cuidas junto a otras personas, solo se borra tu propio acceso: los
          datos que la familia sigue usando no se tocan.
        </li>
        <li>
          Oponerte al tratamiento de tus datos o pedir que dejemos de usarlos: escribe a{" "}
          <a href={`mailto:${CONTACTO}`} className="underline underline-offset-4">
            {CONTACTO}
          </a>
          .
        </li>
      </ul>

      <h2 className="mt-8 text-lg font-semibold">Edad mínima</h2>
      <p className="mt-2">La Doctora Perritos es para personas mayores de 18 años. No recogemos a sabiendas datos de menores de edad.</p>

      <h2 className="mt-8 text-lg font-semibold">Cuánto tiempo guardamos tus datos</h2>
      <p className="mt-2">
        Mientras tu cuenta esté activa. Si cancelas tu suscripción, tus datos siguen disponibles para que puedas
        volver cuando quieras; si prefieres que los borremos de inmediato, usa "Borrar todos mis datos" o escríbenos.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Cambios a esta política</h2>
      <p className="mt-2">
        Si hacemos un cambio importante a esta política, te avisamos por correo antes de que entre en vigor. La fecha
        de arriba siempre indica la última actualización.
      </p>
    </main>
  );
}
