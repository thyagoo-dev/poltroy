import { MoreHorizontal } from 'lucide-react'
import { useMemo } from 'react'

import type { BusLayout } from '@/features/buses/domain/bus-layout'
import { summarizeOperationalSeats } from '@/features/trips/domain/operational-seat-summary'
import type { Trip } from '@/features/trips/domain/trip'
import type { TripSeatState } from '@/features/trips/domain/trip-seat-state'
import { formatOperationalOccupancy } from '@/features/trips/ui/format-operational-occupancy'
import { Button } from '@/shared/ui/Button'

interface OperationalTripSummaryProps {
  trip: Trip
  layout: BusLayout
  states: readonly TripSeatState[]
  actionsOpen: boolean
  onOpenActions: () => void
}

export function OperationalTripSummary({ trip, layout, states, actionsOpen, onOpenActions }: OperationalTripSummaryProps) {
  const summary = useMemo(() => summarizeOperationalSeats(layout, states), [layout, states])
  const route = `${trip.origin} → ${trip.destination}`

  return (
    <section aria-label="Viagem operacional" className="rounded-control border border-border bg-surface px-3 py-2">
      <div className="flex min-w-0 items-center gap-2">
        <p title={route} className="min-w-0 flex-1 truncate font-semibold">{route}</p>
        <span className="shrink-0 rounded-pill border border-primary/20 bg-primary/5 px-2 py-1 text-xs font-semibold text-primary">
          {trip.status === 'ACTIVE' ? 'Em andamento' : 'Planejada'}
        </span>
        <Button variant="ghost" className="size-11 shrink-0 p-0!" aria-label={`Ações da viagem ${trip.origin} para ${trip.destination}`}
          aria-haspopup="dialog" aria-expanded={actionsOpen} onClick={onOpenActions}>
          <MoreHorizontal aria-hidden="true" size={20} />
        </Button>
      </div>
      <p className="text-xs leading-5 text-muted">{formatOperationalOccupancy(summary)}</p>
    </section>
  )
}
