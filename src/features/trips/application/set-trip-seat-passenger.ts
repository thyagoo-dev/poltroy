import type { PassengerRepository } from '@/features/passengers/application/passenger-repository'
import type { PassengerId } from '@/features/passengers/domain/ids'
import type { SeatId } from '@/features/seat-map/domain/ids'
import type { TripRepository } from '@/features/trips/application/trip-repository'
import type { TripSeatStateRepository } from '@/features/trips/application/trip-seat-state-repository'
import type { TripId } from '@/features/trips/domain/ids'
import type { TripSeatState } from '@/features/trips/domain/trip-seat-state'
import { toIsoTimestamp } from '@/shared/lib/timestamps'

export interface SetTripSeatPassengerInput {
  tripId: TripId
  seatId: SeatId
  passengerId: PassengerId | null
}

export interface SetTripSeatPassengerDependencies {
  tripRepository: TripRepository
  tripSeatStateRepository: TripSeatStateRepository
  passengerRepository: PassengerRepository
}

export async function setTripSeatPassenger(
  input: SetTripSeatPassengerInput,
  dependencies: SetTripSeatPassengerDependencies,
): Promise<TripSeatState> {
  const { tripRepository, tripSeatStateRepository, passengerRepository } = dependencies
  const trip = await tripRepository.getById(input.tripId)
  if (!trip) throw new Error('Viagem não encontrada.')
  if (trip.status !== 'PLANNED' && trip.status !== 'ACTIVE') {
    throw new Error('Os assentos de uma viagem concluída ou cancelada não podem ser alterados.')
  }

  const state = await tripSeatStateRepository.getByTripAndSeat(input.tripId, input.seatId)
  if (!state || state.status === 'BLOCKED') {
    throw new Error('Somente assentos ocupados ou reservados podem ter um passageiro associado.')
  }

  if (input.passengerId !== null) {
    const passenger = await passengerRepository.getById(input.passengerId)
    if (!passenger) throw new Error('Passageiro não encontrado.')

    const states = await tripSeatStateRepository.listByTripId(input.tripId)
    if (states.some((other) => other.seatId !== input.seatId && other.passengerId === input.passengerId)) {
      throw new Error('Este passageiro já está associado a outro assento desta viagem.')
    }
  }

  if ((state.passengerId ?? null) === input.passengerId) return state

  const nextState = { ...state, updatedAt: toIsoTimestamp() }
  if (input.passengerId === null) {
    delete nextState.passengerId
  } else {
    nextState.passengerId = input.passengerId
  }
  await tripSeatStateRepository.save(nextState)
  return nextState
}
