'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { useT } from '@/i18n/provider'

/** Confirmation avant une action destructive */
export function Confirm({
  title,
  description,
  confirmLabel = 'Supprimer',
  onConfirm,
  children
}: {
  title: string
  description?: string
  confirmLabel?: string
  onConfirm: () => void | Promise<unknown>
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const t = useT()

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t(title)}</AlertDialogTitle>
          {description && <AlertDialogDescription>{t(description)}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('Annuler')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              await onConfirm()
              setOpen(false)
            }}
          >
            {t(confirmLabel)}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
