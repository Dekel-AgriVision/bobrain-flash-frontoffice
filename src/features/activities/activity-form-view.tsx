'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Field } from '@/components/common/form'
import { InfoItem } from '@/components/common/info-item'
import { useMutationToast } from '@/hooks/use-resource'
import { services } from '@/lib/services'
import { ACTIVITY_TYPES } from '@/lib/constants'
import { formatDateTime, formatDuration } from '@/lib/format'
import { AsideCard, FormLayout } from '@/features/shared/form-layout'
import { SwitchControl } from '@/features/shared/fields'
import { useT } from '@/i18n/provider'

type Values = { isActive: boolean; reason: string }

/**
 * Les activités sont créées par l'API (démarrage / arrêt détectés par le SocketGateway).
 * Le backoffice permet de les clôturer et de documenter la raison.
 */
export default function ActivityFormView({ id }: { id: string }) {
  const t = useT()
  const router = useRouter()
  const q = useQuery({ queryKey: ['activity', id], queryFn: () => services.activities.get(id, 'branch,station') })
  const { register, control, handleSubmit, reset } = useForm<Values>({ defaultValues: { isActive: false, reason: '' } })
  const a = q.data

  useEffect(() => {
    if (a) reset({ isActive: a.isActive, reason: a.reason ?? '' })
  }, [a, reset])

  const save = useMutationToast((v: Values) => services.activities.update(id, v), { success: 'Activité mise à jour', invalidate: [['activities']], onSuccess: () => router.push('/activites') })
  const remove = useMutationToast(() => services.activities.remove(id), { success: 'Activité supprimée', invalidate: [['activities']], onSuccess: () => router.push('/activites') })

  return (
    <FormLayout
      title={a ? `${a.station?.code ?? ''} · ${t(ACTIVITY_TYPES[a.type]?.label ?? a.type)}` : 'Activité'}
      description={a?.branch?.displayName}
      breadcrumbs={[{ label: 'Activités', href: '/activites' }, { label: 'Modification' }]}
      backHref='/activites'
      loading={q.isLoading}
      onSubmit={handleSubmit(v => save.mutate(v))}
      submitting={save.isPending}
      onDelete={() => remove.mutateAsync(undefined)}
      deleteLabel={t('cette activité')}
      aside={
        a && (
          <AsideCard title={t('Détail')} description={t('Données enregistrées par le service flash')}>
            <dl className='grid grid-cols-2 gap-5'>
              <InfoItem label={t('Type')} value={<Badge tone={ACTIVITY_TYPES[a.type]?.tone ?? 'neutral'} dot>{t(ACTIVITY_TYPES[a.type]?.label ?? a.type)}</Badge>} />
              <InfoItem label={t('Code raison')} value={a.reasoncode} mono />
              <InfoItem label={t('Début')} value={formatDateTime(a.startAt)} />
              <InfoItem label={t('Fin')} value={a.endAt ? formatDateTime(a.endAt) : t('En cours')} />
              <InfoItem label={t('Durée')} value={formatDuration(a.startAt, a.endAt)} />
              <InfoItem label={t('Station')} value={a.station ? `${a.station.code} — ${a.station.displayName}` : null} />
            </dl>
          </AsideCard>
        )
      }
    >
      <Field label={t('Raison')} htmlFor='reason' hint={t('Explication libre de l’arrêt ou du démarrage')}>
        <Textarea id='reason' rows={4} {...register('reason')} />
      </Field>
      <SwitchControl control={control} name='isActive' title={t('Activité en cours')} description={t('Désactivez pour clôturer l’activité.')} />
    </FormLayout>
  )
}
