'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/common/form'
import { InfoItem } from '@/components/common/info-item'
import { ActiveBadge } from '@/components/common/status-badge'
import { PASSWORD_HINT, PASSWORD_REGEX, PasswordInput } from '@/components/common/password-input'
import { useMutationToast } from '@/hooks/use-resource'
import { services } from '@/lib/services'
import { USER_TYPES } from '@/lib/constants'
import { formatDateTime } from '@/lib/format'
import { AsideCard, FormLayout, FormSection } from '@/features/shared/form-layout'
import { BranchSelect, RoleSelect, SelectControl, SwitchControl } from '@/features/shared/fields'
import { userFullName } from './user-list-view'
import { useT } from '@/i18n/provider'

const PHONE = /^[+0-9 ().-]{6,20}$/

const makeSchema = (editing: boolean) =>
  z.object({
    firstName: z.string().trim().min(1, 'Prénom obligatoire'),
    lastName: z.string().trim().min(1, 'Nom obligatoire'),
    username: z.string().trim().min(3, '3 caractères minimum'),
    email: z.union([z.literal(''), z.string().trim().email('Email invalide')]),
    phoneNumber: z.union([z.literal(''), z.string().trim().regex(PHONE, 'Téléphone invalide')]),
    branchId: z.string().min(1, 'Surccusale obligatoire'),
    roleId: z.string().min(1, 'Rôle obligatoire'),
    type: z.enum(['OPERATOR', 'OTHER']),
    isActive: z.boolean(),
    newPassword: editing
      ? z.union([z.literal(''), z.string().regex(PASSWORD_REGEX, PASSWORD_HINT)])
      : z.string().min(1, 'Mot de passe obligatoire').regex(PASSWORD_REGEX, PASSWORD_HINT)
  })
type Values = z.infer<ReturnType<typeof makeSchema>>

const EMPTY: Values = { firstName: '', lastName: '', username: '', email: '', phoneNumber: '', branchId: '', roleId: '', type: 'OTHER', isActive: true, newPassword: '' }

export default function UserFormView({ id }: { id?: string }) {
  const t = useT()
  const router = useRouter()
  const { data: session } = useSession()
  const editing = Boolean(id)
  const isMe = editing && session?.apiSession?.user?.id === id
  const q = useQuery({ queryKey: ['user', id], queryFn: () => services.users.get(id!, 'role,branch'), enabled: editing })
  const form = useForm<Values>({ resolver: zodResolver(makeSchema(editing)), defaultValues: EMPTY })
  const { register, control, handleSubmit, reset, formState: { errors } } = form

  useEffect(() => {
    const u = q.data
    if (u)
      reset({
        firstName: u.firstName ?? '',
        lastName: u.lastName ?? '',
        username: u.username,
        email: u.email ?? '',
        phoneNumber: u.phoneNumber ?? '',
        branchId: u.branchId ?? u.branch?.id ?? '',
        roleId: u.roleId ?? u.role?.id ?? '',
        type: (u.type as Values['type']) ?? 'OTHER',
        isActive: u.isActive,
        newPassword: ''
      })
    else if (!editing && session?.apiSession?.targetBranchId) form.setValue('branchId', session.apiSession.targetBranchId)
  }, [q.data, editing, session, reset, form])

  const invalidate = [['users']]
  const save = useMutationToast(
    (v: Values) => {
      const { newPassword, ...rest } = v
      const body = { ...rest, ...(newPassword ? { newPassword } : {}) }

      return editing ? services.users.update(id!, body) : services.users.create(body)
    },
    { success: editing ? 'Utilisateur modifié' : 'Utilisateur créé', invalidate, onSuccess: () => router.push('/utilisateurs') }
  )
  const remove = useMutationToast(() => services.users.remove(id!), { success: 'Utilisateur supprimé', invalidate, onSuccess: () => router.push('/utilisateurs') })

  const u = q.data

  return (
    <FormLayout
      title={editing ? userFullName(u) : 'Nouvel utilisateur'}
      description={editing ? t('Identifiant @{u}', { u: u?.username ?? '' }) : 'Créer un compte backoffice ou un opérateur de pont bascule.'}
      breadcrumbs={[{ label: 'Utilisateurs', href: '/utilisateurs' }, { label: editing ? 'Modification' : 'Création' }]}
      backHref='/utilisateurs'
      loading={editing && q.isLoading}
      onSubmit={handleSubmit(v => save.mutate(v))}
      submitting={save.isPending}
      onDelete={editing && !isMe ? () => remove.mutateAsync(undefined) : undefined}
      deleteLabel={t('cet utilisateur')}
      aside={
        editing && u ? (
          <AsideCard title={t('Compte')}>
            <div className='grid gap-4'>
              <InfoItem label={t('État')} value={<ActiveBadge active={u.isActive} on={t('Actif')} off={t('Inactif')} />} />
              <InfoItem label={t('Rôle')} value={u.role?.displayName ?? u.role?.name ?? '—'} />
              <InfoItem label={t('Surccusale')} value={u.branch?.displayName ?? '—'} />
              <InfoItem label={t('Créé le')} value={formatDateTime(u.createdAt)} />
              <InfoItem label={t('Modifié le')} value={formatDateTime(u.updatedAt)} />
            </div>
          </AsideCard>
        ) : undefined
      }
    >
      <FormSection title={t('Identité')}>
        <div className='grid gap-5 sm:grid-cols-2'>
          <Field label={t('Prénom')} htmlFor='firstName' required error={errors.firstName?.message}>
            <Input id='firstName' {...register('firstName')} />
          </Field>
          <Field label={t('Nom')} htmlFor='lastName' required error={errors.lastName?.message}>
            <Input id='lastName' {...register('lastName')} />
          </Field>
          <Field label={t('Email')} htmlFor='email' error={errors.email?.message}>
            <Input id='email' type='email' {...register('email')} />
          </Field>
          <Field label={t('Téléphone')} htmlFor='phoneNumber' error={errors.phoneNumber?.message}>
            <Input id='phoneNumber' {...register('phoneNumber')} />
          </Field>
        </div>
      </FormSection>

      <FormSection title={t('Accès')} description={t('Rôle (permissions), surccusale de rattachement et type de compte.')}>
        <div className='grid gap-5 sm:grid-cols-2'>
          <Field label={t('Identifiant de connexion')} htmlFor='username' required error={errors.username?.message}>
            <Input id='username' autoComplete='off' {...register('username')} />
          </Field>
          <Field label={t('Type')} required>
            <SelectControl control={control} name='type' options={Object.entries(USER_TYPES).map(([value, label]) => ({ value, label }))} />
          </Field>
          <Field label={t('Rôle')} required error={errors.roleId?.message}>
            <RoleSelect control={control} />
          </Field>
          <Field label={t('Surccusale')} required error={errors.branchId?.message}>
            <BranchSelect control={control} />
          </Field>
        </div>
        <Field
          label={editing ? 'Nouveau mot de passe' : 'Mot de passe'}
          htmlFor='newPassword'
          required={!editing}
          error={errors.newPassword?.message}
          hint={editing ? 'Laisser vide pour conserver le mot de passe actuel.' : PASSWORD_HINT}
        >
          <PasswordInput id='newPassword' {...register('newPassword')} />
        </Field>
        {!isMe && <SwitchControl control={control} name='isActive' title={t('Compte actif')} description={t('Un compte inactif ne peut plus se connecter.')} />}
      </FormSection>
    </FormLayout>
  )
}
