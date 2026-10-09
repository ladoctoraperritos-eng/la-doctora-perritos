import type { Metadata, Viewport } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ladoctoraperritos.com"),
  title: "La Doctora Perritos · Cuida y Recuerda",
  description:
    "Sabe qué necesita tu perro hoy: medicamentos, comida, vacunas y controles en una pantalla, y quién ya lo hizo.",
};

export const viewport: Viewport = {
  themeColor: "#f8f5ee",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${dmSans.variable} ${dmSerif.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
