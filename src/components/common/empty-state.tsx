'use client'

import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import { useT } from '@/i18n/provider'

export function EmptyState({ icon: Icon = Inbox, title, description, action }: { icon?: LucideIcon; title: string; description?: string; action?: React.ReactNode }) {
  const t = useT()

  return (
    <div className='flex flex-col items-center justify-center gap-2 px-6 py-14 text-center'>
      <div className='flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground'>
        <Icon className='size-5' />
      </div>
      <p className='font-semibold'>{t(title)}</p>
      {description && <p className='max-w-sm text-sm text-muted-foreground'>{t(description)}</p>}
      {action}
    </div>
  )
}
