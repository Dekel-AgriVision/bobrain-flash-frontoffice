/** Langues disponibles — le français est la langue source et la langue par défaut */
export const LOCALES = ['fr', 'en', 'he'] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'fr'
export const LOCALE_COOKIE = 'brainflash.locale'

export const LOCALE_LABELS: Record<Locale, string> = { fr: 'Français', en: 'English', he: 'עברית' }
export const LOCALE_SHORT: Record<Locale, string> = { fr: 'FR', en: 'EN', he: 'HE' }

export const isLocale = (v: unknown): v is Locale => typeof v === 'string' && (LOCALES as readonly string[]).includes(v)
export const dirOf = (l: Locale) => (l === 'he' ? 'rtl' : 'ltr')
