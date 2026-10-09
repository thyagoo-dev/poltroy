import type { Bus } from '@/features/buses/domain/bus'
import type { BusId } from '@/features/buses/domain/ids'

export interface BusRepository {
  getById(id: BusId): Promise<Bus | undefined>

  list(): Promise<readonly Bus[]>

  save(bus: Bus): Promise<void>

  delete(id: BusId): Promise<void>
}
