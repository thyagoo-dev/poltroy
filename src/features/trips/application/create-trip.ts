import type { BusLayoutRepository } from '@/features/buses/application/bus-layout-repository'
import type { BusRepository } from '@/features/buses/application/bus-repository'
import type { BusId } from '@/features/buses/domain/ids'
import type { TripRepository } from '@/features/trips/application/trip-repository'
import {
  normalizeTripFields,
  type TripInputFields,
} from '@/features/trips/application/trip-input'
import type { TripId } from '@/features/trips/domain/ids'
import type { Trip } from '@/features/trips/domain/trip'
import { createEntityId } from '@/shared/lib/create-entity-id'
import { createEntityTimestamps } from '@/shared/lib/timestamps'

export interface CreateTripInput
  extends TripInputFields {
  busId: BusId
}

export interface CreateTripDependencies {
  tripRepository: TripRepository
  busRepository: BusRepository
  busLayoutRepository:
    BusLayoutRepository
}

export async function createTrip(
  input: CreateTripInput,
  dependencies: CreateTripDependencies,
): Promise<Trip> {
  const bus =
    await dependencies
      .busRepository
      .getById(input.busId)

  if (!bus) {
    throw new Error(
      'Ônibus não encontrado.',
    )
  }

  if (
    bus.status !== 'ACTIVE'
  ) {
    throw new Error(
      'Não é possível criar uma viagem para um ônibus arquivado.',
    )
  }

  const layout =
    await dependencies
      .busLayoutRepository
      .getById(
        bus.activeLayoutId,
      )

  if (!layout) {
    throw new Error(
      'O layout ativo do ônibus não foi encontrado.',
    )
  }

  const fields =
    normalizeTripFields(
      input,
    )

  const trip: Trip = {
    id:
      createEntityId<TripId>(),

    busId: bus.id,
    layoutId: layout.id,

    ...fields,

    status: 'PLANNED',

    ...createEntityTimestamps(),
  }

  await dependencies
    .tripRepository
    .save(trip)

  return trip
}
