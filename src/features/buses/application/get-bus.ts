import type { BusRepository } from '@/features/buses/application/bus-repository'
import type { BusId } from '@/features/buses/domain/ids'

export async function getBus(
  id: BusId,
  busRepository: BusRepository,
) {
  return busRepository.getById(id)
}
