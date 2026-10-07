'use client'

import { Tip } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n/provider'

export function LiveIndicator({ connected }: { connected: boolean }) {
  const t = useT()

  return (
    <Tip content={t(connected ? 'Flux Socket.IO connecté' : 'Flux Socket.IO déconnecté — reconnexion en cours')}>
      <span className='inline-flex h-9 items-center gap-2 rounded-full border bg-card px-3 text-xs font-semibold'>
        <span className={cn('size-2 rounded-full', connected ? 'animate-pulse-dot bg-agri-500' : 'bg-slate-400')} />
        <span className={connected ? 'text-dekel-600' : 'text-muted-foreground'}>{t(connected ? 'En direct' : 'Hors ligne')}</span>
      </span>
    </Tip>
  )
}
