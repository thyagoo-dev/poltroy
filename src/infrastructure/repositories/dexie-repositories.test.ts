import 'fake-indexeddb/auto'

import { createEntityId } from '@/shared/lib/create-entity-id'

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest'

import type {
  BusId,
  BusLayoutId,
} from '@/features/buses/domain/ids'
import type { Bus } from '@/features/buses/domain/bus'
import type { BusLayout } from '@/features/buses/domain/bus-layout'
import type { PassengerId } from '@/features/passengers/domain/ids'
import type { Passenger } from '@/features/passengers/domain/passenger'
import type { SeatId } from '@/features/seat-map/domain/ids'
import type {
  TripId,
  TripSeatStateId,
} from '@/features/trips/domain/ids'
import type { TripSeatState } from '@/features/trips/domain/trip-seat-state'
import type { Trip } from '@/features/trips/domain/trip'
import { PoltroyDatabase } from '@/infrastructure/database/poltroy-database'
import {
  DexieBusLayoutRepository,
  DexieBusRepository,
} from '@/infrastructure/repositories/dexie-bus-repositories'
import { DexiePassengerRepository } from '@/infrastructure/repositories/dexie-passenger-repository'
import {
  DexieTripRepository,
  DexieTripSeatStateRepository,
} from '@/infrastructure/repositories/dexie-trip-repositories'

const createdAt =
  '2026-10-09T00:00:00.000Z'

const updatedAt =
  '2026-10-09T00:00:00.000Z'

const busId = 'bus-1' as BusId
const layoutId = 'layout-1' as BusLayoutId
const passengerId =
  'passenger-1' as PassengerId
const tripId = 'trip-1' as TripId
const seatId = 'seat-18' as SeatId

const bus: Bus = {
  id: busId,

  name: 'Expresso Litoral - 01',
  plate: 'ABC1D23',
  model: 'Modelo executivo',

  activeLayoutId: layoutId,

  status: 'ACTIVE',

  createdAt,
  updatedAt,
}

const layout: BusLayout = {
  id: layoutId,
  busId,

  name: 'Layout principal',
  version: 1,

  elements: [
    {
      id: seatId,
      kind: 'seat',
      seatNumber: '18',
      seatType: 'EXECUTIVE',
      position: {
        deck: 1,
        row: 5,
        column: 1,
      },
    },
  ],

  createdAt,
  updatedAt,
}

const passenger: Passenger = {
  id: passengerId,

  name: 'João Silva',
  phone: '85999999999',

  createdAt,
  updatedAt,
}

const trip: Trip = {
  id: tripId,

  busId,
  layoutId,

  origin: 'Iguatu',
  destination: 'Fortaleza',

  departureAt:
    '2026-10-10T08:00:00.000Z',

  status: 'PLANNED',

  createdAt,
  updatedAt,
}

let database: PoltroyDatabase

beforeEach(async () => {
  database = new PoltroyDatabase(
    `poltroy-test-${createEntityId<string>()}`,
  )

  await database.open()
})

afterEach(async () => {
  await database.delete()
})

describe('Dexie repositories', () => {
  it('persiste e recupera um ônibus', async () => {
    const repository =
      new DexieBusRepository(database)

    await repository.save(bus)

    const result =
      await repository.getById(busId)

    expect(result).toEqual(bus)
  })

  it('persiste o layout e seus elementos', async () => {
    const repository =
      new DexieBusLayoutRepository(
        database,
      )

    await repository.save(layout)

    const result =
      await repository.getByBusAndVersion(
        busId,
        1,
      )

    expect(result).toEqual(layout)

    expect(result?.elements).toHaveLength(
      1,
    )

    expect(
      result?.elements[0]?.kind,
    ).toBe('seat')
  })

  it('persiste passageiro e viagem', async () => {
    const passengerRepository =
      new DexiePassengerRepository(
        database,
      )

    const tripRepository =
      new DexieTripRepository(database)

    await passengerRepository.save(
      passenger,
    )

    await tripRepository.save(trip)

    expect(
      await passengerRepository.getById(
        passengerId,
      ),
    ).toEqual(passenger)

    expect(
      await tripRepository.getById(
        tripId,
      ),
    ).toEqual(trip)
  })

  it('consulta e remove estado pelo par viagem e assento', async () => {
    const repository =
      new DexieTripSeatStateRepository(
        database,
      )

    const state: TripSeatState = {
      id: 'state-1' as TripSeatStateId,

      tripId,
      seatId,

      passengerId,
      status: 'OCCUPIED',

      createdAt,
      updatedAt,
    }

    await repository.save(state)

    expect(
      await repository.getByTripAndSeat(
        tripId,
        seatId,
      ),
    ).toEqual(state)

    await repository.deleteByTripAndSeat(
      tripId,
      seatId,
    )

    expect(
      await repository.getByTripAndSeat(
        tripId,
        seatId,
      ),
    ).toBeUndefined()
  })

  it('impede dois estados para o mesmo assento na mesma viagem', async () => {
    const firstState: TripSeatState = {
      id: 'state-1' as TripSeatStateId,

      tripId,
      seatId,

      status: 'OCCUPIED',

      createdAt,
      updatedAt,
    }

    const secondState: TripSeatState = {
      id: 'state-2' as TripSeatStateId,

      tripId,
      seatId,

      status: 'RESERVED',

      createdAt,
      updatedAt,
    }

    await database.tripSeatStates.add(
      firstState,
    )

    await expect(
      database.tripSeatStates.add(
        secondState,
      ),
    ).rejects.toThrow()
  })
})

describe('saveWithLayout', () => {
  it('salva ônibus e layout na mesma transação', async () => {
    const repository = new DexieBusRepository(database)

    await repository.saveWithLayout(bus, layout)

    expect(await database.buses.get(busId)).toEqual(bus)
    expect(await database.busLayouts.get(layoutId)).toEqual(layout)
  })

  it('reverte o layout se a gravação do ônibus falhar', async () => {
    const repository = new DexieBusRepository(database)
    const invalidBus: Bus = {
      ...bus,
      id: undefined as unknown as BusId,
    }

    await expect(
      repository.saveWithLayout(invalidBus, layout),
    ).rejects.toThrow()

    expect(await database.busLayouts.get(layoutId)).toBeUndefined()
    expect(await database.buses.count()).toBe(0)
  })
})