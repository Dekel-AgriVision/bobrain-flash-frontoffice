import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getT } from '@/i18n/server'
import ActivityListView from '@/features/activities/activity-list-view'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()

  return { title: t('Activités des stations') }
}

export default function Page() {
  return (
    <Suspense>
      <ActivityListView />
    </Suspense>
  )
}
