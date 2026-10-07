import type { Metadata } from 'next'
import { getT } from '@/i18n/server'
import StationFormView from '@/features/stations/station-form-view'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()

  return { title: t('Nouvelle station') }
}

export default function Page() {
  return <StationFormView />
}
