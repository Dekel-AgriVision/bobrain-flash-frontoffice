import type { Metadata } from 'next'
import { getT } from '@/i18n/server'
import FlashDetailView from '@/features/flash/flash-detail-view'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()

  return { title: t('Détail flash') }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return <FlashDetailView id={id} />
}
