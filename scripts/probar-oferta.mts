import { CONDICIONES, resumenCobro } from '../lib/oferta.ts';
const mostrar = (t: string, r: ReturnType<typeof resumenCobro>) => {
  console.log('\n## ' + t);
  r.lineas.forEach((l) => console.log(`  ${l.etiqueta}: ${l.valor}`));
  if (r.nota) console.log('  · ' + r.nota);
  if (r.garantia) console.log('  · ' + r.garantia);
};
const inicio = new Date(2026, 8, 24); // 24 sep 2026
// A) Estado real hoy: nada verificado
mostrar('SIN prueba ni garantía (estado real) — anual Esencial', resumenCobro({ inicio, periodo: 'anio', importe: 'US$29', equivalente: 'US$2,42 al mes' }));
mostrar('SIN prueba ni garantía — mensual Familia', resumenCobro({ inicio, periodo: 'mes', importe: 'US$4,99' }));
// B) Prueba y garantía verificadas (primer cobro)
CONDICIONES.prueba.verificada = true;
CONDICIONES.garantia.verificada = true;
CONDICIONES.garantia.desde = 'primer_cobro';
mostrar('CON prueba 7d + garantía 15d desde primer cobro — anual Familia', resumenCobro({ inicio, periodo: 'anio', importe: 'US$49', equivalente: 'US$4,08 al mes' }));
mostrar('CON prueba + garantía — mensual Familia', resumenCobro({ inicio, periodo: 'mes', importe: 'US$4,99' }));
mostrar('CON prueba + garantía — mensual Esencial', resumenCobro({ inicio, periodo: 'mes', importe: 'US$2,99' }));
// C) Casos límite de calendario
mostrar('Inicio 25 ene 2027 (primer cobro 1 feb) mensual', resumenCobro({ inicio: new Date(2027, 0, 25), periodo: 'mes', importe: 'US$2,99' }));
CONDICIONES.prueba.verificada = false;
mostrar('Sin prueba, inicio 31 ene 2027 mensual → renovación fin de febrero', resumenCobro({ inicio: new Date(2027, 0, 31), periodo: 'mes', importe: 'US$2,99' }));
mostrar('Sin prueba, inicio 29 feb 2028 anual → 28 feb 2029', resumenCobro({ inicio: new Date(2028, 1, 29), periodo: 'anio', importe: 'US$29' }));
