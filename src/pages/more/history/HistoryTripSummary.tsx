import type { HistoricalTrip, TripHistorySummary } from '@/features/trips/application/trip-history'
import { formatOperationalOccupancy } from '@/features/trips/ui/format-operational-occupancy'

export function HistoryStatus({ status }: { status: HistoricalTrip['status'] }) {
  return <span className={`inline-flex w-fit rounded-pill border px-2.5 py-1 text-xs font-semibold ${status === 'COMPLETED' ? 'border-border bg-surface-soft text-muted' : 'border-danger/20 bg-danger/10 text-danger'}`}>{status === 'COMPLETED' ? 'Concluída' : 'Cancelada'}</span>
}

export function HistoryOccupancy({ details }: { details: TripHistorySummary }) {
  return <p className="break-words text-sm leading-6 text-muted">{details.layout
    ? `${formatOperationalOccupancy(details.seatSummary)} · ${details.assignedPassengerCount} ${details.assignedPassengerCount === 1 ? 'passageiro associado' : 'passageiros associados'}`
    : 'Resumo de assentos indisponível sem um layout compatível.'}</p>
}
