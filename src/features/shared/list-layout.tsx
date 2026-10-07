'use client'

import Link from 'next/link'
import { Plus, ShieldOff } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { Can, useAbility } from '@/components/common/ability'
import { EmptyState } from '@/components/common/empty-state'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatNumber } from '@/lib/format'
import { useT } from '@/i18n/provider'

/** Mise en page commune des listes CRUD */
export function ListLayout({
  title,
  description,
  subject,
  action = 'read',
  createHref,
  createLabel,
  cardTitle,
  total,
  unit = 'élément(s)',
  toolbar,
  children
}: {
  title: string
  description?: string
  subject: string
  /** Action CASL requise pour voir la liste (défaut : read) */
  action?: string
  createHref?: string
  createLabel?: string
  cardTitle: string
  total?: number
  unit?: string
  toolbar?: React.ReactNode
  children: React.ReactNode
}) {
  const ability = useAbility()
  const t = useT()
  const allowed = ability.can(action, subject)

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={
          createHref && (
            <Can I='create' a={subject}>
              <Button asChild>
                <Link href={createHref}>
                  <Plus /> {t(createLabel ?? 'Nouveau')}
                </Link>
              </Button>
            </Can>
          )
        }
      />
      <Card className='overflow-hidden'>
        <CardHeader>
          <div>
            <CardTitle>{t(cardTitle)}</CardTitle>
            {allowed && (
              <CardDescription>
                {formatNumber(total ?? 0)} {t(unit)}
              </CardDescription>
            )}
          </div>
        </CardHeader>
        {allowed ? (
          <>
            {toolbar}
            {children}
          </>
        ) : (
          <EmptyState icon={ShieldOff} title={t('Accès refusé')} description={t('Votre rôle ne permet pas de consulter cette liste.')} />
        )}
      </Card>
    </>
  )
}
