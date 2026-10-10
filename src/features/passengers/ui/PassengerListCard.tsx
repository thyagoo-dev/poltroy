import { Armchair, BusFront, IdCard, Phone } from 'lucide-react'
import { Link } from 'react-router'

import type { Passenger } from '@/features/passengers/domain/passenger'
import { resolvePassengerDisplayName } from '@/features/passengers/domain/passenger-display-name'
import { maskPassengerDocument } from '@/features/passengers/ui/mask-passenger-document'
import type { PassengerOperationalAssignment } from '@/features/trips/application/list-passenger-operational-assignments'
import { Card } from '@/shared/ui/Card'

export function PassengerListCard({ passenger, assignment }: { passenger: Passenger; assignment?: PassengerOperationalAssignment }) {
  const displayName = resolvePassengerDisplayName(passenger)
  const document = maskPassengerDocument(passenger.documentType, passenger.documentNumber)
  return (
    <Card padding="md" className="flex h-full flex-col">
      <h3 className="break-words font-semibold">{passenger.name}</h3>
      <span className="mt-2 inline-flex max-w-full self-start items-center gap-1.5 rounded-pill border border-primary/10 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary">
        <Armchair aria-hidden="true" size={14} className="shrink-0" /><span className="sr-only">Nome exibido no mapa: </span><span className="break-words">{displayName}</span>
      </span>
      {(passenger.phone || document) && <div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted">
        {passenger.phone && <span className="inline-flex min-w-0 max-w-full items-center gap-1"><Phone aria-hidden="true" size={14} className="shrink-0" /><span className="min-w-0 break-words">{passenger.phone}</span></span>}
        {passenger.phone && document && <span aria-hidden="true">·</span>}
        {document && <span className="inline-flex min-w-0 max-w-full items-center gap-1"><IdCard aria-hidden="true" size={14} className="shrink-0" /><span className="min-w-0 break-words">{passenger.documentType} {document}</span></span>}
      </div>}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-2 gap-y-2">
        {assignment && <span className="inline-flex min-w-0 max-w-full items-center gap-1 text-xs text-muted">
          <BusFront aria-hidden="true" size={14} className="shrink-0" />
          <span className="min-w-0 truncate" title={assignment.busName}>{assignment.busName}</span>
          <span className="min-w-0">· Assento {assignment.seatNumber}</span>
        </span>}
        <Link to={`/passengers/${encodeURIComponent(passenger.id)}`} aria-label={`Ver detalhes de ${passenger.name}`}
          className="ml-auto inline-flex min-h-11 max-w-full items-center justify-center rounded-control border border-border bg-surface-raised px-3 py-2 text-xs font-semibold text-foreground! shadow-soft hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">Ver passageiro</Link>
      </div>
    </Card>
  )
}
