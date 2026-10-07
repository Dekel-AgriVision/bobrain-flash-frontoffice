'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { Zap } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { DataTable } from '@/components/common/data-table'
import { FilterBar, SearchInput } from '@/components/common/filters'
import { LiveIndicator } from '@/components/common/live-indicator'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useListState } from '@/hooks/use-list-state'
import { usePaginated } from '@/hooks/use-resource'
import { useFlashSocket } from '@/hooks/use-flash-socket'
import { services } from '@/lib/services'
import { formatFromNow, formatNumber } from '@/lib/format'
import { norm } from '@/lib/utils'
import type { Flash, Paginated } from '@/lib/types'
import { EMPTY_FLASH_FILTERS, FlashFilters } from './flash-filters'
import { flashColumns } from './flash-columns'
import { flashSearch } from './flash-query'
import { useT } from '@/i18n/provider'

export default function FlashListView() {
  const t = useT()
  const router = useRouter()
  const qc = useQueryClient()
  const list = useListState({ ...EMPTY_FLASH_FILTERS })
  const [live, setLive] = useState(true)
  const [lastReceived, setLastReceived] = useState<Date | null>(null)
  const key = ['flashs', list.filters, list.debouncedSearch, list.page, list.perPage]
  const q = usePaginated(key, () => services.flashs.list(flashSearch(list.filters, list.debouncedSearch, list.page, list.perPage)))

  const matches = (f: Flash) =>
    (!list.filters.branch || norm(f.branch) === norm(list.filters.branch)) &&
    (!list.filters.station || norm(f.station) === norm(list.filters.station)) &&
    (!list.filters.status || f.status === list.filters.status) &&
    !list.debouncedSearch

  const { connected } = useFlashSocket({
    onFlash: flash => {
      setLastReceived(new Date())
      if (!live || list.page !== 1 || !matches(flash)) return
      // Insère / remplace en tête de la page courante, sans recharger
      qc.setQueryData<Paginated<Flash>>(key, old => {
        if (!old) return old
        const exists = old.data.some(r => r.id === flash.id)
        const rows = [flash, ...old.data.filter(r => r.id !== flash.id)].slice(0, old.per_page)

        return { ...old, data: rows, total: old.total + (exists ? 0 : 1) }
      })
    },
    onReconnect: () => q.refetch(),
    onBackendStart: () => setTimeout(() => q.refetch(), 3000)
  })

  return (
    <>
      <PageHeader
        title={t('Flashs temps réel')}
        description={t('Dernières pesées transmises par les ponts bascules. La liste se met à jour automatiquement.')}
        actions={
          <>
            {lastReceived && <span className='text-xs text-muted-foreground'>{t('Dernier flash reçu {ago}', { ago: formatFromNow(lastReceived) })}</span>}
            <LiveIndicator connected={connected} />
          </>
        }
      />
      <Card className='overflow-hidden'>
        <CardHeader>
          <div>
            <CardTitle>{t('Flux des pesées')}</CardTitle>
            <CardDescription>{t('{n} enregistrement(s)', { n: formatNumber(q.data?.total ?? 0) })}</CardDescription>
          </div>
          <div className='flex items-center gap-2'>
            <Switch id='live' checked={live} onCheckedChange={setLive} />
            <Label htmlFor='live' className='text-xs text-muted-foreground'>
              {t('Insertion automatique')}
            </Label>
          </div>
        </CardHeader>
        <FilterBar activeCount={list.activeCount} onReset={list.reset} right={<SearchInput value={list.search} onChange={list.setSearch} placeholder={t('Ticket, poste, opérateur…')} />}>
          <FlashFilters value={list.filters} onChange={list.setFilter} />
        </FilterBar>
        <DataTable
          columns={flashColumns('/flashs')}
          rows={q.data?.data}
          loading={q.isLoading}
          fetching={q.isFetching}
          onRowClick={f => router.push(`/flashs/${f.id}`)}
          empty={{ icon: Zap, title: 'Aucun flash', description: 'Aucun enregistrement ne correspond aux filtres.' }}
          page={list.page}
          perPage={list.perPage}
          total={q.data?.total}
          lastPage={q.data?.last_page}
          onPageChange={list.setPage}
          onPerPageChange={list.setPerPage}
        />
      </Card>
    </>
  )
}
