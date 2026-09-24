'use client';

// Landing de La Doctora Perritos — compone las 10 secciones canónicas de 19 desde el kit.
// TODO el copy sale de docs/copy/landing.md (trazado a FICHA-AVATAR.md).

import { AlertTriangle, Brain, FileSearch, Layers, Package, PawPrint, Pill, Users } from 'lucide-react';
import { Hero } from './Hero';
import { Problema } from './Problema';
import { Agitacion } from './Agitacion';
import { Solucion } from './Solucion';
import { AppPorDentro } from './AppPorDentro';
import { Oferta } from './Oferta';
import { RegaloEbook } from './RegaloEbook';
import { Garantia } from './Garantia';
import { Faq } from './Faq';
import { CtaFinal } from './CtaFinal';
import { FooterLegal } from './FooterLegal';
import { CtaButton, StickyCtaMobile } from './ui';

// Mismo destino en hero, mid-page, oferta, CTA final y sticky.
// Provisional: /empezar hasta que existan el onboarding y el checkout de Hotmart.
const CTA_HREF = '/empezar';
const CTA_LABEL = 'Empezar mis 7 días gratis';
// PENDIENTE (ESTADO.md): correo de soporte REAL que alguien lea.
const SOPORTE_EMAIL = 'soporte@ladoctoraperritos.com';

// CTA repetido a mitad de scroll: mismo destino y mismo verbo que el hero (19).
function CtaIntermedio() {
  return (
    <div className="mx-auto flex w-full max-w-md justify-center px-6 py-8">
      <div className="flex w-full flex-col items-center gap-2">
        <CtaButton href={CTA_HREF}>{CTA_LABEL}</CtaButton>
        <p className="text-sm text-[var(--text-secondary)]">Sin cobro hoy · cancela cuando quieras</p>
      </div>
    </div>
  );
}

const LOGO = (
  <span aria-hidden="true" className="inline-flex size-8 items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)]">
    <PawPrint size={18} color="var(--bg)" />
  </span>
);

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--text-primary)] [font-family:var(--font-body)]">
      <Hero
        appName="La Doctora Perritos"
        logo={LOGO}
        loginHref="/empezar"
        h1Marked="Que cuidar a tu perro no dependa de tu [acento]memoria[/acento]"
        subtitleMarked="Medicamentos, comida y controles en una pantalla, y [b]quién ya lo hizo[/b]"
        ctaLabel={CTA_LABEL}
        ctaHref={CTA_HREF}
        socialProof={<span className="text-base font-medium">Sin cobro hoy · cancela cuando quieras · garantía de 15 días</span>}
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
          { icon: Users, textoMarked: '¿En casa nadie sabe con certeza [b]quién lo hizo[/b]?' },
          { icon: Package, textoMarked: '¿Descubres tarde que se le acabaron las pastillas o la comida?' },
          { icon: FileSearch, textoMarked: '¿Buscas su receta entre WhatsApp, fotos y papeles?' },
          { icon: Brain, textoMarked: '¿Cuidarlo bien ya se siente como otra tarea mental?' },
        ]}
      />

      <Agitacion
        iconos={[AlertTriangle, Layers, Brain]}
        frases={[
          'Una dosis olvidada o repetida no avisa: [b]lo notas cuando ya pasó[/b].',
          'Alarmas, chat familiar y fotos de recetas: [b]cinco sistemas para una sola preocupación[/b].',
          'Mientras sigas así, [acento]cuidarlo depende de que te acuerdes[/acento].',
        ]}
        contraste={{
          labelHoy: 'Hoy',
          hoy: '[b]Alarmas sueltas[/b] y un «[b]pensé que se lo habías dado tú[/b]».',
          labelFuturo: 'Si nada cambia',
          futuro: '[b]La misma carga mental[/b], todos los días, y el miedo constante de [b]olvidar algo importante[/b].',
        }}
      />

      <Solucion
        tituloMarked="Abres la app y ya sabes [acento]qué le toca hoy[/acento]"
        mecanismo="el Panel de Hoy"
        bigIdeaMarked="Sabemos lo que pesa acordarte de todo. [b]No es tu memoria[/b]: su cuidado vive en cinco lugares. El Panel de Hoy lo junta y [b]te avisa antes de que algo falle[/b]."
        pasos={[
          { titulo: 'Cuéntanos lo suyo', detalle: 'Un medicamento, su comida o una vacuna. Nosotros lo recordamos por ti.' },
          { titulo: 'Te avisamos a tiempo', detalle: 'Antes de cada dosis y antes de que algo se acabe. Tú respiras.' },
          { titulo: 'Todos ven qué se hizo', detalle: 'Quien lo da lo marca y la familia lo ve. Nadie duda.' },
        ]}
        antesDespues={{
          labelAntes: 'Antes',
          antes: 'Cada dato en un lugar distinto y nadie sabe qué falta.',
          labelDespues: 'Después',
          despues: 'Todo en el Panel de Hoy: qué toca, quién lo hizo y qué falta.',
        }}
      />

      <CtaIntermedio />

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
            'Hasta 3 tutores: quién hizo qué',
            'Hasta 4 perros, un solo precio',
            'Chat de emergencias de La Doctora Perritos (IA)',
            'Resumen para el veterinario y datos exportables',
            'Garantía de 15 días sobre tu primer pago',
          ],
        }}
        mensual={{
          nombre: 'Mensual',
          precioMes: 'US$3,99',
          ctaLabel: 'Elegir mensual',
          ctaHref: CTA_HREF,
          features: [
            'Avisos de medicamentos, comida y vacunas',
            'Hasta 3 tutores: quién hizo qué',
            'Hasta 4 perros, un solo precio',
            'Chat de emergencias de La Doctora Perritos (IA)',
            'Resumen para el veterinario y datos exportables',
            'Garantía de 15 días sobre tu primer pago',
          ],
        }}
      />

      <RegaloEbook
        portadaSrc="/brand/portada-ebook.jpg"
        portadaAlt="Portada del ebook Primeros Auxilios Caninos de La Doctora Perritos"
        tituloMarked="Ebook «Primeros Auxilios Caninos»"
        detalleMarked="La guía de la Doctora Perritos para [b]saber qué hacer en una emergencia[/b]."
        valor="US$9"
      />

      <Garantia
        nombre="Garantía del Primer Aviso"
        condicionMarked="Si la app no te quita el peso de recordar, escribes un correo dentro de los 15 días de garantía y te devolvemos tu primer pago. [b]Sin preguntas.[/b]"
        pisoLegal="Respaldada por la garantía de 15 días de Hotmart"
      />

      <CtaIntermedio />

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
            respuestaMarked: 'No. Organiza, recuerda y, en una emergencia, el chat te guía [b]mientras llegas al veterinario[/b]. No diagnostica ni receta.',
          },
        ]}
      />

      <CtaFinal
        h2Marked="Imagina abrir la app y [acento]tener todo claro[/acento]"
        futurePacingMarked="Esta noche, a las 19:00, la app te avisa. Lo marcas y tu familia lo ve al instante."
        ctaLabel={CTA_LABEL}
        ctaHref={CTA_HREF}
        recap="7 días gratis · Garantía del Primer Aviso · Cancela cuando quieras"
        psMarked="PS: Empiezas con 7 días gratis y la Garantía del Primer Aviso: si no te quita el peso de recordar, un correo y te devolvemos tu primer pago."
      />

      <FooterLegal
        appName="La Doctora Perritos"
        logo={LOGO}
        soporteEmail={SOPORTE_EMAIL}
        enlaces={[
          { label: 'Privacidad', href: '/privacidad' },
          { label: 'Términos y Condiciones', href: '/terminos' },
          { label: 'Reembolsos', href: '/reembolsos' },
          { label: 'Aviso de IA', href: '/aviso-ia' },
        ]}
      />
      <div className="mx-auto mb-16 max-w-6xl px-6">
        <p className="borde-degradado rounded-[var(--radius-card)] px-4 py-3 text-sm leading-relaxed text-[var(--text-secondary)]">
          La Doctora Perritos no es un servicio veterinario ni reemplaza a tu veterinario.
        </p>
      </div>

      <StickyCtaMobile labelComercial={CTA_LABEL} href={CTA_HREF} />
    </div>
  );
}
