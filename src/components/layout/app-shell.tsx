'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Loader2 } from 'lucide-react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sidebar } from './sidebar'
import { BranchSwitcher } from './branch-switcher'
import { UserMenu } from './user-menu'
import { findNavItem } from './nav'
import { useT } from '@/i18n/provider'
import { LanguageSwitcher } from './language-switcher'

export function AppShell({ children }: { children: React.ReactNode }) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const current = findNavItem(pathname)
  const Icon = current?.icon
  const { data: session, status } = useSession()
  const ready = status === 'authenticated' && Boolean(session?.apiToken)

  return (
    <div className='flex min-h-screen'>
      {/* Barre latérale fixe (desktop) */}
      <div className='fixed inset-y-0 start-0 z-30 hidden lg:block'>
        <Sidebar />
      </div>

      {/* Barre latérale mobile */}
      {open && (
        <div className='fixed inset-0 z-40 lg:hidden'>
          <div className='absolute inset-0 bg-black/40' onClick={() => setOpen(false)} />
          <div className='relative h-full w-64 animate-in slide-in-from-left rtl:slide-in-from-right'>
            <Sidebar onNavigate={() => setOpen(false)} />
            <button className='absolute -end-10 top-4 text-white' onClick={() => setOpen(false)}>
              <X />
            </button>
          </div>
        </div>
      )}

      <div className='flex min-w-0 flex-1 flex-col lg:ps-64'>
        <header className='sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-card/80 px-4 backdrop-blur md:px-6'>
          <Button variant='ghost' size='icon' className='lg:hidden' onClick={() => setOpen(true)}>
            <Menu />
          </Button>
          {Icon && (
            <div className='hidden size-8 items-center justify-center rounded-lg bg-dekel-100 text-dekel-600 sm:flex'>
              <Icon className='size-4' />
            </div>
          )}
          <p className='truncate text-sm font-semibold text-muted-foreground'>{t(current?.title ?? (pathname.startsWith('/profil') ? 'Mon profil' : 'Brain Flash'))}</p>
          <div className='ms-auto flex items-center gap-2'>
            <BranchSwitcher />
            <LanguageSwitcher />
            <UserMenu />
          </div>
        </header>
        <main className='mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 md:px-6 lg:px-8'>
          {ready ? (
            children
          ) : (
            <div className='flex h-[60vh] items-center justify-center text-muted-foreground'>
              <Loader2 className='me-2 size-5 animate-spin' /> {t('Chargement de la session…')}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
