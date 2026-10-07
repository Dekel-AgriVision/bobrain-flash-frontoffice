'use client'

import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { KeyRound, LogOut, UserRound } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { services } from '@/lib/services'
import { closeSocket } from '@/lib/socket'
import { ROLE_NAMES } from '@/lib/constants'
import { useT } from '@/i18n/provider'

export function UserMenu() {
  const t = useT()
  const { data } = useSession()
  const s = data?.apiSession
  const name = [s?.user?.firstName, s?.user?.lastName].filter(Boolean).join(' ') || s?.user?.username || t('Utilisateur')
  const initials = name
    .split(/\s+/)
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const logout = async () => {
    await services.auth.logout()
    closeSocket()
    signOut({ callbackUrl: '/login' })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className='flex items-center gap-2.5 rounded-md p-1 pe-2 outline-none hover:bg-accent'>
        <Avatar>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className='hidden text-start leading-tight sm:block'>
          <p className='text-sm font-semibold'>{name}</p>
          <p className='text-[0.7rem] text-muted-foreground'>{s?.role?.displayName ?? t(ROLE_NAMES[s?.role?.name ?? '']) ?? ''}</p>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-56'>
        <DropdownMenuLabel className='font-normal'>
          <p className='text-sm font-semibold text-foreground'>{name}</p>
          <p className='text-xs'>{s?.user?.email ?? s?.user?.username}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href='/profil'>
            <UserRound /> {t('Mon profil')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href='/profil#securite'>
            <KeyRound /> {t('Mot de passe')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={logout} className='text-destructive focus:text-destructive'>
          <LogOut className='rtl-flip' /> {t('Se déconnecter')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
