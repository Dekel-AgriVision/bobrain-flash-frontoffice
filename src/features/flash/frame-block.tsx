'use client'

import { Copy } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useT } from '@/i18n/provider'
import { tr } from '@/i18n/translate'

export function FrameBlock({ frame }: { frame?: string }) {
  const t = useT()
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{t('Trame brute')}</CardTitle>
          <CardDescription>{t('Chaîne reçue de l’indicateur de pesée')}</CardDescription>
        </div>
        <Button
          variant='ghost'
          size='icon'
          disabled={!frame}
          onClick={() => frame && navigator.clipboard?.writeText(frame).then(() => toast.success(tr('Trame copiée')))}
        >
          <Copy />
        </Button>
      </CardHeader>
      <CardContent>
        <pre className='whitespace-pre-wrap break-all rounded-md bg-[#0F1F14] p-4 font-mono text-[0.8rem] text-[#CFE8C4]'>{frame || `— ${t('aucune trame')} —`}</pre>
      </CardContent>
    </Card>
  )
}
