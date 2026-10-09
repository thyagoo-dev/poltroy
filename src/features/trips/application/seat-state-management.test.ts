import {
  describe,
  expect,
  it,
} from 'vitest'

import type { BusLayoutRepository } from '@/features/buses/application/bus-layout-repository'
import type { BusLayout } from '@/features/buses/domain/bus-layout'
import type {
  BusId,
  BusLayoutId,
} from '@/features/buses/domain/ids'
import type { PassengerId } from '@/features/passengers/domain/ids'
import type { SeatId } from '@/features/seat-map/domain/ids'
import { listTripSeatStates } from '@/features/trips/application/list-trip-seat-states'
import { setTripSeatStatus } from '@/features/trips/application/set-trip-seat-status'
import type { TripRepository } from '@/features/trips/application/trip-repository'
import type { TripSeatStateRepository } from '@/features/trips/application/trip-seat-state-repository'
import type {
  TripId,
  TripSeatStateId,
} from '@/features/trips/domain/ids'
import type { TripSeatState } from '@/features/trips/domain/trip-seat-state'
import type { Trip } from '@/features/trips/domain/trip'

const busId =
  'bus-1' as BusId

const layoutId =
  'layout-1' as BusLayoutId

const tripId =
  'trip-1' as TripId

const seatId =
  'seat-01' as SeatId

const createdAt =
  '2026-10-09T00:00:00.000Z'

const layout: BusLayout = {
  id: layoutId,
  busId,

  name: 'Layout teste',
  version: 1,

  elements: [
    {
      id: seatId,

      kind: 'seat',

      seatNumber: '01',
      seatType: 'STANDARD',

      position: {
        deck: 1,
        row: 2,
        column: 1,
      },
    },
  ],

  createdAt,
  updatedAt: createdAt,
}

function createTrip(
  overrides:
    Partial<Trip> = {},
): Trip {
  return {
    id: tripId,

    busId,
    layoutId,

    origin: 'Iguatu',
    destination:
      'Fortaleza',

    departureAt:
      '2026-10-10T08:00:00.000Z',

    status: 'PLANNED',

    createdAt,
    updatedAt: createdAt,

    ...overrides,
  }
}

class FakeTripRepository
  implements TripRepository
{
  private readonly trip: Trip

  constructor(trip: Trip) {
    this.trip = trip
  }

  getById(id: TripId) {
    return Promise.resolve(
      id === this.trip.id
        ? this.trip
        : undefined,
    )
  }

  list() {
    return Promise.resolve([
      this.trip,
    ])
  }

  listByBusId(
    targetBusId: BusId,
  ) {
    return Promise.resolve(
      targetBusId ===
        this.trip.busId
        ? [this.trip]
        : [],
    )
  }

  async save() {}

  async delete() {}
}

class FakeBusLayoutRepository
  implements BusLayoutRepository
{
  getById(
    id: BusLayoutId,
  ) {
    return Promise.resolve(
      id === layout.id
        ? layout
        : undefined,
    )
  }

  getByBusAndVersion(
    targetBusId: BusId,
    version: number,
  ) {
    return Promise.resolve(
      targetBusId ===
          layout.busId &&
        version ===
          layout.version
        ? layout
        : undefined,
    )
  }

  listByBusId(
    targetBusId: BusId,
  ) {
    return Promise.resolve(
      targetBusId ===
        layout.busId
        ? [layout]
        : [],
    )
  }

  async save() {}

  async delete() {}
}

class FakeTripSeatStateRepository
  implements TripSeatStateRepository
{
  private readonly items =
    new Map<
      string,
      TripSeatState
    >()

  constructor(
    initialItems:
      readonly TripSeatState[] = [],
  ) {
    for (
      const item of
        initialItems
    ) {
      this.items.set(
        this.key(
          item.tripId,
          item.seatId,
        ),
        item,
      )
    }
  }

  private key(
    targetTripId: TripId,
    targetSeatId: SeatId,
  ) {
    return `${targetTripId}:${targetSeatId}`
  }

  getByTripAndSeat(
    targetTripId: TripId,
    targetSeatId: SeatId,
  ) {
    return Promise.resolve(
      this.items.get(
        this.key(
          targetTripId,
          targetSeatId,
        ),
      ),
    )
  }

  listByTripId(
    targetTripId: TripId,
  ) {
    return Promise.resolve(
      [
        ...this.items.values(),
      ].filter(
        (item) =>
          item.tripId ===
          targetTripId,
      ),
    )
  }

  async save(
    state: TripSeatState,
  ) {
    this.items.set(
      this.key(
        state.tripId,
        state.seatId,
      ),
      state,
    )
  }

  async deleteByTripAndSeat(
    targetTripId: TripId,
    targetSeatId: SeatId,
  ) {
    this.items.delete(
      this.key(
        targetTripId,
        targetSeatId,
      ),
    )
  }

  async deleteByTripId(
    targetTripId: TripId,
  ) {
    for (
      const [
        key,
        value,
      ] of this.items
    ) {
      if (
        value.tripId ===
        targetTripId
      ) {
        this.items.delete(
          key,
        )
      }
    }
  }
}

function createDependencies(
  trip = createTrip(),
  states:
    readonly TripSeatState[] = [],
) {
  return {
    tripRepository:
      new FakeTripRepository(
        trip,
      ),

    busLayoutRepository:
      new FakeBusLayoutRepository(),

    tripSeatStateRepository:
      new FakeTripSeatStateRepository(
        states,
      ),
  }
}

describe(
  'trip seat state management',
  () => {
    it(
      'lista os estados persistidos da viagem',
      async () => {
        const state:
          TripSeatState = {
          id:
            'state-1' as TripSeatStateId,

          tripId,
          seatId,

          status:
            'RESERVED',

          createdAt,
          updatedAt:
            createdAt,
        }

        const dependencies =
          createDependencies(
            createTrip(),
            [state],
          )

        expect(
          await listTripSeatStates(
            tripId,
            dependencies
              .tripSeatStateRepository,
          ),
        ).toEqual([
          state,
        ])
      },
    )

    it(
      'cria estado OCCUPIED para um assento livre',
      async () => {
        const dependencies =
          createDependencies()

        const result =
          await setTripSeatStatus(
            {
              tripId,
              seatId,

              status:
                'OCCUPIED',
            },

            dependencies,
          )

        expect(
          result?.status,
        ).toBe(
          'OCCUPIED',
        )

        expect(
          await dependencies
            .tripSeatStateRepository
            .getByTripAndSeat(
              tripId,
              seatId,
            ),
        ).toEqual(result)
      },
    )

    it(
      'reutiliza o mesmo estado ao mudar RESERVED para OCCUPIED',
      async () => {
        const state:
          TripSeatState = {
          id:
            'state-1' as TripSeatStateId,

          tripId,
          seatId,

          status:
            'RESERVED',

          createdAt,
          updatedAt:
            createdAt,
        }

        const dependencies =
          createDependencies(
            createTrip(),
            [state],
          )

        const result =
          await setTripSeatStatus(
            {
              tripId,
              seatId,

              status:
                'OCCUPIED',
            },

            dependencies,
          )

        expect(
          result?.id,
        ).toBe(state.id)

        expect(
          result?.status,
        ).toBe(
          'OCCUPIED',
        )
      },
    )

    it(
      'FREE remove o estado persistido',
      async () => {
        const state:
          TripSeatState = {
          id:
            'state-1' as TripSeatStateId,

          tripId,
          seatId,

          status:
            'BLOCKED',

          createdAt,
          updatedAt:
            createdAt,
        }

        const dependencies =
          createDependencies(
            createTrip(),
            [state],
          )

        const result =
          await setTripSeatStatus(
            {
              tripId,
              seatId,
              status:
                'FREE',
            },

            dependencies,
          )

        expect(
          result,
        ).toBeUndefined()

        expect(
          await dependencies
            .tripSeatStateRepository
            .getByTripAndSeat(
              tripId,
              seatId,
            ),
        ).toBeUndefined()
      },
    )

    it(
      'BLOCKED remove associação de passageiro existente',
      async () => {
        const state:
          TripSeatState = {
          id:
            'state-1' as TripSeatStateId,

          tripId,
          seatId,

          status:
            'OCCUPIED',

          passengerId:
            'passenger-1' as PassengerId,

          createdAt,
          updatedAt:
            createdAt,
        }

        const dependencies =
          createDependencies(
            createTrip(),
            [state],
          )

        const result =
          await setTripSeatStatus(
            {
              tripId,
              seatId,

              status:
                'BLOCKED',
            },

            dependencies,
          )

        expect(
          result?.status,
        ).toBe(
          'BLOCKED',
        )

        expect(
          result &&
            'passengerId' in
              result,
        ).toBe(false)
      },
    )

    it(
      'recusa assento que não pertence ao layout da viagem',
      async () => {
        const dependencies =
          createDependencies()

        await expect(
          setTripSeatStatus(
            {
              tripId,

              seatId:
                'unknown-seat' as SeatId,

              status:
                'OCCUPIED',
            },

            dependencies,
          ),
        ).rejects.toThrow(
          /não pertence/i,
        )
      },
    )

    it(
      'recusa alteração em viagem concluída',
      async () => {
        const dependencies =
          createDependencies(
            createTrip({
              status:
                'COMPLETED',

              completedAt:
                createdAt,
            }),
          )

        await expect(
          setTripSeatStatus(
            {
              tripId,
              seatId,

              status:
                'RESERVED',
            },

            dependencies,
          ),
        ).rejects.toThrow(
          /concluída ou cancelada/i,
        )
      },
    )

    it(
      'permite alterar assentos em viagem em andamento',
      async () => {
        const dependencies =
          createDependencies(
            createTrip({
              status:
                'ACTIVE',

              startedAt:
                createdAt,
            }),
          )

        const result =
          await setTripSeatStatus(
            {
              tripId,
              seatId,

              status:
                'RESERVED',
            },

            dependencies,
          )

        expect(
          result?.status,
        ).toBe(
          'RESERVED',
        )
      },
    )
  },
)
