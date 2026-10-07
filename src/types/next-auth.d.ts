import 'next-auth'
import 'next-auth/jwt'
import type { AbilityRule, AuthSession } from '@/lib/types'

declare module 'next-auth' {
  interface Session {
    apiToken?: string
    /** Expiration du token API (ms) */
    apiTokenExp?: number
    apiSession?: AuthSession
    abilities?: AbilityRule[]
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    apiToken?: string
    /** Expiration du token API (ms) */
    apiTokenExp?: number
    apiSession?: AuthSession
    abilities?: AbilityRule[]
  }
}
