'use client';

// Landing de La Doctora Perritos — compone las 10 secciones canónicas de 19 desde el kit.
// TODO el copy sale de docs/copy/landing.md (trazado a FICHA-AVATAR.md).

import { Brain, FileSearch, Package, Pill, Users } from 'lucide-react';
import { Hero } from './Hero';
import { Problema } from './Problema';
import { Agitacion } from './Agitacion';
import { Solucion } from './Solucion';
import { AppPorDentro } from './AppPorDentro';
import { Oferta } from './Oferta';
import { Garantia } from './Garantia';
import { Faq } from './Faq';
import { CtaFinal } from './CtaFinal';
import { FooterLegal } from './FooterLegal';
import { StickyCtaMobile } from './ui';

// Mismo destino en hero, mid-page, oferta, CTA final y sticky.
// Provisional: /empezar hasta que existan el onboarding y el checkout de Hotmart.
const CTA_HREF = '/empezar';
const CTA_LABEL = 'Empezar mis 7 días gratis';
// PENDIENTE (ESTADO.md): correo de soporte REAL que alguien lea.
const SOPORTE_EMAIL = 'soporte@ladoctoraperritos.com';

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--text-primary)] [font-family:var(--font-body)]">
      <Hero
        appName="La Doctora Perritos"
        loginHref="/empezar"
        h1Marked="Que cuidar a tu perro no dependa de tu [acento]memoria[/acento]"
        subtitleMarked="Medicamentos, comida y controles en una pantalla, y [b]quién ya lo hizo[/b]"
        ctaLabel={CTA_LABEL}
        ctaHref={CTA_HREF}
        socialProof={<span>De La Doctora Perritos · +33 mil seguidores en TikTok · 7 días gratis</span>}
        visual={
          <div className="flex justify-center bg-[var(--surface-2)] px-6 pt-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/screens/hoy.png"
              alt="Pantalla Hoy con Toffee: medicamento de las 19:00, alimento para 8 días y quién dio el Omega-3"
              width={310}
              height={640}
              className="h-auto w-full max-w-xs rounded-t-[32px] shadow-[var(--shadow-2)]"
            />
          </div>
        }
        visualPlaceholderSugerencia="captura de «Hoy con Toffee»: medicamento de las 19:00, alimento para ~8 días y quién dio el Omega-3"
      />

      <Problema
        titulo="¿Te suena?"
        preguntas={[
          { icon: Pill, textoMarked: '¿Te preguntas si [b]ya le diste[/b] su medicamento?' },
          { icon: Users, textoMarked: '¿Tu pareja y tú no saben [b]quién lo hizo[/b]?' },
          { icon: Package, textoMarked: '¿Descubres tarde que se le acabaron las pastillas o la comida?' },
          { icon: FileSearch, textoMarked: '¿Buscas su receta entre WhatsApp, fotos y papeles?' },
          { icon: Brain, textoMarked: '¿Cuidarlo bien ya se siente como otra tarea mental?' },
        ]}
      />

      <Agitacion
        frases={[
          'Una dosis olvidada o repetida no avisa: [b]lo notas cuando ya pasó[/b].',
          'Alarmas, chat familiar y fotos de recetas: [b]cinco sistemas para una sola preocupación[/b].',
          'Mientras sigas así, [acento]cuidarlo depende de que te acuerdes[/acento].',
        ]}
        contraste={{
          labelHoy: 'Hoy',
          hoy: 'Alarmas sueltas y un «pensé que se lo habías dado tú».',
          labelFuturo: 'Si nada cambia',
          futuro: 'La misma carga mental, todos los días.',
        }}
      />

      <Solucion
        tituloMarked="Abres la app y ya sabes [acento]qué le toca hoy[/acento]"
        mecanismo="el Panel de Hoy"
        bigIdeaMarked="No te falta memoria: te faltaba un lugar donde vivan sus cuidados. El Panel de Hoy los junta y [b]te avisa antes de que algo falle[/b]."
        pasos={[
          { titulo: 'Agrega lo suyo', detalle: 'Un medicamento, su comida o una vacuna. Toma un minuto.' },
          { titulo: 'Te avisamos a tiempo', detalle: 'Recordatorios y aviso antes de que algo se acabe.' },
          { titulo: 'Todos ven qué se hizo', detalle: 'Quien lo da lo marca; tu familia lo ve al instante.' },
        ]}
        antesDespues={{
          labelAntes: 'Antes',
          antes: 'Alarmas, chats y recetas en fotos, y la duda de si ya se lo dieron.',
          labelDespues: 'Después',
          despues: 'Una pantalla: qué toca hoy, quién lo hizo y qué falta.',
        }}
      />

      <AppPorDentro
        tituloMarked="Tu perro, [acento]todo en orden[/acento]"
        frames={[
          { label: 'Qué toca hoy', nombrePantalla: 'Hoy con Toffee', src: '/screens/hoy.png', alt: 'Pantalla Hoy con Toffee' },
          { label: 'Quién hizo qué, sin preguntar', nombrePantalla: 'Familia', src: '/screens/familia.png', alt: 'Pantalla Familia con el registro de quién dio cada cuidado' },
          { label: 'Su ficha con fechas y alertas', nombrePantalla: 'Ficha del perro', src: '/screens/ficha.png', alt: 'Ficha de Toffee con vacunas y controles' },
          { label: 'Si tienes más de un perro', nombrePantalla: 'Varios perros', src: '/screens/perros.png', alt: 'Pantalla Hoy con selector de varios perros' },
        ]}
        ctaLabel={CTA_LABEL}
        ctaHref={CTA_HREF}
      />

      <Oferta
        tituloMarked="Empieza gratis. Sigue por [acento]US$0,10 al día[/acento]"
        trialDias={7}
        stack={{
          lineas: [
            { resultado: 'Cuida y Recuerda: avisos, familia y ficha (12 meses)', valor: 'US$48' },
            { resultado: 'Guía «Primeros Auxilios Caninos» (ebook)', valor: 'US$9' },
          ],
          totalTachado: 'US$57',
          nota: 'Hoy: US$3,99/mes (se cobra US$35/año)',
        }}
        anual={{
          nombre: 'Anual',
          badge: 'MEJOR VALOR',
          precioMes: 'US$2,92',
          totalAnual: 'Se cobra US$35/año',
          ahorro: '3 meses gratis',
          descomposicionDia: 'menos de US$0,10 al día',
          ctaLabel: CTA_LABEL,
          ctaHref: CTA_HREF,
          features: [
            'Avisos de medicamentos, comida y vacunas',
            'Hasta 3 cuidadores: quién hizo qué',
            'Hasta 4 perros, un solo precio',
            'Resumen para el veterinario en 1 toque',
            'Tus datos siempre tuyos y exportables',
          ],
        }}
        mensual={{
          nombre: 'Mensual',
          precioMes: 'US$3,99',
          ctaLabel: 'Elegir mensual',
          ctaHref: CTA_HREF,
          features: [
            'Avisos de medicamentos, comida y vacunas',
            'Hasta 3 cuidadores: quién hizo qué',
            'Hasta 4 perros, un solo precio',
            'Cancelas cuando quieras',
          ],
        }}
      />

      <Garantia
        nombre="la Garantía del Primer Aviso"
        condicionMarked="Si la app no te quita el peso de recordar, escribes un correo dentro de los 15 días de garantía y te devolvemos tu primer pago. [b]Sin preguntas.[/b]"
        pisoLegal="Respaldada por la garantía de 15 días de Hotmart"
      />

      <Faq
        items={[
          {
            pregunta: '¿Para eso no pongo una alarma?',
            respuestaMarked: 'Una alarma suena; no te dice [b]quién lo dio ni cuánto queda[/b]. El Panel de Hoy sí.',
          },
          {
            pregunta: '¿Otra suscripción más?',
            respuestaMarked: 'Cuesta menos que un solo antiparasitario. Pruebas 7 días gratis y cancelas cuando quieras.',
          },
          {
            pregunta: '¿Tendré que llenar una ficha enorme?',
            respuestaMarked: 'No. Empiezas con un solo medicamento o comida, en [b]un minuto[/b]. El resto lo agregas cuando quieras.',
          },
          {
            pregunta: '¿Y si el aviso no me llega?',
            respuestaMarked: 'Te avisamos por la app y por correo de respaldo. En iPhone, te guiamos para instalarla en tu pantalla de inicio.',
          },
          {
            pregunta: '¿Qué pasa con mis datos si dejo de pagar?',
            respuestaMarked: 'Siguen siendo tuyos: puedes descargarlos siempre y [b]nunca los borramos de golpe[/b].',
          },
          {
            pregunta: '¿Reemplaza a mi veterinario?',
            respuestaMarked: 'No. Organiza y recuerda; no diagnostica ni receta. Ante una duda de salud, consulta a tu veterinario.',
          },
        ]}
      />

      <CtaFinal
        h2Marked="Imagina abrir la app y [acento]tener todo claro[/acento]"
        futurePacingMarked="Esta noche, a las 19:00, la app te avisa. Lo marcas y tu pareja lo ve al instante."
        ctaLabel={CTA_LABEL}
        ctaHref={CTA_HREF}
        recap="7 días gratis · Garantía del Primer Aviso · Cancela cuando quieras"
        psMarked="PS: Empiezas con 7 días gratis y la Garantía del Primer Aviso: si no te quita el peso de recordar, un correo y te devolvemos tu primer pago."
      />

      <FooterLegal
        appName="La Doctora Perritos"
        soporteEmail={SOPORTE_EMAIL}
        enlaces={[
          { label: 'Privacidad', href: '/privacidad' },
          { label: 'Términos y Condiciones', href: '/terminos' },
          { label: 'Reembolsos', href: '/reembolsos' },
        ]}
      />
      <div className="mx-auto mb-16 max-w-6xl px-6">
        <p className="borde-degradado rounded-[var(--radius-card)] px-4 py-3 text-xs leading-relaxed text-[var(--text-secondary)]">
          La Doctora Perritos no es un servicio veterinario ni reemplaza a tu veterinario.
        </p>
      </div>

      <StickyCtaMobile labelComercial={CTA_LABEL} href={CTA_HREF} />
    </div>
  );
}
