'use client'

import { useMemo, useState } from 'react'
import { useDebounce } from './use-debounce'

/** État d'une liste paginée : filtres, recherche (debouncée), page, taille de page */
export function useListState<F extends Record<string, string>>(initial: F, opts: { perPage?: number; preset?: Partial<F> } = {}) {
  const [filters, setFilters] = useState<F>({ ...initial, ...(opts.preset ?? {}) } as F)
  const [search, setSearchRaw] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPageRaw] = useState(opts.perPage ?? 25)
  const debouncedSearch = useDebounce(search)

  const setFilter = (patch: Partial<F>) => {
    setFilters(f => ({ ...f, ...patch }))
    setPage(1)
  }
  const setSearch = (v: string) => {
    setSearchRaw(v)
    setPage(1)
  }
  const setPerPage = (n: number) => {
    setPerPageRaw(n)
    setPage(1)
  }
  const reset = () => {
    setFilters(Object.fromEntries(Object.keys(initial).map(k => [k, ''])) as F)
    setSearchRaw('')
    setPage(1)
  }
  const activeCount = useMemo(() => Object.values(filters).filter(Boolean).length + (search ? 1 : 0), [filters, search])

  return { filters, setFilter, search, setSearch, debouncedSearch, page, setPage, perPage, setPerPage, reset, activeCount }
}
