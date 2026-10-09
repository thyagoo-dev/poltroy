import type { BusLayoutRepository } from '@/features/buses/application/bus-layout-repository'
import type { BusRepository } from '@/features/buses/application/bus-repository'
import type { BusLayout } from '@/features/buses/domain/bus-layout'
import type { Bus } from '@/features/buses/domain/bus'
import type {
  BusId,
  BusLayoutId,
} from '@/features/buses/domain/ids'
import type { BusLayoutElement } from '@/features/seat-map/domain/layout-element'
import type {
  LayoutElementId,
  SeatId,
} from '@/features/seat-map/domain/ids'
import { createEntityId } from '@/shared/lib/create-entity-id'
import { createEntityTimestamps } from '@/shared/lib/timestamps'

export interface DuplicateBusDependencies {
  busRepository: BusRepository
  busLayoutRepository: BusLayoutRepository
}

function duplicateLayoutElement(
  element: BusLayoutElement,
): BusLayoutElement {
  if (element.kind === 'seat') {
    return {
      ...element,

      id: createEntityId<SeatId>(),

      position: {
        ...element.position,
      },
    }
  }

  return {
    ...element,

    id: createEntityId<LayoutElementId>(),

    position: {
      ...element.position,
    },
  }
}

export async function duplicateBus(
  sourceBusId: BusId,
  dependencies: DuplicateBusDependencies,
): Promise<Bus> {
  const sourceBus =
    await dependencies.busRepository
      .getById(sourceBusId)

  if (!sourceBus) {
    throw new Error(
      'Ônibus de origem não encontrado.',
    )
  }

  const sourceLayout =
    await dependencies.busLayoutRepository
      .getById(
        sourceBus.activeLayoutId,
      )

  if (!sourceLayout) {
    throw new Error(
      'Layout ativo do ônibus não encontrado.',
    )
  }

  const busId =
    createEntityId<BusId>()

  const layoutId =
    createEntityId<BusLayoutId>()

  const timestamps =
    createEntityTimestamps()

  const duplicatedLayout: BusLayout = {
    id: layoutId,
    busId,

    name: sourceLayout.name,
    version: 1,

    elements:
      sourceLayout.elements.map(
        duplicateLayoutElement,
      ),

    ...timestamps,
  }

  const duplicatedBus: Bus = {
    id: busId,

    name: `${sourceBus.name} - Cópia`,

    plate: undefined,
    model: sourceBus.model,

    activeLayoutId: layoutId,

    status: 'ACTIVE',

    ...timestamps,
  }

  await dependencies.busRepository
    .saveWithLayout(
      duplicatedBus,
      duplicatedLayout,
    )

  return duplicatedBus
}
