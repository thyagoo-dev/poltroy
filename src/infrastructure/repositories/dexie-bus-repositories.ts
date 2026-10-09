import type { BusLayoutRepository } from '@/features/buses/application/bus-layout-repository'
import type { BusRepository } from '@/features/buses/application/bus-repository'
import type { BusLayout } from '@/features/buses/domain/bus-layout'
import type { Bus } from '@/features/buses/domain/bus'
import type {
  BusId,
  BusLayoutId,
} from '@/features/buses/domain/ids'
import type { PoltroyDatabase } from '@/infrastructure/database/poltroy-database'

export class DexieBusRepository
  implements BusRepository
{
  private readonly database: PoltroyDatabase

  constructor(database: PoltroyDatabase) {
    this.database = database
  }

  async getById(
    id: BusId,
  ): Promise<Bus | undefined> {
    return this.database.buses.get(id)
  }

  async list(): Promise<readonly Bus[]> {
    return this.database.buses
      .orderBy('name')
      .toArray()
  }

  async save(bus: Bus): Promise<void> {
    await this.database.buses.put(bus)
  }

  async delete(id: BusId): Promise<void> {
    await this.database.buses.delete(id)
  }
}

export class DexieBusLayoutRepository
  implements BusLayoutRepository
{
  private readonly database: PoltroyDatabase

  constructor(database: PoltroyDatabase) {
    this.database = database
  }

  async getById(
    id: BusLayoutId,
  ): Promise<BusLayout | undefined> {
    return this.database.busLayouts.get(id)
  }

  async getByBusAndVersion(
    busId: BusId,
    version: number,
  ): Promise<BusLayout | undefined> {
    return this.database.busLayouts
      .where('[busId+version]')
      .equals([
        busId,
        version,
      ])
      .first()
  }

  async listByBusId(
    busId: BusId,
  ): Promise<readonly BusLayout[]> {
    return this.database.busLayouts
      .where('busId')
      .equals(busId)
      .sortBy('version')
  }

  async save(
    layout: BusLayout,
  ): Promise<void> {
    await this.database.busLayouts.put(
      layout,
    )
  }

  async delete(
    id: BusLayoutId,
  ): Promise<void> {
    await this.database.busLayouts.delete(id)
  }
}
