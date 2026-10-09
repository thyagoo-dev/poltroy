import type { TripRepository } from '@/features/trips/application/trip-repository'
import type { TripId } from '@/features/trips/domain/ids'
import { assertTripStatusTransition } from '@/features/trips/domain/trip-status'
import type { Trip } from '@/features/trips/domain/trip'
import { toIsoTimestamp } from '@/shared/lib/timestamps'

export interface CancelTripDependencies {
  tripRepository: TripRepository
}

export async function cancelTrip(
  id: TripId,
  dependencies: CancelTripDependencies,
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
    'CANCELLED',
  )

  const timestamp =
    toIsoTimestamp()

  const cancelledTrip: Trip = {
    ...trip,

    status: 'CANCELLED',

    cancelledAt: timestamp,
    updatedAt: timestamp,
  }

  await dependencies
    .tripRepository
    .save(cancelledTrip)

  return cancelledTrip
}
