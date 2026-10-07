import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Normalise un code (l'API compare les codes sans tenir compte de la casse — MySQL) */
export const norm = (v?: unknown) => String(v ?? '').trim().toUpperCase()

/** Message d'erreur lisible à partir d'une réponse d'erreur de l'API */
export const errorMessage = (err: any, fallback = 'Une erreur est survenue') => {
  if (!err) return fallback
  if (typeof err === 'string') return err
  if (err.errors && typeof err.errors === 'object') {
    const msgs = Object.values(err.errors).flat().filter(m => typeof m === 'string' && m)
    if (msgs.length) return msgs.join(' · ')
  }
  const generic = ['Unauthorized', 'Bad Request', 'Forbidden', 'Not Found', 'Internal error', 'Unprocessable Entity']
  const msg = [err.message, err.description].find(m => typeof m === 'string' && m && !generic.includes(m))

  return msg ?? err.message ?? err.description ?? fallback
}
