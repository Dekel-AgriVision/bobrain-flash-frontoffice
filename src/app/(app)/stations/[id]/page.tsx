import type { Metadata } from 'next'
import { getT } from '@/i18n/server'
import StationFormView from '@/features/stations/station-form-view'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()

  return { title: t('Modifier la station') }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return <StationFormView id={id} />
}
