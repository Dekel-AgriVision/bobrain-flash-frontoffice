import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold leading-5', {
  variants: {
    tone: {
      success: 'bg-agri-100 text-agri-700',
      warning: 'bg-harvest-100 text-harvest-700',
      error: 'bg-red-50 text-red-700',
      info: 'bg-sky-50 text-sky-700',
      neutral: 'bg-muted text-muted-foreground',
      primary: 'bg-dekel-100 text-dekel-600',
      outline: 'border bg-card text-foreground'
    }
  },
  defaultVariants: { tone: 'neutral' }
})

const DOT: Record<string, string> = {
  success: 'bg-agri-500',
  warning: 'bg-harvest-500',
  error: 'bg-red-500',
  info: 'bg-sky-500',
  neutral: 'bg-slate-400',
  primary: 'bg-dekel-600',
  outline: 'bg-slate-400'
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  dot?: boolean
}

function Badge({ className, tone, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props}>
      {dot && <span className={cn('size-1.5 rounded-full', DOT[tone ?? 'neutral'])} />}
      {children}
    </span>
  )
}

export { Badge, badgeVariants }
