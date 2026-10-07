'use client'

import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n/provider'

/** Champ mot de passe avec bouton afficher / masquer */
export const PasswordInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => {
  const [show, setShow] = useState(false)
  const t = useT()

  return (
    <div className='relative'>
      <Input ref={ref} type={show ? 'text' : 'password'} className={cn('pe-10', className)} autoComplete='new-password' {...props} />
      <button
        type='button'
        tabIndex={-1}
        onClick={() => setShow(s => !s)}
        className='absolute inset-y-0 end-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground'
        aria-label={t(show ? 'Masquer le mot de passe' : 'Afficher le mot de passe')}
      >
        {show ? <EyeOff className='size-4' /> : <Eye className='size-4' />}
      </button>
    </div>
  )
})
PasswordInput.displayName = 'PasswordInput'

/** Règle de complexité reprise de l'ancien backoffice */
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/
export const PASSWORD_HINT = '8 caractères min., avec majuscule, minuscule, chiffre et caractère spécial (!@#$%^&*).'
