'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle, Eye, EyeOff, Loader2, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/common/form'
import { encryptCredentials } from '@/lib/login-encrypt'
import { useT } from '@/i18n/provider'

const schema = z.object({
  username: z.string().min(1, 'Nom d’utilisateur requis'),
  password: z.string().min(1, 'Mot de passe requis')
})

export default function LoginForm() {
  const t = useT()
  const router = useRouter()
  const params = useSearchParams()
  const [error, setError] = useState<string | null>(
    params.get('idle')
      ? 'Vous avez été déconnecté pour inactivité. Reconnectez-vous.'
      : params.get('expired')
        ? 'Votre session a expiré, reconnectez-vous.'
        : null
  )
  const [show, setShow] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) })

  const onSubmit = async (v: z.infer<typeof schema>) => {
    setError(null)
    let credential: string
    try {
      credential = await encryptCredentials(v.username, v.password)
    } catch (e: any) {
      setError(e?.message ?? 'Impossible de sécuriser la connexion')

      return
    }
    // Seul le bloc chiffré (identifiant + mot de passe) est envoyé
    const res = await signIn('credentials', { credential, redirect: false })
    if (!res || res.error) {
      setError(res?.error && res.error !== 'CredentialsSignin' ? res.error : 'Identifiants invalides')

      return
    }
    const cb = params.get('callbackUrl')
    router.replace(cb && cb.startsWith('/') && !cb.startsWith('/login') ? cb : '/supervision')
    router.refresh()
  }

  return (
    <div className='w-full max-w-sm'>
      <div className='mb-8 lg:hidden'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src='/logo.png' alt='Brain' className='h-10 w-auto' />
      </div>
      <h2 className='text-2xl font-bold tracking-tight'>{t('Connexion')}</h2>
      <p className='mt-1 text-sm text-muted-foreground'>{t('Accédez au backoffice Brain Flash.')}</p>

      {error && (
        <div className='mt-6 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700'>
          <AlertCircle className='mt-0.5 size-4 shrink-0' />
          {t(error)}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className='mt-6 space-y-4'>
        <Field label='Nom d’utilisateur' htmlFor='username' error={errors.username?.message}>
          <Input id='username' autoComplete='username' autoFocus {...register('username')} />
        </Field>
        <Field label={t('Mot de passe')} htmlFor='password' error={errors.password?.message}>
          <div className='relative'>
            <Input id='password' type={show ? 'text' : 'password'} autoComplete='current-password' className='pe-10' {...register('password')} />
            <button type='button' onClick={() => setShow(s => !s)} className='absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'>
              {show ? <EyeOff className='size-4' /> : <Eye className='size-4' />}
            </button>
          </div>
        </Field>
        <Button type='submit' className='w-full' size='lg' disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className='animate-spin' /> : <LogIn className='rtl-flip' />}
          {t('Se connecter')}
        </Button>
      </form>
    </div>
  )
}
