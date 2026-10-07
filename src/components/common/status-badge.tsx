'use client'

import { Badge } from '@/components/ui/badge'
import { statusLabel, statusTone } from '@/lib/constants'
import { useT } from '@/i18n/provider'

/** Statut d'un flash (WEIGHT_OK, STALE, …) */
export function FlashStatusBadge({ status, className }: { status?: string; className?: string }) {
  const t = useT()

  return (
    <Badge tone={statusTone(status)} dot className={className}>
      {t(statusLabel(status))}
    </Badge>
  )
}

export function ActiveBadge({ active, on = 'Active', off = 'Inactive' }: { active?: boolean; on?: string; off?: string }) {
  const t = useT()

  return (
    <Badge tone={active ? 'success' : 'neutral'} dot>
      {t(active ? on : off)}
    </Badge>
  )
}
