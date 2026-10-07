import type { Metadata } from 'next'
import { getT } from '@/i18n/server'
import UserFormView from '@/features/users/user-form-view'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()

  return { title: t('Nouvel utilisateur') }
}

export default function Page() {
  return <UserFormView />
}
