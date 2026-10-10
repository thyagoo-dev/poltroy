import type { BackupRepository } from '@/features/backup/application/backup-repository'
import type { LocalDataSnapshot } from '@/features/backup/domain/backup-document'
import type { PoltroyDatabase } from '@/infrastructure/database/poltroy-database'

export class DexieBackupRepository implements BackupRepository {
  private readonly database: PoltroyDatabase

  constructor(database: PoltroyDatabase) {
    this.database = database
  }

  private stores() {
    const { buses, busLayouts, trips, passengers, tripSeatStates } = this.database
    return [buses, busLayouts, trips, passengers, tripSeatStates]
  }

  exportSnapshot(): Promise<LocalDataSnapshot> {
    return this.database.transaction('r', this.stores(), async () => {
      const buses = await this.database.buses.toArray()
      const busLayouts = await this.database.busLayouts.toArray()
      const trips = await this.database.trips.toArray()
      const passengers = await this.database.passengers.toArray()
      const tripSeatStates = await this.database.tripSeatStates.toArray()
      return { buses, busLayouts, trips, passengers, tripSeatStates }
    })
  }

  async replaceAll(snapshot: LocalDataSnapshot): Promise<void> {
    await this.database.transaction('rw', this.stores(), async () => {
      for (const store of this.stores()) await store.clear()
      await this.database.buses.bulkPut(snapshot.buses)
      await this.database.busLayouts.bulkPut(snapshot.busLayouts)
      await this.database.trips.bulkPut(snapshot.trips)
      await this.database.passengers.bulkPut(snapshot.passengers)
      await this.database.tripSeatStates.bulkPut(snapshot.tripSeatStates)
      // Errors must escape this callback so Dexie aborts the entire transaction.
    })
  }
}
