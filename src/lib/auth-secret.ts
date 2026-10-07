/**
 * Clé de signature des cookies next-auth.
 * Définir NEXTAUTH_SECRET dans .env (obligatoire en production).
 * À défaut, une clé de développement est utilisée pour que l'application démarre.
 */
export const AUTH_SECRET = process.env.NEXTAUTH_SECRET ?? 'dev-secret-please-change-me-in-production'
