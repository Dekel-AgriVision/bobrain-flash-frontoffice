import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import type { AbilityRule, AuthSession } from './types'
import { AUTH_SECRET } from './auth-secret'
import { decryptLoginSecret } from './login-crypto'
import { jwtExpiresAt } from './token'

const API_ORIGIN = process.env.API_ORIGIN ?? 'http://127.0.0.1:3336'
const API_PREFIX = (process.env.NEXT_PUBLIC_API_PREFIX ?? '/flash-backend/api/v1').replace(/\/$/, '')

/** Réduit la session API au strict nécessaire (le JWT next-auth est stocké en cookie) */
export const compactSession = (s: any): AuthSession | undefined =>
  s
    ? {
        id: s.id,
        user: s.user
          ? { id: s.user.id, username: s.user.username, firstName: s.user.firstName, lastName: s.user.lastName, email: s.user.email }
          : s.userData
            ? { id: s.userData.id, username: s.userData.username ?? s.username, firstName: s.userData.firstName, lastName: s.userData.lastName, email: s.userData.email }
            : { id: s.userId, username: s.username },
        role: s.role ? { id: s.role.id, name: s.role.name, displayName: s.role.displayName, adminPermission: s.role.adminPermission } : undefined,
        targetBranchId: s.targetBranchId,
        targetBranch: s.targetBranch ? { id: s.targetBranch.id, code: s.targetBranch.code, displayName: s.targetBranch.displayName } : undefined,
        branchId: s.branchId,
        branch: s.branch ? { id: s.branch.id, code: s.branch.code, displayName: s.branch.displayName, isParentCompany: s.branch.isParentCompany } : undefined
      }
    : undefined

const compactAbilities = (rules: any): AbilityRule[] =>
  Array.isArray(rules) ? rules.map(r => ({ action: r.action, subject: r.subject, ...(r.conditions ? { conditions: r.conditions } : {}), ...(r.inverted ? { inverted: true } : {}) })) : []

export const authOptions: NextAuthOptions = {
  secret: AUTH_SECRET,
  // La durée réelle est pilotée par le token API (rafraîchi tant que l'utilisateur est actif)
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 7 },
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: { credential: { label: 'Identifiants chiffrés', type: 'text' } },
      async authorize(credentials) {
        // Identifiant et mot de passe arrivent chiffrés (RSA-OAEP) : jamais en clair dans la requête
        if (!credentials?.credential) throw new Error('Identifiants invalides')
        const { username, password } = decryptLoginSecret(credentials.credential)

        const res = await fetch(`${API_ORIGIN}${API_PREFIX}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
          cache: 'no-store'
        }).catch(() => null)

        if (!res) throw new Error("L'API BoBrain Flash est injoignable")
        const body = await res.json().catch(() => ({}))
        if (!res.ok || !body?.token) {
          const errs = body?.errors && typeof body.errors === 'object' ? Object.values(body.errors).flat().filter(x => typeof x === 'string') : []
          const generic = ['Unauthorized', 'Bad Request', 'Too Many Requests']
          const msg = errs[0] ?? [body?.message, body?.description].find((m: any) => typeof m === 'string' && m && !generic.includes(m))
          throw new Error(String(msg ?? (res.status === 429 ? 'Trop de tentatives, réessayez plus tard' : 'Identifiants invalides')))
        }

        return {
          id: body.session?.id ?? body.session?.userId ?? username,
          token: body.token,
          session: compactSession(body.session),
          abilities: compactAbilities(body.abilities)
        } as any
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const u = user as any
        token.apiToken = u.token
        token.apiTokenExp = jwtExpiresAt(u.token)
        token.apiSession = u.session
        token.abilities = u.abilities
      }
      // Mise à jour côté client : changement de surccusale update({ session, abilities })
      // ou rafraîchissement du token API update({ apiToken, session, abilities })
      if (trigger === 'update' && session) {
        if (typeof session.apiToken === 'string' && session.apiToken) {
          token.apiToken = session.apiToken
          token.apiTokenExp = jwtExpiresAt(session.apiToken)
        }
        if (session.session) token.apiSession = compactSession(session.session)
        if (session.abilities) token.abilities = compactAbilities(session.abilities)
      }

      return token
    },
    async session({ session, token }) {
      ;(session as any).apiToken = token.apiToken
      ;(session as any).apiTokenExp = token.apiTokenExp
      ;(session as any).apiSession = token.apiSession
      ;(session as any).abilities = token.abilities

      return session
    }
  }
}
