import { ageMinutes, flashDate, moment } from '@/lib/format'
import { statusTone, type Tone } from '@/lib/constants'
import { norm } from '@/lib/utils'
import type { Flash, Station } from '@/lib/types'

/**
 * ok      : flash récent et statut valide
 * alert   : dernier statut en erreur ou avertissement
 * silent  : « muette » — aucun flash depuis plus de N minutes
 * idle    : station active n'ayant jamais envoyé de flash
 * off     : station désactivée
 */
export type Health = 'ok' | 'alert' | 'silent' | 'idle' | 'off'

export const HEALTH: Record<Health, { label: string; tone: Tone; hint: string }> = {
  ok: { label: 'Opérationnelle', tone: 'success', hint: 'Flash récent et statut valide' },
  alert: { label: 'En alerte', tone: 'warning', hint: 'Dernier statut en erreur ou avertissement' },
  silent: { label: 'Muette', tone: 'error', hint: 'Aucun flash depuis le seuil choisi' },
  idle: { label: 'Sans données', tone: 'neutral', hint: 'Active, aucun flash jamais reçu' },
  off: { label: 'Désactivée', tone: 'neutral', hint: 'Coupée dans Ponts bascules' }
}

export const healthOf = (station: Station, flash: Flash | undefined, silentMinutes: number): Health => {
  if (!station.isActive) return 'off'
  if (!flash) return 'idle'
  const tone = statusTone(flash.status)
  // Un statut en erreur explique déjà l'absence de remontée : on le garde « en alerte »
  if (tone === 'error') return 'alert'
  if (ageMinutes(flashDate(flash)) > silentMinutes) return 'silent'

  return tone === 'warning' ? 'alert' : 'ok'
}

/** Clé de rapprochement flash ↔ station (insensible à la casse / aux espaces) */
export const flashKey = (branch?: string, station?: string) => `${norm(branch)}::${norm(station)}`

export const stationKeys = (s: Station) =>
  [s.branch?.code, s.branch?.displayName, s.branchId, s.branch?.id].filter(Boolean).map(b => flashKey(b as string, s.code))

export const isNewer = (a?: Flash, b?: Flash) => {
  if (!b) return true
  if (!a) return false

  return !moment(flashDate(a)).isBefore(moment(flashDate(b)))
}

/** Index « dernier flash par (surccusale, station) » */
export const indexLatest = (flashes: Flash[] = []) => {
  const map: Record<string, Flash> = {}
  flashes.forEach(f => {
    const k = flashKey(f.branch, f.station)
    if (!map[k] || isNewer(f, map[k])) map[k] = f
  })

  return map
}
