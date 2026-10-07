import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getT } from '@/i18n/server'
import AuditListView from '@/features/audit/audit-list-view'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()

  return { title: t('Audit des flashs') }
}

export default function Page() {
  return (
    <Suspense>
      <AuditListView />
    </Suspense>
  )
}
