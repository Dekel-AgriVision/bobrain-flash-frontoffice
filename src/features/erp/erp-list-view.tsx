'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pencil, Plug, Star } from 'lucide-react'
import { DataTable, type Column } from '@/components/common/data-table'
import { FilterBar, SearchInput, SelectFilter } from '@/components/common/filters'
import { ActiveBadge } from '@/components/common/status-badge'
import { useAbility } from '@/components/common/ability'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tip } from '@/components/ui/tooltip'
import { useListState } from '@/hooks/use-list-state'
import { useBranchOptions, usePaginated } from '@/hooks/use-resource'
import { services } from '@/lib/services'
import { Subject } from '@/lib/constants'
import type { ErpConnection } from '@/lib/types'
import { ListLayout } from '@/features/shared/list-layout'
import { useT } from '@/i18n/provider'

export const erpEndpoint = (c: Partial<ErpConnection>) => {
  if (!c.baseUrl) return '—'
  const base = c.baseUrl.replace(/\/+$/, '')

  return c.port ? `${base}:${c.port}` : base
}

export default function ErpListView() {
  const t = useT()
  const router = useRouter()
  const ability = useAbility()
  const canEdit = ability.can('edit', Subject.Setting)
  const list = useListState({ branch: '' })
  const { data: branches } = useBranchOptions()
  const q = usePaginated(['erp', list.filters, list.debouncedSearch, list.page, list.perPage], () =>
    services.erp.list({
      relations: 'branch',
      where: [{ value: list.filters.branch, attribute: 'branch.code' }, { value: list.debouncedSearch }],
      page: list.page,
      per_page: list.perPage
    })
  )

  const columns: Column<ErpConnection>[] = [
    {
      key: 'code',
      header: 'Connexion',
      cell: c => (
        <div className='flex items-center gap-3'>
          <div className='flex size-9 items-center justify-center rounded-lg bg-dekel-100 text-dekel-600'>
            <Plug className='size-4' />
          </div>
          <div>
            <p className='flex items-center gap-2 font-semibold'>
              {c.code}
              {c.isDefault && (
                <Badge tone='warning'>
                  <Star className='size-3 fill-current' /> {t('Par défaut')}
                </Badge>
              )}
            </p>
            <p className='text-xs text-muted-foreground'>{c.branch?.displayName ?? '—'}</p>
          </div>
        </div>
      )
    },
    { key: 'url', header: 'Serveur', cell: c => <span className='font-mono text-xs'>{erpEndpoint(c)}</span> },
    { key: 'api', header: 'API', cell: c => <span className='font-mono text-xs text-muted-foreground'>{c.apiUri || '—'}</span> },
    { key: 'login', header: 'Compte', cell: c => c.login || '—' },
    { key: 'state', header: 'État', cell: c => <ActiveBadge active={c.isActive} /> },
    {
      key: 'actions',
      header: '',
      className: 'text-end',
      cell: c =>
        canEdit && (
          <div className='flex justify-end' onClick={e => e.stopPropagation()}>
            <Tip content={t('Modifier')}>
              <Button asChild variant='ghost' size='icon' className='size-8'>
                <Link href={`/erp/${c.id}`}>
                  <Pencil className='text-dekel-600' />
                </Link>
              </Button>
            </Tip>
          </div>
        )
    }
  ]

  return (
    <ListLayout
      title={t('Connexions ERP')}
      description={t('Paramètres d’accès aux ERP des surccusales (API, authentification, WebSocket).')}
      subject={Subject.Setting}
      createHref='/erp/new'
      createLabel={t('Nouvelle connexion')}
      cardTitle={t('Connexions')}
      total={q.data?.total}
      unit={t('connexion(s)')}
      toolbar={
        <FilterBar activeCount={list.activeCount} onReset={list.reset} right={<SearchInput value={list.search} onChange={list.setSearch} placeholder={t('Code, URL…')} />}>
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
        onRowClick={canEdit ? c => router.push(`/erp/${c.id}`) : undefined}
        empty={{ icon: Plug, title: 'Aucune connexion ERP' }}
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
