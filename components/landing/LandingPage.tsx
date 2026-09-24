'use client';

// Landing de La Doctora Perritos — compone las secciones canónicas de 19 desde el kit.
// TODO el copy sale de docs/copy/landing.md (trazado a FICHA-AVATAR.md).
// Las condiciones comerciales (prueba, garantía) salen de lib/oferta.ts: solo se prometen
// si están verificadas en la pasarela.

import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { AlertTriangle, CalendarClock, FileSearch, Package, PackageX, Users } from 'lucide-react';
import { CONDICIONES, hayGarantia, hayPrueba } from '@/lib/oferta';
import { featuresPlan, PLANES } from '@/lib/planes';
import { Hero } from './Hero';
import { Problema } from './Problema';
import { Agitacion } from './Agitacion';
import { Solucion } from './Solucion';
import { AppPorDentro } from './AppPorDentro';
import { Oferta } from './Oferta';
import { PlanSelector } from './PlanSelector';
import { RegaloEbook } from './RegaloEbook';
import { ResumenCobro } from './ResumenCobro';
import { Garantia } from './Garantia';
import { Faq } from './Faq';
import { CtaFinal } from './CtaFinal';
import { FooterLegal } from './FooterLegal';
import { CtaButton, StickyCtaMobile } from './ui';

const PRUEBA = hayPrueba();
const GARANTIA = hayGarantia();
const DIAS_PRUEBA = CONDICIONES.prueba.dias;
const DIAS_GARANTIA = CONDICIONES.garantia.dias;

// Mismo destino en hero, mid-page, oferta, CTA final y sticky.
// Modelo 2 (onboarding-first): la landing vende el registro; el onboarding vende el pago.
const CTA_HREF = '/onboarding';
const CTA_LABEL = PRUEBA ? `Empezar mis ${DIAS_PRUEBA} días gratis` : 'Quiero mi Panel de Hoy';
const SOPORTE_EMAIL = CONDICIONES.contacto;
const MICROCOPY = PRUEBA ? `Prueba de ${DIAS_PRUEBA} días · cancela cuando quieras` : 'Cancela cuando quieras';

type IdPlan = keyof typeof PLANES;

// CTA repetido a mitad de scroll: mismo destino y mismo verbo que el hero (19).
function CtaIntermedio() {
  return (
    <div className="mx-auto flex w-full max-w-md justify-center px-6 py-8">
      <div className="flex w-full flex-col items-center gap-2">
        <CtaButton href={CTA_HREF}>{CTA_LABEL}</CtaButton>
        <p className="text-sm text-[var(--text-secondary)]">{MICROCOPY}</p>
      </div>
    </div>
  );
}

const LOGO = (
  // eslint-disable-next-line @next/next/no-img-element
  <img src="/brand/logo.png" alt="" width={48} height={40} className="h-10 w-auto" />
);

const garantiaDesde =
  CONDICIONES.garantia.desde === 'compra' ? ' desde el día de tu compra' : CONDICIONES.garantia.desde === 'primer_cobro' ? ' desde tu primer cobro' : '';

export default function LandingPage() {
  const [plan, setPlan] = useState<IdPlan>('esencial');
  const P = PLANES[plan];
  const reduce = useReducedMotion();

  const recap = [PRUEBA && `${DIAS_PRUEBA} días de prueba`, GARANTIA && 'Garantía del Primer Aviso', 'Cancela cuando quieras']
    .filter(Boolean)
    .join(' · ');
  const ps =
    PRUEBA && GARANTIA
      ? `PS: Empiezas con ${DIAS_PRUEBA} días de prueba y la Garantía del Primer Aviso: si no te quita el peso de recordar, un correo y te devolvemos tu primer pago.`
      : 'PS: La Doctora Perritos junta medicamentos, comida, vacunas y controles de tu perro en el Panel de Hoy, con quién hizo qué.';

  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--text-primary)] [font-family:var(--font-body)]">
      <Hero
        appName="La Doctora Perritos"
        logo={LOGO}
        loginHref="/login"
        h1Marked="Que cuidar a tu perro no dependa de tu [acento]memoria[/acento]"
        subtitleMarked="Medicamentos, comida y controles en una pantalla, y [b]quién ya lo hizo[/b]"
        ctaLabel={CTA_LABEL}
        ctaHref={CTA_HREF}
        socialProof={<span className="text-base font-medium">{MICROCOPY}</span>}
        visual={
          <div className="bg-[var(--surface-2)]">
            <div className="aspect-video overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/hero-mujer-golden.jpg"
                alt="Una mujer acaricia a su perro golden mientras mira el celular; sobre la mesa hay un pastillero semanal"
                width={1200}
                height={675}
                fetchPriority="high"
              />
            </div>
            <div className="mt-6 flex max-h-[26rem] justify-center overflow-hidden px-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/screens/hoy.png"
                alt="Pantalla Hoy con Toffee: medicamento de las 19:00, alimento para 8 días y quién dio el Omega-3"
                width={310}
                height={640}
                className="relative h-auto w-full max-w-xs rounded-t-[32px] shadow-[var(--shadow-2)]"
              />
            </div>
          </div>
        }
        visualPlaceholderSugerencia="captura de «Hoy con Toffee»: medicamento de las 19:00, alimento para ~8 días y quién dio el Omega-3"
      />

      {/* Estructura canónica de 19. Problema = síntomas concretos; Agitación = consecuencias, sin repetir la carga mental. */}
      <Problema
        titulo="¿Te suena?"
        preguntas={[
          { icon: Users, textoMarked: '¿No sabes si otro tutor [b]ya dio el medicamento[/b]?' },
          { icon: Package, textoMarked: '¿Notas tarde que [b]se acabará[/b] su comida o su tratamiento?' },
          { icon: FileSearch, textoMarked: '¿Buscas su receta entre [b]WhatsApp, fotos y papeles[/b]?' },
        ]}
      />

      <Agitacion
        titulo="Lo que cuesta un descuido"
        iconos={[AlertTriangle, PackageX, CalendarClock]}
        frases={[
          'Una dosis repetida o saltada [b]se nota cuando ya pasó[/b].',
          'Sin aviso, el tratamiento o el alimento [b]se acaba en fin de semana[/b].',
          'En la consulta, [b]nadie recuerda la fecha exacta[/b] de la última vacuna.',
        ]}
      />

      <Solucion
        tituloMarked="Abres la app y ya sabes [acento]qué le toca hoy[/acento]"
        mecanismo="el Panel de Hoy"
        bigIdeaMarked="Sabemos lo que pesa acordarte de todo. [b]No es tu memoria[/b]: su cuidado vive en cinco lugares. El Panel de Hoy lo junta y [b]te avisa a tiempo[/b]."
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

      <PlanSelector
        titulo="¿Cuántos perros tienes?"
        activo={plan}
        onChange={(id) => setPlan(id as IdPlan)}
        opciones={(Object.keys(PLANES) as IdPlan[]).map((id) => ({ id, etiqueta: PLANES[id].etiqueta, nombre: PLANES[id].nombre }))}
      />

      <motion.div
        key={plan}
        initial={{ opacity: reduce ? 1 : 0, y: reduce ? 0 : 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        <Oferta
          tituloMarked={
            PRUEBA
              ? `Empieza gratis. Sigue por [acento]${P.dia} al día[/acento]`
              : `Cuida a tu perro desde [acento]${P.dia} al día[/acento]`
          }
          trialDias={PRUEBA ? DIAS_PRUEBA : undefined}
          anual={{
            nombre: 'Anual',
            badge: 'MEJOR VALOR',
            precioMes: P.anualTotal,
            sufijo: 'al año',
            totalAnual: `Equivale a ${P.anualMes} al mes`,
            ahorro: '2 meses gratis',
            resumen: <ResumenCobro periodo="anio" importe={P.anualTotal} equivalente={`${P.anualMes} al mes`} />,
            ctaLabel: CTA_LABEL,
            ctaHref: CTA_HREF,
            features: [
              ...featuresPlan(P.perros),
              ...(GARANTIA ? [`Garantía de ${DIAS_GARANTIA} días sobre tu primer pago`] : []),
              'Regalo: ebook «Primeros Auxilios Caninos»',
            ],
          }}
          mensual={{
            nombre: 'Mensual',
            precioMes: P.mensual,
            sufijo: 'al mes',
            resumen: <ResumenCobro periodo="mes" importe={P.mensual} />,
            ctaLabel: PRUEBA ? 'Elegir mensual' : 'Elegir plan mensual',
            ctaHref: CTA_HREF,
            features: [
              'Todas las funciones del plan anual',
              P.perros,
              ...(GARANTIA ? [`Garantía de ${DIAS_GARANTIA} días sobre tu primer pago`] : []),
              'Cancelas cuando quieras',
            ],
          }}
        />
      </motion.div>

      <RegaloEbook
        tituloMarked="Ebook «Primeros Auxilios Caninos»"
        detalleMarked="La guía de la Doctora Perritos para [b]saber qué hacer en una emergencia[/b]."
        valor="US$9"
      />

      {/* La garantía solo se muestra si está definida y verificada en la pasarela (lib/oferta.ts). */}
      {GARANTIA && (
        <Garantia
          nombre="Garantía del Primer Aviso"
          condicionMarked={`Si la app no te quita el peso de recordar, escribe a ${SOPORTE_EMAIL} dentro de los ${DIAS_GARANTIA} días de garantía${garantiaDesde} y te devolvemos tu primer pago. [b]Sin preguntas.[/b]`}
          pisoLegal={`Respaldada por la garantía de ${DIAS_GARANTIA} días de Hotmart`}
        />
      )}

      <CtaIntermedio />

      <Faq
        items={[
          {
            pregunta: '¿Para eso no pongo una alarma?',
            respuestaMarked: 'Una alarma suena; no te dice [b]quién lo dio ni cuánto queda[/b]. El Panel de Hoy sí.',
          },
          {
            pregunta: '¿Otra suscripción más?',
            respuestaMarked: PRUEBA
              ? `Cuesta menos que un solo antiparasitario. Pruebas ${DIAS_PRUEBA} días y cancelas cuando quieras.`
              : 'Cuesta menos que un solo antiparasitario y cancelas cuando quieras.',
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
            respuestaMarked: 'No. Organiza y recuerda; [b]no diagnostica ni receta[/b]. Ante una duda de salud, consulta a tu veterinario.',
          },
        ]}
      />

      <CtaFinal
        h2Marked="Imagina abrir la app y [acento]tener todo claro[/acento]"
        futurePacingMarked="Esta noche, a las 19:00, la app te avisa. Lo marcas y tu familia lo ve al instante."
        ctaLabel={CTA_LABEL}
        ctaHref={CTA_HREF}
        recap={recap}
        psMarked={ps}
      />

      <FooterLegal
        appName="La Doctora Perritos"
        logo={LOGO}
        soporteEmail={SOPORTE_EMAIL}
        enlaces={[
          { label: 'Privacidad', href: '/privacidad' },
          { label: 'Términos y Condiciones', href: '/terminos' },
          { label: 'Reembolsos', href: '/reembolsos' },
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
