import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El globo "N" de desarrollo tapa contenido en las capturas de revisión.
  devIndicators: false,
  // Mantiene Next.js al día automáticamente solo con parches de seguridad (no con cambios de
  // comportamiento ni versiones mayores) — evita que esto vuelva a quedar atrás.
  experimental: {
    agentUpgrade: "security",
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          {
            // Defensa extra contra código insertado de afuera: solo se ejecuta lo que sirve esta
            // misma app, las fotos pueden venir de Supabase (donde se guardan) y las conexiones de
            // red (login, datos) solo pueden ir a esta app o a Supabase.
            // 'unsafe-inline' en script-src: Next.js inserta scripts en línea para pasar los datos
            // de cada página al navegador (parte de cómo funciona, no algo que se pueda evitar sin
            // construir un sistema de "firmas" por cada carga — probado en vivo: sin esto, la app no
            // arranca). Sigue bloqueando lo más peligroso: cargar código desde un sitio AJENO.
            // 'unsafe-inline' en style-src: Tailwind/Motion pintan con estilos en línea (no ejecutan
            // código, solo dan formato).
            // 'unsafe-eval' SOLO en desarrollo (`npm run dev`): React lo necesita ahí para sus propias
            // herramientas de depuración (reconstruir la pila de llamadas). React mismo confirma que
            // JAMÁS lo usa en producción — por eso en producción (lo que ven tus clientes) no se agrega.
            // "blob:" en img-src: al elegir una foto (perro, tutor, veterinario), el navegador la
            // procesa primero desde una dirección "blob:" temporal (recorte, encuadre) antes de
            // guardarla — sin este permiso, "Añadir foto" falla con "No pudimos abrir esa foto".
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.supabase.co",
              "font-src 'self'",
              "connect-src 'self' https://*.supabase.co",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
