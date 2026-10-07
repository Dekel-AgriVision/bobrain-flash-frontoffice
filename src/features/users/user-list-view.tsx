'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Pencil, Users } from 'lucide-react'
import { DataTable, type Column } from '@/components/common/data-table'
import { FilterBar, SearchInput, SelectFilter } from '@/components/common/filters'
import { ActiveBadge } from '@/components/common/status-badge'
import { useAbility } from '@/components/common/ability'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Tip } from '@/components/ui/tooltip'
import { useListState } from '@/hooks/use-list-state'
import { useBranchOptions, useMutationToast, usePaginated, useRoleOptions } from '@/hooks/use-resource'
import { services } from '@/lib/services'
import { Subject, USER_TYPES } from '@/lib/constants'
import { formatDate } from '@/lib/format'
import type { User } from '@/lib/types'
import { ListLayout } from '@/features/shared/list-layout'
import { useT } from '@/i18n/provider'

export const userFullName = (u?: Partial<User>) => [u?.firstName, u?.lastName].filter(Boolean).join(' ') || u?.username || '—'
const initials = (u: User) =>
  userFullName(u)
    .split(/\s+/)
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export default function UserListView() {
  const t = useT()
  const router = useRouter()
  const ability = useAbility()
  const { data: session } = useSession()
  const me = session?.apiSession?.user?.id
  const canEdit = ability.can('edit', Subject.User)
  const list = useListState({ branch: '', role: '', type: '' })
  const { data: branches } = useBranchOptions()
  const { data: roles } = useRoleOptions()

  const q = usePaginated(['users', list.filters, list.debouncedSearch, list.page, list.perPage], () =>
    services.users.list({
      relations: 'role,branch',
      where: [
        { value: list.filters.branch, attribute: 'branch.code' },
        { value: list.filters.role, attribute: 'role.name' },
        { value: list.filters.type, attribute: 'type' },
        { value: list.debouncedSearch }
      ],
      page: list.page,
      per_page: list.perPage
    })
  )
  const toggle = useMutationToast(({ id, isActive }: { id: string; isActive: boolean }) => services.users.update(id, { isActive }), {
    success: 'Utilisateur mis à jour',
    invalidate: [['users']]
  })

  const columns: Column<User>[] = [
    {
      key: 'user',
      header: 'Utilisateur',
      cell: u => (
        <div className='flex items-center gap-3'>
          <Avatar>
            <AvatarFallback>{initials(u)}</AvatarFallback>
          </Avatar>
          <div className='min-w-0'>
            <p className='truncate font-semibold'>
              {userFullName(u)} {u.id === me && <span className='ms-1 text-xs font-normal text-muted-foreground'>{t('(vous)')}</span>}
            </p>
            <p className='truncate text-xs text-muted-foreground'>@{u.username}</p>
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      header: 'Contact',
      cell: u => (
        <div className='text-xs leading-5'>
          <p>{u.email || '—'}</p>
          <p className='text-muted-foreground'>{u.phoneNumber || ''}</p>
        </div>
      )
    },
    { key: 'role', header: 'Rôle', cell: u => (u.role ? <Badge tone={u.role.adminPermission ? 'primary' : 'neutral'}>{u.role.displayName || u.role.name}</Badge> : '—') },
    { key: 'type', header: 'Type', cell: u => <span className='text-muted-foreground'>{t(USER_TYPES[u.type ?? '']) ?? '—'}</span> },
    { key: 'branch', header: 'Surccusale', cell: u => u.branch?.displayName ?? '—' },
    {
      key: 'state',
      header: 'État',
      cell: u => (
        <div className='flex items-center gap-2' onClick={e => e.stopPropagation()}>
          <Switch
            checked={u.isActive}
            disabled={!canEdit || u.id === me || toggle.isPending}
            onCheckedChange={v => toggle.mutate({ id: u.id, isActive: v })}
          />
          <ActiveBadge active={u.isActive} on={t('Actif')} off={t('Inactif')} />
        </div>
      )
    },
    { key: 'created', header: 'Créé le', cell: u => <span className='text-muted-foreground'>{formatDate(u.createdAt)}</span> },
    {
      key: 'actions',
      header: '',
      className: 'text-end',
      cell: u =>
        canEdit && (
          <div className='flex justify-end' onClick={e => e.stopPropagation()}>
            <Tip content={t('Modifier')}>
              <Button asChild variant='ghost' size='icon' className='size-8'>
                <Link href={`/utilisateurs/${u.id}`}>
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
      title={t('Utilisateurs')}
      description={t('Comptes ayant accès au backoffice et opérateurs des ponts bascules.')}
      subject={Subject.User}
      createHref='/utilisateurs/new'
      createLabel={t('Nouvel utilisateur')}
      cardTitle={t('Comptes')}
      total={q.data?.total}
      unit={t('utilisateur(s)')}
      toolbar={
        <FilterBar activeCount={list.activeCount} onReset={list.reset} right={<SearchInput value={list.search} onChange={list.setSearch} placeholder={t('Nom, identifiant, email…')} />}>
          <SelectFilter
            value={list.filters.branch}
            onChange={v => list.setFilter({ branch: v })}
            placeholder={t('Surccusale')}
            allLabel={t('Toutes')}
            options={(branches?.data ?? []).map(b => ({ value: b.code, label: b.displayName }))}
          />
          <SelectFilter
            value={list.filters.role}
            onChange={v => list.setFilter({ role: v })}
            placeholder={t('Rôle')}
            allLabel={t('Tous')}
            options={(roles?.data ?? []).map(r => ({ value: r.name, label: r.displayName || r.name }))}
          />
          <SelectFilter
            value={list.filters.type}
            onChange={v => list.setFilter({ type: v })}
            placeholder={t('Type')}
            allLabel={t('Tous')}
            options={Object.entries(USER_TYPES).map(([value, label]) => ({ value, label }))}
          />
        </FilterBar>
      }
    >
      <DataTable
        columns={columns}
        rows={q.data?.data}
        loading={q.isLoading}
        fetching={q.isFetching}
        onRowClick={canEdit ? u => router.push(`/utilisateurs/${u.id}`) : undefined}
        empty={{ icon: Users, title: 'Aucun utilisateur' }}
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
