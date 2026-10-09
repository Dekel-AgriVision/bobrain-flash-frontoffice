'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { Column } from '@/components/common/data-table'
import { FlashStatusBadge } from '@/components/common/status-badge'
import { useAbility } from '@/components/common/ability'
import { Tip } from '@/components/ui/tooltip'
import type { AppAbility } from '@/lib/acl'
import { Subject, SubjectAction } from '@/lib/constants'
import { flashDate, formatCalendar, formatDateTime, formatFromNow, formatWeight } from '@/lib/format'
import type { Flash } from '@/lib/types'
import { useT } from '@/i18n/provider'

/** Droits utilisés par les colonnes de flash */
export const flashRights = (ability: AppAbility) => ({
  /** Ouvrir le détail d'un flash (/flashs/:id ou /audit/:id) */
  canOpen: ability.can(SubjectAction.create, Subject.User),
  /** Lien vers les activités de la station */
  canSeeActivities: ability.can(SubjectAction.create, Subject.User)
})

export const flashColumns = (detailBase: string, ability: AppAbility, t: (k: string) => string = k => k): Column<Flash>[] => {
  const { canOpen, canSeeActivities } = flashRights(ability)

  const columns: (Column<Flash> | false)[] = [
    {
      key: 'date',
      header: 'Date',
      cell: f => (
        <Tip content={formatDateTime(flashDate(f))}>
          <div>
            <p className='font-medium'>{formatCalendar(flashDate(f))}</p>
            <p className='text-xs text-muted-foreground'>{formatFromNow(flashDate(f))}</p>
          </div>
        </Tip>
      )
    },
    {
      key: 'station',
      header: 'Station',
      cell: f => (
        <div>
            <Tip content={t('Activités de la station')}>
              <Link
                href={`/activites?station=${encodeURIComponent(f.station)}`}
                className='font-bold text-dekel-600 hover:underline'
                onClick={e => e.stopPropagation()}
              >
                {f.station}
              </Link>
            </Tip>
        </div>
      )
    },
    {
      key: 'weight',
      header: 'Poids',
      headClassName: 'text-end',
      className: 'text-end',
      cell: f => <span className='tabular font-bold'>{formatWeight(f.sentWeight)}</span>
    },
    {
      key: 'status',
      header: 'Statut',
      cell: f => (
        <Tip content={f.statusMsg}>
          <span>
            <FlashStatusBadge status={f.status} />
          </span>
        </Tip>
      )
    },
    {
      key: 'operator',
      header: 'Opérateur / poste',
      cell: f => (
         canSeeActivities && f.station && (
        <div className='max-w-[180px]'>
          <p className='truncate'>{f.userName || f.userProfile || '—'}</p>
          <p className='truncate text-xs text-muted-foreground'>{f.computerName}</p>
        </div>)
      )
    },
    { key: 'latency', header: 'Latence', cell: f => <span className='text-muted-foreground'>{f.latency ?? '—'}</span> },
    // Colonne « ouvrir » : seulement si l'utilisateur peut lire le détail d'un flash
    canOpen && {
      key: 'go',
      header: '',
      className: 'w-10 text-end',
      cell: f => (
        <Link href={`${detailBase}/${f.id}`} className='inline-flex text-muted-foreground hover:text-primary' onClick={e => e.stopPropagation()}>
          <ChevronRight className='rtl-flip size-5' />
        </Link>
      )
    }
  ]

  return columns.filter(Boolean) as Column<Flash>[]
}

/** Colonnes + droits, recalculés quand les permissions de la session changent */
export function useFlashColumns(detailBase: string) {
  const ability = useAbility()
  const t = useT()

  return useMemo(() => ({ columns: flashColumns(detailBase, ability, t), ...flashRights(ability) }), [detailBase, ability, t])
}
