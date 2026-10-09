import type { BusLayoutRepository } from '@/features/buses/application/bus-layout-repository'
import type { BusLayoutId } from '@/features/buses/domain/ids'

export async function getBusLayout(
  id: BusLayoutId,
  repository: BusLayoutRepository,
) {
  return repository.getById(id)
}
