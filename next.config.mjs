import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

// Conecta os bindings do wrangler.toml ao processo local (next dev)
if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform();
}

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
