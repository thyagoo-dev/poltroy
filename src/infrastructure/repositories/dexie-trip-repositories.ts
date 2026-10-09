import type { TripRepository } from '@/features/trips/application/trip-repository'
import type { TripSeatStateRepository } from '@/features/trips/application/trip-seat-state-repository'
import type { BusId } from '@/features/buses/domain/ids'
import type { SeatId } from '@/features/seat-map/domain/ids'
import type { TripId } from '@/features/trips/domain/ids'
import type { TripSeatState } from '@/features/trips/domain/trip-seat-state'
import type { Trip } from '@/features/trips/domain/trip'
import type { PoltroyDatabase } from '@/infrastructure/database/poltroy-database'

export class DexieTripRepository
  implements TripRepository
{
  private readonly database: PoltroyDatabase

  constructor(database: PoltroyDatabase) {
    this.database = database
  }

  async getById(
    id: TripId,
  ): Promise<Trip | undefined> {
    return this.database.trips.get(id)
  }

  async list(): Promise<readonly Trip[]> {
    return this.database.trips
      .orderBy('departureAt')
      .reverse()
      .toArray()
  }

  async listByBusId(
    busId: BusId,
  ): Promise<readonly Trip[]> {
    const trips = await this.database.trips
      .where('busId')
      .equals(busId)
      .toArray()

    return trips.sort((a, b) =>
      b.departureAt.localeCompare(
        a.departureAt,
      ),
    )
  }

  async save(trip: Trip): Promise<void> {
    await this.database.trips.put(trip)
  }

  async delete(id: TripId): Promise<void> {
    await this.database.trips.delete(id)
  }
}

export class DexieTripSeatStateRepository
  implements TripSeatStateRepository
{
  private readonly database: PoltroyDatabase

  constructor(database: PoltroyDatabase) {
    this.database = database
  }

  async getByTripAndSeat(
    tripId: TripId,
    seatId: SeatId,
  ): Promise<TripSeatState | undefined> {
    return this.database.tripSeatStates
      .where('[tripId+seatId]')
      .equals([
        tripId,
        seatId,
      ])
      .first()
  }

  async listByTripId(
    tripId: TripId,
  ): Promise<readonly TripSeatState[]> {
    return this.database.tripSeatStates
      .where('tripId')
      .equals(tripId)
      .toArray()
  }

  async save(
    state: TripSeatState,
  ): Promise<void> {
    await this.database.tripSeatStates.put(
      state,
    )
  }

  async deleteByTripAndSeat(
    tripId: TripId,
    seatId: SeatId,
  ): Promise<void> {
    await this.database.tripSeatStates
      .where('[tripId+seatId]')
      .equals([
        tripId,
        seatId,
      ])
      .delete()
  }

  async deleteByTripId(
    tripId: TripId,
  ): Promise<void> {
    await this.database.tripSeatStates
      .where('tripId')
      .equals(tripId)
      .delete()
  }
}
