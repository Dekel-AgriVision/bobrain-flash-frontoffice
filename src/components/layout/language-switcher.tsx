'use client'

import { Check, Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { LOCALE_LABELS, LOCALE_SHORT, LOCALES } from '@/i18n/config'
import { useI18n } from '@/i18n/provider'
import { cn } from '@/lib/utils'

/** Sélecteur de langue (français par défaut, anglais, hébreu en écriture de droite à gauche) */
export function LanguageSwitcher({ className, variant = 'ghost' }: { className?: string; variant?: 'ghost' | 'outline' }) {
  const { locale, setLocale, t } = useI18n()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size='sm' className={cn('gap-1.5', className)} aria-label={t('Langue')}>
          <Languages className='size-4' />
          <span className='text-xs font-semibold'>{LOCALE_SHORT[locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-44'>
        <DropdownMenuLabel>{t('Langue')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {LOCALES.map(l => (
          <DropdownMenuItem key={l} onSelect={() => setLocale(l)} dir={l === 'he' ? 'rtl' : 'ltr'}>
            <span className='flex-1'>{LOCALE_LABELS[l]}</span>
            {locale === l && <Check className='text-primary' />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
