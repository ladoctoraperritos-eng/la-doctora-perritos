// Contenido del SOS: extraído y condensado del ebook «Primeros Auxilios Caninos» de la creadora (módulos 4
// y 5), para que se lea en segundos en una emergencia real en vez de buscar en un PDF de 90 páginas.
// No es contenido generado: son los mismos pasos de su ebook, resumidos a formato de pantalla.

export interface SituacionSos {
  id: string;
  titulo: string;
  resumen: string;
  senales: string[];
  pasos: string[];
  evitar?: string[];
  veterinarioSi: string[];
}

export const SITUACIONES: SituacionSos[] = [
  {
    id: 'atragantamiento',
    titulo: 'Atragantamiento o asfixia',
    resumen: 'Un objeto bloquea parcial o totalmente sus vías respiratorias.',
    senales: ['Arcadas sin vómito', 'Dificultad para respirar', 'Tos intensa', 'Lengua o encías azuladas', 'Agitación o colapso repentino'],
    pasos: [
      'Evalúa si respira parcialmente. Si respira, mantén la calma y evita intervenir con brusquedad.',
      'Abre el hocico con precaución. Si ves el objeto y puedes sacarlo con los dedos o una pinza sin forzar, hazlo. Si no está visible o está atascado profundo, no lo empujes.',
      'Si hay obstrucción total — perros pequeños: sujétalo con el lomo contra tu pecho, cabeza hacia abajo, y aplica 5 compresiones suaves en el abdomen. Perros medianos o grandes: de pie o de lado, manos justo detrás de las costillas, presiona hacia arriba (Heimlich adaptado).',
      'Si colapsa: inicia RCP de inmediato y ve al veterinario sin esperar.',
    ],
    evitar: ['Meter los dedos a ciegas', 'Usar agua o aceite para intentar "bajar" el objeto', 'Perder tiempo sin actuar'],
    veterinarioSi: ['Siempre, aunque ya haya expulsado el objeto.'],
  },
  {
    id: 'convulsiones',
    titulo: 'Convulsiones',
    resumen: 'Descargas eléctricas anormales en el cerebro: epilepsia, fiebre, intoxicación o golpe.',
    senales: ['Pérdida de consciencia', 'Movimientos espasmódicos', 'Rigidez muscular', 'Salivación excesiva', 'Pérdida de orina o heces'],
    pasos: [
      'No intentes sujetarlo ni abrirle la boca: no se traga la lengua.',
      'Retira objetos peligrosos y asegura el entorno.',
      'Cronometra el tiempo: menos de 2 minutos requiere control; si se prolonga, es urgente.',
      'Después de la convulsión: llévalo a un lugar tranquilo, sin ruidos ni luces.',
    ],
    evitar: ['Gritar o agitarlo', 'Forzar contacto durante la convulsión', 'Darle medicamentos sin indicación veterinaria'],
    veterinarioSi: ['Es la primera vez', 'Dura más de 2 minutos', 'Hay más de una convulsión en menos de 1 hora', 'No recupera la consciencia'],
  },
  {
    id: 'intoxicacion',
    titulo: 'Envenenamiento o intoxicación',
    resumen: 'Comió algo tóxico: chocolate, cebolla, uvas, una planta, un producto de limpieza o un medicamento humano.',
    senales: ['Vómitos o diarrea', 'Temblores o convulsiones', 'Pupilas dilatadas', 'Babeo excesivo', 'Colapso'],
    pasos: [
      'Identifica qué sustancia ingirió y cuánto. Guarda el envase si puedes.',
      'No le induzcas el vómito sin que el veterinario te lo indique.',
      'Contacta de inmediato a tu veterinario o a un centro de toxicología.',
      'Si te lo indican: dale carbón activado o agua oxigenada al 3% en la dosis exacta que te digan según su peso.',
      'Conserva una muestra de vómito o heces si hay que analizarla.',
    ],
    evitar: ['Inducir el vómito sin autorización profesional', 'Automedicar con remedios humanos'],
    veterinarioSi: ['Siempre, aunque el perro se vea bien — muchos tóxicos actúan horas después.'],
  },
  {
    id: 'heridas',
    titulo: 'Heridas abiertas y hemorragias',
    resumen: 'Cortes, raspones, mordeduras o heridas punzantes con sangrado.',
    senales: ['Sangrado visible', 'Cojera o dolor al tocar la zona', 'El perro lame la zona insistentemente'],
    pasos: [
      'Ponte guantes. Controla el sangrado presionando con una gasa por 3 a 5 minutos.',
      'Si la gasa se empapa, no la quites: coloca otra encima.',
      'Una vez controlado el sangrado: lava con suero fisiológico y desinfecta con clorhexidina.',
      'Cubre con una gasa estéril y venda sin apretar demasiado.',
    ],
    evitar: ['Aplicar pomadas sin indicación', 'Coser o cerrar la herida en casa', 'Usar alcohol directo sobre la herida'],
    veterinarioSi: ['La herida es profunda o irregular', 'El sangrado no se detiene', 'Se ve músculo o hueso'],
  },
  {
    id: 'golpe-calor',
    titulo: 'Golpe de calor',
    resumen: 'Temperatura muy alta por ejercicio intenso, sol directo o quedar encerrado en un auto.',
    senales: ['Jadeo excesivo', 'Temperatura mayor a 40 °C', 'Encías rojas brillantes', 'Temblores o debilidad', 'Desmayo'],
    pasos: [
      'Traslada al perro a un lugar fresco y ventilado de inmediato.',
      'Moja su abdomen y patas con agua tibia (nunca fría).',
      'Ofrécele agua fresca en pequeñas cantidades.',
      'Controla su temperatura cada 5 minutos.',
      'Llévalo al veterinario en cuanto baje a 39.2 °C.',
    ],
    veterinarioSi: ['Siempre — puede provocar fallo renal o cerebral en menos de 30 minutos si no se revierte.'],
  },
  {
    id: 'rcp',
    titulo: 'RCP canina (reanimación)',
    resumen: 'Solo cuando el perro NO respira y NO tiene pulso.',
    senales: ['No respira y no tiene pulso', 'Está inconsciente, no responde a estímulos', 'Encías grisáceas o azuladas'],
    pasos: [
      'Comprueba el pulso (arteria femoral, parte interna del muslo) y la respiración (el pecho sube y baja).',
      'Si no hay ninguno de los dos: acuéstalo sobre su costado derecho, en una superficie firme y plana.',
      'Dobla la pata delantera izquierda hacia atrás: donde el codo toca el pecho es el centro del corazón — ahí van tus manos.',
      'Aplica 30 compresiones (ritmo de 100 a 120 por minuto) y luego 2 respiraciones de rescate: cierra su hocico y sopla por la nariz hasta ver que el pecho se eleva.',
      'Repite el ciclo de 30 compresiones + 2 respiraciones, revisando cada 2 minutos si recupera pulso o respiración propia.',
    ],
    evitar: ['Hacer RCP si el perro tiene pulso o respira por sí solo'],
    veterinarioSi: ['Traslada apenas puedas, incluso si recupera los signos vitales.'],
  },
  {
    id: 'heimlich',
    titulo: 'Maniobra de Heimlich adaptada',
    resumen: 'Solo si no respira en absoluto por un objeto atascado (comida, juguete, hueso).',
    senales: ['No puede inhalar nada de aire', 'No logra expulsar el objeto por sí solo'],
    pasos: [
      'Perros pequeños: sujétalo con la espalda contra tu pecho, cabeza hacia abajo, una mano sobre el abdomen bajo las costillas, y aplica 5 compresiones rápidas y suaves hacia arriba.',
      'Perros medianos o grandes: de pie o de lado, puño debajo de la caja torácica, cubierto con la otra mano, y 5 compresiones firmes hacia adentro y hacia arriba.',
      'Revisa su boca: si ves el objeto y es accesible, retíralo con cuidado sin empujarlo más adentro.',
      'Si no hay éxito, repite el ciclo. Si colapsa, aplica RCP de inmediato.',
    ],
    evitar: ['Hacer esta maniobra si el perro aún puede respirar algo, aunque sea limitado — en ese caso ve directo al veterinario sin comprimir.'],
    veterinarioSi: ['Siempre, incluso si logra expulsar el objeto.'],
  },
];

export type NivelTriage = 'emergencia' | 'urgencia' | 'control';

export const NIVELES_TRIAGE: { nivel: NivelTriage; titulo: string; detalle: string; ejemplos: string[] }[] = [
  {
    nivel: 'emergencia',
    titulo: 'Emergencia',
    detalle: 'Atención inmediata. Retrasarla puede poner en peligro su vida.',
    ejemplos: ['Dificultad para respirar', 'Hemorragia activa', 'Convulsiones prolongadas o repetidas', 'Golpe de calor', 'Traumatismo severo', 'Intoxicación confirmada o sospechada', 'Pérdida de consciencia'],
  },
  {
    nivel: 'urgencia',
    titulo: 'Urgencia',
    detalle: 'No compromete la vida en minutos, pero necesita evaluación en pocas horas.',
    ejemplos: ['Vómitos o diarrea persistentes', 'Cojera repentina sin causa visible', 'Herida abierta superficial', 'Sangre en orina o heces', 'Fiebre (más de 39.5 °C)', 'Letargo marcado'],
  },
  {
    nivel: 'control',
    titulo: 'Control programado',
    detalle: 'Puede esperar un chequeo agendado, pero no debe olvidarse.',
    ejemplos: ['Vacunación o antiparasitario', 'Limpieza dental', 'Exámenes de rutina', 'Cambio de alimentación guiada'],
  },
];
