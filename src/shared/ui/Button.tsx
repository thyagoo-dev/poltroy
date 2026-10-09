import type { ButtonHTMLAttributes } from 'react'

import { cn } from '@/shared/lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-on-primary shadow-control hover:bg-primary-hover active:bg-primary-pressed',

  secondary:
    'border border-border bg-surface-raised text-foreground shadow-soft hover:border-border-strong hover:bg-surface-soft',

  ghost:
    'bg-transparent text-muted hover:bg-surface-soft hover:text-foreground',

  danger:
    'border border-danger/20 bg-danger/10 text-danger hover:bg-danger/15',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-10 px-3.5 text-sm',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-5 text-base',
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  type,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type ?? 'button'}
      className={cn(
        'inline-flex items-center justify-center gap-2',
        'rounded-control font-semibold tracking-[-0.01em]',
        'transition-[background-color,border-color,color,box-shadow,transform]',
        'duration-150 ease-out',
        'focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-primary/55',
        'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'active:translate-y-px',
        'disabled:pointer-events-none disabled:opacity-45',
        'motion-reduce:transition-none motion-reduce:active:translate-y-0',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    />
  )
}
