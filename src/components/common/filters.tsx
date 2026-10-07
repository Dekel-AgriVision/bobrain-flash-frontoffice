'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n/provider'

const ALL = '__all__'

/** Liste déroulante de filtre avec option « Tous » */
export function SelectFilter({
  value,
  onChange,
  options,
  placeholder,
  allLabel = 'Tous',
  className
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder: string
  allLabel?: string
  className?: string
}) {
  const t = useT()
  placeholder = t(placeholder)
  allLabel = t(allLabel)

  return (
    <Select value={value || ALL} onValueChange={v => onChange(v === ALL ? '' : v)}>
      <SelectTrigger className={cn('w-[180px]', value && 'border-primary/50 bg-dekel-50 text-dekel-600', className)}>
        <SelectValue placeholder={placeholder}>{value ? t(options.find(o => o.value === value)?.label ?? value) : `${placeholder} : ${allLabel.toLocaleLowerCase()}`}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {options.map(o => (
          <SelectItem key={o.value} value={o.value}>
            {t(o.label)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function SearchInput({ value, onChange, placeholder = 'Rechercher…', className }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  const t = useT()

  return (
    <div className={cn('relative w-full sm:w-64', className)}>
      <Search className='pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
      <Input value={value} onChange={e => onChange(e.target.value)} placeholder={t(placeholder)} className='ps-8 pe-8' />
      {value && (
        <button type='button' onClick={() => onChange('')} className='absolute end-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'>
          <X className='size-4' />
        </button>
      )}
    </div>
  )
}

/** Période (dates au format YYYY-MM-DD) */
export function DateRangeFilter({ start, end, onChange }: { start?: string; end?: string; onChange: (r: { start: string; end: string }) => void }) {
  const t = useT()

  return (
    <div className={cn('flex h-9 items-center gap-1 rounded-md border bg-card px-2 text-sm shadow-sm', (start || end) && 'border-primary/50 bg-dekel-50')}>
      <span className='text-xs text-muted-foreground'>{t('Du')}</span>
      <input
        type='date'
        value={start ?? ''}
        max={end || undefined}
        onChange={e => onChange({ start: e.target.value, end: end ?? '' })}
        className='bg-transparent text-sm outline-none'
      />
      <span className='text-xs text-muted-foreground'>{t('au')}</span>
      <input
        type='date'
        value={end ?? ''}
        min={start || undefined}
        onChange={e => onChange({ start: start ?? '', end: e.target.value })}
        className='bg-transparent text-sm outline-none'
      />
    </div>
  )
}

/** Barre de filtres : filtres à gauche, recherche + actions à droite */
export function FilterBar({ children, right, activeCount = 0, onReset }: { children?: React.ReactNode; right?: React.ReactNode; activeCount?: number; onReset?: () => void }) {
  const t = useT()

  return (
    <div className='flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3'>
      <div className='flex flex-wrap items-center gap-2'>
        {children}
        {onReset && activeCount > 0 && (
          <Button variant='ghost' size='sm' onClick={onReset} className='text-muted-foreground'>
            <X /> {t('Effacer ({n})', { n: activeCount })}
          </Button>
        )}
      </div>
      {right && <div className='flex flex-wrap items-center gap-2'>{right}</div>}
    </div>
  )
}
