import type { NextConfig } from 'next'

/**
 * Le navigateur appelle l'API en same-origin (/flash-backend/api/v1/...) :
 * Next relaie vers BOBRAINFLASHAPI → pas de souci de CORS.
 */
const apiOrigin = process.env.API_ORIGIN ?? 'http://127.0.0.1:3336'
const apiPrefix = (process.env.NEXT_PUBLIC_API_PREFIX ?? '/flash-backend/api/v1').replace(/\/$/, '')

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // NEXT_OUTPUT=standalone npm run build → .next/standalone/server.js (déploiement Docker / PM2)
  output: process.env.NEXT_OUTPUT === 'standalone' ? 'standalone' : undefined,
  eslint: { ignoreDuringBuilds: true }, // lancer `npm run lint` séparément
  async rewrites() {
    return [{ source: `${apiPrefix}/:path*`, destination: `${apiOrigin}${apiPrefix}/:path*` }]
  }
}

export default nextConfig
