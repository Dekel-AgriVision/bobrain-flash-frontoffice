'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { moment } from '@/lib/format'
import { dirOf, LOCALE_COOKIE, type Locale } from './config'
import { makeT, setCurrentLocale, type TFn } from './translate'

type I18nValue = { locale: Locale; dir: 'ltr' | 'rtl'; t: TFn; setLocale: (l: Locale) => void }

const I18nContext = createContext<I18nValue | null>(null)

const MOMENT_LOCALE: Record<Locale, string> = { fr: 'fr', en: 'en', he: 'he' }

export function I18nProvider({ initialLocale, children }: { initialLocale: Locale; children: React.ReactNode }) {
  const router = useRouter()
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  // Synchrone : les dates et le code hors rendu utilisent la bonne langue dès ce rendu
  setCurrentLocale(locale)
  moment.locale(MOMENT_LOCALE[locale])

  const setLocale = useCallback(
    (l: Locale) => {
      try {
        document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`
      } catch {}
      document.documentElement.lang = l
      document.documentElement.dir = dirOf(l)
      setCurrentLocale(l)
      moment.locale(MOMENT_LOCALE[l])
      setLocaleState(l)
      router.refresh() // titres de pages et rendu serveur dans la nouvelle langue
    },
    [router]
  )

  const value = useMemo<I18nValue>(() => ({ locale, dir: dirOf(locale), t: makeT(locale), setLocale }), [locale, setLocale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const v = useContext(I18nContext)
  if (!v) throw new Error('useI18n doit être utilisé dans <I18nProvider>')

  return v
}

/** Fonction de traduction de la langue courante */
export const useT = () => useI18n().t

/** Traduit une valeur si c'est une chaîne (props des composants partagés) */
export const useTx = () => {
  const t = useT()

  return <T,>(v: T): T => (typeof v === 'string' ? (t(v) as T) : v)
}
