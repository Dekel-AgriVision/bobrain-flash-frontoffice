'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/common/form'
import { InfoItem } from '@/components/common/info-item'
import { PasswordInput } from '@/components/common/password-input'
import { useMutationToast } from '@/hooks/use-resource'
import { services } from '@/lib/services'
import { AsideCard, FormLayout, FormSection } from '@/features/shared/form-layout'
import { BranchSelect, SwitchControl } from '@/features/shared/fields'
import { erpEndpoint } from './erp-list-view'
import { useT } from '@/i18n/provider'

const schema = z.object({
  code: z.string().trim().min(1, 'Code obligatoire'),
  branchId: z.string().min(1, 'Surccusale obligatoire'),
  baseUrl: z.string().trim().min(1, 'URL obligatoire').url('URL invalide (http://…)'),
  port: z.coerce.number({ invalid_type_error: 'Port obligatoire' }).int('Port invalide').min(1, 'Port obligatoire').max(65535, 'Port invalide'),
  apiUri: z.string().optional(),
  authUri: z.string().optional(),
  wsUri: z.string().optional(),
  login: z.string().trim().min(1, 'Identifiant obligatoire'),
  password: z.string().min(1, 'Mot de passe obligatoire'),
  isActive: z.boolean(),
  isDefault: z.boolean()
})
type Values = z.infer<typeof schema>

export default function ErpFormView({ id }: { id?: string }) {
  const t = useT()
  const router = useRouter()
  const { data: session } = useSession()
  const editing = Boolean(id)
  const q = useQuery({ queryKey: ['erp', id], queryFn: () => services.erp.get(id!, 'branch'), enabled: editing })
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { code: '', branchId: '', baseUrl: '', port: 80, apiUri: '', authUri: '', wsUri: '', login: '', password: '', isActive: true, isDefault: false }
  })
  const { register, control, handleSubmit, reset, formState: { errors } } = form
  const preview = useWatch({ control })

  useEffect(() => {
    const c = q.data
    if (c)
      reset({
        code: c.code,
        branchId: c.branchId ?? c.branch?.id ?? '',
        baseUrl: c.baseUrl ?? '',
        port: c.port ?? 80,
        apiUri: c.apiUri ?? '',
        authUri: c.authUri ?? '',
        wsUri: c.wsUri ?? '',
        login: c.login ?? '',
        password: c.password ?? '',
        isActive: c.isActive,
        isDefault: c.isDefault
      })
    else if (!editing && session?.apiSession?.targetBranchId) form.setValue('branchId', session.apiSession.targetBranchId)
  }, [q.data, editing, session, reset, form])

  const invalidate = [['erp']]
  const save = useMutationToast(
    (v: Values) => {
      const body = { ...v, port: Number(v.port) }

      return editing ? services.erp.update(id!, body) : services.erp.create(body)
    },
    { success: editing ? 'Connexion modifiée' : 'Connexion créée', invalidate, onSuccess: () => router.push('/erp') }
  )
  const remove = useMutationToast(() => services.erp.remove(id!), { success: 'Connexion supprimée', invalidate, onSuccess: () => router.push('/erp') })

  const base = erpEndpoint({ baseUrl: preview.baseUrl, port: preview.port ? Number(preview.port) : undefined })
  const join = (uri?: string) => (uri ? `${base === '—' ? '' : base}${uri.startsWith('/') ? '' : '/'}${uri}` : '—')

  return (
    <FormLayout
      title={editing ? t('Connexion {code}', { code: q.data?.code ?? '' }) : 'Nouvelle connexion ERP'}
      description={t('Une seule connexion par défaut est utilisée par surccusale.')}
      breadcrumbs={[{ label: 'Connexions ERP', href: '/erp' }, { label: editing ? 'Modification' : 'Création' }]}
      backHref='/erp'
      loading={editing && q.isLoading}
      onSubmit={handleSubmit(v => save.mutate(v))}
      submitting={save.isPending}
      onDelete={editing ? () => remove.mutateAsync(undefined) : undefined}
      deleteLabel={t('cette connexion')}
      aside={
        <AsideCard title={t('Aperçu des URL')} description={t('Calculées à partir des champs saisis.')}>
          <div className='grid gap-4'>
            <InfoItem label={t('Serveur')} value={base} mono />
            <InfoItem label={t('API')} value={join(preview.apiUri)} mono />
            <InfoItem label={t('Authentification')} value={join(preview.authUri)} mono />
            <InfoItem label={t('WebSocket')} value={join(preview.wsUri)} mono />
          </div>
        </AsideCard>
      }
    >
      <FormSection title={t('Général')}>
        <div className='grid gap-5 sm:grid-cols-2'>
          <Field label={t('Code')} htmlFor='code' required error={errors.code?.message}>
            <Input id='code' {...register('code')} />
          </Field>
          <Field label={t('Surccusale')} required error={errors.branchId?.message}>
            <BranchSelect control={control} />
          </Field>
        </div>
      </FormSection>
      <FormSection title={t('Serveur')}>
        <div className='grid gap-5 sm:grid-cols-[1fr_8rem]'>
          <Field label={t('URL de base')} htmlFor='baseUrl' required error={errors.baseUrl?.message} hint={t('Ex : http://10.0.0.12')}>
            <Input id='baseUrl' className='font-mono' {...register('baseUrl')} />
          </Field>
          <Field label={t('Port')} htmlFor='port' required error={errors.port?.message}>
            <Input id='port' type='number' inputMode='numeric' {...register('port')} />
          </Field>
        </div>
        <div className='grid gap-5 sm:grid-cols-3'>
          <Field label={t('URI API')} htmlFor='apiUri'>
            <Input id='apiUri' className='font-mono' placeholder={t('/api')} {...register('apiUri')} />
          </Field>
          <Field label={t('URI auth')} htmlFor='authUri'>
            <Input id='authUri' className='font-mono' placeholder={t('/auth/login')} {...register('authUri')} />
          </Field>
          <Field label={t('URI WebSocket')} htmlFor='wsUri'>
            <Input id='wsUri' className='font-mono' placeholder={t('/ws')} {...register('wsUri')} />
          </Field>
        </div>
      </FormSection>
      <FormSection title={t('Authentification')}>
        <div className='grid gap-5 sm:grid-cols-2'>
          <Field label={t('Identifiant')} htmlFor='login' required error={errors.login?.message}>
            <Input id='login' autoComplete='off' {...register('login')} />
          </Field>
          <Field label={t('Mot de passe')} htmlFor='password' required error={errors.password?.message}>
            <PasswordInput id='password' {...register('password')} />
          </Field>
        </div>
      </FormSection>
      <div className='grid gap-3 sm:grid-cols-2'>
        <SwitchControl control={control} name='isActive' title={t('Connexion active')} />
        <SwitchControl control={control} name='isDefault' title={t('Connexion par défaut')} />
      </div>
    </FormLayout>
  )
}
