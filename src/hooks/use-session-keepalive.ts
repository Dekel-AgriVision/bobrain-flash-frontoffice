'use client'

import { useCallback, useEffect, useRef } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { API_PREFIX, getApiToken, setApiToken, setRefreshHandler } from '@/lib/api'
import { closeSocket } from '@/lib/socket'
import { jwtTimes } from '@/lib/token'
import { tr } from '@/i18n/translate'

const minutes = (v: string | undefined, fallback: number) => {
  const n = Number(v)

  return (Number.isFinite(n) && n > 0 ? n : fallback) * 60 * 1000
}

/** Inactivité tolérée avant retour à la page de connexion (défaut 10 min) */
const IDLE_MS = minutes(process.env.NEXT_PUBLIC_SESSION_IDLE_MINUTES, 10)
/** Âge du token à partir duquel il est renouvelé (défaut 20 min) */
const REFRESH_EVERY_MS = minutes(process.env.NEXT_PUBLIC_SESSION_REFRESH_MINUTES, 20)
/** Avertissement avant la déconnexion pour inactivité */
const WARN_BEFORE_MS = Math.min(60 * 1000, IDLE_MS / 2)
/** Marge de sécurité : renouveler aussi s'il reste moins de 2 min, quel que soit l'âge du token */
const SAFETY_MS = 2 * 60 * 1000
const CHECK_EVERY_MS = 15 * 1000
const ACTIVITY_KEY = 'brainflash.lastActivity'
const ACTIVITY_EVENTS = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'scroll', 'touchstart'] as const

/**
 * Politique de session du backoffice :
 * - le token API (30 min) est renouvelé toutes les 20 min tant que l'utilisateur est actif ;
 * - après 10 min sans aucune interaction (souris, clavier, défilement, tactile), l'utilisateur
 *   est averti puis renvoyé vers la page de connexion ;
 * - l'activité est partagée entre les onglets ouverts (localStorage) ;
 * - un 401 de l'API déclenche un renouvellement puis la requête est rejouée une fois.
 */
export function useSessionKeepAlive() {
  const { update, status } = useSession()
  const lastActivity = useRef(Date.now())
  const inflight = useRef<Promise<string | null> | null>(null)
  const warned = useRef<string | number | null>(null)
  const loggingOut = useRef(false)
  const lastRefresh = useRef(0)

  const isActive = () => Date.now() - lastActivity.current < IDLE_MS

  // Suivi de l'activité, partagé entre onglets
  useEffect(() => {
    let last = 0
    const mark = () => {
      const now = Date.now()
      if (now - last < 1000) return
      lastActivity.current = last = now
      if (warned.current !== null) {
        toast.dismiss(warned.current)
        warned.current = null
      }
      try {
        localStorage.setItem(ACTIVITY_KEY, String(now))
      } catch {}
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key === ACTIVITY_KEY && e.newValue) lastActivity.current = Math.max(lastActivity.current, Number(e.newValue) || 0)
    }
    try {
      const shared = Number(localStorage.getItem(ACTIVITY_KEY))
      if (shared) lastActivity.current = Math.max(lastActivity.current, shared)
    } catch {}
    ACTIVITY_EVENTS.forEach(e => window.addEventListener(e, mark, { passive: true }))
    window.addEventListener('storage', onStorage)

    return () => {
      ACTIVITY_EVENTS.forEach(e => window.removeEventListener(e, mark))
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  /** Un seul renouvellement à la fois ; renvoie le nouveau token ou null */
  const refresh = useCallback(async (): Promise<string | null> => {
    if (inflight.current) return inflight.current
    const current = getApiToken()
    if (!current || !isActive()) return null

    lastRefresh.current = Date.now()
    inflight.current = (async () => {
      try {
        const res = await fetch(`${API_PREFIX}/auth/refresh`, {
          method: 'POST',
          headers: { Accept: 'application/json', 'x-user-claims': current },
          cache: 'no-store'
        })
        if (!res.ok) return null
        const body = await res.json().catch(() => null)
        if (!body?.token) return null
        setApiToken(body.token)
        await update({ apiToken: body.token, session: body.session, abilities: body.abilities })

        return body.token as string
      } catch {
        return null
      } finally {
        inflight.current = null
      }
    })()

    return inflight.current
  }, [update])

  // Renouvellement sur 401 (client HTTP) ; référence stable pour la boucle de contrôle
  const refreshRef = useRef(refresh)
  useEffect(() => {
    refreshRef.current = refresh
    setRefreshHandler(refresh)
  }, [refresh])

  const authenticated = status === 'authenticated'
  useEffect(() => {
    if (!authenticated) return

    const logoutForIdle = async () => {
      if (loggingOut.current) return
      loggingOut.current = true
      const token = getApiToken()
      if (token) {
        await fetch(`${API_PREFIX}/auth/logout`, { method: 'POST', headers: { 'x-user-claims': token } }).catch(() => null)
      }
      closeSocket()
      signOut({ callbackUrl: '/login?idle=1' })
    }

    const check = () => {
      const idleFor = Date.now() - lastActivity.current

      // 1. Inactivité : avertissement puis retour à la connexion
      if (idleFor >= IDLE_MS) return void logoutForIdle()
      if (idleFor >= IDLE_MS - WARN_BEFORE_MS && warned.current === null) {
        warned.current = toast.warning(tr('Session inactive'), {
          description: tr('Vous serez déconnecté dans moins d’une minute. Bougez la souris ou appuyez sur une touche pour rester connecté.'),
          duration: WARN_BEFORE_MS
        })
      }

      // 2. Renouvellement périodique du token (toutes les 20 min) pour un utilisateur actif
      const { iat, exp } = jwtTimes(getApiToken())
      if (!exp || inflight.current) return
      const now = Date.now()
      const lifetime = iat ? exp - iat : REFRESH_EVERY_MS
      // Garde-fous : jamais plus d'un renouvellement par tiers de durée de vie du token
      if (now - lastRefresh.current < Math.min(REFRESH_EVERY_MS, lifetime / 3)) return
      const age = iat ? now - iat : 0
      const safety = Math.min(SAFETY_MS, lifetime / 3)
      if (age >= REFRESH_EVERY_MS || exp - now < safety) void refreshRef.current()
    }

    check()
    const id = window.setInterval(check, CHECK_EVERY_MS)
    const onVisible = () => document.visibilityState === 'visible' && check()
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [authenticated])
}
