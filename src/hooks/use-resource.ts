'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { errorMessage } from '@/lib/utils'
import { services } from '@/lib/services'
import { tr } from '@/i18n/translate'

/** Listes de référence (surccusales, stations, rôles) pour les filtres et formulaires */
export function useBranchOptions() {
  return useQuery({ queryKey: ['options', 'branches'], queryFn: () => services.branches.list({ per_page: 500, order_by: 'displayName', order: 'ASC' }), staleTime: 300_000 })
}

export function useStationOptions() {
  return useQuery({
    queryKey: ['options', 'stations'],
    queryFn: () => services.stations.list({ relations: 'branch', per_page: 500, order_by: 'code', order: 'ASC' }),
    staleTime: 60_000
  })
}

export function useRoleOptions() {
  return useQuery({ queryKey: ['options', 'roles'], queryFn: () => services.roles.list({ per_page: 100 }), staleTime: 300_000 })
}

/** Requête paginée (garde la page précédente affichée pendant le chargement) */
export function usePaginated<T>(key: unknown[], fn: () => Promise<T>, opts: { refetchInterval?: number | false } = {}) {
  return useQuery({ queryKey: key, queryFn: fn, placeholderData: keepPreviousData, refetchInterval: opts.refetchInterval })
}

/** Mutation avec toasts et invalidation des clés concernées */
export function useMutationToast<TVars, TData = unknown>(
  fn: (vars: TVars) => Promise<TData>,
  { success, invalidate = [], onSuccess }: { success?: string; invalidate?: unknown[][]; onSuccess?: (d: TData, v: TVars) => void } = {}
) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: fn,
    onSuccess: (d, v) => {
      if (success) toast.success(tr(success))
      invalidate.forEach(k => qc.invalidateQueries({ queryKey: k }))
      onSuccess?.(d, v)
    },
    onError: (e: any) => toast.error(tr(errorMessage(e?.body ?? e)))
  })
}
