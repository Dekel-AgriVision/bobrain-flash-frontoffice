'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, CheckCircle2, DatabaseZap, PowerOff, RefreshCw, WifiOff } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { KpiCard } from '@/components/common/kpi-card'
import { LiveIndicator } from '@/components/common/live-indicator'
import { SelectFilter } from '@/components/common/filters'
import { EmptyState } from '@/components/common/empty-state'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tip } from '@/components/ui/tooltip'
import { useFlashSocket } from '@/hooks/use-flash-socket'
import { useNow } from '@/hooks/use-now'
import { services } from '@/lib/services'
import { statusLabel } from '@/lib/constants'
import { formatFromNow, formatWeight } from '@/lib/format'
import { cn, norm } from '@/lib/utils'
import type { Flash, Station } from '@/lib/types'
import { EventLog, type LogEntry } from './event-log'
import { StationCard } from './station-card'
import { flashKey, HEALTH, healthOf, indexLatest, isNewer, stationKeys, type Health } from './health'
import { useT } from '@/i18n/provider'

const SILENT_OPTIONS = [1, 2, 5, 10, 15, 30, 60]
const SILENT_KEY = 'brainflash.silentMinutes'
const HEALTH_ORDER: Health[] = ['ok', 'alert', 'silent', 'idle', 'off']
const KPI_ICONS = { ok: CheckCircle2, alert: AlertTriangle, silent: WifiOff, idle: DatabaseZap, off: PowerOff }

export default function SupervisionView() {
  const t = useT()
  useNow(10_000) // ré-évalue « muette » et les « il y a … »

  const [latest, setLatest] = useState<Record<string, Flash>>({})
  const [pulses, setPulses] = useState<Record<string, number>>({})
  const [log, setLog] = useState<LogEntry[]>([])
  const [branch, setBranch] = useState('')
  const [healthFilter, setHealthFilter] = useState<Health | ''>('')
  const [silentMinutes, setSilentMinutes] = useState(5)
  const [lastSync, setLastSync] = useState<Date>(new Date())
  const logId = useRef(0)
  const resyncTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const prevHealth = useRef<Record<string, Health>>({})

  const stationsQ = useQuery({ queryKey: ['supervision', 'stations'], queryFn: () => services.stations.list({ relations: 'branch', per_page: 500, order_by: 'code', order: 'ASC' }) })
  const flashsQ = useQuery({ queryKey: ['supervision', 'flashs'], queryFn: () => services.flashs.list({ per_page: 500, order_by: 'createdAt', order: 'DESC' }) })
  const stations: Station[] = useMemo(() => stationsQ.data?.data ?? [], [stationsQ.data])
  const stationsRef = useRef(stations)
  stationsRef.current = stations

  const pushLog = useCallback((kind: LogEntry['kind'], text: string, href?: string) => {
    logId.current += 1
    const e: LogEntry = { id: logId.current, kind, at: new Date(), text, href }
    setLog(prev => [e, ...prev].slice(0, 80))
  }, [])

  // Intègre les flashs REST sans écraser un flash plus récent reçu par socket
  useEffect(() => {
    if (!flashsQ.data?.data) return
    const fresh = indexLatest(flashsQ.data.data)
    setLatest(prev => {
      const out = { ...prev }
      Object.entries(fresh).forEach(([k, f]) => {
        if (!out[k] || out[k].id === f.id || isNewer(f, out[k])) out[k] = f
      })

      return out
    })
    setLastSync(new Date())
  }, [flashsQ.data])

  const resync = useCallback(
    (reason: string) => {
      Promise.all([stationsQ.refetch(), flashsQ.refetch()]).then(() => pushLog('resync', reason))
    },
    [stationsQ, flashsQ, pushLog]
  )

  const scheduleResync = (reason: string, delay = 1500) => {
    clearTimeout(resyncTimer.current)
    resyncTimer.current = setTimeout(() => resync(reason), delay)
  }

  const applyFlash = (flash: Flash) => {
    if (!flash?.station) return
    const k = flashKey(flash.branch, flash.station)
    setLatest(prev => {
      const cur = prev[k]
      if (cur && cur.id !== flash.id && !isNewer(flash, cur)) return prev

      return { ...prev, [k]: { ...(cur?.id === flash.id ? cur : {}), ...flash } }
    })
    const now = Date.now()
    setPulses(p => ({ ...p, [k]: now, [`*::${norm(flash.station)}`]: now }))
    setLastSync(new Date())
    pushLog('flash', `${flash.station} (${flash.branch ?? '?'}) · ${formatWeight(flash.sentWeight)} · ${t(statusLabel(flash.status))}`, flash.id ? `/flashs/${flash.id}` : undefined)

    const matched = stationsRef.current.some(s => stationKeys(s).includes(k) || norm(s.code) === norm(flash.station))
    if (!matched && stationsRef.current.length) {
      pushLog('unmatched', t('Station « {station} » / surccusale « {branch} » inconnue — vérifiez les codes dans Ponts bascules', { station: flash.station, branch: flash.branch ?? '?' }))
    }
  }

  const { connected } = useFlashSocket({
    onFlash: applyFlash,
    onBackendStart: () => {
      pushLog('backend', t('L’API a redémarré'))
      scheduleResync(t('Données rechargées après redémarrage de l’API'), 3000)
    },
    onAction: (d: any) => {
      pushLog('action', d?.station ? t('Action reçue pour {station}', { station: d.station }) : t('Action reçue'))
      scheduleResync(t('Données rechargées après une action'))
    },
    onReconnect: () => scheduleResync(t('Rattrapage après reconnexion'), 500),
    onAny: e => {
      if (e.event === 'connect') pushLog('connect', t('Flux temps réel connecté'))
      if (e.event === 'disconnect') pushLog('disconnect', t('Flux temps réel coupé ({reason})', { reason: e.payload ?? t('raison inconnue') }))
    }
  })

  // Sans socket : rafraîchissement toutes les 30 s
  useEffect(() => {
    if (connected) return
    const id = setInterval(() => resync(t('Rafraîchissement périodique (socket indisponible)')), 30_000)

    return () => clearInterval(id)
  }, [connected, resync, t])

  // Seuil « muette » mémorisé
  useEffect(() => {
    try {
      const v = Number(localStorage.getItem(SILENT_KEY))
      if (SILENT_OPTIONS.includes(v)) setSilentMinutes(v)
    } catch {}
  }, [])
  const changeSilent = (v: string) => {
    setSilentMinutes(Number(v))
    try {
      localStorage.setItem(SILENT_KEY, v)
    } catch {}
  }

  useEffect(() => () => clearTimeout(resyncTimer.current), [])

  // Rapprochement station ↔ dernier flash
  const latestByCode = useMemo(() => {
    const m: Record<string, Flash> = {}
    Object.values(latest).forEach(f => {
      const c = norm(f.station)
      if (!m[c] || isNewer(f, m[c])) m[c] = f
    })

    return m
  }, [latest])
  const codeCount = useMemo(() => {
    const m: Record<string, number> = {}
    stations.forEach(s => (m[norm(s.code)] = (m[norm(s.code)] ?? 0) + 1))

    return m
  }, [stations])

  const lastOf = (s: Station) => {
    for (const k of stationKeys(s)) if (latest[k]) return latest[k]

    return codeCount[norm(s.code)] === 1 ? latestByCode[norm(s.code)] : undefined
  }
  const pulseOf = (s: Station) => Math.max(0, ...stationKeys(s).map(k => pulses[k] ?? 0), codeCount[norm(s.code)] === 1 ? pulses[`*::${norm(s.code)}`] ?? 0 : 0)

  const healthMap: Record<string, Health> = {}
  stations.forEach(s => (healthMap[s.id] = healthOf(s, lastOf(s), silentMinutes)))

  // Journalise les stations qui deviennent muettes
  useEffect(() => {
    stations.forEach(s => {
      const h = healthMap[s.id]
      if (h === 'silent' && prevHealth.current[s.id] && prevHealth.current[s.id] !== 'silent') pushLog('silent', t('{code} : aucun flash depuis plus de {n} min', { code: s.code, n: silentMinutes }))
      prevHealth.current[s.id] = h
    })
  })

  const branches = useMemo(() => {
    const m = new Map<string, string>()
    stations.forEach(s => s.branch && m.set(s.branch.code, s.branch.displayName))

    return Array.from(m, ([value, label]) => ({ value, label }))
  }, [stations])

  const scoped = stations.filter(s => !branch || s.branch?.code === branch)
  const visible = scoped.filter(s => !healthFilter || healthMap[s.id] === healthFilter)
  const count = (h: Health) => scoped.filter(s => healthMap[s.id] === h).length

  const groups = useMemo(() => {
    const g = new Map<string, { name: string; items: Station[] }>()
    visible.forEach(s => {
      const k = s.branch?.code ?? '—'
      if (!g.has(k)) g.set(k, { name: s.branch?.displayName ?? t('Sans surccusale'), items: [] })
      g.get(k)!.items.push(s)
    })

    return Array.from(g.values())
  }, [visible, t])

  const loading = stationsQ.isLoading || flashsQ.isLoading

  return (
    <>
      <PageHeader
        title={t('Supervision')}
        description={t('{n} station(s) · {active} active(s) · données à jour {ago}', { n: scoped.length, active: scoped.filter(s => s.isActive).length, ago: formatFromNow(lastSync) })}
        actions={
          <>
            <SelectFilter value={branch} onChange={setBranch} placeholder={t('Surccusale')} allLabel={t('Toutes')} options={branches} />
            <Tip content={t('Une station active devient « muette » si elle n’envoie aucun flash pendant ce délai')}>
              <div>
                <Select value={String(silentMinutes)} onValueChange={changeSilent}>
                  <SelectTrigger className='w-[190px]'>
                    <WifiOff className='size-4 text-muted-foreground' />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SILENT_OPTIONS.map(m => (
                      <SelectItem key={m} value={String(m)}>
                        {t('Muette après {m} min', { m })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Tip>
            <Tip content={t('Recharger maintenant')}>
              <Button variant='outline' size='icon' onClick={() => resync(t('Rechargement manuel'))}>
                <RefreshCw className={cn((stationsQ.isFetching || flashsQ.isFetching) && 'animate-spin')} />
              </Button>
            </Tip>
            <LiveIndicator connected={connected} />
          </>
        }
      />

      <div className='grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5'>
        {HEALTH_ORDER.map(h => (
          <KpiCard
            key={h}
            icon={KPI_ICONS[h]}
            label={t(HEALTH[h].label)}
            value={loading ? '…' : count(h)}
            hint={h === 'silent' ? t('Aucun flash depuis plus de {n} min', { n: silentMinutes }) : t(HEALTH[h].hint)}
            tone={HEALTH[h].tone}
            active={healthFilter === h}
            onClick={() => setHealthFilter(f => (f === h ? '' : h))}
          />
        ))}
      </div>

      {healthFilter && (
        <div className='mt-4 flex items-center gap-2 text-sm text-muted-foreground'>
          {t('Filtre :')} <span className='font-semibold text-foreground'>{t(HEALTH[healthFilter].label)}</span>
          <Button variant='link' size='sm' className='h-auto p-0' onClick={() => setHealthFilter('')}>
            {t('afficher tout')}
          </Button>
        </div>
      )}

      <div className='mt-6 grid gap-6 2xl:grid-cols-[1fr_360px]'>
        <div className='space-y-6'>
          {loading &&
            [0].map(i => (
              <div key={i} className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
                {Array.from({ length: 6 }).map((_, j) => (
                  <Skeleton key={j} className='h-[170px]' />
                ))}
              </div>
            ))}
          {!loading &&
            groups.map(g => (
              <section key={g.name}>
                {groups.length > 1 && (
                  <h2 className='mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                    {g.name} · {g.items.length}
                  </h2>
                )}
                <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
                  {g.items.map(s => (
                    <StationCard key={s.id} station={s} flash={lastOf(s)} health={healthMap[s.id]} pulse={pulseOf(s) || undefined} />
                  ))}
                </div>
              </section>
            ))}
          {!loading && !visible.length && (
            <Card>
              <EmptyState title={t('Aucune station')} description={t('Aucune station ne correspond à la sélection.')} />
            </Card>
          )}
        </div>

        <Card className='h-fit overflow-hidden 2xl:sticky 2xl:top-20'>
          <CardHeader>
            <div>
              <CardTitle>{t('Journal temps réel')}</CardTitle>
              <CardDescription>{t('Événements Socket.IO reçus sur cette page')}</CardDescription>
            </div>
          </CardHeader>
          <EventLog items={log} />
        </Card>
      </div>
    </>
  )
}
