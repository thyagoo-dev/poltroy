import { NavLink } from 'react-router'

import { navigationItems } from '@/app/navigation/navigation-items'
import { cn } from '@/shared/lib/cn'

export function DesktopNavigation() {
  return (
    <nav
      aria-label="Navegação principal"
      className="flex flex-col gap-1.5"
    >
      {navigationItems.map((item) => {
        const Icon = item.icon

        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'group flex min-h-11 items-center gap-3',
                'rounded-control px-3.5',
                'text-sm font-medium',
                'transition-[background-color,color]',
                'duration-150 ease-out',
                'focus-visible:outline-none',
                'focus-visible:ring-2 focus-visible:ring-primary/55',
                'motion-reduce:transition-none',
                isActive
                  ? 'bg-primary/10 text-primary!'
                  : 'text-muted! hover:bg-surface-soft hover:text-foreground!',
              )
            }
          >
            <Icon
              aria-hidden="true"
              size={20}
              strokeWidth={1.8}
            />

            <span>{item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}

export function MobileNavigation() {
  return (
    <nav
      aria-label="Navegação principal"
      className="
        fixed inset-x-0 bottom-0 z-[var(--poltroy-z-sticky)]
        border-t border-border
        bg-background/95
        px-2 pt-2
        pb-[calc(0.5rem+env(safe-area-inset-bottom))]
        backdrop-blur-xl
        lg:hidden
      "
    >
      <div className="mx-auto grid max-w-lg grid-cols-4 gap-1">
        {navigationItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex min-h-14 flex-col items-center justify-center',
                  'gap-1 rounded-control px-2',
                  'text-[0.6875rem] font-semibold',
                  'transition-[background-color,color]',
                  'duration-150 ease-out',
                  'focus-visible:outline-none',
                  'focus-visible:ring-2 focus-visible:ring-primary/55',
                  'motion-reduce:transition-none',
                  isActive
                    ? 'bg-primary/10 text-primary!'
                    : 'text-muted! hover:bg-surface-soft hover:text-foreground!',
                )
              }
            >
              <Icon
                aria-hidden="true"
                size={21}
                strokeWidth={1.9}
              />

              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
