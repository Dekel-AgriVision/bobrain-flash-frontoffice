'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Pencil, Plus, Settings, Trash2 } from 'lucide-react'
import { DataTable, type Column } from '@/components/common/data-table'
import { FilterBar, SearchInput } from '@/components/common/filters'
import { Confirm } from '@/components/common/confirm-button'
import { Field } from '@/components/common/form'
import { Can, useAbility } from '@/components/common/ability'
import { PageHeader } from '@/components/common/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tip } from '@/components/ui/tooltip'
import { useListState } from '@/hooks/use-list-state'
import { useMutationToast, usePaginated } from '@/hooks/use-resource'
import { services } from '@/lib/services'
import { Subject } from '@/lib/constants'
import { formatDateTime, formatNumber } from '@/lib/format'
import type { Setting } from '@/lib/types'
import { useT } from '@/i18n/provider'

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Clé obligatoire')
    .regex(/^[A-Za-z0-9_.-]+$/, 'Lettres, chiffres, « _ », « . » ou « - » uniquement'),
  displayName: z.string().trim().min(1, 'Libellé obligatoire'),
  value: z.string().trim().min(1, 'Valeur obligatoire')
})
type Values = z.infer<typeof schema>

function SettingDialog({ open, onOpenChange, setting }: { open: boolean; onOpenChange: (o: boolean) => void; setting?: Setting | null }) {
  const t = useT()
  const editing = Boolean(setting)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { name: '', displayName: '', value: '' } })

  useEffect(() => {
    if (open) reset(setting ? { name: setting.name, displayName: setting.displayName, value: setting.value ?? '' } : { name: '', displayName: '', value: '' })
  }, [open, setting, reset])

  const save = useMutationToast((v: Values) => (setting ? services.settings.update(setting.id, v) : services.settings.create(v)), {
    success: editing ? 'Paramètre modifié' : 'Paramètre créé',
    invalidate: [['settings']],
    onSuccess: () => onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit(v => save.mutate(v))} noValidate className='space-y-5'>
          <DialogHeader>
            <DialogTitle>{t(editing ? 'Modifier le paramètre' : 'Nouveau paramètre')}</DialogTitle>
            <DialogDescription>{t('Valeur lue par l’API et les services de pesée.')}</DialogDescription>
          </DialogHeader>
          <Field label={t('Clé')} htmlFor='name' required error={errors.name?.message} hint={editing ? 'La clé ne peut pas être modifiée.' : undefined}>
            <Input id='name' className='font-mono' disabled={editing} {...register('name')} />
          </Field>
          <Field label={t('Libellé')} htmlFor='displayName' required error={errors.displayName?.message}>
            <Input id='displayName' {...register('displayName')} />
          </Field>
          <Field label={t('Valeur')} htmlFor='value' required error={errors.value?.message}>
            <Textarea id='value' rows={3} className='font-mono' {...register('value')} />
          </Field>
          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
              {t('Annuler')}
            </Button>
            <Button type='submit' disabled={save.isPending}>
              {save.isPending && <Loader2 className='animate-spin' />} {t('Enregistrer')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function SettingListView() {
  const t = useT()
  const ability = useAbility()
  const canEdit = ability.can('edit', Subject.Setting)
  const canDelete = ability.can('delete', Subject.Setting)
  const list = useListState({})
  const [dialog, setDialog] = useState<{ open: boolean; setting?: Setting | null }>({ open: false })
  const q = usePaginated(['settings', list.debouncedSearch, list.page, list.perPage], () =>
    services.settings.list({ where: [{ value: list.debouncedSearch }], page: list.page, per_page: list.perPage, order_by: 'name', order: 'ASC' })
  )
  const remove = useMutationToast((id: string) => services.settings.remove(id), { success: 'Paramètre supprimé', invalidate: [['settings']] })

  const columns: Column<Setting>[] = [
    {
      key: 'name',
      header: 'Paramètre',
      cell: s => (
        <div>
          <p className='font-semibold'>{s.displayName}</p>
          <p className='font-mono text-xs text-muted-foreground'>{s.name}</p>
        </div>
      )
    },
    {
      key: 'value',
      header: 'Valeur',
      cell: s => <code className='block max-w-md truncate rounded bg-muted px-2 py-1 font-mono text-xs'>{s.value === '' || s.value == null ? '∅' : String(s.value)}</code>
    },
    { key: 'updated', header: 'Modifié le', cell: s => <span className='text-muted-foreground'>{formatDateTime(s.updatedAt ?? s.createdAt)}</span> },
    {
      key: 'actions',
      header: '',
      className: 'text-end',
      cell: s => (
        <div className='flex justify-end' onClick={e => e.stopPropagation()}>
          {canEdit && (
            <Tip content={t('Modifier')}>
              <Button variant='ghost' size='icon' className='size-8' onClick={() => setDialog({ open: true, setting: s })}>
                <Pencil className='text-dekel-600' />
              </Button>
            </Tip>
          )}
          {canDelete && (
            <Confirm title={t('Supprimer ce paramètre ?')} description={t('« {name} » sera supprimé définitivement.', { name: s.name })} onConfirm={() => remove.mutateAsync(s.id)}>
              <Button variant='ghost' size='icon' className='size-8'>
                <Trash2 className='text-destructive' />
              </Button>
            </Confirm>
          )}
        </div>
      )
    }
  ]

  return (
    <>
      <PageHeader
        title={t('Paramètres système')}
        description={t('Clés de configuration partagées (seuils, délais, options des services).')}
        actions={
          <Can I='create' a={Subject.Setting}>
            <Button onClick={() => setDialog({ open: true, setting: null })}>
              <Plus /> {t('Nouveau paramètre')}
            </Button>
          </Can>
        }
      />
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{t('Paramètres')}</CardTitle>
            <CardDescription>{q.data ? t('{n} paramètre(s)', { n: formatNumber(q.data.total) }) : t('Chargement…')}</CardDescription>
          </div>
        </CardHeader>
        <FilterBar activeCount={list.activeCount} onReset={list.reset} right={<SearchInput value={list.search} onChange={list.setSearch} placeholder={t('Clé, libellé…')} />} />
        <DataTable
          columns={columns}
          rows={q.data?.data}
          loading={q.isLoading}
          fetching={q.isFetching}
          onRowClick={canEdit ? s => setDialog({ open: true, setting: s }) : undefined}
          empty={{ icon: Settings, title: 'Aucun paramètre' }}
          page={list.page}
          perPage={list.perPage}
          total={q.data?.total}
          lastPage={q.data?.last_page}
          onPageChange={list.setPage}
          onPerPageChange={list.setPerPage}
        />
      </Card>
      <SettingDialog open={dialog.open} setting={dialog.setting} onOpenChange={open => setDialog(d => ({ ...d, open }))} />
    </>
  )
}
