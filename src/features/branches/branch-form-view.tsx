'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Field } from '@/components/common/form'
import { useMutationToast } from '@/hooks/use-resource'
import { services } from '@/lib/services'
import { FormLayout, FormSection } from '@/features/shared/form-layout'
import { SwitchControl } from '@/features/shared/fields'
import { useT } from '@/i18n/provider'

const schema = z.object({
  code: z.string().trim().min(1, 'Code obligatoire').max(20),
  displayName: z.string().trim().min(1, 'Nom obligatoire'),
  email: z.union([z.literal(''), z.string().trim().email('Email invalide')]),
  phoneNumber: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  isActive: z.boolean(),
  isParentCompany: z.boolean()
})
type Values = z.infer<typeof schema>

/** L'API valide `email` avec IsEmail (IsOptional ne tolère que null/undefined) */
const emptyToNull = (v: Values) => Object.fromEntries(Object.entries(v).map(([k, x]) => [k, x === '' ? null : x]))

export default function BranchFormView({ id }: { id?: string }) {
  const t = useT()
  const router = useRouter()
  const editing = Boolean(id)
  const q = useQuery({ queryKey: ['branch', id], queryFn: () => services.branches.get(id!), enabled: editing })
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { code: '', displayName: '', email: '', phoneNumber: '', description: '', address: '', city: '', isActive: true, isParentCompany: false }
  })
  const { register, control, handleSubmit, reset, formState: { errors } } = form

  useEffect(() => {
    const b = q.data
    if (b)
      reset({
        code: b.code,
        displayName: b.displayName,
        email: b.email ?? '',
        phoneNumber: b.phoneNumber ?? '',
        description: b.description ?? '',
        address: b.address ?? '',
        city: b.city ?? '',
        isActive: b.isActive,
        isParentCompany: !!b.isParentCompany
      })
  }, [q.data, reset])

  const invalidate = [['branches'], ['options', 'branches']]
  const save = useMutationToast((v: any) => (editing ? services.branches.update(id!, v) : services.branches.create(v)), {
    success: editing ? 'Surccusale modifiée' : 'Surccusale créée',
    invalidate,
    onSuccess: () => router.push('/surccusales')
  })
  const remove = useMutationToast(() => services.branches.remove(id!), { success: 'Surccusale supprimée', invalidate, onSuccess: () => router.push('/surccusales') })

  return (
    <FormLayout
      title={editing ? q.data?.displayName ?? 'Surccusale' : 'Nouvelle surccusale'}
      description={t('Le code est utilisé par le service de pesée pour identifier le site (champ « branch » des flashs).')}
      breadcrumbs={[{ label: 'Surccusales', href: '/surccusales' }, { label: editing ? 'Modification' : 'Création' }]}
      backHref='/surccusales'
      loading={editing && q.isLoading}
      onSubmit={handleSubmit(v => save.mutate(emptyToNull({ ...v, code: v.code.toUpperCase() })))}
      submitting={save.isPending}
      onDelete={editing ? () => remove.mutateAsync(undefined) : undefined}
      deleteLabel={t('cette surccusale')}
    >
      <FormSection title={t('Identification')}>
        <div className='grid gap-5 sm:grid-cols-2'>
          <Field label={t('Code')} htmlFor='code' required error={errors.code?.message}>
            <Input id='code' className='uppercase' {...register('code')} />
          </Field>
          <Field label={t('Nom')} htmlFor='displayName' required error={errors.displayName?.message}>
            <Input id='displayName' {...register('displayName')} />
          </Field>
        </div>
        <Field label={t('Description')} htmlFor='description'>
          <Textarea id='description' rows={2} {...register('description')} />
        </Field>
      </FormSection>
      <FormSection title={t('Coordonnées')}>
        <div className='grid gap-5 sm:grid-cols-2'>
          <Field label={t('Email')} htmlFor='email' error={errors.email?.message}>
            <Input id='email' type='email' {...register('email')} />
          </Field>
          <Field label={t('Téléphone')} htmlFor='phoneNumber'>
            <Input id='phoneNumber' {...register('phoneNumber')} />
          </Field>
          <Field label={t('Adresse')} htmlFor='address'>
            <Input id='address' {...register('address')} />
          </Field>
          <Field label={t('Ville')} htmlFor='city'>
            <Input id='city' {...register('city')} />
          </Field>
        </div>
      </FormSection>
      <div className='grid gap-3 sm:grid-cols-2'>
        <SwitchControl control={control} name='isActive' title={t('Surccusale active')} />
        <SwitchControl control={control} name='isParentCompany' title={t('Société mère')} description={t('Peut consulter toutes les surccusales.')} />
      </div>
    </FormLayout>
  )
}
