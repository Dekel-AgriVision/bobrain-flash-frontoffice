'use client'

import { signOut, useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { KeyRound, Loader2, ShieldCheck, UserRound } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { Field } from '@/components/common/form'
import { InfoItem } from '@/components/common/info-item'
import { PASSWORD_HINT, PASSWORD_REGEX, PasswordInput } from '@/components/common/password-input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useMutationToast } from '@/hooks/use-resource'
import { services } from '@/lib/services'
import { ACTION_LABELS, ROLE_NAMES, SUBJECT_LABELS } from '@/lib/constants'
import { useT } from '@/i18n/provider'

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Mot de passe actuel obligatoire'),
    password: z.string().regex(PASSWORD_REGEX, PASSWORD_HINT),
    confirmPassword: z.string()
  })
  .refine(v => v.password === v.confirmPassword, { path: ['confirmPassword'], message: 'Les mots de passe doivent correspondre' })
  .refine(v => v.password !== v.currentPassword, { path: ['password'], message: 'Le nouveau mot de passe doit être différent' })
type Values = z.infer<typeof schema>

function ChangePasswordCard() {
  const t = useT()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', password: '', confirmPassword: '' }
  })
  const save = useMutationToast((v: Values) => services.auth.changePassword(v), {
    success: 'Mot de passe modifié — reconnectez-vous',
    onSuccess: () => {
      reset()
      // L'API invalide la session après le changement de mot de passe
      setTimeout(() => signOut({ callbackUrl: '/login' }), 1200)
    }
  })

  return (
    <Card id='securite' className='scroll-mt-24'>
      <form onSubmit={handleSubmit(v => save.mutate(v))} noValidate>
        <CardHeader>
          <div className='flex items-center gap-3'>
            <div className='flex size-9 items-center justify-center rounded-lg bg-dekel-100 text-dekel-600'>
              <KeyRound className='size-4' />
            </div>
            <div>
              <CardTitle>{t('Sécurité')}</CardTitle>
              <CardDescription>{t('Changer le mot de passe de connexion.')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='grid gap-5 pt-6'>
          <Field label={t('Mot de passe actuel')} htmlFor='currentPassword' required error={errors.currentPassword?.message}>
            <PasswordInput id='currentPassword' autoComplete='current-password' {...register('currentPassword')} />
          </Field>
          <div className='grid gap-5 sm:grid-cols-2'>
            <Field label={t('Nouveau mot de passe')} htmlFor='password' required error={errors.password?.message} hint={PASSWORD_HINT}>
              <PasswordInput id='password' {...register('password')} />
            </Field>
            <Field label={t('Confirmation')} htmlFor='confirmPassword' required error={errors.confirmPassword?.message}>
              <PasswordInput id='confirmPassword' {...register('confirmPassword')} />
            </Field>
          </div>
        </CardContent>
        <CardFooter className='justify-end'>
          <Button type='submit' disabled={save.isPending}>
            {save.isPending && <Loader2 className='animate-spin' />} {t('Mettre à jour')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default function ProfileView() {
  const t = useT()
  const { data } = useSession()
  const s = data?.apiSession
  const rules = data?.abilities ?? []
  const name = [s?.user?.firstName, s?.user?.lastName].filter(Boolean).join(' ') || s?.user?.username || t('Utilisateur')
  const initials = name
    .split(/\s+/)
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  const fullAccess = s?.role?.adminPermission === true

  const grouped = rules
    .filter(r => !r.inverted)
    .reduce<Record<string, Set<string>>>((acc, r) => {
      ;[r.subject].flat().forEach(sub => {
        acc[sub] ??= new Set()
        ;[r.action].flat().forEach(a => acc[sub].add(a))
      })

      return acc
    }, {})

  return (
    <>
      <PageHeader title={t('Mon profil')} description={t('Informations du compte connecté et sécurité.')} />
      <div className='grid gap-6 xl:grid-cols-[22rem_1fr]'>
        <div className='space-y-6'>
          <Card>
            <CardContent className='flex flex-col items-center gap-3 pt-8 text-center'>
              <Avatar className='size-16 text-lg'>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className='text-lg font-bold'>{name}</p>
                <p className='text-sm text-muted-foreground'>@{s?.user?.username}</p>
              </div>
              <Badge tone='primary'>{s?.role?.displayName ?? t(ROLE_NAMES[s?.role?.name ?? ''] ?? 'Sans rôle')}</Badge>
            </CardContent>
            <CardContent className='grid gap-4 border-t pt-5'>
              <InfoItem label={t('Email')} value={s?.user?.email} />
              <InfoItem label={t('Surccusale de rattachement')} value={s?.branch?.displayName} />
              <InfoItem label={t('Surccusale active')} value={s?.targetBranch?.displayName ?? s?.branch?.displayName} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className='flex items-center gap-3'>
                <div className='flex size-9 items-center justify-center rounded-lg bg-dekel-100 text-dekel-600'>
                  <ShieldCheck className='size-4' />
                </div>
                <div>
                  <CardTitle>{t('Permissions')}</CardTitle>
                  <CardDescription>{t('Issues du rôle, appliquées par l’API.')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-3 pt-5'>
              {fullAccess ? (
                <p className='text-sm'>
                  <Badge tone='primary'>{t('Accès complet')}</Badge> {t('à tous les modules.')}
                </p>
              ) : Object.keys(grouped).length === 0 ? (
                <p className='text-sm text-muted-foreground'>{t('Aucune permission.')}</p>
              ) : (
                Object.entries(grouped).map(([sub, actions]) => (
                  <div key={sub}>
                    <p className='mb-1 text-xs font-semibold'>{t(SUBJECT_LABELS[sub]) ?? sub}</p>
                    <div className='flex flex-wrap gap-1'>
                      {[...actions].map(a => (
                        <Badge key={a} tone='neutral'>
                          {t(ACTION_LABELS[a]) ?? a}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <div className='flex items-center gap-3'>
                <div className='flex size-9 items-center justify-center rounded-lg bg-dekel-100 text-dekel-600'>
                  <UserRound className='size-4' />
                </div>
                <div>
                  <CardTitle>{t('Compte')}</CardTitle>
                  <CardDescription>{t('Pour modifier ces informations, contactez un administrateur.')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className='grid gap-5 pt-6 sm:grid-cols-2'>
              <InfoItem label={t('Prénom')} value={s?.user?.firstName} />
              <InfoItem label={t('Nom')} value={s?.user?.lastName} />
              <InfoItem label={t('Identifiant')} value={s?.user?.username} mono />
              <InfoItem label={t('Rôle')} value={s?.role?.displayName ?? t(ROLE_NAMES[s?.role?.name ?? '']) ?? s?.role?.name} />
            </CardContent>
          </Card>
          <ChangePasswordCard />
        </div>
      </div>
    </>
  )
}
