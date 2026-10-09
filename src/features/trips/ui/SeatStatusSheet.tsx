import {
  useEffect,
  useId,
  useRef,
} from 'react'

import type { SeatStatus } from '@/features/trips/domain/trip-seat-state'
import { seatStatusVisuals } from '@/features/trips/ui/seat-status-visuals'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'

interface SeatStatusSheetProps {
  open: boolean

  seatNumber: string

  currentStatus:
    SeatStatus

  isPending?: boolean
  error?: string | null

  onSelect: (
    status: SeatStatus,
  ) => void

  onClose: () => void
}

const statuses:
  readonly SeatStatus[] = [
  'FREE',
  'OCCUPIED',
  'RESERVED',
  'BLOCKED',
]

export function SeatStatusSheet({
  open,
  seatNumber,
  currentStatus,
  isPending = false,
  error,
  onSelect,
  onClose,
}: SeatStatusSheetProps) {
  const titleId = useId()
  const seatLabelId = useId()
  const descriptionId = useId()
  const dialogRef =
    useRef<HTMLDialogElement>(
      null,
    )

  useEffect(() => {
    const dialog =
      dialogRef.current

    if (!dialog) {
      return
    }

    if (
      open &&
      !dialog.open
    ) {
      dialog.showModal()
      return
    }

    if (
      !open &&
      dialog.open
    ) {
      dialog.close()
    }
  }, [open])

  const currentVisual =
    seatStatusVisuals[
      currentStatus
    ]

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={seatLabelId + " " + titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault()

        if (!isPending) {
          onClose()
        }
      }}
      className="
        m-0 mt-auto
        w-full max-w-none max-h-dvh
        rounded-t-sheet
        border border-border
        bg-surface
        p-0
        text-foreground
        shadow-raised
        backdrop:bg-black/65

        sm:m-auto
        sm:max-w-md
        sm:rounded-card
      "
    >
      <div className="p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:p-6">
        <p id={seatLabelId} className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          Assento {seatNumber}
        </p>

        <h2 id={titleId} className="mt-2 text-xl font-semibold tracking-[-0.025em]">
          Alterar estado
        </h2>

        <p id={descriptionId} className="mt-2 text-sm text-muted">
          Estado atual:{' '}
          <span className="font-semibold text-foreground">
            {
              currentVisual.label
            }
          </span>
        </p>

        <div
          role="group"
          aria-label={`Estado do assento ${seatNumber}`}
          className="mt-5 grid gap-2"
        >
          {statuses.map(
            (status) => {
              const visual =
                seatStatusVisuals[
                  status
                ]

              const Icon =
                visual.icon

              const selected =
                status ===
                currentStatus

              return (
                <button
                  key={status}
                  type="button"

                  aria-pressed={
                    selected
                  }
                  disabled={
                    isPending
                  }
                  onClick={() =>
                    onSelect(
                      status,
                    )
                  }
                  className={cn(
                    'flex min-h-14',
                    'items-center gap-3',
                    'rounded-control',
                    'border',
                    'px-4 py-3',
                    'text-left',
                    'transition-[border-color,background-color]',
                    'focus-visible:outline-none',
                    'focus-visible:ring-2',
                    'focus-visible:ring-primary/55',
                    'disabled:cursor-wait disabled:opacity-60',
                    selected
                      ? visual.className
                      : 'border-border bg-surface-raised text-muted hover:border-border-strong',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-9',
                      'shrink-0',
                      'items-center justify-center',
                      'rounded-control',
                      selected
                        ? ''
                        : 'bg-surface-soft',
                    )}
                  >
                    <Icon
                      aria-hidden="true"
                      size={17}
                    />
                  </span>

                  <span className="flex-1">
                    <span className="block text-sm font-semibold">
                      {
                        visual.label
                      }
                    </span>

                    {selected && (
                      <span className="mt-0.5 block text-xs">
                        Estado atual
                      </span>
                    )}
                  </span>
                </button>
              )
            },
          )}
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-control border border-danger/20 bg-danger/10 px-3 py-2.5 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end">
          <Button
            type="button"
            variant="ghost"
            disabled={
              isPending
            }
            onClick={
              onClose
            }
          >
            Fechar
          </Button>
        </div>
      </div>
    </dialog>
  )
}
