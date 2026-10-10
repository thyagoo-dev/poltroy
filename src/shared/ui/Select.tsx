import type { SelectHTMLAttributes } from 'react'

import { cn } from '@/shared/lib/cn'

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>

export function Select({
  className,
  ...props
}: SelectProps) {
  return (
    <select
      className={cn(
        'min-h-11 min-w-0 w-full max-w-full truncate',
        'rounded-control',
        'border border-border',
        'bg-surface-raised',
        'px-3.5',
        'text-sm text-foreground',
        'outline-none',
        'transition-[border-color,box-shadow]',
        'focus:border-primary/60',
        'focus:ring-2 focus:ring-primary/15',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}
