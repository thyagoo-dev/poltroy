import type { BusRepository } from '@/features/buses/application/bus-repository'
import type { TripRepository } from '@/features/trips/application/trip-repository'
import type { TripId } from '@/features/trips/domain/ids'
import { assertTripStatusTransition } from '@/features/trips/domain/trip-status'
import type { Trip } from '@/features/trips/domain/trip'
import { toIsoTimestamp } from '@/shared/lib/timestamps'

export interface StartTripDependencies {
  tripRepository: TripRepository
  busRepository: BusRepository
}

export async function startTrip(
  id: TripId,
  dependencies: StartTripDependencies,
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
    'ACTIVE',
  )

  const bus =
    await dependencies
      .busRepository
      .getById(trip.busId)

  if (
    !bus ||
    bus.status !== 'ACTIVE'
  ) {
    throw new Error(
      'O ônibus desta viagem precisa estar ativo para iniciar a operação.',
    )
  }

  const timestamp =
    toIsoTimestamp()

  const activeTrip: Trip = {
    ...trip,

    status: 'ACTIVE',

    startedAt: timestamp,
    updatedAt: timestamp,
  }

  await dependencies
    .tripRepository
    .save(activeTrip)

  return activeTrip
}
