import { DEFAULT_LOCALE, type Locale } from './config'
import en from './messages/en'
import he from './messages/he'

/**
 * Les clés sont les textes français eux-mêmes (langue source).
 * Une traduction manquante retombe sur le texte français : rien ne casse.
 * Variables : t('{n} station(s)', { n: 3 })
 */
const CATALOGS: Record<Locale, Record<string, string>> = { fr: {}, en, he }

export type TVars = Record<string, string | number | null | undefined>
export type TFn = (key: string, vars?: TVars) => string

const interpolate = (s: string, vars?: TVars) => (vars ? s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] === undefined || vars[k] === null ? m : String(vars[k]))) : s)

export const translate = (locale: Locale, key: string, vars?: TVars): string => {
  if (key === undefined || key === null) return key
  const msg = locale === 'fr' ? key : CATALOGS[locale]?.[key] ?? key

  return interpolate(msg, vars)
}

export const makeT = (locale: Locale): TFn => (key, vars) => translate(locale, key, vars)

/**
 * Langue courante côté navigateur, pour le code hors rendu (toasts, gestionnaires d'événements).
 * Dans les composants, utiliser useT() (contexte), sûr aussi pendant le rendu serveur.
 */
let current: Locale = DEFAULT_LOCALE
export const setCurrentLocale = (l: Locale) => {
  current = l
}
export const getCurrentLocale = () => current
export const tr: TFn = (key, vars) => translate(current, key, vars)
