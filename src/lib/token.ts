/** Lecture (sans vérification de signature) des dates d'un JWT — planification uniquement */
export function jwtTimes(token?: string): { iat?: number; exp?: number } {
  if (!token) return {}
  try {
    const part = token.split('.')[1]
    const json = JSON.parse(
      typeof atob === 'function'
        ? decodeURIComponent(escape(atob(part.replace(/-/g, '+').replace(/_/g, '/'))))
        : Buffer.from(part, 'base64url').toString('utf8')
    )

    return {
      iat: typeof json.iat === 'number' ? json.iat * 1000 : undefined,
      exp: typeof json.exp === 'number' ? json.exp * 1000 : undefined
    }
  } catch {
    return {}
  }
}

/** Date d'expiration (ms) d'un JWT */
export const jwtExpiresAt = (token?: string) => jwtTimes(token).exp
