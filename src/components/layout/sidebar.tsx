'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAbility } from '@/components/common/ability'
import { cn } from '@/lib/utils'
import { NAVIGATION } from './nav'
import { useT } from '@/i18n/provider'

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const t = useT()
  const pathname = usePathname()
  const ability = useAbility()

  return (
    <aside className='flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground'>
      <div className='flex h-16 items-center gap-3 border-b border-white/10 px-5'>
        <div className='flex size-9 items-center justify-center overflow-hidden rounded-lg bg-white p-1'>
          <Image src='/logo.png' alt='Brain' width={36} height={36} className='object-contain' />
        </div>
        <div className='leading-tight'>
          <p className='text-sm font-bold tracking-tight text-white'>Brain Flash</p>
          <p className='text-[0.68rem] text-sidebar-muted'>{t('DekelOil · supervision pesées')}</p>
        </div>
      </div>

      <nav className='scrollbar-thin flex-1 space-y-5 overflow-y-auto px-3 py-4'>
        {NAVIGATION.map(group => {
          const items = group.items.filter(i => ability.can(i.action ?? 'read', i.subject))
          if (!items.length) return null

          return (
            <div key={group.title}>
              <p className='mb-1.5 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-sidebar-muted'>{t(group.title)}</p>
              <ul className='space-y-0.5'>
                {items.map(item => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
                  const Icon = item.icon

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                          'group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                          active ? 'bg-sidebar-active text-white' : 'text-sidebar-foreground/80 hover:bg-white/5 hover:text-white'
                        )}
                      >
                        {active && <span className='absolute start-0 top-1.5 h-[calc(100%-12px)] w-[3px] rounded-e bg-agri-500' />}
                        <Icon className={cn('size-[18px]', active ? 'text-agri-500' : 'text-sidebar-muted group-hover:text-white')} />
                        {t(item.title)}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </nav>

      <div className='border-t border-white/10 px-5 py-3 text-[0.68rem] text-sidebar-muted'>© {new Date().getFullYear()} Dekel Agri-Vision</div>
    </aside>
  )
}
