import type { BusId } from '@/features/buses/domain/ids'
import type { TripId } from '@/features/trips/domain/ids'
import type { Trip } from '@/features/trips/domain/trip'

export interface TripRepository {
  getById(id: TripId): Promise<Trip | undefined>

  list(): Promise<readonly Trip[]>

  listByBusId(
    busId: BusId,
  ): Promise<readonly Trip[]>

  save(trip: Trip): Promise<void>

  delete(id: TripId): Promise<void>
}
