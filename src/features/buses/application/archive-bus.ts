import type { BusRepository } from '@/features/buses/application/bus-repository'
import type { Bus } from '@/features/buses/domain/bus'
import type { BusId } from '@/features/buses/domain/ids'
import { toIsoTimestamp } from '@/shared/lib/timestamps'

export interface ArchiveBusDependencies {
  busRepository: BusRepository
}

export async function archiveBus(
  id: BusId,
  dependencies: ArchiveBusDependencies,
): Promise<Bus> {
  const bus =
    await dependencies.busRepository
      .getById(id)

  if (!bus) {
    throw new Error(
      'Ônibus não encontrado.',
    )
  }

  const timestamp =
    toIsoTimestamp()

  const archivedBus: Bus = {
    ...bus,

    status: 'ARCHIVED',

    archivedAt: timestamp,
    updatedAt: timestamp,
  }

  await dependencies.busRepository.save(
    archivedBus,
  )

  return archivedBus
}
