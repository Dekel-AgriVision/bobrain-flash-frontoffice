import type { Metadata } from 'next'
import { getT } from '@/i18n/server'
import BranchListView from '@/features/branches/branch-list-view'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()

  return { title: t('Surccusales') }
}

export default function Page() {
  return <BranchListView />
}
