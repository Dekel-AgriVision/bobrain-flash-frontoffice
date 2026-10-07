import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { Column } from '@/components/common/data-table'
import { FlashStatusBadge } from '@/components/common/status-badge'
import { Tip } from '@/components/ui/tooltip'
import { flashDate, formatCalendar, formatDateTime, formatFromNow, formatWeight } from '@/lib/format'
import type { Flash } from '@/lib/types'

export const flashColumns = (detailBase: string): Column<Flash>[] => [
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
        <p className='font-bold text-dekel-600'>{f.station ?? '—'}</p>
        <p className='text-xs text-muted-foreground'>{f.branch}</p>
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
      <div className='max-w-[180px]'>
        <p className='truncate'>{f.userName || f.userProfile || '—'}</p>
        <p className='truncate text-xs text-muted-foreground'>{f.computerName}</p>
      </div>
    )
  },
  { key: 'latency', header: 'Latence', cell: f => <span className='text-muted-foreground'>{f.latency ?? '—'}</span> },
  {
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
