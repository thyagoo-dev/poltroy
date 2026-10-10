import {
  useMemo,
  useState,
  useRef,
} from 'react'

import type { BusLayout } from '@/features/buses/domain/bus-layout'
import type { PassengerId } from '@/features/passengers/domain/ids'
import type { Passenger } from '@/features/passengers/domain/passenger'
import { resolvePassengerDisplayName } from '@/features/passengers/domain/passenger-display-name'
import type { SeatId } from '@/features/seat-map/domain/ids'
import { BusMap } from '@/features/seat-map/ui/BusMap'
import {
  resolveSeatStatus,
  type SeatStatus,
  type TripSeatState,
} from '@/features/trips/domain/trip-seat-state'
import { matchesOperationalSeatFilter, type OperationalSeatFilter } from '@/features/trips/domain/operational-seat-filter'
import { OperationalMapControls } from '@/features/trips/ui/OperationalMapControls'
import { OperationalSeatButton } from '@/features/trips/ui/OperationalSeatButton'
import { SeatStatusSheet } from '@/features/trips/ui/SeatStatusSheet'

interface OperationalBusMapProps {
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
  layout,
  states,
  passengers,
  onChangePassenger,
  onChangeStatus,
}: OperationalBusMapProps) {
  const changeInFlight = useRef(false)
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
    if (changeInFlight.current) return

    if (
      status ===
      selectedStatus
    ) {
      setSelectedSeatId(null)
      return
    }

    changeInFlight.current = true
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
      changeInFlight.current = false
      setIsPending(false)
    }
  }

  async function handlePassengerSelect(passengerId: PassengerId | null) {
    if (!selectedSeat || isPending || changeInFlight.current) return
    changeInFlight.current = true
    setIsPending(true)
    setError(null)
    try {
      await onChangePassenger(selectedSeat.id, passengerId)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Não foi possível alterar o passageiro.')
    } finally {
      changeInFlight.current = false
      setIsPending(false)
    }
  }

  return (
    <>
      <OperationalMapControls filter={filter} search={search} matchCount={matchingSeatIds.size}
        onFilterChange={setFilter} onSearchChange={setSearch} onClear={() => {
          setFilter('ALL')
          setSearch('')
        }} />

      <BusMap
        layout={layout}
        showLayoutSummary={false}
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

          const passenger = state?.passengerId ? passengerById.get(state.passengerId) : undefined

          return (
            <OperationalSeatButton
              passengerFullName={passenger?.name}
              passengerDisplayName={passenger ? resolvePassengerDisplayName(passenger) : undefined}
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

    </>
  )
}
