import { poltroyDatabase } from '@/infrastructure/database/database'
import { DexieBackupRepository } from '@/infrastructure/repositories/dexie-backup-repository'
import {
  DexieBusLayoutRepository,
  DexieBusRepository,
} from '@/infrastructure/repositories/dexie-bus-repositories'
import { DexiePassengerRepository } from '@/infrastructure/repositories/dexie-passenger-repository'
import {
  DexieTripRepository,
  DexieTripSeatStateRepository,
} from '@/infrastructure/repositories/dexie-trip-repositories'

export const busRepository =
  new DexieBusRepository(
    poltroyDatabase,
  )

export const backupRepository = new DexieBackupRepository(poltroyDatabase)

export const busLayoutRepository =
  new DexieBusLayoutRepository(
    poltroyDatabase,
  )

export const passengerRepository =
  new DexiePassengerRepository(
    poltroyDatabase,
  )

export const tripRepository =
  new DexieTripRepository(
    poltroyDatabase,
  )

export const tripSeatStateRepository =
  new DexieTripSeatStateRepository(
    poltroyDatabase,
  )
