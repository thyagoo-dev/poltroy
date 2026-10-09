import type { BusLayout } from '@/features/buses/domain/bus-layout'
import type { Bus } from '@/features/buses/domain/bus'
import type { BusId } from '@/features/buses/domain/ids'

export interface BusRepository {
  getById(id: BusId): Promise<Bus | undefined>

  list(): Promise<readonly Bus[]>

  save(bus: Bus): Promise<void>

  saveWithLayout(
    bus: Bus,
    layout: BusLayout,
  ): Promise<void>

  delete(id: BusId): Promise<void>
}
