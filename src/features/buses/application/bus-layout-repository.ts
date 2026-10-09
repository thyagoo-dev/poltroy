import type { BusLayout } from '@/features/buses/domain/bus-layout'
import type {
  BusId,
  BusLayoutId,
} from '@/features/buses/domain/ids'

export interface BusLayoutRepository {
  getById(
    id: BusLayoutId,
  ): Promise<BusLayout | undefined>

  getByBusAndVersion(
    busId: BusId,
    version: number,
  ): Promise<BusLayout | undefined>

  listByBusId(
    busId: BusId,
  ): Promise<readonly BusLayout[]>

  save(layout: BusLayout): Promise<void>

  delete(id: BusLayoutId): Promise<void>
}
