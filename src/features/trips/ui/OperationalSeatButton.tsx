import {
  Armchair,
} from 'lucide-react'

import type { LayoutElementPlacement } from '@/features/seat-map/domain/layout-engine'
import type { SeatStatus } from '@/features/trips/domain/trip-seat-state'
import { seatStatusVisuals } from '@/features/trips/ui/seat-status-visuals'
import { cn } from '@/shared/lib/cn'

interface OperationalSeatButtonProps {
  placement:
    LayoutElementPlacement

  status: SeatStatus

  onClick: () => void
}

export function OperationalSeatButton({
  placement,
  status,
  onClick,
}: OperationalSeatButtonProps) {
  if (
    placement.element.kind !==
    'seat'
  ) {
    return null
  }

  const {
    element,
  } = placement

  const visual =
    seatStatusVisuals[
      status
    ]

  const StatusIcon =
    visual.icon

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={
        `Assento ${element.seatNumber}, ${visual.label}`
      }
      title={
        `Assento ${element.seatNumber} · ${visual.label}`
      }
      style={{
        gridRow:
          `${placement.row} / span ${placement.rowSpan}`,

        gridColumn:
          `${placement.column} / span ${placement.columnSpan}`,
      }}
      className={cn(
        'relative',
        'flex min-h-11 min-w-11',
        'flex-col items-center justify-center',
        'overflow-hidden',
        'rounded-[0.9rem]',
        'border',
        'shadow-soft',
        'transition-[transform,border-color,background-color,box-shadow]',
        'hover:-translate-y-0.5',
        'focus-visible:outline-none',
        'focus-visible:ring-2',
        'focus-visible:ring-primary/60',
        'focus-visible:ring-offset-2',
        'focus-visible:ring-offset-surface',
        visual.className,
      )}
    >
      <StatusIcon
        aria-hidden="true"
        className="
          absolute
          right-1.5 top-1.5
          size-2.5
        "
        strokeWidth={2.4}
      />

      <Armchair
        aria-hidden="true"
        size={16}
        strokeWidth={1.8}
      />

      <span
        className="
          mt-0.5
          text-[0.6875rem]
          font-bold
          leading-none
        "
      >
        {element.seatNumber}
      </span>
    </button>
  )
}
