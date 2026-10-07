import type { Metadata } from 'next'
import { getT } from '@/i18n/server'
import ActivityFormView from '@/features/activities/activity-form-view'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()

  return { title: t('Activité') }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return <ActivityFormView id={id} />
}
