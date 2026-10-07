'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, History } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { EmptyState } from '@/components/common/empty-state'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { services } from '@/lib/services'
import { flashDate, formatDateTime, formatFromNow } from '@/lib/format'
import { FlashInfo, WeightHero } from './flash-info'
import { FrameBlock } from './frame-block'
import { useT } from '@/i18n/provider'

export default function FlashDetailView({ id }: { id: string }) {
  const t = useT()
  const q = useQuery({ queryKey: ['flash', id], queryFn: () => services.flashs.get(id) })
  const f = q.data

  if (q.isLoading) return <Skeleton className='h-[480px]' />
  if (!f)
    return (
      <Card>
        <EmptyState title={t('Flash introuvable')} description={t('Ce flash a peut-être été remplacé par une pesée plus récente.')} action={<Button asChild variant='outline'><Link href='/flashs'>{t('Retour')}</Link></Button>} />
      </Card>
    )

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Flashs temps réel', href: '/flashs' }, { label: t('Réf. {ref}', { ref: f.reference ?? '—' }) }]}
        title={`${f.station ?? '—'} · ${f.branch ?? '—'}`}
        description={t('Reçu le {date} ({ago})', { date: formatDateTime(flashDate(f)), ago: formatFromNow(flashDate(f)) })}
        actions={
          <>
            <Button asChild variant='outline'>
              <Link href={`/audit?station=${encodeURIComponent(f.station ?? '')}`}>
                <History /> {t('Historique de la station')}
              </Link>
            </Button>
            <Button asChild variant='ghost'>
              <Link href='/flashs'>
                <ArrowLeft className='rtl-flip' /> {t('Retour')}
              </Link>
            </Button>
          </>
        }
      />
      <div className='grid gap-6 xl:grid-cols-[1fr_420px]'>
        <div className='space-y-6'>
          <WeightHero flash={f} />
          <FlashInfo flash={f} />
        </div>
        <FrameBlock frame={f.frame} />
      </div>
    </>
  )
}
