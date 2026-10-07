'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Activity, Pencil } from 'lucide-react'
import { DataTable, type Column } from '@/components/common/data-table'
import { DateRangeFilter, FilterBar, SearchInput, SelectFilter } from '@/components/common/filters'
import { useAbility } from '@/components/common/ability'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Tip } from '@/components/ui/tooltip'
import { useListState } from '@/hooks/use-list-state'
import { useBranchOptions, useMutationToast, usePaginated, useStationOptions } from '@/hooks/use-resource'
import { services } from '@/lib/services'
import { ACTIVITY_TYPES, Subject } from '@/lib/constants'
import { formatCalendar, formatDateTime, formatDuration, toApiEndOfDay, toApiStartOfDay } from '@/lib/format'
import type { WhereParam } from '@/lib/query'
import type { StationActivity } from '@/lib/types'
import { ListLayout } from '@/features/shared/list-layout'
import { useT } from '@/i18n/provider'

export default function ActivityListView() {
  const t = useT()
  const router = useRouter()
  const params = useSearchParams()
  const ability = useAbility()
  const canEdit = ability.can('edit', Subject.StationActivity)
  const list = useListState({ branch: '', station: '', type: '', start: '', end: '' }, { preset: { station: params.get('station') ?? '' } })
  const { data: branches } = useBranchOptions()
  const { data: stations } = useStationOptions()

  const q = usePaginated(['activities', list.filters, list.debouncedSearch, list.page, list.perPage], () => {
    const f = list.filters
    const where: WhereParam[] = [
      { value: f.branch, attribute: 'branch.code' },
      { value: f.station, attribute: 'station.code' },
      { value: f.type, attribute: 'type' },
      { value: list.debouncedSearch }
    ]
    const s = toApiStartOfDay(f.start)
    const e = toApiEndOfDay(f.end)
    if (s && e) where.push({ value: [s, e], attribute: 'startAt', type: 'between' })
    else if (s) where.push({ value: s, attribute: 'startAt', type: 'greaterThanOrEquals' })
    else if (e) where.push({ value: e, attribute: 'startAt', type: 'lessThanOrEquals' })

    return services.activities.list({ relations: 'branch,station', where, order_by: 'createdAt', order: 'DESC', page: list.page, per_page: list.perPage })
  })

  const toggle = useMutationToast(({ id, isActive }: { id: string; isActive: boolean }) => services.activities.update(id, { isActive }), {
    success: 'Activité mise à jour',
    invalidate: [['activities']]
  })

  const stationOptions = (stations?.data ?? [])
    .filter(s => !list.filters.branch || s.branch?.code === list.filters.branch)
    .map(s => ({ value: s.code, label: `${s.code} — ${s.displayName}` }))

  const columns: Column<StationActivity>[] = [
    {
      key: 'station',
      header: 'Station',
      cell: a => (
        <div>
          <p className='font-bold text-dekel-600'>{a.station?.code ?? '—'}</p>
          <p className='text-xs text-muted-foreground'>{a.branch?.displayName}</p>
        </div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      cell: a => (
        <Badge tone={ACTIVITY_TYPES[a.type]?.tone ?? 'neutral'} dot>
          {t(ACTIVITY_TYPES[a.type]?.label ?? a.type)}
        </Badge>
      )
    },
    {
      key: 'period',
      header: 'Période',
      cell: a => (
        <Tip content={`${formatDateTime(a.startAt)} → ${a.endAt ? formatDateTime(a.endAt) : t('en cours')}`}>
          <div>
            <p>{formatCalendar(a.startAt)}</p>
            <p className='text-xs text-muted-foreground'>{a.endAt ? `→ ${formatCalendar(a.endAt)}` : `→ ${t('en cours')}`}</p>
          </div>
        </Tip>
      )
    },
    { key: 'duration', header: 'Durée', cell: a => <span className='tabular font-semibold'>{formatDuration(a.startAt, a.endAt)}</span> },
    {
      key: 'reason',
      header: 'Raison',
      cell: a => (
        <div className='flex max-w-[320px] items-center gap-2'>
          {a.reasoncode && <code className='rounded bg-muted px-1.5 py-0.5 text-[0.7rem] text-muted-foreground'>{a.reasoncode}</code>}
          <span className='truncate'>{a.reason || '—'}</span>
        </div>
      )
    },
    {
      key: 'active',
      header: 'En cours',
      cell: a => (
        <div onClick={e => e.stopPropagation()}>
          <Switch checked={a.isActive} disabled={!canEdit || toggle.isPending} onCheckedChange={v => toggle.mutate({ id: a.id, isActive: v })} />
        </div>
      )
    },
    {
      key: 'actions',
      header: '',
      className: 'text-end',
      cell: a =>
        canEdit && (
          <Button asChild variant='ghost' size='icon' className='size-8' onClick={e => e.stopPropagation()}>
            <Link href={`/activites/${a.id}`}>
              <Pencil className='text-dekel-600' />
            </Link>
          </Button>
        )
    }
  ]

  return (
    <ListLayout
      title={t('Activités des stations')}
      description={t('Démarrages et arrêts détectés par le service flash (latence réseau, arrêt du service, port série…).')}
      subject={Subject.StationActivity}
      cardTitle={t('Journal des activités')}
      total={q.data?.total}
      unit={t('activité(s)')}
      toolbar={
        <FilterBar activeCount={list.activeCount} onReset={list.reset} right={<SearchInput value={list.search} onChange={list.setSearch} placeholder={t('Raison…')} />}>
          <SelectFilter
            value={list.filters.branch}
            onChange={v => list.setFilter({ branch: v, station: '' })}
            placeholder={t('Surccusale')}
            allLabel={t('Toutes')}
            options={(branches?.data ?? []).map(b => ({ value: b.code, label: b.displayName }))}
          />
          <SelectFilter value={list.filters.station} onChange={v => list.setFilter({ station: v })} placeholder={t('Station')} allLabel={t('Toutes')} options={stationOptions} />
          <SelectFilter
            value={list.filters.type}
            onChange={v => list.setFilter({ type: v })}
            placeholder={t('Type')}
            className='w-[150px]'
            options={Object.entries(ACTIVITY_TYPES).map(([k, v]) => ({ value: k, label: v.label }))}
          />
          <DateRangeFilter start={list.filters.start} end={list.filters.end} onChange={({ start, end }) => list.setFilter({ start, end })} />
        </FilterBar>
      }
    >
      <DataTable
        columns={columns}
        rows={q.data?.data}
        loading={q.isLoading}
        fetching={q.isFetching}
        onRowClick={canEdit ? a => router.push(`/activites/${a.id}`) : undefined}
        empty={{ icon: Activity, title: 'Aucune activité' }}
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
