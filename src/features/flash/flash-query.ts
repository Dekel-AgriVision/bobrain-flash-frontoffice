import { toApiEndOfDay, toApiStartOfDay } from '@/lib/format'
import type { SearchOptions, WhereParam } from '@/lib/query'
import type { FlashFilterState } from './flash-filters'

/** Filtres Flash/Audit → paramètres de recherche API */
export const flashSearch = (f: FlashFilterState, search: string, page: number, perPage: number): SearchOptions => {
  const where: WhereParam[] = [
    { value: f.branch, attribute: 'branch' },
    { value: f.station, attribute: 'station' },
    { value: f.status, attribute: 'status' },
    { value: search }
  ]
  const s = toApiStartOfDay(f.start)
  const e = toApiEndOfDay(f.end)
  if (s && e) where.push({ value: [s, e], attribute: 'createdAt', type: 'between' })
  else if (s) where.push({ value: s, attribute: 'createdAt', type: 'greaterThanOrEquals' })
  else if (e) where.push({ value: e, attribute: 'createdAt', type: 'lessThanOrEquals' })

  return { where, order_by: 'createdAt', order: 'DESC', page, per_page: perPage }
}
