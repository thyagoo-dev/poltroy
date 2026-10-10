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
                'focus-visible:ring-2 focus-visible:ring-primary',
                'motion-reduce:transition-none',
                isActive
                  ? 'bg-primary/5 text-primary!'
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
        fixed left-1/2 -translate-x-1/2
        bottom-[calc(1rem+env(safe-area-inset-bottom))]
        z-[var(--poltroy-z-sticky)]
        w-[calc(100%-2rem)] max-w-[27.5rem]
        rounded-pill border border-border
        bg-surface-raised p-2 shadow-raised
        lg:hidden
      "
    >
      <div className="flex items-center justify-between">
        {navigationItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              aria-label={item.label}
              className={({ isActive }) =>
                cn(
                  'flex min-h-11 min-w-11 shrink-0 items-center justify-center',
                  'rounded-pill text-sm font-semibold',
                  'transition-[background-color,color,padding,gap]',
                  'duration-[var(--poltroy-duration-slow)] ease-[var(--poltroy-ease-standard)]',
                  'focus-visible:outline-none',
                  'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised',
                  'motion-reduce:transition-none',
                  isActive
                    ? 'gap-2 bg-primary px-3 text-on-primary! shadow-control'
                    : 'gap-0 px-2 text-muted! hover:bg-surface-soft hover:text-foreground!',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    aria-hidden="true"
                    className="shrink-0"
                    size={21}
                    strokeWidth={1.9}
                  />

                  <span
                    aria-hidden="true"
                    className={cn(
                      'overflow-hidden whitespace-nowrap',
                      'transition-[max-width,opacity]',
                      'duration-[var(--poltroy-duration-slow)] ease-[var(--poltroy-ease-standard)]',
                      'motion-reduce:transition-none',
                      isActive ? 'max-w-28 opacity-100' : 'max-w-0 opacity-0',
                    )}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
