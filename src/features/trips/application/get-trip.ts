import type { TripRepository } from '@/features/trips/application/trip-repository'
import type { TripId } from '@/features/trips/domain/ids'

export async function getTrip(
  id: TripId,
  repository: TripRepository,
) {
  return repository.getById(id)
}
