import {
  useMemo,
  useState,
} from 'react'

import type { BusLayout } from '@/features/buses/domain/bus-layout'
import type { PassengerId } from '@/features/passengers/domain/ids'
import type { Passenger } from '@/features/passengers/domain/passenger'
import type { SeatId } from '@/features/seat-map/domain/ids'
import { BusMap } from '@/features/seat-map/ui/BusMap'
import {
  resolveSeatStatus,
  type SeatStatus,
  type TripSeatState,
} from '@/features/trips/domain/trip-seat-state'
import type { Trip } from '@/features/trips/domain/trip'
import { matchesOperationalSeatFilter, type OperationalSeatFilter } from '@/features/trips/domain/operational-seat-filter'
import { summarizeOperationalSeats } from '@/features/trips/domain/operational-seat-summary'
import { OperationalMapControls } from '@/features/trips/ui/OperationalMapControls'
import { OperationalSeatButton } from '@/features/trips/ui/OperationalSeatButton'
import { SeatStatusSheet } from '@/features/trips/ui/SeatStatusSheet'

interface OperationalBusMapProps {
  trip: Trip
  layout: BusLayout

  states:
    readonly TripSeatState[]
  passengers: readonly Passenger[]
  onChangePassenger: (seatId: SeatId, passengerId: PassengerId | null) => Promise<void>

  onChangeStatus: (
    seatId: SeatId,
    status: SeatStatus,
  ) => Promise<void>
}

export function OperationalBusMap({
  trip,
  layout,
  states,
  passengers,
  onChangePassenger,
  onChangeStatus,
}: OperationalBusMapProps) {
  const [filter, setFilter] = useState<OperationalSeatFilter>('ALL')
  const [search, setSearch] = useState('')
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

  const summary = useMemo(() => summarizeOperationalSeats(layout, states), [layout, states])
  const passengerById = useMemo(() => new Map(passengers.map((passenger) => [passenger.id, passenger])), [passengers])
  const matchingSeatIds = useMemo(() => new Set(seatElements.filter((seat) => {
    const state = stateBySeatId.get(seat.id)
    return matchesOperationalSeatFilter({
      seat,
      state,
      passenger: state?.passengerId ? passengerById.get(state.passengerId) : undefined,
      filter,
      search,
    })
  }).map((seat) => seat.id)), [seatElements, stateBySeatId, passengerById, filter, search])

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

  async function handlePassengerSelect(passengerId: PassengerId | null) {
    if (!selectedSeat || isPending) return
    setIsPending(true)
    setError(null)
    try {
      await onChangePassenger(selectedSeat.id, passengerId)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Não foi possível alterar o passageiro.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <>
      <p aria-label="Resumo dos assentos" className="mb-3 flex flex-wrap gap-x-2 gap-y-1 text-sm text-muted">
        <strong className="text-foreground">{summary.totalSeats} assentos</strong>
        <span>· {summary.free} livres</span>
        {summary.occupied > 0 && <span>· {summary.occupied} {summary.occupied === 1 ? 'ocupado' : 'ocupados'}</span>}
        {summary.reserved > 0 && <span>· {summary.reserved} {summary.reserved === 1 ? 'reservado' : 'reservados'}</span>}
        {summary.blocked > 0 && <span>· {summary.blocked} {summary.blocked === 1 ? 'bloqueado' : 'bloqueados'}</span>}
      </p>
      <OperationalMapControls filter={filter} search={search} matchCount={matchingSeatIds.size}
        onFilterChange={setFilter} onSearchChange={setSearch} onClear={() => {
          setFilter('ALL')
          setSearch('')
        }} />

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
              passengerName={state?.passengerId ? passengerById.get(state.passengerId)?.name : undefined}
              isSelected={selectedSeatId === placement.element.id}
              isDimmed={!matchingSeatIds.has(placement.element.id)}
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
        passengers={passengers}
        passengerId={selectedState?.passengerId}
        onSelectPassenger={(passengerId) => void handlePassengerSelect(passengerId)}
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
