import type { TripSeatStateRepository } from '@/features/trips/application/trip-seat-state-repository'
import type { TripId } from '@/features/trips/domain/ids'

export async function listTripSeatStates(
  tripId: TripId,
  repository: TripSeatStateRepository,
) {
  return repository.listByTripId(
    tripId,
  )
}
