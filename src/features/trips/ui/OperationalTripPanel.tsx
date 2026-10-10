import type { Bus } from '@/features/buses/domain/bus'
import type { BusLayout } from '@/features/buses/domain/bus-layout'
import type { Trip } from '@/features/trips/domain/trip'
import { formatDateTime } from '@/shared/lib/date-time'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'

interface OperationalTripPanelProps {
  trip: Trip
  bus: Bus
  layout: BusLayout
  pendingAction: 'start' | 'complete' | null
  error: string | null
  onStart: () => void
  onComplete: () => void
  onExit: () => void
}

export function OperationalTripPanel({ trip, bus, layout, pendingAction, error, onStart, onComplete, onExit }: OperationalTripPanelProps) {
  return (
    <Card className="mt-6" padding="md">
      <section aria-label="Viagem operacional" aria-busy={pendingAction !== null}>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="min-w-0 break-words text-lg font-semibold">{trip.origin} → {trip.destination}</h3>
          <span className="rounded-pill border border-primary/20 bg-primary/5 px-2 py-1 text-xs font-semibold text-primary">
            {trip.status === 'ACTIVE' ? 'Em andamento' : 'Planejada'}
          </span>
        </div>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
          <div className="min-w-0"><dt className="text-xs text-subtle">Ônibus</dt><dd className="mt-1 break-words text-muted">{bus.name}</dd></div>
          <div className="min-w-0"><dt className="text-xs text-subtle">Layout</dt><dd className="mt-1 break-words text-muted">{layout.name}</dd></div>
          <div><dt className="text-xs text-subtle">Saída</dt><dd className="mt-1 text-muted"><time dateTime={trip.departureAt}>{formatDateTime(trip.departureAt)}</time></dd></div>
          {trip.arrivalEstimateAt && <div><dt className="text-xs text-subtle">Chegada estimada</dt><dd className="mt-1 text-muted"><time dateTime={trip.arrivalEstimateAt}>{formatDateTime(trip.arrivalEstimateAt)}</time></dd></div>}
        </dl>
        <div className="mt-5 flex flex-wrap gap-2 sm:justify-end">
          <Button variant="ghost" disabled={pendingAction !== null} onClick={onExit}>Sair da viagem</Button>
          {trip.status === 'PLANNED' && <Button className="flex-1 sm:flex-none" disabled={pendingAction !== null} onClick={onStart}>
            {pendingAction === 'start' ? 'Iniciando...' : 'Iniciar viagem'}
          </Button>}
          {trip.status === 'ACTIVE' && <Button className="flex-1 sm:flex-none" disabled={pendingAction !== null} onClick={onComplete}>
            {pendingAction === 'complete' ? 'Concluindo...' : 'Concluir viagem'}
          </Button>}
        </div>
        {error && <p role="alert" className="mt-4 rounded-control border border-danger/20 bg-danger/10 px-3 py-2.5 text-sm text-danger">{error}</p>}
      </section>
    </Card>
  )
}
