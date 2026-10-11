import { Armchair } from 'lucide-react'
import type { LayoutElementPlacement } from '@/features/seat-map/domain/layout-engine'
import type { HistoricalSeat } from '@/features/trips/application/trip-history'
import { resolveSeatStatus } from '@/features/trips/domain/trip-seat-state'
import { seatStatusVisuals } from '@/features/trips/ui/seat-status-visuals'
import { cn } from '@/shared/lib/cn'

export function HistoricalSeatView({ placement, entry }: { placement: LayoutElementPlacement; entry?: HistoricalSeat }) {
  if (placement.element.kind !== 'seat') return null
  const status = resolveSeatStatus(entry?.state)
  const visual = seatStatusVisuals[status]
  const StatusIcon = visual.icon
  const missingPassenger = (status === 'OCCUPIED' || status === 'RESERVED') && entry?.state?.passengerId && !entry.passenger
  const name = entry?.passenger?.name ?? (missingPassenger ? 'Passageiro não encontrado' : '')
  return (
    <div style={{ gridRow: `${placement.row} / span ${placement.rowSpan}`, gridColumn: `${placement.column} / span ${placement.columnSpan}` }}
      className={cn('relative flex min-h-11 min-w-11 flex-col justify-center gap-1 overflow-hidden rounded-control border px-0.5', visual.className)}>
      <span className="sr-only">Poltrona {placement.element.seatNumber}, {visual.label}{name ? `, ${name}` : ''}.</span>
      <span aria-hidden="true" className="flex items-center justify-between gap-1">
        <Armchair className="shrink-0" size={14} /><span className="flex items-center gap-0.5"><StatusIcon size={10} /><span className="text-sm font-bold text-foreground">{placement.element.seatNumber}</span></span>
      </span>
      <span aria-hidden="true" className="block min-w-0 truncate text-[0.6875rem] font-medium leading-4 text-foreground">
        {entry?.passenger?.displayName ?? (missingPassenger ? 'Não encontrado' : visual.label)}
      </span>
    </div>
  )
}
