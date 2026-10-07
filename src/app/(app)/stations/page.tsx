import type { Metadata } from 'next'
import { getT } from '@/i18n/server'
import StationListView from '@/features/stations/station-list-view'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()

  return { title: t('Ponts bascules') }
}

export default function Page() {
  return <StationListView />
}
