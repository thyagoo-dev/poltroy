import { Armchair } from 'lucide-react'

import type {
  LayoutElementPlacement,
} from '@/features/seat-map/domain/layout-engine'
import type {
  SeatType,
} from '@/features/seat-map/domain/seat'
import { structuralElementVisuals } from '@/features/seat-map/ui/layout-element-visuals'
import { cn } from '@/shared/lib/cn'

const seatTypeLabels:
  Record<SeatType, string> = {
    STANDARD: 'Convencional',
    EXECUTIVE: 'Executivo',
    SEMI_SLEEPER: 'Semi-leito',
    SLEEPER: 'Leito',
    ACCESSIBLE: 'Acessível',
  }

interface LayoutElementViewProps {
  placement:
    LayoutElementPlacement
}

export function LayoutElementView({
  placement,
}: LayoutElementViewProps) {
  const { element } = placement

  const gridStyle = {
    gridRow:
      `${placement.row} / span ${placement.rowSpan}`,

    gridColumn:
      `${placement.column} / span ${placement.columnSpan}`,
  }

  if (element.kind === 'seat') {
    const seatTypeLabel =
      seatTypeLabels[
        element.seatType
      ]

    return (
      <button
        type="button"
        disabled
        aria-label={
          `Assento ${element.seatNumber}, ${seatTypeLabel}`
        }
        title={
          `Assento ${element.seatNumber} · ${seatTypeLabel}`
        }
        style={gridStyle}
        className="
          relative
          flex min-h-11 min-w-11
          flex-col items-center justify-center
          overflow-hidden
          rounded-[0.9rem]
          border border-seat-free/35
          bg-surface-raised
          text-foreground
          shadow-soft
          disabled:cursor-default
          disabled:opacity-100
        "
      >
        <Armchair
          aria-hidden="true"
          className="text-seat-free"
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

  const visual =
    structuralElementVisuals[
      element.kind
    ]

  const Icon = visual.icon

  const accessibleLabel =
    element.label
      ? `${visual.label}: ${element.label}`
      : visual.label

  if (element.kind === 'aisle') {
    return (
      <div
        role="img"
        aria-label={
          accessibleLabel
        }
        title={
          accessibleLabel
        }
        style={gridStyle}
        className="
          relative
          min-h-11 min-w-8
          rounded-pill
          bg-primary/[0.025]
        "
      >
        <span
          aria-hidden="true"
          className="
            absolute inset-y-2
            left-1/2
            border-l border-dashed
            border-border-strong
          "
        />
      </div>
    )
  }

  return (
    <div
      role="img"
      aria-label={
        accessibleLabel
      }
      title={
        accessibleLabel
      }
      style={gridStyle}
      className={cn(
        'flex min-h-11 min-w-11',
        'items-center justify-center',
        'rounded-control',
        'border border-border',
        'bg-surface-soft',
        'text-muted',
      )}
    >
      <Icon
        aria-hidden="true"
        size={19}
        strokeWidth={1.7}
      />
    </div>
  )
}
