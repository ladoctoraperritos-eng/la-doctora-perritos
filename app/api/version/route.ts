// Confirma qué versión del código está publicada ahora mismo — Vercel pone el SHA del commit
// automáticamente, no hace falta configurar nada. Sirve para comprobar que un `git push` se
// reflejó de verdad en producción (62-PUBLICACION-SEGURA-Y-CONTINUA.md, P7/P8).
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    sha: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    branch: process.env.VERCEL_GIT_COMMIT_REF ?? null,
    env: process.env.VERCEL_ENV ?? null,
  });
}
