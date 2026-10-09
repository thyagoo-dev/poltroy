import type { ButtonHTMLAttributes } from 'react'

import { cn } from '@/shared/lib/cn'

type IconButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'

type IconButtonSize = 'sm' | 'md' | 'lg'

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  'aria-label': string

  variant?: IconButtonVariant
  size?: IconButtonSize
}

const variantClasses: Record<IconButtonVariant, string> = {
  primary:
    'bg-primary text-on-primary shadow-control hover:bg-primary-hover active:bg-primary-pressed',

  secondary:
    'border border-border bg-surface-raised text-foreground shadow-soft hover:border-border-strong hover:bg-surface-soft',

  ghost:
    'bg-transparent text-muted hover:bg-surface-soft hover:text-foreground',

  danger:
    'border border-danger/20 bg-danger/10 text-danger hover:bg-danger/15',
}

const sizeClasses: Record<IconButtonSize, string> = {
  sm: 'size-10',
  md: 'size-11',
  lg: 'size-12',
}

export function IconButton({
  className,
  variant = 'secondary',
  size = 'md',
  type,
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type ?? 'button'}
      className={cn(
        'inline-flex shrink-0 items-center justify-center',
        'rounded-control',
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
        className,
      )}
      {...props}
    />
  )
}
