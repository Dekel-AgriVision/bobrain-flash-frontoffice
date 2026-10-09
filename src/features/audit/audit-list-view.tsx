'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { History } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { DataTable } from '@/components/common/data-table'
import { FilterBar, SearchInput } from '@/components/common/filters'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useListState } from '@/hooks/use-list-state'
import { usePaginated } from '@/hooks/use-resource'
import { services } from '@/lib/services'
import { formatNumber } from '@/lib/format'
import { EMPTY_FLASH_FILTERS, FlashFilters } from '@/features/flash/flash-filters'
import { useFlashColumns } from '@/features/flash/flash-columns'
import { flashSearch } from '@/features/flash/flash-query'
import { useT } from '@/i18n/provider'

export default function AuditListView() {
  const t = useT()
  const router = useRouter()
  const params = useSearchParams()
  const { columns, canOpen } = useFlashColumns('/audit')
  const list = useListState({ ...EMPTY_FLASH_FILTERS }, { preset: { station: params.get('station') ?? '', branch: params.get('branch') ?? '' } })
  const q = usePaginated(['audit', list.filters, list.debouncedSearch, list.page, list.perPage], () =>
    services.audit.list(flashSearch(list.filters, list.debouncedSearch, list.page, list.perPage))
  )

  return (
    <>
      <PageHeader
        title={t('Audit des flashs')}
        description={t('Historique complet des événements de pesée. Ouvrez une ligne pour voir sa chronologie et les statistiques de la station.')}
      />
      <Card className='overflow-hidden'>
        <CardHeader>
          <div>
            <CardTitle>{t('Historique')}</CardTitle>
            <CardDescription>{t('{n} événement(s)', { n: formatNumber(q.data?.total ?? 0) })}</CardDescription>
          </div>
        </CardHeader>
        <FilterBar activeCount={list.activeCount} onReset={list.reset} right={<SearchInput value={list.search} onChange={list.setSearch} placeholder={t('Référence, ticket, poste…')} />}>
          <FlashFilters value={list.filters} onChange={list.setFilter} withDates />
        </FilterBar>
        <DataTable
          columns={columns}
          rows={q.data?.data}
          loading={q.isLoading}
          fetching={q.isFetching}
          onRowClick={canOpen ? f => router.push(`/audit/${f.id}`) : undefined}
          empty={{ icon: History, title: 'Aucun événement', description: 'Aucun enregistrement ne correspond aux filtres.' }}
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
