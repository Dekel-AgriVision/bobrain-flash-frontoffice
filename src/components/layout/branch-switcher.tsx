'use client'

import { useSession } from 'next-auth/react'
import { useQueryClient } from '@tanstack/react-query'
import { Building2, Check, ChevronsUpDown } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useBranchOptions } from '@/hooks/use-resource'
import { services } from '@/lib/services'
import { errorMessage } from '@/lib/utils'
import { useT } from '@/i18n/provider'
import { tr } from '@/i18n/translate'

/** Changement de surccusale cible de la session (POST /auth/switch/:branchId) */
export function BranchSwitcher() {
  const t = useT()
  const { data, update } = useSession()
  const qc = useQueryClient()
  const session = data?.apiSession
  const canSwitch = Boolean(session?.branch?.isParentCompany || session?.role?.adminPermission)
  const { data: branches } = useBranchOptions()
  const current = session?.targetBranch ?? session?.branch

  const switchTo = async (id: string) => {
    try {
      const res: any = await services.auth.switchBranch(id)
      await update({ session: res?.session, abilities: res?.abilities })
      await qc.invalidateQueries()
      toast.success(tr('Surccusale active : {name}', { name: res?.session?.targetBranch?.displayName ?? '' }))
    } catch (e: any) {
      toast.error(tr(errorMessage(e?.body ?? e)))
    }
  }

  if (!canSwitch || !branches?.data?.length) {
    return current ? (
      <span className='hidden items-center gap-2 rounded-md border bg-card px-3 py-1.5 text-sm md:inline-flex'>
        <Building2 className='size-4 text-muted-foreground' />
        {current.displayName}
      </span>
    ) : null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' className='hidden md:inline-flex'>
          <Building2 className='text-muted-foreground' />
          <span className='max-w-[160px] truncate'>{current?.displayName ?? 'Surccusale'}</span>
          <ChevronsUpDown className='opacity-50' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-64'>
        <DropdownMenuLabel>{t('Changer de surccusale')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {branches.data.map(b => (
          <DropdownMenuItem key={b.id} onSelect={() => switchTo(b.id)}>
            <span className='flex-1 truncate'>{b.displayName}</span>
            <span className='text-xs text-muted-foreground'>{b.code}</span>
            {current?.id === b.id && <Check className='text-primary' />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
