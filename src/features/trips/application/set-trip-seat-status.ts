import type { BusLayoutRepository } from '@/features/buses/application/bus-layout-repository'
import type { SeatId } from '@/features/seat-map/domain/ids'
import type { TripRepository } from '@/features/trips/application/trip-repository'
import type { TripSeatStateRepository } from '@/features/trips/application/trip-seat-state-repository'
import type {
  TripId,
  TripSeatStateId,
} from '@/features/trips/domain/ids'
import type {
  SeatStatus,
  TripSeatState,
} from '@/features/trips/domain/trip-seat-state'
import { createEntityId } from '@/shared/lib/create-entity-id'
import { toIsoTimestamp } from '@/shared/lib/timestamps'

export interface SetTripSeatStatusInput {
  tripId: TripId
  seatId: SeatId

  status: SeatStatus
}

export interface SetTripSeatStatusDependencies {
  tripRepository: TripRepository

  busLayoutRepository:
    BusLayoutRepository

  tripSeatStateRepository:
    TripSeatStateRepository
}

export async function setTripSeatStatus(
  input: SetTripSeatStatusInput,
  dependencies:
    SetTripSeatStatusDependencies,
): Promise<
  TripSeatState | undefined
> {
  const trip =
    await dependencies
      .tripRepository
      .getById(input.tripId)

  if (!trip) {
    throw new Error(
      'Viagem não encontrada.',
    )
  }

  if (
    trip.status !== 'PLANNED' &&
    trip.status !== 'ACTIVE'
  ) {
    throw new Error(
      'Os assentos de uma viagem concluída ou cancelada não podem ser alterados.',
    )
  }

  const layout =
    await dependencies
      .busLayoutRepository
      .getById(
        trip.layoutId,
      )

  if (!layout) {
    throw new Error(
      'O layout desta viagem não foi encontrado.',
    )
  }

  const seatExists =
    layout.elements.some(
      (element) =>
        element.kind ===
          'seat' &&
        element.id ===
          input.seatId,
    )

  if (!seatExists) {
    throw new Error(
      'O assento não pertence ao layout desta viagem.',
    )
  }

  const existingState =
    await dependencies
      .tripSeatStateRepository
      .getByTripAndSeat(
        input.tripId,
        input.seatId,
      )

  if (
    input.status === 'FREE'
  ) {
    if (existingState) {
      await dependencies
        .tripSeatStateRepository
        .deleteByTripAndSeat(
          input.tripId,
          input.seatId,
        )
    }

    return undefined
  }

  if (
    existingState?.status ===
    input.status
  ) {
    return existingState
  }

  const timestamp =
    toIsoTimestamp()

  const commonState = {
    id:
      existingState?.id ??
      createEntityId<TripSeatStateId>(),

    tripId:
      input.tripId,

    seatId:
      input.seatId,

    createdAt:
      existingState?.createdAt ??
      timestamp,

    updatedAt:
      timestamp,

    ...(existingState?.notes
      ? {
          notes:
            existingState.notes,
        }
      : {}),
  }

  let nextState:
    TripSeatState

  if (
    input.status ===
    'BLOCKED'
  ) {
    nextState = {
      ...commonState,
      status: 'BLOCKED',
    }
  } else {
    const existingPassengerId =
      existingState?.status ===
        'OCCUPIED' ||
      existingState?.status ===
        'RESERVED'
        ? existingState.passengerId
        : undefined

    nextState = {
      ...commonState,

      status:
        input.status,

      ...(existingPassengerId
        ? {
            passengerId:
              existingPassengerId,
          }
        : {}),
    }
  }

  await dependencies
    .tripSeatStateRepository
    .save(nextState)

  return nextState
}
