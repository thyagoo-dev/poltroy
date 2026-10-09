import type { BusLayoutRepository } from '@/features/buses/application/bus-layout-repository'
import type { BusRepository } from '@/features/buses/application/bus-repository'
import type { BusLayout } from '@/features/buses/domain/bus-layout'
import type { Bus } from '@/features/buses/domain/bus'

export interface BusSummary {
  bus: Bus

  activeLayout:
    | BusLayout
    | undefined

  seatCount: number
}

export interface ListBusesDependencies {
  busRepository: BusRepository
  busLayoutRepository: BusLayoutRepository
}

export async function listBuses(
  dependencies: ListBusesDependencies,
): Promise<readonly BusSummary[]> {
  const buses =
    await dependencies.busRepository
      .list()

  return Promise.all(
    buses.map(async (bus) => {
      const activeLayout =
        await dependencies
          .busLayoutRepository
          .getById(
            bus.activeLayoutId,
          )

      const seatCount =
        activeLayout?.elements.filter(
          (element) =>
            element.kind === 'seat',
        ).length ?? 0

      return {
        bus,
        activeLayout,
        seatCount,
      }
    }),
  )
}
