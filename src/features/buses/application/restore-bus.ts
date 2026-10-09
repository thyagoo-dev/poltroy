import type { BusRepository } from '@/features/buses/application/bus-repository'
import type { Bus } from '@/features/buses/domain/bus'
import type { BusId } from '@/features/buses/domain/ids'
import { toIsoTimestamp } from '@/shared/lib/timestamps'

export interface RestoreBusDependencies {
  busRepository: BusRepository
}

export async function restoreBus(
  id: BusId,
  dependencies: RestoreBusDependencies,
): Promise<Bus> {
  const bus =
    await dependencies.busRepository
      .getById(id)

  if (!bus) {
    throw new Error(
      'Ônibus não encontrado.',
    )
  }

  const restoredBus: Bus = {
    ...bus,

    status: 'ACTIVE',

    archivedAt: undefined,
    updatedAt: toIsoTimestamp(),
  }

  await dependencies.busRepository.save(
    restoredBus,
  )

  return restoredBus
}
