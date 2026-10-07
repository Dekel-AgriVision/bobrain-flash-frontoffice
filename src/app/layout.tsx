import type { Metadata } from 'next'
import './globals.css'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getLocale, getT } from '@/i18n/server'
import { dirOf } from '@/i18n/config'
import Providers from './providers'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()

  return {
    title: { default: 'Brain Flash', template: '%s · Brain Flash' },
    description: t('Supervision des ponts bascules et des pesées — DekelOil, groupe Dekel Agri-Vision.')
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Session lue côté serveur : le token API est disponible dès le premier rendu
  const session = await getServerSession(authOptions)
  const locale = await getLocale()

  return (
    <html lang={locale} dir={dirOf(locale)} suppressHydrationWarning>
      <head>
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='' />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Hebrew:wght@400;500;600;700&display=swap' rel='stylesheet' />
      </head>
      <body className='min-h-screen font-sans'>
        <Providers session={session} locale={locale}>{children}</Providers>
      </body>
    </html>
  )
}
