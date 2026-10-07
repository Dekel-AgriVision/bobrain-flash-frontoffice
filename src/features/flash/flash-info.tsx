'use client'

import { Eye } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { InfoItem } from '@/components/common/info-item'
import { FlashStatusBadge } from '@/components/common/status-badge'
import { flashDate, formatCalendar, formatDateTime, formatNumber, formatWeight } from '@/lib/format'
import type { Flash } from '@/lib/types'
import { useT } from '@/i18n/provider'

/** Poids mis en avant + statut */
export function WeightHero({ flash }: { flash: Flash }) {
  const t = useT()
  return (
    <Card className='flex flex-wrap items-center justify-between gap-4 p-6'>
      <div>
        <p className='text-xs font-medium text-muted-foreground'>{t('Poids envoyé')}</p>
        <p className='tabular text-4xl font-bold leading-tight text-dekel-600'>{formatWeight(flash.sentWeight)}</p>
        <p className='mt-1 text-sm text-muted-foreground'>{formatCalendar(flashDate(flash))}</p>
      </div>
      <div className='flex flex-col items-end gap-2'>
        <FlashStatusBadge status={flash.status} className='px-3 py-1 text-sm' />
        {flash.isMonitored && (
          <span className='flex items-center gap-1 text-xs font-semibold text-dekel-600'>
            <Eye className='size-3.5' /> {t('Station supervisée')}
          </span>
        )}
      </div>
    </Card>
  )
}

/** Grille des données transmises par le service de pesée */
export function FlashInfo({ flash }: { flash: Flash }) {
  const t = useT()
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{t('Informations')}</CardTitle>
          <CardDescription>{t('Données transmises par le service de pesée')}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <dl className='grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-3'>
          <InfoItem label={t('Référence')} value={flash.reference} mono />
          <InfoItem label={t('Ticket')} value={flash.ticket} />
          <InfoItem label={t('Latence')} value={flash.latency} />
          <InfoItem label={t('Entrée BC')} value={flash.inputFromBc !== undefined && flash.inputFromBc !== null ? formatNumber(flash.inputFromBc) : null} />
          <InfoItem label={t('Sortie BC')} value={flash.outputFromBc !== undefined && flash.outputFromBc !== null ? formatNumber(flash.outputFromBc) : null} />
          <InfoItem label={t('Message statut')} value={flash.statusMsg} />
          <InfoItem label={t('Opérateur')} value={flash.userName} />
          <InfoItem label={t('Profil utilisateur')} value={flash.userProfile} />
          <InfoItem label={t('Poste')} value={flash.computerName} />
          <InfoItem label={t('Utilisateur poste')} value={flash.computerUser} />
          <InfoItem label={t('Horodatage service')} value={flash.timestamp ? formatDateTime(flash.timestamp) : null} />
          <InfoItem label={t('Enregistré le')} value={formatDateTime(flash.createdAt)} />
        </dl>
      </CardContent>
    </Card>
  )
}
