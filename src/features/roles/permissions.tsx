'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { ACTION_LABELS, ACTIONS, SUBJECT_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n/provider'

export type PermissionMatrix = Record<string, Record<string, boolean>>

const SUBJECTS = Object.keys(SUBJECT_LABELS)

/** Normalise la valeur stockée par l'API ({ Sujet: true } ou { Sujet: { read: true } }) */
export function toMatrix(raw?: Record<string, boolean | Record<string, boolean>> | null): PermissionMatrix {
  return Object.fromEntries(
    SUBJECTS.map(s => {
      const v = raw?.[s]

      return [s, Object.fromEntries(ACTIONS.map(a => [a, v === true || (typeof v === 'object' && v !== null && !!v[a])]))]
    })
  )
}

export const countGranted = (raw?: Record<string, boolean | Record<string, boolean>> | null) =>
  Object.values(toMatrix(raw)).reduce((n, row) => n + Object.values(row).filter(Boolean).length, 0)

/** Grille Sujets × Actions, avec sélection par ligne et par colonne */
export function PermissionsMatrix({ value, onChange, disabled }: { value: PermissionMatrix; onChange: (v: PermissionMatrix) => void; disabled?: boolean }) {
  const t = useT()
  const rowAll = (s: string) => ACTIONS.every(a => value[s]?.[a])
  const rowSome = (s: string) => ACTIONS.some(a => value[s]?.[a])
  const colAll = (a: string) => SUBJECTS.every(s => value[s]?.[a])
  const colSome = (a: string) => SUBJECTS.some(s => value[s]?.[a])

  const set = (s: string, a: string, v: boolean) => onChange({ ...value, [s]: { ...value[s], [a]: v } })
  const setRow = (s: string, v: boolean) => onChange({ ...value, [s]: Object.fromEntries(ACTIONS.map(a => [a, v])) })
  const setCol = (a: string, v: boolean) => onChange(Object.fromEntries(SUBJECTS.map(s => [s, { ...value[s], [a]: v }])))

  const state = (all: boolean, some: boolean) => (all ? true : some ? 'indeterminate' : false)

  return (
    <div className={cn('overflow-x-auto rounded-lg border', disabled && 'pointer-events-none opacity-50')}>
      <table className='w-full text-sm'>
        <thead className='bg-muted/50'>
          <tr className='border-b'>
            <th className='px-4 py-2.5 text-start text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground'>{t('Module')}</th>
            {ACTIONS.map(a => (
              <th key={a} className='px-3 py-2.5 text-center'>
                <label className='flex cursor-pointer flex-col items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground'>
                  {t(ACTION_LABELS[a])}
                  <Checkbox checked={state(colAll(a), colSome(a))} onCheckedChange={v => setCol(a, v === true)} aria-label={t('Tout {action}', { action: t(ACTION_LABELS[a]) })} />
                </label>
              </th>
            ))}
            <th className='px-3 py-2.5 text-center text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground'>{t('Tout')}</th>
          </tr>
        </thead>
        <tbody>
          {SUBJECTS.map(s => (
            <tr key={s} className='border-b last:border-0 hover:bg-muted/30'>
              <td className='px-4 py-2.5 font-medium'>{t(SUBJECT_LABELS[s])}</td>
              {ACTIONS.map(a => (
                <td key={a} className='px-3 py-2.5 text-center'>
                  <Checkbox checked={!!value[s]?.[a]} onCheckedChange={v => set(s, a, v === true)} aria-label={`${t(SUBJECT_LABELS[s])} — ${t(ACTION_LABELS[a])}`} />
                </td>
              ))}
              <td className='px-3 py-2.5 text-center'>
                <Checkbox checked={state(rowAll(s), rowSome(s))} onCheckedChange={v => setRow(s, v === true)} aria-label={t('Tout pour {subject}', { subject: t(SUBJECT_LABELS[s]) })} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
