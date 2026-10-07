'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pencil, ShieldCheck } from 'lucide-react'
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
import { ROLE_NAMES, Subject } from '@/lib/constants'
import { formatDate } from '@/lib/format'
import type { Role } from '@/lib/types'
import { ListLayout } from '@/features/shared/list-layout'
import { countGranted } from './permissions'
import { useT } from '@/i18n/provider'

export default function RoleListView() {
  const t = useT()
  const router = useRouter()
  const ability = useAbility()
  const canEdit = ability.can('edit', Subject.Role)
  const list = useListState({})
  const q = usePaginated(['roles', list.debouncedSearch, list.page, list.perPage], () =>
    services.roles.list({ where: [{ value: list.debouncedSearch }], page: list.page, per_page: list.perPage })
  )

  const columns: Column<Role>[] = [
    {
      key: 'role',
      header: 'Rôle',
      cell: r => (
        <div className='flex items-center gap-3'>
          <div className='flex size-9 items-center justify-center rounded-lg bg-dekel-100 text-dekel-600'>
            <ShieldCheck className='size-4' />
          </div>
          <div className='min-w-0'>
            <p className='font-semibold'>{r.displayName || r.name}</p>
            <p className='truncate text-xs text-muted-foreground'>{r.description || t(ROLE_NAMES[r.name]) || r.name}</p>
          </div>
        </div>
      )
    },
    { key: 'name', header: 'Type', cell: r => <Badge tone='outline'>{t(ROLE_NAMES[r.name]) ?? r.name}</Badge> },
    {
      key: 'perms',
      header: 'Permissions',
      cell: r =>
        r.adminPermission ? (
          <Badge tone='primary'>{t('Accès complet')}</Badge>
        ) : (
          <span className='text-muted-foreground'>{t('{n} droit(s)', { n: countGranted(r.permissions) })}</span>
        )
    },
    { key: 'state', header: 'État', cell: r => <ActiveBadge active={r.isActive} on={t('Actif')} off={t('Inactif')} /> },
    { key: 'created', header: 'Créé le', cell: r => <span className='text-muted-foreground'>{formatDate(r.createdAt)}</span> },
    {
      key: 'actions',
      header: '',
      className: 'text-end',
      cell: r =>
        canEdit && (
          <div className='flex justify-end' onClick={e => e.stopPropagation()}>
            <Tip content={t('Modifier')}>
              <Button asChild variant='ghost' size='icon' className='size-8'>
                <Link href={`/roles/${r.id}`}>
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
      title={t('Rôles')}
      description={t('Profils de permissions attribués aux utilisateurs (règles CASL côté API).')}
      subject={Subject.Role}
      createHref='/roles/new'
      createLabel={t('Nouveau rôle')}
      cardTitle={t('Rôles')}
      total={q.data?.total}
      unit={t('rôle(s)')}
      toolbar={<FilterBar activeCount={list.activeCount} onReset={list.reset} right={<SearchInput value={list.search} onChange={list.setSearch} placeholder={t('Nom du rôle…')} />} />}
    >
      <DataTable
        columns={columns}
        rows={q.data?.data}
        loading={q.isLoading}
        fetching={q.isFetching}
        onRowClick={canEdit ? r => router.push(`/roles/${r.id}`) : undefined}
        empty={{ icon: ShieldCheck, title: 'Aucun rôle' }}
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
