'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Field } from '@/components/common/form'
import { useMutationToast } from '@/hooks/use-resource'
import { services } from '@/lib/services'
import { ROLE_NAMES } from '@/lib/constants'
import { FormLayout, FormSection } from '@/features/shared/form-layout'
import { SelectControl, SwitchControl } from '@/features/shared/fields'
import { PermissionsMatrix, toMatrix, type PermissionMatrix } from './permissions'
import { useT } from '@/i18n/provider'

const schema = z.object({
  name: z.string().min(1, 'Type obligatoire'),
  displayName: z.string().trim().min(1, 'Libellé obligatoire'),
  description: z.string().optional(),
  isActive: z.boolean(),
  adminPermission: z.boolean(),
  permissions: z.record(z.record(z.boolean()))
})
type Values = z.infer<typeof schema>

export default function RoleFormView({ id }: { id?: string }) {
  const t = useT()
  const router = useRouter()
  const editing = Boolean(id)
  const q = useQuery({ queryKey: ['role', id], queryFn: () => services.roles.get(id!), enabled: editing })
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: 'guest', displayName: '', description: '', isActive: true, adminPermission: false, permissions: toMatrix() }
  })
  const { register, control, handleSubmit, reset, formState: { errors } } = form
  const admin = useWatch({ control, name: 'adminPermission' })

  useEffect(() => {
    if (q.data)
      reset({
        name: q.data.name,
        displayName: q.data.displayName ?? '',
        description: q.data.description ?? '',
        isActive: q.data.isActive,
        adminPermission: !!q.data.adminPermission,
        permissions: toMatrix(q.data.permissions)
      })
  }, [q.data, reset])

  const invalidate = [['roles'], ['options', 'roles']]
  const save = useMutationToast((v: Values) => (editing ? services.roles.update(id!, v) : services.roles.create(v)), {
    success: editing ? 'Rôle modifié' : 'Rôle créé',
    invalidate,
    onSuccess: () => router.push('/roles')
  })
  const remove = useMutationToast(() => services.roles.remove(id!), { success: 'Rôle supprimé', invalidate, onSuccess: () => router.push('/roles') })

  return (
    <FormLayout
      title={editing ? q.data?.displayName || 'Rôle' : 'Nouveau rôle'}
      description={t('Les permissions sont appliquées à la prochaine connexion des utilisateurs concernés.')}
      breadcrumbs={[{ label: 'Rôles', href: '/roles' }, { label: editing ? 'Modification' : 'Création' }]}
      backHref='/roles'
      loading={editing && q.isLoading}
      onSubmit={handleSubmit(v => save.mutate(v))}
      submitting={save.isPending}
      onDelete={editing ? () => remove.mutateAsync(undefined) : undefined}
      deleteLabel={t('ce rôle')}
    >
      <FormSection title={t('Informations')}>
        <div className='grid gap-5 sm:grid-cols-2'>
          <Field label={t('Libellé')} htmlFor='displayName' required error={errors.displayName?.message}>
            <Input id='displayName' {...register('displayName')} />
          </Field>
          <Field label={t('Type de rôle')} required error={errors.name?.message}>
            <SelectControl control={control} name='name' options={Object.entries(ROLE_NAMES).map(([value, label]) => ({ value, label }))} />
          </Field>
        </div>
        <Field label={t('Description')} htmlFor='description'>
          <Textarea id='description' rows={2} {...register('description')} />
        </Field>
        <div className='grid gap-3 sm:grid-cols-2'>
          <SwitchControl control={control} name='isActive' title={t('Rôle actif')} />
          <SwitchControl control={control} name='adminPermission' title={t('Accès complet')} description={t('Toutes les actions sur tous les modules, et accès à toutes les surccusales.')} />
        </div>
      </FormSection>

      <FormSection title={t('Permissions')} description={admin ? 'Ignorées : le rôle dispose de l’accès complet.' : 'Cocher les actions autorisées pour chaque module.'}>
        <Controller
          control={control}
          name='permissions'
          render={({ field }) => <PermissionsMatrix value={field.value as PermissionMatrix} onChange={field.onChange} disabled={admin} />}
        />
      </FormSection>
    </FormLayout>
  )
}
