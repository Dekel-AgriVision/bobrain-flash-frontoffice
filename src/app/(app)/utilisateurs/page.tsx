import type { Metadata } from 'next'
import { getT } from '@/i18n/server'
import UserListView from '@/features/users/user-list-view'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()

  return { title: t('Utilisateurs') }
}

export default function Page() {
  return <UserListView />
}
