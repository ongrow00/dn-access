/**
 * Lê uma variável de ambiente.
 * - Produção (Cloudflare Workers via OpenNext): process.env é populado com bindings do Worker.
 * - Desenvolvimento local: process.env lê do .env.local via Next.js.
 */
export function getEnv(key: string): string | undefined {
  return process.env[key];
}
