import type { BusLayoutRepository } from '@/features/buses/application/bus-layout-repository'
import type { BusRepository } from '@/features/buses/application/bus-repository'
import type { BusLayout } from '@/features/buses/domain/bus-layout'
import type { Bus } from '@/features/buses/domain/bus'
import type { TripRepository } from '@/features/trips/application/trip-repository'
import type { Trip } from '@/features/trips/domain/trip'

export interface TripSummary {
  trip: Trip

  bus:
    | Bus
    | undefined

  layout:
    | BusLayout
    | undefined

  seatCount: number
}

export interface ListTripsDependencies {
  tripRepository: TripRepository
  busRepository: BusRepository
  busLayoutRepository:
    BusLayoutRepository
}

export async function listTrips(
  dependencies: ListTripsDependencies,
): Promise<
  readonly TripSummary[]
> {
  const trips =
    await dependencies
      .tripRepository
      .list()

  return Promise.all(
    trips.map(
      async (
        trip,
      ): Promise<TripSummary> => {
        const [
          bus,
          layout,
        ] = await Promise.all([
          dependencies
            .busRepository
            .getById(
              trip.busId,
            ),

          dependencies
            .busLayoutRepository
            .getById(
              trip.layoutId,
            ),
        ])

        const seatCount =
          layout?.elements.filter(
            (element) =>
              element.kind ===
              'seat',
          ).length ?? 0

        return {
          trip,
          bus,
          layout,
          seatCount,
        }
      },
    ),
  )
}
