import type { TripRepository } from '@/features/trips/application/trip-repository'
import type { TripId } from '@/features/trips/domain/ids'
import { assertTripStatusTransition } from '@/features/trips/domain/trip-status'
import type { Trip } from '@/features/trips/domain/trip'
import { toIsoTimestamp } from '@/shared/lib/timestamps'

export interface CompleteTripDependencies {
  tripRepository: TripRepository
}

export async function completeTrip(
  id: TripId,
  dependencies: CompleteTripDependencies,
): Promise<Trip> {
  const trip =
    await dependencies
      .tripRepository
      .getById(id)

  if (!trip) {
    throw new Error(
      'Viagem não encontrada.',
    )
  }

  assertTripStatusTransition(
    trip.status,
    'COMPLETED',
  )

  const timestamp =
    toIsoTimestamp()

  const completedTrip: Trip = {
    ...trip,

    status: 'COMPLETED',

    completedAt: timestamp,
    updatedAt: timestamp,
  }

  await dependencies
    .tripRepository
    .save(completedTrip)

  return completedTrip
}
