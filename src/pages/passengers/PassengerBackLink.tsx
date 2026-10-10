import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'

interface PassengerBackLinkProps {
  to?: string
  children?: string
}

export function PassengerBackLink({ to = '/passengers', children = 'Passageiros' }: PassengerBackLinkProps) {
  return (
    <Link to={to} className="mb-4 inline-flex min-h-11 max-w-full items-center gap-2 rounded-control px-2 text-sm font-semibold text-primary! hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
      <ArrowLeft aria-hidden="true" className="shrink-0" size={17} />
      <span className="min-w-0 break-words">{children}</span>
    </Link>
  )
}
