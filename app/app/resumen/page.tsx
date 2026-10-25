import { Suspense } from "react";
import Resumen from "@/components/app/Resumen";
import RequiereSesion from "@/components/app/RequiereSesion";

export const metadata = { title: "Resumen para el veterinario · La Doctora Perritos" };

export default function Page() {
  return (
    <RequiereSesion>
      <Suspense>
        <Resumen />
      </Suspense>
    </RequiereSesion>
  );
}
