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
import { toIsoTimestamp } from '@/shared/lib/timestamps'

export interface UpdateTripInput
  extends TripInputFields {
  id: TripId
  busId: BusId
}

export interface UpdateTripDependencies {
  tripRepository: TripRepository
  busRepository: BusRepository
  busLayoutRepository:
    BusLayoutRepository
}

export async function updateTrip(
  input: UpdateTripInput,
  dependencies: UpdateTripDependencies,
): Promise<Trip> {
  const currentTrip =
    await dependencies
      .tripRepository
      .getById(input.id)

  if (!currentTrip) {
    throw new Error(
      'Viagem não encontrada.',
    )
  }

  if (
    currentTrip.status !==
    'PLANNED'
  ) {
    throw new Error(
      'Somente viagens planejadas podem ser editadas.',
    )
  }

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
      'Selecione um ônibus ativo.',
    )
  }

  const fields =
    normalizeTripFields(
      input,
    )

  let layoutId =
    currentTrip.layoutId

  if (
    bus.id !==
    currentTrip.busId
  ) {
    const layout =
      await dependencies
        .busLayoutRepository
        .getById(
          bus.activeLayoutId,
        )

    if (!layout) {
      throw new Error(
        'O layout ativo do novo ônibus não foi encontrado.',
      )
    }

    layoutId = layout.id
  }

  const updatedTrip: Trip = {
    ...currentTrip,

    busId: bus.id,
    layoutId,

    ...fields,

    updatedAt:
      toIsoTimestamp(),
  }

  await dependencies
    .tripRepository
    .save(updatedTrip)

  return updatedTrip
}
