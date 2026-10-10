import type { HTMLAttributes } from 'react'

import { cn } from '@/shared/lib/cn'

type CardVariant = 'default' | 'raised' | 'soft'

type CardPadding = 'none' | 'sm' | 'md' | 'lg'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  padding?: CardPadding
}

const variantClasses: Record<CardVariant, string> = {
  default:
    'border border-border bg-surface shadow-soft',

  raised:
    'border border-border-strong bg-surface-raised shadow-raised',

  soft:
    'border border-border/70 bg-surface-soft/70',
}

const paddingClasses: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6 sm:p-7',
}

export function Card({
  className,
  variant = 'default',
  padding = 'md',
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'min-w-0 rounded-card [overflow-wrap:anywhere]',
        variantClasses[variant],
        paddingClasses[padding],
        className,
      )}
      {...props}
    />
  )
}
