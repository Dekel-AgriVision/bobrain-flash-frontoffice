import type { Metadata } from 'next'
import { getT } from '@/i18n/server'
import SettingListView from '@/features/settings/setting-list-view'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()

  return { title: t('Paramètres système') }
}

export default function Page() {
  return <SettingListView />
}
