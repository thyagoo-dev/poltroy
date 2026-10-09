import {
  describe,
  expect,
  it,
} from 'vitest'

import type { BusLayoutRepository } from '@/features/buses/application/bus-layout-repository'
import type { BusRepository } from '@/features/buses/application/bus-repository'
import type { BusLayout } from '@/features/buses/domain/bus-layout'
import type { Bus } from '@/features/buses/domain/bus'
import type {
  BusId,
  BusLayoutId,
} from '@/features/buses/domain/ids'
import type { TripRepository } from '@/features/trips/application/trip-repository'
import { cancelTrip } from '@/features/trips/application/cancel-trip'
import { completeTrip } from '@/features/trips/application/complete-trip'
import { createTrip } from '@/features/trips/application/create-trip'
import { startTrip } from '@/features/trips/application/start-trip'
import { updateTrip } from '@/features/trips/application/update-trip'
import type { TripId } from '@/features/trips/domain/ids'
import type { Trip } from '@/features/trips/domain/trip'

const busId =
  'bus-1' as BusId

const secondBusId =
  'bus-2' as BusId

const layoutId =
  'layout-1' as BusLayoutId

const secondLayoutId =
  'layout-2' as BusLayoutId

const createdAt =
  '2026-10-09T00:00:00.000Z'

const bus: Bus = {
  id: busId,

  name: 'Ônibus 01',

  activeLayoutId:
    layoutId,

  status: 'ACTIVE',

  createdAt,
  updatedAt: createdAt,
}

const secondBus: Bus = {
  id: secondBusId,

  name: 'Ônibus 02',

  activeLayoutId:
    secondLayoutId,

  status: 'ACTIVE',

  createdAt,
  updatedAt: createdAt,
}

const layout: BusLayout = {
  id: layoutId,
  busId,

  name: 'Layout 01',
  version: 1,

  elements: [],

  createdAt,
  updatedAt: createdAt,
}

const secondLayout:
  BusLayout = {
  id: secondLayoutId,
  busId: secondBusId,

  name: 'Layout 02',
  version: 1,

  elements: [],

  createdAt,
  updatedAt: createdAt,
}

class FakeBusRepository
  implements BusRepository
{
  private readonly items =
    new Map<
      BusId,
      Bus
    >()

  constructor(
    initialItems:
      readonly Bus[],
  ) {
    for (
      const item of
        initialItems
    ) {
      this.items.set(
        item.id,
        item,
      )
    }
  }

  getById(id: BusId) {
    return Promise.resolve(
      this.items.get(id),
    )
  }

  list() {
    return Promise.resolve(
      [...this.items.values()],
    )
  }

  async save(bus: Bus) {
    this.items.set(
      bus.id,
      bus,
    )
  }

  async saveWithLayout(
    bus: Bus,
  ) {
    await this.save(bus)
  }

  async delete(id: BusId) {
    this.items.delete(id)
  }
}

class FakeBusLayoutRepository
  implements BusLayoutRepository
{
  private readonly items =
    new Map<
      BusLayoutId,
      BusLayout
    >()

  constructor(
    initialItems:
      readonly BusLayout[],
  ) {
    for (
      const item of
        initialItems
    ) {
      this.items.set(
        item.id,
        item,
      )
    }
  }

  getById(
    id: BusLayoutId,
  ) {
    return Promise.resolve(
      this.items.get(id),
    )
  }

  getByBusAndVersion(
    targetBusId: BusId,
    version: number,
  ) {
    return Promise.resolve(
      [...this.items.values()].find(
        (item) =>
          item.busId ===
            targetBusId &&
          item.version ===
            version,
      ),
    )
  }

  listByBusId(
    targetBusId: BusId,
  ) {
    return Promise.resolve(
      [...this.items.values()].filter(
        (item) =>
          item.busId ===
          targetBusId,
      ),
    )
  }

  async save(
    item: BusLayout,
  ) {
    this.items.set(
      item.id,
      item,
    )
  }

  async delete(
    id: BusLayoutId,
  ) {
    this.items.delete(id)
  }
}

class FakeTripRepository
  implements TripRepository
{
  private readonly items =
    new Map<
      TripId,
      Trip
    >()

  constructor(
    initialItems:
      readonly Trip[] = [],
  ) {
    for (
      const item of
        initialItems
    ) {
      this.items.set(
        item.id,
        item,
      )
    }
  }

  getById(id: TripId) {
    return Promise.resolve(
      this.items.get(id),
    )
  }

  list() {
    return Promise.resolve(
      [...this.items.values()],
    )
  }

  listByBusId(
    targetBusId: BusId,
  ) {
    return Promise.resolve(
      [...this.items.values()].filter(
        (item) =>
          item.busId ===
          targetBusId,
      ),
    )
  }

  async save(trip: Trip) {
    this.items.set(
      trip.id,
      trip,
    )
  }

  async delete(id: TripId) {
    this.items.delete(id)
  }
}

function createRepositories(
  trips:
    readonly Trip[] = [],
) {
  return {
    busRepository:
      new FakeBusRepository([
        bus,
        secondBus,
      ]),

    busLayoutRepository:
      new FakeBusLayoutRepository([
        layout,
        secondLayout,
      ]),

    tripRepository:
      new FakeTripRepository(
        trips,
      ),
  }
}

function createPlannedTrip(
  overrides:
    Partial<Trip> = {},
): Trip {
  return {
    id:
      'trip-1' as TripId,

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

describe(
  'trip management',
  () => {
    it(
      'cria uma viagem usando o layout ativo do ônibus',
      async () => {
        const repositories =
          createRepositories()

        const trip =
          await createTrip(
            {
              busId,

              origin:
                ' Iguatu ',
              destination:
                ' Fortaleza ',

              departureAt:
                '2026-10-10T08:00:00.000Z',
            },

            repositories,
          )

        expect(
          trip,
        ).toMatchObject({
          busId,
          layoutId,

          origin: 'Iguatu',
          destination:
            'Fortaleza',

          status: 'PLANNED',
        })

        expect(
          await repositories
            .tripRepository
            .getById(
              trip.id,
            ),
        ).toEqual(trip)
      },
    )

    it(
      'recusa criar viagem para ônibus arquivado',
      async () => {
        const archivedBus: Bus = {
          ...bus,
          status: 'ARCHIVED',
        }

        const repositories = {
          busRepository:
            new FakeBusRepository([
              archivedBus,
            ]),

          busLayoutRepository:
            new FakeBusLayoutRepository([
              layout,
            ]),

          tripRepository:
            new FakeTripRepository(),
        }

        await expect(
          createTrip(
            {
              busId,

              origin:
                'Iguatu',

              destination:
                'Fortaleza',

              departureAt:
                '2026-10-10T08:00:00.000Z',
            },

            repositories,
          ),
        ).rejects.toThrow(
          /arquivado/i,
        )
      },
    )

    it(
      'recusa origem e destino iguais',
      async () => {
        const repositories =
          createRepositories()

        await expect(
          createTrip(
            {
              busId,

              origin:
                'Iguatu',

              destination:
                'iguatu',

              departureAt:
                '2026-10-10T08:00:00.000Z',
            },

            repositories,
          ),
        ).rejects.toThrow(
          /diferentes/i,
        )
      },
    )

    it(
      'preserva o layout original ao editar a mesma viagem e manter o ônibus',
      async () => {
        const trip =
          createPlannedTrip()

        const changedBus: Bus = {
          ...bus,

          activeLayoutId:
            secondLayoutId,
        }

        const repositories = {
          busRepository:
            new FakeBusRepository([
              changedBus,
            ]),

          busLayoutRepository:
            new FakeBusLayoutRepository([
              layout,
              secondLayout,
            ]),

          tripRepository:
            new FakeTripRepository([
              trip,
            ]),
        }

        const updated =
          await updateTrip(
            {
              id: trip.id,
              busId,

              origin:
                'Iguatu',

              destination:
                'Fortaleza',

              departureAt:
                trip.departureAt,

              notes:
                'Atualizada',
            },

            repositories,
          )

        expect(
          updated.layoutId,
        ).toBe(layoutId)
      },
    )

    it(
      'usa o layout ativo do novo ônibus quando o ônibus da viagem é alterado',
      async () => {
        const trip =
          createPlannedTrip()

        const repositories =
          createRepositories([
            trip,
          ])

        const updated =
          await updateTrip(
            {
              id: trip.id,

              busId:
                secondBusId,

              origin:
                trip.origin,

              destination:
                trip.destination,

              departureAt:
                trip.departureAt,
            },

            repositories,
          )

        expect(
          updated.busId,
        ).toBe(
          secondBusId,
        )

        expect(
          updated.layoutId,
        ).toBe(
          secondLayoutId,
        )
      },
    )

    it(
      'não permite editar viagem em andamento',
      async () => {
        const trip =
          createPlannedTrip({
            status: 'ACTIVE',
          })

        const repositories =
          createRepositories([
            trip,
          ])

        await expect(
          updateTrip(
            {
              id: trip.id,
              busId,

              origin:
                trip.origin,

              destination:
                trip.destination,

              departureAt:
                trip.departureAt,
            },

            repositories,
          ),
        ).rejects.toThrow(
          /planejadas/i,
        )
      },
    )

    it(
      'inicia uma viagem planejada',
      async () => {
        const trip =
          createPlannedTrip()

        const repositories =
          createRepositories([
            trip,
          ])

        const result =
          await startTrip(
            trip.id,
            repositories,
          )

        expect(
          result.status,
        ).toBe('ACTIVE')

        expect(
          result.startedAt,
        ).toBeTruthy()
      },
    )

    it(
      'não inicia viagem se o ônibus estiver arquivado',
      async () => {
        const trip =
          createPlannedTrip()

        const repositories =
          createRepositories([
            trip,
          ])

        await repositories
          .busRepository
          .save({
            ...bus,
            status:
              'ARCHIVED',
          })

        await expect(
          startTrip(
            trip.id,
            repositories,
          ),
        ).rejects.toThrow(
          /ativo/i,
        )
      },
    )

    it(
      'conclui somente uma viagem em andamento',
      async () => {
        const trip =
          createPlannedTrip({
            status: 'ACTIVE',
            startedAt:
              createdAt,
          })

        const repositories =
          createRepositories([
            trip,
          ])

        const result =
          await completeTrip(
            trip.id,
            repositories,
          )

        expect(
          result.status,
        ).toBe(
          'COMPLETED',
        )

        expect(
          result.completedAt,
        ).toBeTruthy()
      },
    )

    it(
      'cancela uma viagem planejada',
      async () => {
        const trip =
          createPlannedTrip()

        const repositories =
          createRepositories([
            trip,
          ])

        const result =
          await cancelTrip(
            trip.id,
            repositories,
          )

        expect(
          result.status,
        ).toBe(
          'CANCELLED',
        )

        expect(
          result.cancelledAt,
        ).toBeTruthy()
      },
    )

    it(
      'não permite cancelar viagem já concluída',
      async () => {
        const trip =
          createPlannedTrip({
            status:
              'COMPLETED',

            completedAt:
              createdAt,
          })

        const repositories =
          createRepositories([
            trip,
          ])

        await expect(
          cancelTrip(
            trip.id,
            repositories,
          ),
        ).rejects.toThrow(
          /não é possível/i,
        )
      },
    )
  },
)
