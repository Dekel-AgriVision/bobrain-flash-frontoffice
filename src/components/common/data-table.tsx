'use client'

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from './empty-state'
import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/format'
import { useT, useTx } from '@/i18n/provider'

export type Column<T> = {
  key: string
  header: React.ReactNode
  cell: (row: T) => React.ReactNode
  className?: string
  headClassName?: string
}

type Props<T> = {
  columns: Column<T>[]
  rows?: T[]
  loading?: boolean
  fetching?: boolean
  rowKey?: (row: T) => string
  onRowClick?: (row: T) => void
  rowClassName?: (row: T) => string | undefined
  empty?: { icon?: LucideIcon; title: string; description?: string }
  page?: number
  perPage?: number
  total?: number
  lastPage?: number
  onPageChange?: (p: number) => void
  onPerPageChange?: (n: number) => void
}

export function DataTable<T>({
  columns,
  rows,
  loading,
  fetching,
  rowKey = (r: any) => r.id,
  onRowClick,
  rowClassName,
  empty = { title: 'Aucune donnée' },
  page = 1,
  perPage = 25,
  total,
  lastPage,
  onPageChange,
  onPerPageChange
}: Props<T>) {
  const t = useT()
  const tx = useTx()
  const pages = lastPage ?? (total ? Math.max(1, Math.ceil(total / perPage)) : 1)
  const from = total ? (page - 1) * perPage + 1 : 0
  const to = total ? Math.min(page * perPage, total) : 0

  return (
    <div className='relative'>
      {fetching && !loading && (
        <div className='absolute end-3 top-2.5 z-10 text-muted-foreground'>
          <Loader2 className='size-4 animate-spin' />
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow className='hover:bg-transparent'>
            {columns.map(c => (
              <TableHead key={c.key} className={c.headClassName}>
                {tx(c.header)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading &&
            Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i} className='hover:bg-transparent'>
                {columns.map(c => (
                  <TableCell key={c.key}>
                    <Skeleton className='h-4 w-full max-w-[140px]' />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          {!loading &&
            rows?.map(r => (
              <TableRow key={rowKey(r)} onClick={onRowClick ? () => onRowClick(r) : undefined} className={cn(onRowClick && 'cursor-pointer', rowClassName?.(r))}>
                {columns.map(c => (
                  <TableCell key={c.key} className={c.className}>
                    {c.cell(r)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
        </TableBody>
      </Table>
      {!loading && !rows?.length && <EmptyState icon={empty.icon} title={empty.title} description={empty.description} />}

      {onPageChange && (total ?? 0) > 0 && (
        <div className='flex flex-wrap items-center justify-between gap-3 border-t px-4 py-2.5 text-sm text-muted-foreground'>
          <span className='tabular'>
            {t('{from}–{to} sur {total}', { from: formatNumber(from), to: formatNumber(to), total: formatNumber(total) })}
          </span>
          <div className='flex items-center gap-2'>
            {onPerPageChange && (
              <Select value={String(perPage)} onValueChange={v => onPerPageChange(Number(v))}>
                <SelectTrigger className='h-8 w-[110px]'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 25, 50, 100].map(n => (
                    <SelectItem key={n} value={String(n)}>
                      {t('{n} / page', { n })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button variant='outline' size='icon' className='size-8' disabled={page <= 1} onClick={() => onPageChange(1)}>
              <ChevronsLeft className='rtl-flip' />
            </Button>
            <Button variant='outline' size='icon' className='size-8' disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
              <ChevronLeft className='rtl-flip' />
            </Button>
            <span className='tabular px-1 text-foreground'>
              {page} / {pages}
            </span>
            <Button variant='outline' size='icon' className='size-8' disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
              <ChevronRight className='rtl-flip' />
            </Button>
            <Button variant='outline' size='icon' className='size-8' disabled={page >= pages} onClick={() => onPageChange(pages)}>
              <ChevronsRight className='rtl-flip' />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
