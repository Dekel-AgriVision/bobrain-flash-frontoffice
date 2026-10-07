import type { Metadata } from 'next'
import { getT } from '@/i18n/server'
import UserFormView from '@/features/users/user-form-view'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()

  return { title: t('Modifier l’utilisateur') }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return <UserFormView id={id} />
}
