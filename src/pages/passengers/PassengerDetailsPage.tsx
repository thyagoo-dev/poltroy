import { Pencil } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link, useLocation, useParams } from 'react-router'

import { resolvePassengerDisplayName } from '@/features/passengers/domain/passenger-display-name'
import { formatCpf } from '@/features/passengers/domain/passenger-document'
import { PassengerBackLink } from '@/pages/passengers/PassengerBackLink'
import { PassengerLoadState } from '@/pages/passengers/PassengerLoadState'
import { usePassenger } from '@/pages/passengers/use-passenger'
import { Card } from '@/shared/ui/Card'

export function PassengerDetailsPage() {
  const { passengerId } = useParams()
  const result = usePassenger(passengerId)
  const heading = useRef<HTMLHeadingElement>(null)
  const location = useLocation()
  const passenger = result.passenger
  useEffect(() => {
    if (passenger) {
      window.scrollTo(0, 0)
      heading.current?.focus({ preventScroll: true })
    }
  }, [passenger])

  if (result.status !== 'ready') return <PassengerLoadState status={result.status} />
  const feedback = location.state?.passengerFeedback
  const displayName = resolvePassengerDisplayName(result.passenger)

  return (
    <div className="mx-auto w-full max-w-3xl">
      <PassengerBackLink />
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">Pessoas</p>
      <h2 ref={heading} tabIndex={-1} className="mt-2 break-words text-2xl font-bold tracking-[-0.035em] focus-visible:rounded-control focus-visible:outline-2 focus-visible:outline-primary sm:text-3xl">{result.passenger.name}</h2>
      <p className="mt-2 break-words text-sm text-muted">No mapa: {displayName}</p>
      {(feedback === 'created' || feedback === 'updated') && <p role="status" className="mt-4 text-sm text-success">{feedback === 'created' ? 'Passageiro criado com sucesso.' : 'Passageiro atualizado.'}</p>}
      <Link to={`/passengers/${encodeURIComponent(result.passenger.id)}/edit`} className="mt-5 inline-flex min-h-11 max-w-full items-center justify-center gap-2 rounded-control bg-primary px-4 py-2 text-sm font-semibold text-on-primary! shadow-control hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">
        <Pencil aria-hidden="true" className="shrink-0" size={17} />Editar passageiro
      </Link>
      <Card className="mt-6" padding="lg">
        <dl className="grid min-w-0 gap-6 sm:grid-cols-2">
          <div className="min-w-0 sm:col-span-2"><dt className="text-sm font-semibold text-muted">Nome completo</dt><dd className="mt-1 break-words leading-7">{result.passenger.name}</dd></div>
          <div className="min-w-0"><dt className="text-sm font-semibold text-muted">Nome de exibição</dt><dd className="mt-1 break-words leading-7">{displayName}</dd></div>
          {result.passenger.phone && <div className="min-w-0"><dt className="text-sm font-semibold text-muted">Telefone</dt><dd className="mt-1 break-words leading-7">{result.passenger.phone}</dd></div>}
          {result.passenger.documentType && result.passenger.documentNumber && <div className="min-w-0"><dt className="text-sm font-semibold text-muted">{result.passenger.documentType}</dt><dd className="mt-1 break-words leading-7">{result.passenger.documentType === 'CPF' ? formatCpf(result.passenger.documentNumber) : result.passenger.documentNumber}</dd></div>}
          {result.passenger.notes && <div className="min-w-0 sm:col-span-2"><dt className="text-sm font-semibold text-muted">Observações</dt><dd className="mt-1 whitespace-pre-wrap break-words leading-7">{result.passenger.notes}</dd></div>}
        </dl>
      </Card>
    </div>
  )
}
