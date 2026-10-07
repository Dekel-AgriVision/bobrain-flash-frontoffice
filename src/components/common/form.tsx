'use client'

import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n/provider'

/** Champ de formulaire : libellé, aide et erreur */
export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  className,
  children
}: {
  label: string
  htmlFor?: string
  error?: string
  hint?: string
  required?: boolean
  className?: string
  children: React.ReactNode
}) {
  const t = useT()

  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={htmlFor} className='text-[0.8rem]'>
        {t(label)}
        {required && <span className='ms-0.5 text-destructive'>*</span>}
      </Label>
      {children}
      {error ? <p className='text-xs font-medium text-destructive'>{t(error)}</p> : hint ? <p className='text-xs text-muted-foreground'>{t(hint)}</p> : null}
    </div>
  )
}

/** Ligne interrupteur + libellé + description */
export function SwitchRow({ title, description, control }: { title: string; description?: string; control: React.ReactNode }) {
  const t = useT()

  return (
    <div className='flex items-center justify-between gap-4 rounded-lg border bg-muted/30 px-4 py-3'>
      <div>
        <p className='text-sm font-medium'>{t(title)}</p>
        {description && <p className='text-xs text-muted-foreground'>{t(description)}</p>}
      </div>
      {control}
    </div>
  )
}
