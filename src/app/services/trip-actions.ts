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
  listTrips,
} from '@/features/trips/application/list-trips'
import {
  startTrip,
} from '@/features/trips/application/start-trip'
import {
  updateTrip,
  type UpdateTripInput,
} from '@/features/trips/application/update-trip'
import type { TripId } from '@/features/trips/domain/ids'
import {
  busLayoutRepository,
  busRepository,
  tripRepository,
} from '@/infrastructure/repositories/repositories'

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

export function listTripsAction() {
  return listTrips({
    tripRepository,
    busRepository,
    busLayoutRepository,
  })
}
