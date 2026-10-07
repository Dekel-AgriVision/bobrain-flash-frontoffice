'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { useTx } from '@/i18n/provider'

type Crumb = { label: string; href?: string }

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions
}: {
  title: React.ReactNode
  description?: React.ReactNode
  breadcrumbs?: Crumb[]
  actions?: React.ReactNode
}) {
  const tx = useTx()

  return (
    <div className='mb-6 flex flex-wrap items-end justify-between gap-4'>
      <div className='min-w-0'>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className='mb-1.5 flex flex-wrap items-center gap-1 text-xs text-muted-foreground'>
            {breadcrumbs.map((c, i) => (
              <span key={i} className='flex items-center gap-1'>
                {i > 0 && <ChevronRight className='rtl-flip size-3 opacity-60' />}
                {c.href ? (
                  <Link href={c.href} className='hover:text-foreground'>
                    {tx(c.label)}
                  </Link>
                ) : (
                  <span className='font-medium text-foreground'>{tx(c.label)}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className='truncate text-2xl font-bold tracking-tight'>{tx(title)}</h1>
        {description && <p className='mt-1 text-sm text-muted-foreground'>{tx(description)}</p>}
      </div>
      {actions && <div className='flex flex-wrap items-center gap-2'>{actions}</div>}
    </div>
  )
}
