'use client'

import Link from 'next/link'
import { AlertTriangle, Link2Off, Plug, Radio, RefreshCw, Server, Unplug, Zap, type LucideIcon } from 'lucide-react'
import { EmptyState } from '@/components/common/empty-state'
import { cn } from '@/lib/utils'
import { formatTime } from '@/lib/format'
import { useT } from '@/i18n/provider'

export type LogEntry = { id: number; kind: keyof typeof META; at: Date; text: string; href?: string }

export const META = {
  flash: { label: 'Flash', icon: Zap, cls: 'bg-dekel-100 text-dekel-600' },
  action: { label: 'Action', icon: Radio, cls: 'bg-sky-50 text-sky-700' },
  backend: { label: 'Démarrage API', icon: Server, cls: 'bg-sky-50 text-sky-700' },
  connect: { label: 'Connexion', icon: Plug, cls: 'bg-agri-100 text-agri-700' },
  disconnect: { label: 'Coupure', icon: Unplug, cls: 'bg-red-50 text-red-600' },
  resync: { label: 'Resynchronisation', icon: RefreshCw, cls: 'bg-muted text-muted-foreground' },
  silent: { label: 'Station muette', icon: AlertTriangle, cls: 'bg-red-50 text-red-600' },
  unmatched: { label: 'Flash non rattaché', icon: Link2Off, cls: 'bg-harvest-100 text-harvest-700' }
} satisfies Record<string, { label: string; icon: LucideIcon; cls: string }>

export function EventLog({ items }: { items: LogEntry[] }) {
  const t = useT()
  if (!items.length) return <EmptyState icon={Radio} title={t('En attente d’événements')} description={t('Les flashs et événements reçus en direct apparaissent ici.')} />

  return (
    <ul className='scrollbar-thin max-h-[560px] divide-y overflow-y-auto'>
      {items.map(it => {
        const m = META[it.kind]
        const Icon = m.icon
        const inner = (
          <>
            <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-md', m.cls)}>
              <Icon className='size-3.5' />
            </span>
            <span className='min-w-0 flex-1'>
              <span className='block break-words text-[0.82rem] font-medium leading-snug'>{it.text}</span>
              <span className='text-[0.7rem] text-muted-foreground'>{t(m.label)}</span>
            </span>
            <span className='tabular shrink-0 text-xs text-muted-foreground'>{formatTime(it.at)}</span>
          </>
        )

        return (
          <li key={it.id}>
            {it.href ? (
              <Link href={it.href} className='flex items-start gap-3 px-4 py-2.5 hover:bg-muted/50'>
                {inner}
              </Link>
            ) : (
              <div className='flex items-start gap-3 px-4 py-2.5'>{inner}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
