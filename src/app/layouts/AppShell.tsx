import { useEffect, useRef, useState } from 'react'
import {
  BusFront,
  Circle,
  ChevronRight,
} from 'lucide-react'
import {
  Link,
  Outlet,
  useLocation,
} from 'react-router'

import { useActiveBus } from '@/app/hooks/use-active-bus'
import { getShellBusContext } from '@/app/layouts/shell-route-context'
import {
  DesktopNavigation,
  MobileNavigation,
} from '@/app/navigation/AppNavigation'
import { getPassengerTitleId, getRoutePresentation } from '@/app/layouts/route-presentation'
import { getPassengerAction } from '@/app/services/passenger-actions'
import type { PassengerId } from '@/features/passengers/domain/ids'
import { OfflineStatus } from '@/app/pwa/OfflineStatus'
import { PwaUpdatePrompt } from '@/app/pwa/PwaUpdatePrompt'

export function AppShell() {
  const location = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [passengerTitle, setPassengerTitle] = useState<{ pathname: string; name: string } | null>(null)

  const {
    activeBus,
    isLoading,
  } = useActiveBus()

  const { sectionTitle: currentPageTitle, documentTitle } = getRoutePresentation(location.pathname,
    passengerTitle?.pathname === location.pathname ? passengerTitle.name : undefined)

  const busContext = getShellBusContext(location.pathname)

  useEffect(() => {
    document.title = documentTitle
  }, [documentTitle])

  useEffect(() => {
    const id = getPassengerTitleId(location.pathname)
    if (!id) return
    let cancelled = false
    void getPassengerAction(id as PassengerId).then((passenger) => {
      if (!cancelled) setPassengerTitle({ pathname: location.pathname, name: passenger?.name ?? 'Passageiro não encontrado' })
    }).catch(() => {
      if (!cancelled) setPassengerTitle({ pathname: location.pathname, name: 'Cadastro do passageiro' })
    })
    return () => { cancelled = true }
  }, [location.pathname])

  useEffect(() => {
    window.scrollTo(0, 0)
    // Preserve intentional field autofocus and the existing asynchronous page focus.
    if (mainRef.current?.contains(document.activeElement) && document.activeElement !== mainRef.current) return
    const target = mainRef.current?.querySelector<HTMLElement>('h2[tabindex="-1"]') ?? headingRef.current
    target?.focus({ preventScroll: true })
  }, [location.pathname, location.key])

  const activeBusLabel =
    isLoading
      ? 'Carregando...'
      : activeBus?.name ??
        'Nenhum ônibus'

  const busContextClassName = `
    flex min-h-11 min-w-0 flex-1 max-w-[13rem]
    items-center gap-2.5 rounded-pill border border-border
    bg-surface px-3 py-2 shadow-soft sm:max-w-[18rem]
  `
  const busContextContent = <>
    <BusFront aria-hidden="true" className={activeBus ? 'shrink-0 text-primary' : 'shrink-0 text-subtle'} size={17} strokeWidth={1.8} />
    {busContext === 'indicator' && <span className="sr-only">Ônibus selecionado: </span>}
    <span className="min-w-0 flex-1 truncate text-xs font-medium text-muted">{activeBusLabel}</span>
    {busContext === 'link' && <ChevronRight aria-hidden="true" className="shrink-0 text-subtle" size={14} />}
  </>

  return (
    <div
      className="
        min-h-dvh
        bg-background text-foreground
        lg:grid
        lg:grid-cols-[15.5rem_minmax(0,1fr)]
      "
    >
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[var(--poltroy-z-toast)] focus:rounded-control focus:bg-surface focus:px-4 focus:py-3 focus:font-semibold focus:text-primary focus:shadow-raised"
        onClick={(event) => { event.preventDefault(); mainRef.current?.focus(); mainRef.current?.scrollIntoView({ block: 'start' }) }}>
        Pular para o conteúdo
      </a>
      <aside
        aria-label="Área de navegação"
        className="
          hidden
          border-r border-border
          bg-surface
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
            <p className="font-bold tracking-[-0.02em] text-primary">
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
            bg-surface
            pt-[env(safe-area-inset-top)]
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
            <div className="min-w-0">
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
                ref={headingRef} tabIndex={-1}
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

            {busContext === 'link' && <Link
              to="/buses"
              className={`${busContextClassName}
                transition-[border-color,background-color]
                hover:border-border-strong
                hover:bg-surface-raised
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-primary
              `}
              aria-label={`Gerenciar ônibus. Selecionado: ${activeBusLabel}`}
              title={activeBusLabel}
            >
              {busContextContent}
            </Link>}
            {busContext === 'indicator' && <div className={busContextClassName} title={activeBusLabel}>
              {busContextContent}
            </div>}
          </div>
        </header>

        <main
          id="main-content" ref={mainRef} tabIndex={-1}
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
