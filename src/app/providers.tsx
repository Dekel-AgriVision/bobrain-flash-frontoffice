'use client'

import { useEffect, useState } from 'react'
import { SessionProvider, signOut, useSession } from 'next-auth/react'
import type { Session } from 'next-auth'
import { I18nProvider, useI18n } from '@/i18n/provider'
import type { Locale } from '@/i18n/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { DirectionProvider } from '@radix-ui/react-direction'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AbilityProvider } from '@/components/common/ability'
import { setApiToken, setUnauthorizedHandler } from '@/lib/api'
import { closeSocket } from '@/lib/socket'
import { useSessionKeepAlive } from '@/hooks/use-session-keepalive'

/** Notifications et composants Radix orientés selon la langue (hébreu : droite à gauche) */
function LocalizedToaster() {
  const { dir } = useI18n()

  return <Toaster dir={dir} position={dir === 'rtl' ? 'top-left' : 'top-right'} richColors closeButton />
}

function Directional({ children }: { children: React.ReactNode }) {
  const { dir } = useI18n()

  return <DirectionProvider dir={dir}>{children}</DirectionProvider>
}

/** Synchronise le token de session avec le client HTTP */
function ApiTokenSync() {
  const { data } = useSession()
  // Synchrone : le token doit être en place avant les premières requêtes des pages
  setApiToken(data?.apiToken)
  // Rafraîchit le token API tant que l'utilisateur est actif
  useSessionKeepAlive()

  useEffect(() => {
    let done = false
    setUnauthorizedHandler(() => {
      if (done) return
      done = true
      closeSocket()
      signOut({ callbackUrl: '/login?expired=1' })
    })
  }, [])

  return null
}

export default function Providers({ children, session, locale }: { children: React.ReactNode; session?: Session | null; locale: Locale }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 15_000,
            refetchOnWindowFocus: false,
            retry: (count, err: any) => (err?.status && err.status < 500 ? false : count < 2)
          }
        }
      })
  )

  return (
    <I18nProvider initialLocale={locale}>
    <Directional>
    <SessionProvider session={session} refetchOnWindowFocus={false}>
      <ApiTokenSync />
      <QueryClientProvider client={queryClient}>
        <AbilityProvider>
          <TooltipProvider delayDuration={200}>
            {children}
            <LocalizedToaster />
          </TooltipProvider>
        </AbilityProvider>
      </QueryClientProvider>
    </SessionProvider>
    </Directional>
    </I18nProvider>
  )
}
