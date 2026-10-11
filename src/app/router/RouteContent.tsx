import { useEffect, type RefObject } from 'react'
import { Outlet, useLocation } from 'react-router'

interface RouteContentProps {
  mainRef: RefObject<HTMLElement | null>
  headingRef: RefObject<HTMLHeadingElement | null>
}

export function RouteContent({ mainRef, headingRef }: RouteContentProps) {
  const { pathname, key } = useLocation()

  // Run after the route has committed, rather than while its chunk is loading.
  useEffect(() => {
    window.scrollTo(0, 0)
    // Preserve intentional field autofocus and the existing asynchronous page focus.
    if (mainRef.current?.contains(document.activeElement) && document.activeElement !== mainRef.current) return
    const target = mainRef.current?.querySelector<HTMLElement>('h2[tabindex="-1"]') ?? headingRef.current
    target?.focus({ preventScroll: true })
  }, [pathname, key, mainRef, headingRef])

  return <Outlet />
}
