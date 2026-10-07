'use client'

import Link from 'next/link'
import { Activity, Clock, Zap } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tip } from '@/components/ui/tooltip'
import { FlashStatusBadge } from '@/components/common/status-badge'
import { cn } from '@/lib/utils'
import { flashDate, formatDateTime, formatElapsed, formatFromNow, formatWeight } from '@/lib/format'
import type { Flash, Station } from '@/lib/types'
import { HEALTH, type Health } from './health'
import { useT } from '@/i18n/provider'

const DOT: Record<Health, string> = { ok: 'bg-agri-500', alert: 'bg-harvest-500', silent: 'bg-red-500', idle: 'bg-slate-300', off: 'bg-slate-300' }

export function StationCard({ station, flash, health, pulse }: { station: Station; flash?: Flash; health: Health; pulse?: number }) {
  const t = useT()
  const h = HEALTH[health]

  return (
    <Card
      key={pulse}
      className={cn(
        'flex h-full flex-col overflow-hidden',
        pulse && 'animate-pulse-ring',
        health === 'silent' && 'border-red-200',
        health === 'off' && 'opacity-70'
      )}
    >
      <div className='flex items-start justify-between gap-2 px-4 pt-4'>
        <div className='min-w-0'>
          <div className='flex items-center gap-2'>
            <span className={cn('size-2 rounded-full', DOT[health])} />
            <span className='font-bold'>{station.code}</span>
          </div>
          <p className='mt-0.5 truncate text-xs text-muted-foreground'>{station.displayName}</p>
        </div>
        <Badge tone={h.tone}>{t(h.label)}</Badge>
      </div>

      <div className='flex-1 px-4 pb-4 pt-3'>
        <p className={cn('tabular text-[1.9rem] font-bold leading-tight', (!flash || health === 'silent') && 'text-muted-foreground')}>
          {flash ? formatWeight(flash.sentWeight) : '—'}
        </p>
        <div className='mt-2 min-h-6'>{flash && <FlashStatusBadge status={flash.status} />}</div>
      </div>

      <div className={cn('flex items-center justify-between border-t px-4 py-2', health === 'silent' ? 'bg-red-50' : 'bg-muted/40')}>
        <Tip content={flash ? t('Dernier flash : {date}', { date: formatDateTime(flashDate(flash)) }) : undefined}>
          <span className={cn('flex items-center gap-1.5 text-xs', health === 'silent' ? 'font-semibold text-red-600' : 'text-muted-foreground')}>
            <Clock className='size-3.5' />
            {flash ? (health === 'silent' ? t('Muette depuis {d}', { d: formatElapsed(flashDate(flash)) }) : formatFromNow(flashDate(flash))) : t('Aucun flash reçu')}
          </span>
        </Tip>
        <div className='flex'>
          {flash?.id && (
            <Tip content={t('Dernier flash')}>
              <Button asChild variant='ghost' size='icon' className='size-7'>
                <Link href={`/flashs/${flash.id}`}>
                  <Zap className='text-dekel-600' />
                </Link>
              </Button>
            </Tip>
          )}
          <Tip content={t('Activités de la station')}>
            <Button asChild variant='ghost' size='icon' className='size-7'>
              <Link href={`/activites?station=${encodeURIComponent(station.code)}`}>
                <Activity className='text-muted-foreground' />
              </Link>
            </Button>
          </Tip>
        </div>
      </div>
    </Card>
  )
}
