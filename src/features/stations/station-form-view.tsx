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
import { useMutationToast } from '@/hooks/use-resource'
import { services } from '@/lib/services'
import { FormLayout } from '@/features/shared/form-layout'
import { BranchSelect, SwitchControl } from '@/features/shared/fields'
import { useT } from '@/i18n/provider'

const schema = z.object({
  code: z.string().trim().min(1, 'Code obligatoire').max(20),
  displayName: z.string().trim().min(1, 'Libellé obligatoire'),
  branchId: z.string().min(1, 'Surccusale obligatoire'),
  isActive: z.boolean()
})
type Values = z.infer<typeof schema>

export default function StationFormView({ id }: { id?: string }) {
  const t = useT()
  const router = useRouter()
  const { data: session } = useSession()
  const editing = Boolean(id)
  const q = useQuery({ queryKey: ['station', id], queryFn: () => services.stations.get(id!, 'branch'), enabled: editing })
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { code: '', displayName: '', branchId: '', isActive: true } })
  const { register, control, handleSubmit, reset, formState: { errors } } = form

  useEffect(() => {
    if (q.data) reset({ code: q.data.code, displayName: q.data.displayName, branchId: q.data.branchId ?? '', isActive: q.data.isActive })
    else if (!editing && session?.apiSession?.targetBranchId) form.setValue('branchId', session.apiSession.targetBranchId)
  }, [q.data, editing, session, reset, form])

  const invalidate = [['stations'], ['options', 'stations'], ['supervision']]
  const save = useMutationToast((v: Values) => (editing ? services.stations.update(id!, v) : services.stations.create(v)), {
    success: editing ? 'Station modifiée' : 'Station créée',
    invalidate,
    onSuccess: () => router.push('/stations')
  })
  const remove = useMutationToast(() => services.stations.remove(id!), { success: 'Station supprimée', invalidate, onSuccess: () => router.push('/stations') })

  return (
    <FormLayout
      title={editing ? t('Station {code}', { code: q.data?.code ?? '' }) : 'Nouvelle station'}
      description={t('Pont bascule rattaché à une surccusale. Le code doit correspondre exactement à celui envoyé par le service de pesée.')}
      breadcrumbs={[{ label: 'Ponts bascules', href: '/stations' }, { label: editing ? 'Modification' : 'Création' }]}
      backHref='/stations'
      loading={editing && q.isLoading}
      onSubmit={handleSubmit(v => save.mutate({ ...v, code: v.code.toUpperCase() }))}
      submitting={save.isPending}
      onDelete={editing ? () => remove.mutateAsync(undefined) : undefined}
      deleteLabel={t('cette station')}
    >
      <div className='grid gap-5 sm:grid-cols-2'>
        <Field label={t('Code station')} htmlFor='code' required error={errors.code?.message} hint={t('Ex : AY1')}>
          <Input id='code' className='uppercase' {...register('code')} />
        </Field>
        <Field label={t('Libellé')} htmlFor='displayName' required error={errors.displayName?.message}>
          <Input id='displayName' {...register('displayName')} />
        </Field>
      </div>
      <Field label={t('Surccusale')} required error={errors.branchId?.message}>
        <BranchSelect control={control} />
      </Field>
      <SwitchControl control={control} name='isActive' title={t('Station active')} description={t('Désactivée, la station est signalée « Station désactivée » et ses pesées sont bloquées.')} />
    </FormLayout>
  )
}
