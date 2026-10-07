import moment from 'moment'
import 'moment/locale/fr'
import 'moment/locale/he'

moment.locale('fr')

export { moment }

type DateInput = string | number | Date | null | undefined

export const toMoment = (value: DateInput) => {
  if (value === null || value === undefined || value === '') return null
  let v: any = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value
  // Timestamps en secondes (service de pesée) → millisecondes
  if (typeof v === 'number' && v < 1e12) v = v * 1000
  const m = moment(v)

  return m.isValid() ? m : null
}

/** Date de référence d'un flash : timestamp du service, sinon date d'enregistrement */
export const flashDate = (f: any) => (f?.timestamp ? toMoment(f.timestamp)?.toDate() : f?.updatedAt ?? f?.createdAt) ?? null

export const formatDateTime = (v: DateInput) => toMoment(v)?.format('DD/MM/YYYY HH:mm:ss') ?? '—'
export const formatDate = (v: DateInput) => toMoment(v)?.format('DD/MM/YYYY') ?? '—'
export const formatTime = (v: DateInput) => toMoment(v)?.format('HH:mm:ss') ?? '—'
export const formatDayLabel = (v: DateInput) => toMoment(v)?.format('dddd D MMMM YYYY') ?? '—'
export const formatFromNow = (v: DateInput) => toMoment(v)?.fromNow() ?? '—'
/** Durée écoulée sans « il y a » (ex. « 5 minutes ») */
export const formatElapsed = (v: DateInput) => toMoment(v)?.fromNow(true) ?? '—'
export const formatCalendar = (v: DateInput) =>
  // « Aujourd'hui à… / Today at… / היום ב… » selon la langue courante (moment.locale)
  toMoment(v)?.calendar(null, { sameElse: 'DD/MM/YYYY HH:mm' }) ?? '—'

/** Unités courtes des durées par langue */
const DURATION_UNITS: Record<string, { d: string; h: string; m: string }> = {
  fr: { d: 'j', h: 'h', m: 'min' },
  en: { d: 'd', h: 'h', m: 'min' },
  he: { d: ' ימ׳', h: ' שע׳', m: ' דק׳' }
}
const NUMBER_LOCALE: Record<string, string> = { fr: 'fr-FR', en: 'en-GB', he: 'he-IL' }
const numberLocale = () => NUMBER_LOCALE[moment.locale()] ?? 'fr-FR'

/** « 2j 3h 05min » entre deux dates (ou jusqu'à maintenant) */
export const formatDuration = (start: DateInput, end?: DateInput) => {
  const s = toMoment(start)
  if (!s) return '—'
  const e = toMoment(end) ?? moment()
  const ms = e.diff(s)
  if (ms < 0) return '—'
  const d = moment.duration(ms)
  const days = Math.floor(d.asDays())
  const h = d.hours()
  const m = d.minutes()

  const u = DURATION_UNITS[moment.locale()] ?? DURATION_UNITS.fr

  return [days ? `${days}${u.d}` : '', h ? `${h}${u.h}` : '', `${String(m).padStart(days || h ? 2 : 1, '0')}${u.m}`].filter(Boolean).join(' ')
}

/** Âge en minutes */
export const ageMinutes = (v: DateInput) => {
  const m = toMoment(v)

  return m ? moment().diff(m, 'minutes', true) : Infinity
}

export const toApiStartOfDay = (v?: string) => (v ? moment(v).startOf('day').format('YYYY-MM-DD HH:mm:ss') : '')
export const toApiEndOfDay = (v?: string) => (v ? moment(v).endOf('day').format('YYYY-MM-DD HH:mm:ss') : '')

export const formatWeight = (v?: number | string | null) =>
  v === null || v === undefined || v === '' ? '—' : `${Number(v).toLocaleString(numberLocale())} kg`
export const formatNumber = (v?: number | string | null) =>
  v === null || v === undefined || v === '' ? '—' : Number(v).toLocaleString(numberLocale())
