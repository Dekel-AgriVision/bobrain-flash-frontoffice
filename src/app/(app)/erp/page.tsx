import type { Metadata } from 'next'
import { getT } from '@/i18n/server'
import ErpListView from '@/features/erp/erp-list-view'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()

  return { title: t('Connexions ERP') }
}

export default function Page() {
  return <ErpListView />
}
