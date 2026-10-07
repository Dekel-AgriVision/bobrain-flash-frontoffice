import type { Metadata } from 'next'
import { getT } from '@/i18n/server'
import RoleListView from '@/features/roles/role-list-view'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()

  return { title: t('Rôles') }
}

export default function Page() {
  return <RoleListView />
}
