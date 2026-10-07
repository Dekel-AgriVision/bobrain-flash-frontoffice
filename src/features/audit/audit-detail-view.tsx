'use client'

import { useState } from 'react'
import Link from 'next/link'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Loader2, ZapOff } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { EmptyState } from '@/components/common/empty-state'
import { InfoItem } from '@/components/common/info-item'
import { FlashStatusBadge } from '@/components/common/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tip } from '@/components/ui/tooltip'
import { services } from '@/lib/services'
import { statusLabel, statusTone } from '@/lib/constants'
import { flashDate, formatCalendar, formatDateTime, formatDayLabel, formatFromNow, formatNumber, formatTime, formatWeight } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { AuditFlashStats, Flash } from '@/lib/types'
import { FlashInfo, WeightHero } from '@/features/flash/flash-info'
import { FrameBlock } from '@/features/flash/frame-block'
import { useT } from '@/i18n/provider'

const PERIODS = [
  { value: 24, label: '24 h' },
  { value: 24 * 7, label: '7 j' },
  { value: 24 * 30, label: '30 j' }
]

const BAR: Record<string, string> = { success: 'bg-agri-500', warning: 'bg-harvest-500', error: 'bg-red-500', info: 'bg-sky-500', neutral: 'bg-slate-400', primary: 'bg-dekel-600' }

function Stats({ stats }: { stats?: AuditFlashStats }) {
  const t = useT()
  const total = stats?.total ?? 0
  const rows = [...(stats?.byStatus ?? [])].sort((a, b) => b.count - a.count)

  return (
    <div className='space-y-5'>
      <dl className='grid grid-cols-2 gap-4'>
        <InfoItem label={t('Événements')} value={formatNumber(total)} />
        <InfoItem label={t('Poids valides')} value={formatNumber(stats?.validWeights)} />
      </dl>
      <dl className='grid grid-cols-3 gap-4'>
        <InfoItem label={t('Min')} value={formatWeight(stats?.minWeight)} />
        <InfoItem label={t('Moyenne')} value={formatWeight(stats?.avgWeight)} />
        <InfoItem label={t('Max')} value={formatWeight(stats?.maxWeight)} />
      </dl>
      <div>
        <p className='mb-3 text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground'>{t('Répartition des statuts')}</p>
        {!rows.length && <p className='text-sm text-muted-foreground'>{t('Aucun événement sur la période.')}</p>}
        <div className='space-y-3'>
          {rows.map(r => {
            const pct = total ? Math.round((r.count / total) * 100) : 0

            return (
              <div key={r.status}>
                <div className='mb-1 flex justify-between text-[0.8rem]'>
                  <span>{t(statusLabel(r.status))}</span>
                  <span className='tabular text-muted-foreground'>
                    {formatNumber(r.count)} · {pct}%
                  </span>
                </div>
                <div className='h-1.5 overflow-hidden rounded-full bg-muted'>
                  <div className={cn('h-full rounded-full', BAR[statusTone(r.status)])} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const DOT: Record<string, string> = { success: 'bg-agri-500 ring-agri-100', warning: 'bg-harvest-500 ring-harvest-100', error: 'bg-red-500 ring-red-100', info: 'bg-sky-500 ring-sky-100', neutral: 'bg-slate-400 ring-slate-100', primary: 'bg-dekel-600 ring-dekel-100' }

function Timeline({ items, currentId }: { items: Flash[]; currentId: string }) {
  const t = useT()
  if (!items?.length) return <EmptyState title={t('Aucun événement')} />
  let lastDay = ''

  return (
    <div className='pb-2'>
      {items.map(it => {
        const day = formatDayLabel(flashDate(it))
        const showDay = day !== lastDay
        lastDay = day
        const current = it.id === currentId
        const row = (
          <div
            className={cn(
              'grid grid-cols-[72px_16px_1fr_auto] items-center gap-3 border-s-[3px] px-5 py-2.5',
              current ? 'border-primary bg-dekel-50' : 'border-transparent hover:bg-muted/50'
            )}
          >
            <span className='tabular text-[0.8rem] text-muted-foreground'>{formatTime(flashDate(it))}</span>
            <span className={cn('size-2.5 justify-self-center rounded-full ring-4', DOT[statusTone(it.status)])} />
            <span className='min-w-0'>
              <span className={cn('block truncate text-sm', current ? 'font-bold' : 'font-medium')}>
                {t(statusLabel(it.status))}
                {current && <span className='ms-2 text-[0.65rem] font-bold uppercase tracking-wider text-primary'>{t('consulté')}</span>}
              </span>
              {it.statusMsg && <span className='block truncate text-xs text-muted-foreground'>{it.statusMsg}</span>}
            </span>
            <span className='tabular text-sm font-semibold'>{formatWeight(it.sentWeight)}</span>
          </div>
        )

        return (
          <div key={it.id}>
            {showDay && <p className='px-5 pb-1 pt-4 text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground'>{day}</p>}
            {current ? row : <Link href={`/audit/${it.id}`}>{row}</Link>}
          </div>
        )
      })}
    </div>
  )
}

export default function AuditDetailView({ id }: { id: string }) {
  const t = useT()
  const [hours, setHours] = useState(24)
  const q = useQuery({ queryKey: ['audit-details', id, hours], queryFn: () => services.audit.details(id, 10, hours), placeholderData: keepPreviousData })
  const d = q.data

  if (q.isLoading) return <Skeleton className='h-[560px]' />
  if (!d?.audit)
    return (
      <Card>
        <EmptyState title={t('Audit introuvable')} action={<Button asChild variant='outline'><Link href='/audit'>{t('Retour')}</Link></Button>} />
      </Card>
    )

  const { audit, previous, next, timeline, currentFlash, stats } = d
  const delta = currentFlash ? Number(currentFlash.sentWeight ?? 0) - Number(audit.sentWeight ?? 0) : null

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Audit des flashs', href: '/audit' }, { label: t('Réf. {ref}', { ref: audit.reference ?? '—' }) }]}
        title={`${audit.station ?? '—'} · ${audit.branch ?? '—'}`}
        description={t('Événement du {date} ({ago})', { date: formatDateTime(flashDate(audit)), ago: formatFromNow(flashDate(audit)) })}
        actions={
          <>
            <Tip content={previous ? t('Précédent : {date}', { date: formatDateTime(flashDate(previous)) }) : t('Aucun événement précédent')}>
              <span>
                <Button variant='outline' disabled={!previous} asChild={!!previous}>
                  {previous ? (
                    <Link href={`/audit/${previous.id}`}>
                      <ChevronLeft className='rtl-flip' /> {t('Précédent')}
                    </Link>
                  ) : (
                    <span>
                      <ChevronLeft className='rtl-flip' /> {t('Précédent')}
                    </span>
                  )}
                </Button>
              </span>
            </Tip>
            <Tip content={next ? t('Suivant : {date}', { date: formatDateTime(flashDate(next)) }) : t('Aucun événement suivant')}>
              <span>
                <Button variant='outline' disabled={!next} asChild={!!next}>
                  {next ? (
                    <Link href={`/audit/${next.id}`}>
                      {t('Suivant')} <ChevronRight className='rtl-flip' />
                    </Link>
                  ) : (
                    <span>
                      {t('Suivant')} <ChevronRight className='rtl-flip' />
                    </span>
                  )}
                </Button>
              </span>
            </Tip>
            <Button asChild variant='ghost'>
              <Link href='/audit'>
                <ArrowLeft className='rtl-flip' /> {t('Retour')}
              </Link>
            </Button>
          </>
        }
      />

      <div className='grid gap-6 xl:grid-cols-[1fr_380px]'>
        <div className='space-y-6'>
          <WeightHero flash={audit} />
          <FlashInfo flash={audit} />
          <FrameBlock frame={audit.frame} />
          <Card className='overflow-hidden'>
            <CardHeader>
              <div>
                <CardTitle>{t('Chronologie de la station')}</CardTitle>
                <CardDescription>{t('Événements de {station} autour de cet audit', { station: audit.station ?? '—' })}</CardDescription>
              </div>
            </CardHeader>
            <Timeline items={timeline} currentId={audit.id} />
          </Card>
        </div>

        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{t('État actuel de la station')}</CardTitle>
                <CardDescription>{t('Dernier flash reçu')}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {currentFlash ? (
                <div className='space-y-3'>
                  <div className='flex items-center justify-between gap-2'>
                    <p className='tabular text-2xl font-bold'>{formatWeight(currentFlash.sentWeight)}</p>
                    <FlashStatusBadge status={currentFlash.status} />
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {formatCalendar(flashDate(currentFlash))} · {formatFromNow(flashDate(currentFlash))}
                  </p>
                  {delta !== null && (
                    <div className='flex justify-between rounded-md bg-muted/60 px-3 py-2 text-sm'>
                      <span className='text-muted-foreground'>{t('Écart avec cet audit')}</span>
                      <span className={cn('tabular font-bold', delta > 0 ? 'text-agri-700' : delta < 0 ? 'text-red-600' : 'text-muted-foreground')}>
                        {delta > 0 ? '+' : ''}
                        {formatWeight(delta)}
                      </span>
                    </div>
                  )}
                  <Button asChild variant='outline' className='w-full'>
                    <Link href={`/flashs/${currentFlash.id}`}>
                      {t('Ouvrir le flash courant')} <ArrowRight className='rtl-flip' />
                    </Link>
                  </Button>
                </div>
              ) : (
                <EmptyState icon={ZapOff} title={t('Aucun flash courant')} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle className='flex items-center gap-2'>{t('Statistiques')} {q.isFetching && <Loader2 className='size-3.5 animate-spin text-muted-foreground' />}</CardTitle>
                <CardDescription>{t('Sur {period} jusqu’à cet événement', { period: t(PERIODS.find(p => p.value === hours)?.label ?? '') })}</CardDescription>
              </div>
              <Tabs value={String(hours)} onValueChange={v => setHours(Number(v))}>
                <TabsList>
                  {PERIODS.map(p => (
                    <TabsTrigger key={p.value} value={String(p.value)}>
                      {t(p.label)}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <Stats stats={stats} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
