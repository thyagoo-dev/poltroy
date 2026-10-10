import {
  Ban,
  BusFront,
  CalendarClock,
  Check,
  LayoutGrid,
  MapPin,
  Pencil,
  Play,
} from 'lucide-react'

import type { TripSummary } from '@/features/trips/application/list-trips'
import type { TripStatus } from '@/features/trips/domain/trip'
import { formatDateTime } from '@/shared/lib/date-time'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'

interface TripCardProps {
  summary: TripSummary
  isPending?: boolean

  onOpenMap: () => void
  onEdit: () => void
  onStart: () => void
  onComplete: () => void
  onCancel: () => void
}

const statusLabels:
  Record<
    TripStatus,
    string
  > = {
  PLANNED: 'Planejada',
  ACTIVE: 'Em andamento',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
}

const statusClasses:
  Record<
    TripStatus,
    string
  > = {
  PLANNED:
    'border-primary/20 bg-primary/10 text-primary',

  ACTIVE:
    'border-success/20 bg-success/10 text-success',

  COMPLETED:
    'border-border bg-surface-soft text-muted',

  CANCELLED:
    'border-danger/20 bg-danger/10 text-danger',
}

export function TripCard({
  summary,
  isPending = false,
  onOpenMap,
  onEdit,
  onStart,
  onComplete,
  onCancel,
}: TripCardProps) {
  const {
    trip,
    bus,
    layout,
    seatCount,
  } = summary

  const isOperational =
    trip.status ===
      'PLANNED' ||
    trip.status ===
      'ACTIVE'

  return (
    <Card
      variant={
        trip.status ===
        'ACTIVE'
          ? 'raised'
          : 'default'
      }
      padding="lg"
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="min-w-0 text-base font-semibold text-foreground">
                {trip.origin}
                {' → '}
                {trip.destination}
              </h4>

              <span
                className={cn(
                  'rounded-pill border',
                  'px-2 py-1',
                  'text-[0.625rem]',
                  'font-bold uppercase',
                  'tracking-[0.08em]',
                  statusClasses[
                    trip.status
                  ],
                )}
              >
                {
                  statusLabels[
                    trip.status
                  ]
                }
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2 text-sm text-muted">
              <CalendarClock
                aria-hidden="true"
                className="shrink-0"
                size={16}
              />

              <span>
                {formatDateTime(
                  trip.departureAt,
                )}
              </span>
            </div>

            {trip.arrivalEstimateAt && (
              <p className="mt-1 pl-6 text-xs text-subtle">
                Chegada estimada:{' '}
                {formatDateTime(
                  trip.arrivalEstimateAt,
                )}
              </p>
            )}
          </div>

          <MapPin
            aria-hidden="true"
            className="shrink-0 text-primary"
            size={20}
          />
        </div>

        <div
          className="
            rounded-control
            border border-border
            bg-surface-soft
            p-3.5
          "
        >
          <div className="flex items-center gap-3">
            <BusFront
              aria-hidden="true"
              className="shrink-0 text-muted"
              size={18}
            />

            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {bus?.name ??
                  'Ônibus indisponível'}
              </p>

              <p className="mt-1 text-xs text-subtle">
                {layout?.name ??
                  'Layout indisponível'}
                {' · '}
                {seatCount}{' '}
                lugares
              </p>
            </div>
          </div>
        </div>

        {trip.notes && (
          <p className="text-sm leading-6 text-muted">
            {trip.notes}
          </p>
        )}

        {isOperational && (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={trip.status === 'ACTIVE' ? 'primary' : 'secondary'}
              disabled={isPending}
              onClick={
                onOpenMap
              }
            >
              <LayoutGrid
                aria-hidden="true"
                size={15}
              />

              {trip.status === 'ACTIVE' ? 'Continuar operação' : 'Abrir mapa'}
            </Button>

            {trip.status ===
              'PLANNED' && (
              <>
                <Button
                  size="sm"
                  onClick={
                    onStart
                  }
                  disabled={isPending}
                >
                  <Play
                    aria-hidden="true"
                    size={15}
                  />

                  {isPending ? 'Aguarde...' : 'Iniciar'}
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isPending}
                  onClick={
                    onEdit
                  }
                >
                  <Pencil
                    aria-hidden="true"
                    size={15}
                  />

                  Editar
                </Button>
              </>
            )}

            {trip.status ===
              'ACTIVE' && (
              <Button
                size="sm"
                onClick={
                  onComplete
                }
                variant="secondary"
                disabled={isPending}
              >
                <Check
                  aria-hidden="true"
                  size={15}
                />

                Concluir
              </Button>
            )}

            <Button
              size="sm"
              variant="danger"
              disabled={isPending}
              onClick={
                onCancel
              }
            >
              <Ban
                aria-hidden="true"
                size={15}
              />

              Cancelar
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
