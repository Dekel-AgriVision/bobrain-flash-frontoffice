'use client'

import { DateRangeFilter, SelectFilter } from '@/components/common/filters'
import { STATUS_MAP } from '@/lib/constants'
import { useBranchOptions, useStationOptions } from '@/hooks/use-resource'
import { useT } from '@/i18n/provider'

export type FlashFilterState = { branch: string; station: string; status: string; start: string; end: string }

export const EMPTY_FLASH_FILTERS: FlashFilterState = { branch: '', station: '', status: '', start: '', end: '' }

/** Filtres communs Flashs / Audit : surccusale, station, statut (+ période) */
export function FlashFilters({ value, onChange, withDates }: { value: FlashFilterState; onChange: (p: Partial<FlashFilterState>) => void; withDates?: boolean }) {
  const t = useT()
  const { data: branches } = useBranchOptions()
  const { data: stations } = useStationOptions()
  const stationOptions = (stations?.data ?? [])
    .filter(s => !value.branch || s.branch?.code === value.branch)
    .map(s => ({ value: s.code, label: `${s.code} — ${s.displayName}` }))

  return (
    <>
      <SelectFilter
        value={value.branch}
        onChange={v => onChange({ branch: v, station: '' })}
        placeholder={t('Surccusale')}
        allLabel={t('Toutes')}
        options={(branches?.data ?? []).map(b => ({ value: b.code, label: b.displayName }))}
      />
      <SelectFilter value={value.station} onChange={v => onChange({ station: v })} placeholder={t('Station')} allLabel={t('Toutes')} options={stationOptions} />
      <SelectFilter
        value={value.status}
        onChange={v => onChange({ status: v })}
        placeholder={t('Statut')}
        className='w-[200px]'
        options={Object.entries(STATUS_MAP).map(([k, v]) => ({ value: k, label: v.label }))}
      />
      {withDates && <DateRangeFilter start={value.start} end={value.end} onChange={({ start, end }) => onChange({ start, end })} />}
    </>
  )
}
