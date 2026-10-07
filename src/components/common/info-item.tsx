'use client'

import { cn } from '@/lib/utils'
import { useT } from '@/i18n/provider'

export function InfoItem({ label, value, mono, className }: { label: string; value: React.ReactNode; mono?: boolean; className?: string }) {
  const t = useT()
  const empty = value === null || value === undefined || value === ''

  return (
    <div className={cn('min-w-0', className)}>
      <dt className='text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground'>{t(label)}</dt>
      <dd className={cn('mt-1 break-words text-sm font-medium', mono && 'font-mono text-[0.8rem]', empty && 'text-muted-foreground')}>{empty ? '—' : value}</dd>
    </div>
  )
}
