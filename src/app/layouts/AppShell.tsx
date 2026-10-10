import { useEffect } from 'react'
import {
  BusFront,
  Circle,
  ChevronDown,
} from 'lucide-react'
import {
  Link,
  Outlet,
  useLocation,
} from 'react-router'

import { useActiveBus } from '@/app/hooks/use-active-bus'
import {
  DesktopNavigation,
  MobileNavigation,
} from '@/app/navigation/AppNavigation'
import { navigationItems } from '@/app/navigation/navigation-items'
import { OfflineStatus } from '@/app/pwa/OfflineStatus'
import { PwaUpdatePrompt } from '@/app/pwa/PwaUpdatePrompt'

function getCurrentPageTitle(
  pathname: string,
) {
  if (
    pathname === '/buses' ||
    pathname.startsWith(
      '/buses/',
    )
  ) {
    return 'Ônibus'
  }

  const currentNavigationItem =
    navigationItems.find(
      (item) => {
        if (item.end) {
          return (
            pathname ===
            item.path
          )
        }

        return (
          pathname ===
            item.path ||
          pathname.startsWith(
            `${item.path}/`,
          )
        )
      },
    )

  return (
    currentNavigationItem?.label ??
    'Poltroy'
  )
}

export function AppShell() {
  const location = useLocation()

  const {
    activeBus,
    isLoading,
  } = useActiveBus()

  const currentPageTitle =
    getCurrentPageTitle(
      location.pathname,
    )

  useEffect(() => {
    document.title =
      currentPageTitle === 'Mapa'
        ? 'Poltroy'
        : `${currentPageTitle} · Poltroy`
  }, [currentPageTitle])

  const activeBusLabel =
    isLoading
      ? 'Carregando...'
      : activeBus?.name ??
        'Nenhum ônibus'

  return (
    <div
      className="
        min-h-dvh
        bg-background text-foreground
        lg:grid
        lg:grid-cols-[15.5rem_minmax(0,1fr)]
      "
    >
      <aside
        className="
          hidden
          border-r border-border
          bg-surface/55
          lg:sticky lg:top-0 lg:flex lg:h-dvh
          lg:flex-col lg:overflow-y-auto
          pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]
        "
      >
        <div className="flex min-h-20 shrink-0 items-center gap-3 px-5">
          <div
            className="
              flex size-10 shrink-0 items-center justify-center
              rounded-control
              border border-primary/15
              bg-primary/10
              text-primary
            "
          >
            <BusFront
              aria-hidden="true"
              size={21}
              strokeWidth={1.9}
            />
          </div>

          <div className="min-w-0">
            <p className="font-bold tracking-[-0.02em]">
              Poltroy
            </p>

            <p className="text-xs text-subtle">
              Controle de viagens
            </p>
          </div>
        </div>

        <div className="px-3">
          <DesktopNavigation />
        </div>

        <div className="mt-auto p-4">
          <div
            className="
              rounded-control
              border border-border/80
              bg-surface
              p-3.5
            "
          >
            <div className="flex items-center gap-2">
              <Circle
                aria-hidden="true"
                className="fill-success text-success"
                size={8}
              />

              <span className="text-xs font-semibold text-foreground">
                Local-first
              </span>
            </div>

            <p className="mt-1.5 text-xs leading-5 text-subtle">
              Preparado para funcionar mesmo com conexão instável.
            </p>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header
          className="
            sticky top-0 z-[var(--poltroy-z-sticky)]
            border-b border-border
            bg-background/90
            pt-[env(safe-area-inset-top)]
            backdrop-blur-xl
          "
        >
          <div
            className="
              mx-auto flex min-h-[var(--poltroy-shell-header-height)]
              w-full max-w-[100rem]
              items-center justify-between
              gap-3
              px-[var(--poltroy-space-page-inline)]
            "
          >
            <div className="min-w-0 shrink-0">
              <p
                className="
                  text-[0.6875rem] font-bold
                  tracking-[0.16em]
                  text-primary
                  lg:hidden
                "
              >
                POLTROY
              </p>

              <h1
                className="
                  truncate
                  text-lg font-semibold
                  tracking-[-0.025em]
                  text-foreground
                  lg:text-xl
                "
              >
                {currentPageTitle}
              </h1>
            </div>

            <Link
              to="/buses"
              className="
                flex min-h-11 min-w-0 flex-1
                max-w-[13rem]
                items-center gap-2.5
                rounded-pill
                border border-border
                bg-surface
                px-3 py-2
                shadow-soft
                transition-[border-color,background-color]
                hover:border-border-strong
                hover:bg-surface-raised
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-primary/55
                sm:max-w-[18rem]
              "
              aria-label={`Gerenciar ônibus. Selecionado: ${activeBusLabel}`}
              title={activeBusLabel}
            >
              <BusFront
                aria-hidden="true"
                className={
                  activeBus
                    ? 'shrink-0 text-primary'
                    : 'shrink-0 text-subtle'
                }
                size={17}
                strokeWidth={1.8}
              />

              <span
                className="
                  min-w-0 flex-1
                  truncate
                  text-xs font-medium
                  text-muted
                "
              >
                {activeBusLabel}
              </span>

              <ChevronDown
                aria-hidden="true"
                className="shrink-0 text-subtle"
                size={14}
              />
            </Link>
          </div>
        </header>

        <main
          className="
            mx-auto
            min-h-[calc(100dvh-var(--poltroy-shell-header-height))]
            w-full max-w-[100rem]
            px-[var(--poltroy-space-page-inline)]
            py-[var(--poltroy-space-page-block)]
            pb-[calc(var(--poltroy-mobile-nav-clearance)+env(safe-area-inset-bottom))]
            lg:pb-[var(--poltroy-space-page-block)]
          "
        >
          <OfflineStatus />
          <PwaUpdatePrompt />
          <Outlet />
        </main>

        <MobileNavigation />
      </div>
    </div>
  )
}
