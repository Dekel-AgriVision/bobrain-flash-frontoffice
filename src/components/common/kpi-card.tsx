'use client'

import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Tone } from '@/lib/constants'
import { useT } from '@/i18n/provider'

const TONES: Record<Tone, string> = {
  primary: 'bg-dekel-100 text-dekel-600',
  success: 'bg-agri-100 text-agri-700',
  warning: 'bg-harvest-100 text-harvest-700',
  error: 'bg-red-50 text-red-600',
  info: 'bg-sky-50 text-sky-700',
  neutral: 'bg-muted text-muted-foreground'
}

export function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = 'primary',
  active,
  onClick
}: {
  icon: LucideIcon
  label: string
  value: React.ReactNode
  hint?: string
  tone?: Tone
  active?: boolean
  onClick?: () => void
}) {
  const t = useT()

  return (
    <Card
      onClick={onClick}
      className={cn('p-4 transition-colors', onClick && 'cursor-pointer hover:border-primary/40', active && 'border-primary ring-1 ring-primary/30')}
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <p className='text-xs font-medium text-muted-foreground'>{t(label)}</p>
          <p className='tabular mt-1 text-2xl font-bold leading-tight'>{value}</p>
          {hint && <p className='mt-0.5 truncate text-xs text-muted-foreground'>{t(hint)}</p>}
        </div>
        <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', TONES[tone])}>
          <Icon className='size-[18px]' />
        </div>
      </div>
    </Card>
  )
}
