import { ArrowLeft } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link } from 'react-router'

interface MorePageHeaderProps {
  title: string
  description: string
  showBack?: boolean
}

export function MorePageHeader({ title, description, showBack = true }: MorePageHeaderProps) {
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    window.scrollTo(0, 0)
    heading.current?.focus({ preventScroll: true })
  }, [title])

  return (
    <>
      {showBack && <Link to="/more" className="mb-4 inline-flex min-h-11 max-w-full items-center gap-2 rounded-control px-2 text-sm font-semibold text-primary! hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        <ArrowLeft aria-hidden="true" className="shrink-0" size={17} />Mais
      </Link>}
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">Sistema</p>
      <h2 ref={heading} tabIndex={-1} className="mt-2 break-words text-2xl font-bold tracking-[-0.035em] focus-visible:rounded-control focus-visible:outline-2 focus-visible:outline-primary sm:text-3xl">{title}</h2>
      <p className="mt-2 max-w-2xl leading-7 text-muted">{description}</p>
    </>
  )
}
