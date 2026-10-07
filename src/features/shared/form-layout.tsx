'use client'

import Link from 'next/link'
import { ArrowLeft, Loader2, Save, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { Confirm } from '@/components/common/confirm-button'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useT } from '@/i18n/provider'

/** Mise en page commune des formulaires de création / modification */
export function FormLayout({
  title,
  description,
  breadcrumbs,
  backHref,
  onSubmit,
  submitting,
  canSubmit = true,
  onDelete,
  deleteLabel = 'cet élément',
  loading,
  aside,
  children
}: {
  title: string
  description?: string
  breadcrumbs: { label: string; href?: string }[]
  backHref: string
  onSubmit: (e: React.FormEvent) => void
  submitting?: boolean
  canSubmit?: boolean
  onDelete?: () => Promise<unknown> | void
  deleteLabel?: string
  loading?: boolean
  aside?: React.ReactNode
  children: React.ReactNode
}) {
  const t = useT()

  return (
    <>
      <PageHeader
        breadcrumbs={breadcrumbs}
        title={title}
        description={description}
        actions={
          <Button asChild variant='ghost'>
            <Link href={backHref}>
              <ArrowLeft className='rtl-flip' /> {t('Retour')}
            </Link>
          </Button>
        }
      />
      {loading ? (
        <Skeleton className='h-[420px] max-w-3xl' />
      ) : (
        <div className={aside ? 'grid gap-6 xl:grid-cols-[minmax(0,48rem)_1fr]' : 'max-w-3xl'}>
          <form onSubmit={onSubmit} noValidate>
            <Card>
              <CardContent className='space-y-5 pt-6'>{children}</CardContent>
              <CardFooter className='justify-between'>
                <div>
                  {onDelete && (
                    <Confirm title={t('Supprimer {x} ?', { x: t(deleteLabel) })} description={t('Cette action est définitive.')} onConfirm={onDelete}>
                      <Button type='button' variant='ghost' className='text-destructive hover:bg-red-50 hover:text-destructive'>
                        <Trash2 /> {t('Supprimer')}
                      </Button>
                    </Confirm>
                  )}
                </div>
                <div className='flex gap-2'>
                  <Button type='button' variant='outline' asChild>
                    <Link href={backHref}>{t('Annuler')}</Link>
                  </Button>
                  {canSubmit && (
                    <Button type='submit' disabled={submitting}>
                      {submitting ? <Loader2 className='animate-spin' /> : <Save />}
                      {t('Enregistrer')}
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          </form>
          {aside}
        </div>
      )}
    </>
  )
}

/** Section titrée à l'intérieur d'un formulaire */
export function FormSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  const t = useT()

  return (
    <section className='space-y-4'>
      <div>
        <h3 className='text-sm font-semibold'>{t(title)}</h3>
        {description && <p className='text-xs text-muted-foreground'>{t(description)}</p>}
      </div>
      {children}
    </section>
  )
}

/** Carte annexe affichée à côté du formulaire */
export function AsideCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  const t = useT()

  return (
    <Card className='h-fit'>
      <CardHeader>
        <div>
          <CardTitle>{t(title)}</CardTitle>
          {description && <CardDescription>{t(description)}</CardDescription>}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
