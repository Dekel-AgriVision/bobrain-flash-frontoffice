'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Building2, Pencil } from 'lucide-react'
import { DataTable, type Column } from '@/components/common/data-table'
import { FilterBar, SearchInput } from '@/components/common/filters'
import { ActiveBadge } from '@/components/common/status-badge'
import { useAbility } from '@/components/common/ability'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tip } from '@/components/ui/tooltip'
import { useListState } from '@/hooks/use-list-state'
import { usePaginated } from '@/hooks/use-resource'
import { services } from '@/lib/services'
import { Subject, SubjectAction } from '@/lib/constants'
import type { Branch } from '@/lib/types'
import { ListLayout } from '@/features/shared/list-layout'
import { useT } from '@/i18n/provider'

export default function BranchListView() {
  const t = useT()
  const router = useRouter()
  const ability = useAbility()
  const canEdit = ability.can('edit', Subject.Branch)
  const list = useListState({})
  const q = usePaginated(['branches', list.debouncedSearch, list.page, list.perPage], () =>
    services.branches.list({ where: [{ value: list.debouncedSearch }], page: list.page, per_page: list.perPage, order_by: 'displayName', order: 'ASC' })
  )

  const columns: Column<Branch>[] = [
    {
      key: 'branch',
      header: 'Surccusale',
      cell: b => (
        <div className='flex items-center gap-3'>
          <div className='flex size-9 items-center justify-center rounded-lg bg-dekel-100 text-dekel-600'>
            <Building2 className='size-4' />
          </div>
          <div className='min-w-0'>
            <p className='flex items-center gap-2 font-semibold'>
              {b.displayName}
              {b.isParentCompany && <Badge tone='primary'>{t('Société mère')}</Badge>}
            </p>
            <p className='text-xs font-mono text-muted-foreground'>{b.code}</p>
          </div>
        </div>
      )
    },
    { key: 'city', header: 'Ville', cell: b => b.city || '—' },
    {
      key: 'contact',
      header: 'Contact',
      cell: b => (
        <div className='text-xs leading-5'>
          <p>{b.email || '—'}</p>
          <p className='text-muted-foreground'>{b.phoneNumber || ''}</p>
        </div>
      )
    },
    { key: 'state', header: 'État', cell: b => <ActiveBadge active={b.isActive} /> },
    {
      key: 'actions',
      header: '',
      className: 'text-end',
      cell: b =>
        canEdit && (
          <div className='flex justify-end' onClick={e => e.stopPropagation()}>
            <Tip content={t('Modifier')}>
              <Button asChild variant='ghost' size='icon' className='size-8'>
                <Link href={`/surccusales/${b.id}`}>
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
      title={t('Surccusales')}
      description={t('Sites du groupe auxquels sont rattachés stations, utilisateurs et connexions ERP.')}
      subject={Subject.Branch}
      action={SubjectAction.read}
      createHref='/surccusales/new'
      createLabel={t('Nouvelle surccusale')}
      cardTitle={t('Surccusales')}
      total={q.data?.total}
      unit={t('surccusale(s)')}
      toolbar={<FilterBar activeCount={list.activeCount} onReset={list.reset} right={<SearchInput value={list.search} onChange={list.setSearch} placeholder={t('Code, nom, ville…')} />} />}
    >
      <DataTable
        columns={columns}
        rows={q.data?.data}
        loading={q.isLoading}
        fetching={q.isFetching}
        onRowClick={canEdit ? b => router.push(`/surccusales/${b.id}`) : undefined}
        empty={{ icon: Building2, title: 'Aucune surccusale' }}
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
