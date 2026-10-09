import type { PassengerRepository } from '@/features/passengers/application/passenger-repository'
import type { PassengerId } from '@/features/passengers/domain/ids'
import type { Passenger } from '@/features/passengers/domain/passenger'
import type { PoltroyDatabase } from '@/infrastructure/database/poltroy-database'

export class DexiePassengerRepository
  implements PassengerRepository
{
  private readonly database: PoltroyDatabase

  constructor(database: PoltroyDatabase) {
    this.database = database
  }

  async getById(
    id: PassengerId,
  ): Promise<Passenger | undefined> {
    return this.database.passengers.get(id)
  }

  async list(): Promise<
    readonly Passenger[]
  > {
    return this.database.passengers
      .orderBy('name')
      .toArray()
  }

  async save(
    passenger: Passenger,
  ): Promise<void> {
    await this.database.passengers.put(
      passenger,
    )
  }

  async delete(
    id: PassengerId,
  ): Promise<void> {
    await this.database.passengers.delete(id)
  }
}
