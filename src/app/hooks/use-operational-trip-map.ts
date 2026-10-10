import { useCallback, useEffect, useState } from 'react'

import { getBusAction, getBusLayoutAction } from '@/app/services/bus-actions'
import { listPassengersAction } from '@/app/services/passenger-actions'
import type { Passenger } from '@/features/passengers/domain/passenger'
import { getTripAction, listTripSeatStatesAction } from '@/app/services/trip-actions'
import type { BusLayout } from '@/features/buses/domain/bus-layout'
import type { Bus } from '@/features/buses/domain/bus'
import type { TripId } from '@/features/trips/domain/ids'
import type { TripSeatState } from '@/features/trips/domain/trip-seat-state'
import type { Trip } from '@/features/trips/domain/trip'
import { useTripOperationStore } from '@/features/trips/ui/trip-operation-store'

interface OperationalMapState {
  id: TripId
  trip?: Trip
  bus?: Bus
  layout?: BusLayout
  seatStates: readonly TripSeatState[]
  passengers: readonly Passenger[]
  error: string | null
}

const emptySeatStates: readonly TripSeatState[] = []
const emptyPassengers: readonly Passenger[] = []

export function useOperationalTripMap() {
  const operationalTripId = useTripOperationStore((state) => state.operationalTripId)
  const clearOperationalTrip = useTripOperationStore((state) => state.clearOperationalTrip)
  const [mapState, setMapState] = useState<OperationalMapState>()
  const [revision, setRevision] = useState(0)
  const refresh = useCallback((updatedTrip?: Trip) => {
    if (updatedTrip) {
      setMapState((current) => current?.id === updatedTrip.id ? { ...current, trip: updatedTrip } : current)
    }
    setRevision((current) => current + 1)
  }, [])

  useEffect(() => {
    if (!operationalTripId) return
    let cancelled = false
    const tripId = operationalTripId

    async function load() {
      const trip = await getTripAction(tripId)
      if (cancelled) return
      if (!trip || trip.status === 'COMPLETED' || trip.status === 'CANCELLED') {
        clearOperationalTrip()
        return
      }

      const [bus, layout, seatStates, passengers] = await Promise.all([
        getBusAction(trip.busId),
        getBusLayoutAction(trip.layoutId),
        listTripSeatStatesAction(trip.id),
        listPassengersAction(),
      ])
      if (cancelled) return
      setMapState({
        id: tripId,
        trip,
        bus,
        layout,
        seatStates,
        passengers,
        error: !bus
          ? 'O ônibus desta viagem não foi encontrado.'
          : !layout
            ? 'O layout desta viagem não foi encontrado.'
            : null,
      })
    }

    void load().catch(() => {
      if (!cancelled) {
        setMapState({
          id: tripId,
          seatStates: emptySeatStates,
          passengers: emptyPassengers,
          error: 'Não foi possível carregar o mapa operacional.',
        })
      }
    })
    return () => { cancelled = true }
  }, [operationalTripId, revision, clearOperationalTrip])

  const currentState = operationalTripId && mapState?.id === operationalTripId
    ? mapState
    : undefined

  return {
    operationalTripId,
    trip: currentState?.trip,
    bus: currentState?.bus,
    layout: currentState?.layout,
    seatStates: currentState?.seatStates ?? emptySeatStates,
    passengers: currentState?.passengers ?? emptyPassengers,
    isLoading: Boolean(operationalTripId && !currentState),
    error: currentState?.error ?? null,
    refresh,
    clearOperationalTrip,
  }
}
