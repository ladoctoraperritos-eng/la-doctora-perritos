import { Suspense } from "react";
import Resumen from "@/components/app/Resumen";

export const metadata = { title: "Resumen para el veterinario · La Doctora Perritos" };

export default function Page() {
  return (
    <Suspense>
      <Resumen />
    </Suspense>
  );
}
