import { Armchair } from 'lucide-react'

import type { LayoutElementPlacement } from '@/features/seat-map/domain/layout-engine'
import type { SeatStatus } from '@/features/trips/domain/trip-seat-state'
import { seatStatusVisuals } from '@/features/trips/ui/seat-status-visuals'
import { cn } from '@/shared/lib/cn'

interface OperationalSeatButtonProps {
  placement: LayoutElementPlacement
  status: SeatStatus
  passengerFullName?: string
  passengerDisplayName?: string
  isSelected?: boolean
  isDimmed?: boolean
  onClick: () => void
}

export function OperationalSeatButton({
  placement,
  status,
  passengerFullName,
  passengerDisplayName,
  isSelected = false,
  isDimmed = false,
  onClick,
}: OperationalSeatButtonProps) {
  const { element } = placement
  if (element.kind !== 'seat') return null

  const visual = seatStatusVisuals[status]
  const StatusIcon = visual.icon
  const relatedPassenger = status === 'OCCUPIED' || status === 'RESERVED' ? passengerFullName : undefined
  const description = {
    FREE: 'livre',
    OCCUPIED: relatedPassenger ? `ocupada por ${relatedPassenger}` : 'ocupada, sem passageiro associado',
    RESERVED: relatedPassenger ? `reservada para ${relatedPassenger}` : 'reservada, sem passageiro associado',
    BLOCKED: 'bloqueada',
  }[status]
  const accessibleName = `Poltrona ${element.seatNumber}, ${description}${isDimmed ? ', fora da busca ou filtro' : ''}`

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={accessibleName}
      aria-haspopup="dialog"
      aria-expanded={isSelected}
      title={accessibleName}
      style={{
        gridRow: `${placement.row} / span ${placement.rowSpan}`,
        gridColumn: `${placement.column} / span ${placement.columnSpan}`,
      }}
      className={cn(
        'flex min-h-11 min-w-11 flex-col justify-center gap-1 overflow-hidden px-0.5',
        'rounded-control border',
        'transition-[border-color,background-color,box-shadow,opacity]',
        isDimmed && 'opacity-75 hover:opacity-100 focus-visible:opacity-100',
        'hover:shadow-control',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        'focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        visual.className,
        isSelected && 'border-primary! opacity-100! ring-2 ring-primary ring-offset-2 ring-offset-surface',
      )}
    >
      <span className="flex items-center justify-between gap-1">
        <Armchair aria-hidden="true" className="shrink-0" size={14} strokeWidth={1.8} />
        <span className="flex items-center gap-0.5">
          <StatusIcon aria-hidden="true" className="shrink-0" size={10} strokeWidth={2.4} />
          <span className="text-sm font-bold text-foreground">{element.seatNumber}</span>
        </span>
      </span>
      <span className={cn('block w-full min-w-0 font-medium leading-4 text-foreground',
        relatedPassenger ? 'truncate text-[0.6875rem]' : 'whitespace-nowrap text-[0.625rem]')}>
        {relatedPassenger ? passengerDisplayName : visual.label}
      </span>
    </button>
  )
}
