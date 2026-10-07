import type { Metadata } from 'next'
import { getT } from '@/i18n/server'
import ErpFormView from '@/features/erp/erp-form-view'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()

  return { title: t('Nouvelle connexion ERP') }
}

export default function Page() {
  return <ErpFormView />
}
