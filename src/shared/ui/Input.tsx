import type { InputHTMLAttributes } from 'react'

import { cn } from '@/shared/lib/cn'

export type InputProps = InputHTMLAttributes<HTMLInputElement>

export function Input({
  className,
  ...props
}: InputProps) {
  return (
    <input
      className={cn(
        'min-h-11 min-w-0 w-full max-w-full',
        'rounded-control',
        'border border-border',
        'bg-surface-raised',
        'px-3.5',
        'text-sm text-foreground',
        'outline-none',
        'placeholder:text-subtle',
        'transition-[border-color,box-shadow]',
        'focus:border-primary/60',
        'focus:ring-2 focus:ring-primary/15',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-[invalid=true]:border-danger/60',
        'aria-[invalid=true]:ring-danger/10',
        className,
      )}
      {...props}
    />
  )
}
