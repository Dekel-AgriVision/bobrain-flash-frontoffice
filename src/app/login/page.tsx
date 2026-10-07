import { Suspense } from 'react'
import type { Metadata } from 'next'
import LoginForm from './login-form'
import { LanguageSwitcher } from '@/components/layout/language-switcher'
import { getT } from '@/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()

  return { title: t('Connexion') }
}

export default async function LoginPage() {
  const t = await getT()

  return (
    <div className='grid min-h-screen lg:grid-cols-[1.1fr_1fr]'>
      <div className='relative hidden flex-col justify-between overflow-hidden bg-sidebar p-10 text-white lg:flex'>
        <div className='absolute -end-24 -top-24 size-96 rounded-full bg-agri-500/10' />
        <div className='absolute -bottom-32 -start-20 size-[28rem] rounded-full bg-white/5' />
        <div className='relative flex items-center gap-3'>
          <div className='rounded-lg bg-white p-1.5'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src='/logo.png' alt='Brain' className='h-8 w-auto' />
          </div>
          <span className='text-lg font-bold'>Brain Flash</span>
        </div>
        <div className='relative max-w-md'>
          <h1 className='text-3xl font-bold leading-tight'>{t('Supervision en temps réel des ponts bascules')}</h1>
          <p className='mt-4 text-sidebar-foreground/80'>
            {t('Suivez les pesées de chaque station, détectez les coupures et retrouvez l’historique complet des événements.')}
          </p>
          <div className='mt-8 grid grid-cols-3 gap-4 text-sm'>
            {[
              ['Temps réel', 'Flux Socket.IO'],
              ['Audit', 'Historique complet'],
              ['Alertes', 'Stations muettes']
            ].map(([title, d]) => (
              <div key={title} className='rounded-lg border border-white/10 bg-white/5 p-3'>
                <p className='font-semibold'>{t(title)}</p>
                <p className='text-xs text-sidebar-muted'>{t(d)}</p>
              </div>
            ))}
          </div>
        </div>
        <p className='relative text-xs text-sidebar-muted'>{t('DekelOil · groupe Dekel Agri-Vision')}</p>
      </div>
      <div className='relative flex items-center justify-center p-6'>
        <div className='absolute end-4 top-4'>
          <LanguageSwitcher variant='outline' />
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
