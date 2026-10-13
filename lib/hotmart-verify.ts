// Verifica que un aviso del webhook venga de verdad de Hotmart. El HOTTOK es un secreto
// compartido (no una firma): comparar mal (con === normal) filtra por tiempo cuántos bytes
// acertó un atacante, por eso se compara en tiempo constante. Nunca se inventa una firma HMAC
// con el hottok como clave — Hotmart no firma así.
import 'server-only';
import crypto from 'node:crypto';

function timingSafeEqualStr(a: string, b: string): boolean {
  const ba = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

/** Fail-secure: sin el secreto configurado, CUALQUIER aviso se rechaza — nunca un "default" que
 * deje pasar por error. Se lee en cada pedido (no al cargar el módulo) para que la compilación
 * no reviente si falta en un entorno donde el webhook todavía no se usa (ej. local). */
export function verificarHotmart(hottokRecibido: string | undefined | null): boolean {
  const HOTTOK = process.env.HOTMART_HOTTOK;
  if (!HOTTOK || !hottokRecibido) return false;
  return timingSafeEqualStr(hottokRecibido, HOTTOK);
}
