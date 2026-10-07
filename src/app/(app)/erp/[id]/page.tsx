import type { Metadata } from 'next'
import { getT } from '@/i18n/server'
import ErpFormView from '@/features/erp/erp-form-view'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()

  return { title: t('Modifier la connexion ERP') }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return <ErpFormView id={id} />
}
