import Dexie, {
  type Table,
} from 'dexie'

import type { BusLayout } from '@/features/buses/domain/bus-layout'
import type { Bus } from '@/features/buses/domain/bus'
import type {
  BusId,
  BusLayoutId,
} from '@/features/buses/domain/ids'
import type { PassengerId } from '@/features/passengers/domain/ids'
import type { Passenger } from '@/features/passengers/domain/passenger'
import type {
  TripId,
  TripSeatStateId,
} from '@/features/trips/domain/ids'
import type { TripSeatState } from '@/features/trips/domain/trip-seat-state'
import type { Trip } from '@/features/trips/domain/trip'
import {
  databaseSchemaV1,
  POLTROY_DATABASE_NAME,
  POLTROY_DATABASE_VERSION,
} from '@/infrastructure/database/schema'

export class PoltroyDatabase extends Dexie {
  buses!: Table<Bus, BusId>

  busLayouts!: Table<
    BusLayout,
    BusLayoutId
  >

  trips!: Table<Trip, TripId>

  passengers!: Table<
    Passenger,
    PassengerId
  >

  tripSeatStates!: Table<
    TripSeatState,
    TripSeatStateId
  >

  constructor(
    databaseName: string = POLTROY_DATABASE_NAME,
  ) {
    super(databaseName)

    this.version(
      POLTROY_DATABASE_VERSION,
    ).stores(databaseSchemaV1)
  }
}
