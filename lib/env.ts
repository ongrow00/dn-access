import { getRequestContext } from '@cloudflare/next-on-pages';

/**
 * Lê uma variável de ambiente com suporte a dois contextos:
 *  - Cloudflare Workers (produção): lê dos bindings via getRequestContext().env
 *  - Node.js / next dev (local): lê de process.env (.env.local)
 */
export function getEnv(key: string): string | undefined {
  try {
    const ctx = getRequestContext();
    const val = (ctx.env as unknown as Record<string, unknown>)[key];
    if (typeof val === 'string' && val.trim()) return val;
  } catch {
    // Fora do contexto do Workers (ex: next dev local)
  }
  return process.env[key];
}
