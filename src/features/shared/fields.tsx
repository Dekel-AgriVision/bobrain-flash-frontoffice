'use client'

import { Controller } from 'react-hook-form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { SwitchRow } from '@/components/common/form'
import { useBranchOptions, useRoleOptions } from '@/hooks/use-resource'
import { useT } from '@/i18n/provider'

const NONE = '__none__'

/** Select contrôlé générique (react-hook-form) */
export function SelectControl({
  control,
  name,
  options,
  placeholder = 'Sélectionner…',
  allowEmpty,
  disabled
}: {
  control: any
  name: string
  options: { value: string; label: string }[]
  placeholder?: string
  allowEmpty?: string
  disabled?: boolean
}) {
  const t = useT()

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Select value={field.value ? String(field.value) : allowEmpty ? NONE : undefined} onValueChange={v => {
            // Radix émet parfois '' lors d'un reset du formulaire : on l'ignore
            if (v === '') return
            field.onChange(v === NONE ? '' : v)
          }} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder={t(placeholder)} />
          </SelectTrigger>
          <SelectContent>
            {allowEmpty && <SelectItem value={NONE}>{t(allowEmpty)}</SelectItem>}
            {options.map(o => (
              <SelectItem key={o.value} value={o.value}>
                {t(o.label)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  )
}

export function BranchSelect({ control, name = 'branchId', disabled, allowEmpty }: { control: any; name?: string; disabled?: boolean; allowEmpty?: string }) {
  const t = useT()
  const { data } = useBranchOptions()

  return (
    <SelectControl
      control={control}
      name={name}
      disabled={disabled}
      allowEmpty={allowEmpty}
      placeholder={t('Choisir la surccusale')}
      options={(data?.data ?? []).map(b => ({ value: b.id, label: `${b.displayName} (${b.code})` }))}
    />
  )
}

export function RoleSelect({ control, name = 'roleId' }: { control: any; name?: string }) {
  const t = useT()
  const { data } = useRoleOptions()

  return <SelectControl control={control} name={name} placeholder={t('Choisir le rôle')} options={(data?.data ?? []).map(r => ({ value: r.id, label: r.displayName || r.name }))} />
}

export function SwitchControl({ control, name, title, description }: { control: any; name: string; title: string; description?: string }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => <SwitchRow title={title} description={description} control={<Switch checked={!!field.value} onCheckedChange={field.onChange} />} />}
    />
  )
}
