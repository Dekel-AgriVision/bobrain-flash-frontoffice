import type { Metadata } from 'next'
import { getT } from '@/i18n/server'
import SupervisionView from '@/features/supervision/supervision-view'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()

  return { title: t('Supervision') }
}

export default function Page() {
  return <SupervisionView />
}
