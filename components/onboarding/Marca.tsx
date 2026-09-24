// Marca mínima para las pantallas del embudo: logo de los tres perros + nombre (lleva al inicio).
import Link from 'next/link';

export default function Marca() {
  return (
    <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/logo.png" alt="" width={48} height={40} className="h-8 w-auto" />
      La Doctora Perritos
    </Link>
  );
}
