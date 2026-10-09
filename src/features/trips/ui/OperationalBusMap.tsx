import {
  useMemo,
  useState,
} from 'react'

import type { BusLayout } from '@/features/buses/domain/bus-layout'
import type { SeatId } from '@/features/seat-map/domain/ids'
import { BusMap } from '@/features/seat-map/ui/BusMap'
import {
  resolveSeatStatus,
  type SeatStatus,
  type TripSeatState,
} from '@/features/trips/domain/trip-seat-state'
import type { Trip } from '@/features/trips/domain/trip'
import { OperationalSeatButton } from '@/features/trips/ui/OperationalSeatButton'
import { SeatStatusSheet } from '@/features/trips/ui/SeatStatusSheet'
import { seatStatusVisuals } from '@/features/trips/ui/seat-status-visuals'
import { cn } from '@/shared/lib/cn'

interface OperationalBusMapProps {
  trip: Trip
  layout: BusLayout

  states:
    readonly TripSeatState[]

  onChangeStatus: (
    seatId: SeatId,
    status: SeatStatus,
  ) => Promise<void>
}

export function OperationalBusMap({
  trip,
  layout,
  states,
  onChangeStatus,
}: OperationalBusMapProps) {
  const [
    selectedSeatId,
    setSelectedSeatId,
  ] = useState<
    SeatId | null
  >(null)

  const [
    isPending,
    setIsPending,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null)

  const stateBySeatId =
    useMemo(
      () =>
        new Map(
          states.map(
            (state) => [
              state.seatId,
              state,
            ],
          ),
        ),
      [states],
    )

  const seatElements =
    useMemo(
      () =>
        layout.elements.filter(
          (element) =>
            element.kind ===
            'seat',
        ),
      [layout],
    )

  const selectedSeat =
    selectedSeatId
      ? seatElements.find(
          (seat) =>
            seat.id ===
            selectedSeatId,
        )
      : undefined

  const selectedState =
    selectedSeatId
      ? stateBySeatId.get(
          selectedSeatId,
        )
      : undefined

  const selectedStatus =
    resolveSeatStatus(
      selectedState,
    )

  const occupiedCount =
    states.filter(
      (state) =>
        state.status ===
        'OCCUPIED',
    ).length

  const reservedCount =
    states.filter(
      (state) =>
        state.status ===
        'RESERVED',
    ).length

  const blockedCount =
    states.filter(
      (state) =>
        state.status ===
        'BLOCKED',
    ).length

  const freeCount =
    Math.max(
      0,
      seatElements.length -
        occupiedCount -
        reservedCount -
        blockedCount,
    )

  const counters:
    readonly [
      SeatStatus,
      number,
    ][] = [
    [
      'FREE',
      freeCount,
    ],

    [
      'OCCUPIED',
      occupiedCount,
    ],

    [
      'RESERVED',
      reservedCount,
    ],

    [
      'BLOCKED',
      blockedCount,
    ],
  ]

  async function handleStatusSelect(
    status: SeatStatus,
  ) {
    if (!selectedSeat) {
      return
    }

    if (
      status ===
      selectedStatus
    ) {
      setSelectedSeatId(null)
      return
    }

    setIsPending(true)
    setError(null)

    try {
      await onChangeStatus(
        selectedSeat.id,
        status,
      )

      setSelectedSeatId(null)
    } catch (
      caughtError
    ) {
      setError(
        caughtError instanceof
          Error
          ? caughtError.message
          : 'Não foi possível alterar o assento.',
      )
    } finally {
      setIsPending(false)
    }
  }

  return (
    <>
      <div
        className="
          mb-6
          grid grid-cols-2
          gap-2
          sm:grid-cols-4
        "
        aria-label="Resumo dos assentos"
      >
        {counters.map(
          ([
            status,
            count,
          ]) => {
            const visual =
              seatStatusVisuals[
                status
              ]

            const Icon =
              visual.icon

            return (
              <div
                key={status}
                className={cn(
                  'rounded-control',
                  'border',
                  'px-3 py-3',
                  visual.className,
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    aria-hidden="true"
                    size={14}
                  />

                  <span className="text-xs font-semibold">
                    {
                      visual.label
                    }
                  </span>
                </div>

                <p className="mt-2 text-xl font-bold tracking-[-0.03em]">
                  {count}
                </p>
              </div>
            )
          },
        )}
      </div>

      <BusMap
        layout={layout}
        renderElement={(
          placement,
        ) => {
          if (
            placement.element
              .kind !== 'seat'
          ) {
            return null
          }

          const state =
            stateBySeatId.get(
              placement.element.id,
            )

          const status =
            resolveSeatStatus(
              state,
            )

          return (
            <OperationalSeatButton
              placement={
                placement
              }
              status={
                status
              }
              onClick={() => {
                setError(null)
                setSelectedSeatId(
                  placement.element
                    .kind ===
                    'seat'
                    ? placement.element
                        .id
                    : null,
                )
              }}
            />
          )
        }}
      />

      <SeatStatusSheet
        error={error}
        open={
          selectedSeat !==
          undefined
        }
        seatNumber={
          selectedSeat
            ?.seatNumber ?? ''
        }
        currentStatus={
          selectedStatus
        }
        isPending={
          isPending
        }
        onClose={() =>
          setSelectedSeatId(
            null,
          )
        }
        onSelect={(status) =>
          void handleStatusSelect(
            status,
          )
        }
      />

      <p className="mt-4 text-xs leading-5 text-subtle">
        Estados referentes à viagem{' '}
        <span className="font-semibold text-muted">
          {trip.origin}
          {' → '}
          {trip.destination}
        </span>
        .
      </p>
    </>
  )
}
