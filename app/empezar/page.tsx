import Link from "next/link";

export const metadata = { title: "Empezar · La Doctora Perritos" };

// Provisional: aquí irá el onboarding (Sesión 4). Hoy es honesto: la app aún no está abierta.
export default function Empezar() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-4 px-6 py-16">
      <h1 className="text-3xl font-bold leading-tight text-[var(--text-primary)]">
        Estamos terminando La Doctora Perritos
      </h1>
      <p className="text-base leading-relaxed text-[var(--text-secondary)]">
        Muy pronto vas a poder empezar tus 7 días gratis desde aquí.
      </p>
      <Link href="/" className="text-base font-semibold text-[var(--accent)] underline underline-offset-4">
        Volver al inicio
      </Link>
    </main>
  );
}
