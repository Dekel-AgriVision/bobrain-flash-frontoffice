import type { Metadata } from 'next'
import { getT } from '@/i18n/server'
import RoleFormView from '@/features/roles/role-form-view'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()

  return { title: t('Modifier le rôle') }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return <RoleFormView id={id} />
}
