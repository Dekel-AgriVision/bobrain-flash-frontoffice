export type WhereParam = { value?: unknown; attribute?: string; type?: string }

export type SearchOptions = {
  relations?: string
  where?: WhereParam[]
  order_by?: string
  order?: 'ASC' | 'DESC'
  page?: number
  per_page?: number
}

/**
 * Query string au format ApiSearchParamOptions (@app/nestjs) :
 * relations, where (JSON), order_by, order, page, per_page.
 */
export const buildSearchQuery = (o: SearchOptions = {}) => {
  const where = (o.where ?? []).filter(w => {
    if (!w) return false
    if (w.type && ['isTrue', 'isFalse', 'isNull', 'isNotNull'].includes(w.type)) return true

    return w.value !== undefined && w.value !== null && w.value !== ''
  })
  const params = new URLSearchParams()
  if (o.relations) params.set('relations', o.relations)
  if (where.length) params.set('where', JSON.stringify(where))
  if (o.order_by) params.set('order_by', o.order_by)
  if (o.order) params.set('order', o.order)
  if (o.page) params.set('page', String(o.page))
  if (o.per_page) params.set('per_page', String(Math.min(o.per_page, 500)))

  return params.toString()
}
