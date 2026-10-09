import {
  cancelTrip,
} from '@/features/trips/application/cancel-trip'
import {
  completeTrip,
} from '@/features/trips/application/complete-trip'
import {
  createTrip,
  type CreateTripInput,
} from '@/features/trips/application/create-trip'
import {
  getTrip,
} from '@/features/trips/application/get-trip'
import {
  listTrips,
} from '@/features/trips/application/list-trips'
import {
  listTripSeatStates,
} from '@/features/trips/application/list-trip-seat-states'
import {
  setTripSeatStatus,
  type SetTripSeatStatusInput,
} from '@/features/trips/application/set-trip-seat-status'
import {
  startTrip,
} from '@/features/trips/application/start-trip'
import {
  updateTrip,
  type UpdateTripInput,
} from '@/features/trips/application/update-trip'
import type { TripId } from '@/features/trips/domain/ids'
import { setTripSeatPassenger, type SetTripSeatPassengerInput } from '@/features/trips/application/set-trip-seat-passenger'
import {
  busLayoutRepository,
  busRepository,
  passengerRepository,
  tripRepository,
  tripSeatStateRepository,
} from '@/infrastructure/repositories/repositories'

export function setTripSeatPassengerAction(input: SetTripSeatPassengerInput) {
  return setTripSeatPassenger(input, { tripRepository, tripSeatStateRepository, passengerRepository })
}

export function createTripAction(
  input: CreateTripInput,
) {
  return createTrip(
    input,
    {
      tripRepository,
      busRepository,
      busLayoutRepository,
    },
  )
}

export function updateTripAction(
  input: UpdateTripInput,
) {
  return updateTrip(
    input,
    {
      tripRepository,
      busRepository,
      busLayoutRepository,
    },
  )
}

export function startTripAction(
  id: TripId,
) {
  return startTrip(
    id,
    {
      tripRepository,
      busRepository,
    },
  )
}

export function completeTripAction(
  id: TripId,
) {
  return completeTrip(
    id,
    {
      tripRepository,
    },
  )
}

export function cancelTripAction(
  id: TripId,
) {
  return cancelTrip(
    id,
    {
      tripRepository,
    },
  )
}

export function getTripAction(
  id: TripId,
) {
  return getTrip(
    id,
    tripRepository,
  )
}

export function listTripsAction() {
  return listTrips({
    tripRepository,
    busRepository,
    busLayoutRepository,
  })
}

export function listTripSeatStatesAction(
  tripId: TripId,
) {
  return listTripSeatStates(
    tripId,
    tripSeatStateRepository,
  )
}

export function setTripSeatStatusAction(
  input: SetTripSeatStatusInput,
) {
  return setTripSeatStatus(
    input,
    {
      tripRepository,
      busLayoutRepository,
      tripSeatStateRepository,
    },
  )
}
