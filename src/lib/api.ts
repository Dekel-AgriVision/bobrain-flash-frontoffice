import { buildSearchQuery, type SearchOptions } from './query'
import { jwtExpiresAt } from './token'

export const API_PREFIX = (process.env.NEXT_PUBLIC_API_PREFIX ?? '/flash-backend/api/v1').replace(/\/$/, '')

let apiToken: string | undefined
let onUnauthorized: (() => void) | undefined
let onRefresh: (() => Promise<string | null>) | undefined

/** Appelé par les providers dès que la session next-auth est connue */
export const setApiToken = (t?: string) => {
  // Ne pas revenir à un token plus ancien (rendu intermédiaire pendant un rafraîchissement)
  if (t && apiToken && t !== apiToken) {
    const next = jwtExpiresAt(t)
    const cur = jwtExpiresAt(apiToken)
    if (next && cur && next < cur) return
  }
  apiToken = t
}
export const setUnauthorizedHandler = (fn: () => void) => {
  onUnauthorized = fn
}
/** Appelé sur un 401 : renvoie un nouveau token si la session a pu être prolongée */
export const setRefreshHandler = (fn: () => Promise<string | null>) => {
  onRefresh = fn
}
export const getApiToken = () => apiToken

/** Le filtre d'exceptions de l'API place le texte utile dans `message` (et `errors` pour la validation) */
export const apiErrorText = (body: any): string | undefined => {
  if (!body || typeof body !== 'object') return typeof body === 'string' && body ? body : undefined
  const errs = body.errors && typeof body.errors === 'object' ? Object.values(body.errors).flat().filter(x => typeof x === 'string') : []
  if (errs.length) return (errs as string[]).join(' · ')
  const generic = ['Unauthorized', 'Bad Request', 'Forbidden', 'Not Found', 'Internal error', 'Unprocessable Entity']
  const msg = [body.message, body.description].find(m => typeof m === 'string' && m && !generic.includes(m))

  return msg ?? body.message ?? body.description
}

export class ApiError extends Error {
  status: number
  body: any
  constructor(status: number, body: any) {
    super(apiErrorText(body) ?? `Erreur ${status}`)
    this.status = status
    this.body = body
  }
}

type RequestOptions = { method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'; body?: unknown; query?: SearchOptions | string }

/**
 * Client HTTP de l'API Brain Flash (same-origin, relayé par Next vers BOBRAINFLASHAPI).
 * Le JWT de session est transmis dans l'en-tête `x-user-claims`.
 */
export async function api<T = any>(path: string, opts: RequestOptions = {}, retried = false): Promise<T> {
  const qs = typeof opts.query === 'string' ? opts.query : opts.query ? buildSearchQuery(opts.query) : ''
  const url = `${API_PREFIX}/${path.replace(/^\//, '')}${qs ? `?${qs}` : ''}`
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (apiToken) headers['x-user-claims'] = apiToken
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json'

  const res = await fetch(url, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    cache: 'no-store'
  })

  // 401 avec token : on tente de prolonger la session (utilisateur actif), puis on rejoue une fois
  if (res.status === 401 && headers['x-user-claims']) {
    const canRefresh = !retried && !/^auth\/(refresh|logout|login)/.test(path)
    const fresh = canRefresh && onRefresh ? await onRefresh().catch(() => null) : null
    if (fresh) return api<T>(path, opts, true)
    onUnauthorized?.()
  }

  const text = await res.text()
  const data = text ? (() => { try { return JSON.parse(text) } catch { return text } })() : null

  if (!res.ok) throw new ApiError(res.status, data)

  return data as T
}

/** Raccourcis CRUD génériques */
export const crud = <T>(resource: string) => ({
  list: (query?: SearchOptions) => api<import('./types').Paginated<T>>(resource, { query }),
  get: (id: string, relations?: string) => api<T>(`${resource}/${id}`, { query: relations ? { relations } : undefined }),
  create: (body: Partial<T> | Record<string, unknown>) => api<T>(resource, { method: 'POST', body }),
  update: (id: string, body: Partial<T> | Record<string, unknown>) => api<T>(`${resource}/${id}`, { method: 'PATCH', body }),
  remove: (id: string) => api(`${resource}/${id}`, { method: 'DELETE' })
})
