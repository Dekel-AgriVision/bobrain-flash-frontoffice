import type { Metadata } from 'next'
import { getT } from '@/i18n/server'
import RoleFormView from '@/features/roles/role-form-view'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()

  return { title: t('Nouveau rôle') }
}

export default function Page() {
  return <RoleFormView />
}
