'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Activity, Pencil, Scale } from 'lucide-react'
import { DataTable, type Column } from '@/components/common/data-table'
import { FilterBar, SearchInput, SelectFilter } from '@/components/common/filters'
import { ActiveBadge } from '@/components/common/status-badge'
import { useAbility } from '@/components/common/ability'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Tip } from '@/components/ui/tooltip'
import { useListState } from '@/hooks/use-list-state'
import { useBranchOptions, useMutationToast, usePaginated } from '@/hooks/use-resource'
import { services } from '@/lib/services'
import { Subject } from '@/lib/constants'
import { formatDate } from '@/lib/format'
import type { Station } from '@/lib/types'
import { ListLayout } from '@/features/shared/list-layout'
import { useT } from '@/i18n/provider'

export default function StationListView() {
  const t = useT()
  const router = useRouter()
  const ability = useAbility()
  const canEdit = ability.can('edit', Subject.Station)
  const list = useListState({ branch: '' })
  const { data: branches } = useBranchOptions()
  const q = usePaginated(['stations', list.filters, list.debouncedSearch, list.page, list.perPage], () =>
    services.stations.list({
      relations: 'branch',
      where: [{ value: list.filters.branch, attribute: 'branch.code' }, { value: list.debouncedSearch }],
      page: list.page,
      per_page: list.perPage
    })
  )
  const toggle = useMutationToast(({ id, isActive }: { id: string; isActive: boolean }) => services.stations.update(id, { isActive }), {
    success: 'Station mise à jour',
    invalidate: [['stations'], ['options', 'stations'], ['supervision']]
  })

  const columns: Column<Station>[] = [
    {
      key: 'station',
      header: 'Station',
      cell: s => (
        <div className='flex items-center gap-3'>
          <div className='flex size-9 items-center justify-center rounded-lg bg-dekel-100 text-dekel-600'>
            <Scale className='size-4' />
          </div>
          <div>
            <p className='font-bold'>{s.code}</p>
            <p className='text-xs text-muted-foreground'>{s.displayName}</p>
          </div>
        </div>
      )
    },
    { key: 'branch', header: 'Surccusale', cell: s => s.branch?.displayName ?? '—' },
    {
      key: 'state',
      header: 'État',
      cell: s => (
        <div className='flex items-center gap-2' onClick={e => e.stopPropagation()}>
          <Switch checked={s.isActive} disabled={!canEdit || toggle.isPending} onCheckedChange={v => toggle.mutate({ id: s.id, isActive: v })} />
          <ActiveBadge active={s.isActive} />
        </div>
      )
    },
    { key: 'created', header: 'Créée le', cell: s => <span className='text-muted-foreground'>{formatDate(s.createdAt)}</span> },
    {
      key: 'actions',
      header: '',
      className: 'text-end',
      cell: s => (
        <div className='flex justify-end' onClick={e => e.stopPropagation()}>
          <Tip content={t('Activités')}>
            <Button asChild variant='ghost' size='icon' className='size-8'>
              <Link href={`/activites?station=${encodeURIComponent(s.code)}`}>
                <Activity className='text-muted-foreground' />
              </Link>
            </Button>
          </Tip>
          {canEdit && (
            <Tip content={t('Modifier')}>
              <Button asChild variant='ghost' size='icon' className='size-8'>
                <Link href={`/stations/${s.id}`}>
                  <Pencil className='text-dekel-600' />
                </Link>
              </Button>
            </Tip>
          )}
        </div>
      )
    }
  ]

  return (
    <ListLayout
      title={t('Ponts bascules')}
      description={t('Stations rattachées aux surccusales. Une station désactivée bloque la remontée des pesées.')}
      subject={Subject.Station}
      createHref='/stations/new'
      createLabel={t('Nouvelle station')}
      cardTitle={t('Stations')}
      total={q.data?.total}
      unit={t('station(s)')}
      toolbar={
        <FilterBar activeCount={list.activeCount} onReset={list.reset} right={<SearchInput value={list.search} onChange={list.setSearch} placeholder={t('Code, libellé…')} />}>
          <SelectFilter
            value={list.filters.branch}
            onChange={v => list.setFilter({ branch: v })}
            placeholder={t('Surccusale')}
            allLabel={t('Toutes')}
            options={(branches?.data ?? []).map(b => ({ value: b.code, label: b.displayName }))}
          />
        </FilterBar>
      }
    >
      <DataTable
        columns={columns}
        rows={q.data?.data}
        loading={q.isLoading}
        fetching={q.isFetching}
        onRowClick={canEdit ? s => router.push(`/stations/${s.id}`) : undefined}
        empty={{ icon: Scale, title: 'Aucune station' }}
        page={list.page}
        perPage={list.perPage}
        total={q.data?.total}
        lastPage={q.data?.last_page}
        onPageChange={list.setPage}
        onPerPageChange={list.setPerPage}
      />
    </ListLayout>
  )
}
