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
          flex-col justify-center gap-1 px-1
          overflow-hidden
          rounded-[0.9rem]
          border border-border-strong
          bg-surface-raised
          text-foreground
          disabled:cursor-default
          disabled:opacity-100
        "
      >
        <span className="flex items-center justify-between gap-1">
          <Armchair aria-hidden="true" className="shrink-0 text-muted" size={14} strokeWidth={1.8} />
          <span className="text-sm font-bold">{element.seatNumber}</span>
        </span>
        <span className="truncate text-[0.625rem] leading-4 text-muted">{seatTypeLabel}</span>
      </button>
    )
  }

  const visual =
    structuralElementVisuals[
      element.kind
    ]

  const Icon = visual.icon

  const accessibleLabel =
    element.label && element.label !== visual.label
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
          min-h-11 min-w-0
          rounded-pill
          bg-surface-soft/70
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
        'flex min-h-11 min-w-0 flex-col gap-1 px-1',
        'items-center justify-center overflow-hidden',
        'rounded-control',
        'border border-border',
        'bg-surface-soft',
        'text-muted',
      )}
    >
      <Icon
        aria-hidden="true"
        size={16}
        strokeWidth={1.7}
      />
      <span className="max-w-full truncate text-[0.625rem] leading-4">{visual.label}</span>
    </div>
  )
}
