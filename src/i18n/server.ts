import { cookies, headers } from 'next/headers'
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from './config'
import { makeT } from './translate'

/** Langue de la requête : cookie, sinon français (langue par défaut) */
export async function getLocale(): Promise<Locale> {
  const c = (await cookies()).get(LOCALE_COOKIE)?.value
  if (isLocale(c)) return c
  void headers // la langue du navigateur n'est pas utilisée : le français reste la langue par défaut

  return DEFAULT_LOCALE
}

export async function getT() {
  return makeT(await getLocale())
}
