import type { Metadata } from 'next'
import { getT } from '@/i18n/server'
import FlashListView from '@/features/flash/flash-list-view'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()

  return { title: t('Flashs temps réel') }
}

export default function Page() {
  return <FlashListView />
}
