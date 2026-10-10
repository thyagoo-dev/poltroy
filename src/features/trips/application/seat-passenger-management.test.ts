import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { createPassenger } from '@/features/passengers/application/create-passenger'
import type { PassengerId } from '@/features/passengers/domain/ids'
import type { Passenger } from '@/features/passengers/domain/passenger'
import type { SeatId } from '@/features/seat-map/domain/ids'
import { setTripSeatPassenger } from '@/features/trips/application/set-trip-seat-passenger'
import { setTripSeatStatus } from '@/features/trips/application/set-trip-seat-status'
import type { Trip } from '@/features/trips/domain/trip'
import type { TripId } from '@/features/trips/domain/ids'
import { PoltroyDatabase } from '@/infrastructure/database/poltroy-database'
import { DexieBusLayoutRepository } from '@/infrastructure/repositories/dexie-bus-repositories'
import { DexiePassengerRepository } from '@/infrastructure/repositories/dexie-passenger-repository'
import { DexieTripRepository, DexieTripSeatStateRepository } from '@/infrastructure/repositories/dexie-trip-repositories'
import { createBus } from '@/features/buses/application/create-bus'
import { DexieBusRepository } from '@/infrastructure/repositories/dexie-bus-repositories'
import { createTrip } from '@/features/trips/application/create-trip'
import { createEntityId } from '@/shared/lib/create-entity-id'

let database: PoltroyDatabase
let dependencies: {
  tripRepository: DexieTripRepository
  tripSeatStateRepository: DexieTripSeatStateRepository
  passengerRepository: DexiePassengerRepository
  busLayoutRepository: DexieBusLayoutRepository
}
let trip: Trip
let passenger: Passenger
let seatId: SeatId
let secondSeatId: SeatId

beforeEach(async () => {
  database = new PoltroyDatabase(`seat-passengers-test-${createEntityId<string>()}`)
  await database.open()
  dependencies = {
    tripRepository: new DexieTripRepository(database),
    tripSeatStateRepository: new DexieTripSeatStateRepository(database),
    passengerRepository: new DexiePassengerRepository(database),
    busLayoutRepository: new DexieBusLayoutRepository(database),
  }
  const busRepository = new DexieBusRepository(database)
  const bus = await createBus({ name: 'Ônibus teste', presetId: 'conventional-44' }, { busRepository })
  trip = await createTrip({ busId: bus.id, origin: 'Iguatu', destination: 'Fortaleza', departureAt: '2026-10-10T08:00:00.000Z' }, { ...dependencies, busRepository })
  const layout = await dependencies.busLayoutRepository.getById(trip.layoutId)
  const seats = layout!.elements.filter((element) => element.kind === 'seat')
  seatId = seats[0].id
  secondSeatId = seats[1].id
  passenger = await createPassenger({ displayName: 'Pessoa', name: 'João' }, dependencies.passengerRepository)
})
afterEach(async () => { await database.delete() })

function assign(targetSeatId = seatId, passengerId: PassengerId | null = passenger.id, tripId = trip.id) {
  return setTripSeatPassenger({ tripId, seatId: targetSeatId, passengerId }, dependencies)
}

describe('Atribuição de passageiros aos assentos', () => {
  it.each(['OCCUPIED', 'RESERVED'] as const)('associa passageiro em %s preservando os demais campos', async (status) => {
    const state = await setTripSeatStatus({ tripId: trip.id, seatId, status }, dependencies)
    await dependencies.tripSeatStateRepository.save({ ...state!, notes: 'Bagagem', updatedAt: '2020-01-01T00:00:00.000Z' })
    const result = await assign()
    expect(result).toMatchObject({ ...state, notes: 'Bagagem', passengerId: passenger.id, updatedAt: result.updatedAt })
    expect(Date.parse(result.updatedAt)).toBeGreaterThan(Date.parse('2020-01-01T00:00:00.000Z'))
    expect(await dependencies.tripSeatStateRepository.getByTripAndSeat(trip.id, seatId)).toEqual(result)
  })

  it.each(['OCCUPIED', 'RESERVED'] as const)('remove passageiro mantendo estado %s', async (status) => {
    await setTripSeatStatus({ tripId: trip.id, seatId, status }, dependencies)
    const assigned = await assign()
    const removed = await assign(seatId, null)
    expect(removed.status).toBe(status)
    expect(removed.id).toBe(assigned.id)
    expect(removed.createdAt).toBe(assigned.createdAt)
    expect(removed).not.toHaveProperty('passengerId')
  })

  it.each(['FREE', 'BLOCKED'] as const)('rejeita associação e remoção em %s', async (status) => {
    await setTripSeatStatus({ tripId: trip.id, seatId, status }, dependencies)
    await expect(assign()).rejects.toThrow(/somente assentos ocupados ou reservados/i)
    await expect(assign(seatId, null)).rejects.toThrow(/somente assentos ocupados ou reservados/i)
  })

  it('rejeita passageiro inexistente sem alterar o estado', async () => {
    const state = await setTripSeatStatus({ tripId: trip.id, seatId, status: 'OCCUPIED' }, dependencies)
    await expect(assign(seatId, 'missing' as PassengerId)).rejects.toThrow(/passageiro não encontrado/i)
    expect(await dependencies.tripSeatStateRepository.getByTripAndSeat(trip.id, seatId)).toEqual(state)
  })

  it('rejeita viagem inexistente', async () => {
    await expect(assign(seatId, passenger.id, 'missing' as TripId)).rejects.toThrow(/viagem não encontrada/i)
  })

  it.each(['COMPLETED', 'CANCELLED'] as const)('rejeita associação e remoção em viagem %s', async (status) => {
    await setTripSeatStatus({ tripId: trip.id, seatId, status: 'RESERVED' }, dependencies)
    await assign()
    await dependencies.tripRepository.save({ ...trip, status })
    await expect(assign()).rejects.toThrow(/concluída ou cancelada/i)
    await expect(assign(seatId, null)).rejects.toThrow(/concluída ou cancelada/i)
  })

  it('permite associação em viagem ACTIVE', async () => {
    await dependencies.tripRepository.save({ ...trip, status: 'ACTIVE' })
    await setTripSeatStatus({ tripId: trip.id, seatId, status: 'OCCUPIED' }, dependencies)
    expect((await assign()).passengerId).toBe(passenger.id)
  })

  it('rejeita o mesmo passageiro em outro assento da mesma viagem', async () => {
    await setTripSeatStatus({ tripId: trip.id, seatId, status: 'OCCUPIED' }, dependencies)
    await setTripSeatStatus({ tripId: trip.id, seatId: secondSeatId, status: 'RESERVED' }, dependencies)
    await assign()
    await expect(assign(secondSeatId)).rejects.toThrow(/outro assento desta viagem/i)
    expect((await dependencies.tripSeatStateRepository.getByTripAndSeat(trip.id, secondSeatId))?.passengerId).toBeUndefined()
  })

  it('permite o mesmo passageiro em viagens diferentes', async () => {
    const otherTrip = { ...trip, id: 'trip-b' as TripId }
    await dependencies.tripRepository.save(otherTrip)
    await setTripSeatStatus({ tripId: trip.id, seatId, status: 'OCCUPIED' }, dependencies)
    await setTripSeatStatus({ tripId: otherTrip.id, seatId: secondSeatId, status: 'RESERVED' }, dependencies)
    await assign()
    expect((await assign(secondSeatId, passenger.id, otherTrip.id)).passengerId).toBe(passenger.id)
  })

  it('é idempotente no mesmo assento e permite trocar de passageiro', async () => {
    await setTripSeatStatus({ tripId: trip.id, seatId, status: 'RESERVED' }, dependencies)
    const assigned = await assign()
    expect(await assign()).toEqual(assigned)
    const other = await createPassenger({ displayName: 'Pessoa', name: 'Maria' }, dependencies.passengerRepository)
    expect((await assign(seatId, other.id)).passengerId).toBe(other.id)
  })

  it('preserva passageiro ao alternar RESERVED e OCCUPIED', async () => {
    await setTripSeatStatus({ tripId: trip.id, seatId, status: 'RESERVED' }, dependencies)
    const assigned = await assign()
    for (const status of ['OCCUPIED', 'RESERVED'] as const) {
      const result = await setTripSeatStatus({ tripId: trip.id, seatId, status }, dependencies)
      expect(result).toMatchObject({ passengerId: passenger.id, id: assigned.id, createdAt: assigned.createdAt, status })
    }
  })

  it('BLOCKED remove passageiro e FREE apaga todo o estado', async () => {
    await setTripSeatStatus({ tripId: trip.id, seatId, status: 'OCCUPIED' }, dependencies)
    await assign()
    const blocked = await setTripSeatStatus({ tripId: trip.id, seatId, status: 'BLOCKED' }, dependencies)
    expect(blocked).not.toHaveProperty('passengerId')
    await setTripSeatStatus({ tripId: trip.id, seatId, status: 'OCCUPIED' }, dependencies)
    await assign()
    expect(await setTripSeatStatus({ tripId: trip.id, seatId, status: 'FREE' }, dependencies)).toBeUndefined()
    expect(await dependencies.tripSeatStateRepository.getByTripAndSeat(trip.id, seatId)).toBeUndefined()
  })

  it('persiste associação após fechar e reabrir o IndexedDB', async () => {
    await setTripSeatStatus({ tripId: trip.id, seatId, status: 'OCCUPIED' }, dependencies)
    const assigned = await assign()
    database.close()
    await database.open()
    expect(await dependencies.tripSeatStateRepository.getByTripAndSeat(trip.id, seatId)).toEqual(assigned)
  })
})
