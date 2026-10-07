import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getT } from '@/i18n/server'

export default async function NotFound() {
  const t = await getT()

  return (
    <main className='flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center'>
      <p className='text-6xl font-black text-dekel-600'>404</p>
      <h1 className='text-xl font-bold'>{t('Page introuvable')}</h1>
      <p className='max-w-sm text-sm text-muted-foreground'>{t('La page demandée n’existe pas ou a été déplacée.')}</p>
      <Button asChild>
        <Link href='/'>{t('Retour au tableau de bord')}</Link>
      </Button>
    </main>
  )
}
