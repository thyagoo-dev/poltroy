import type { SeatId } from '@/features/seat-map/domain/ids'
import type { TripId } from '@/features/trips/domain/ids'
import type { TripSeatState } from '@/features/trips/domain/trip-seat-state'

export interface TripSeatStateRepository {
  getByTripAndSeat(
    tripId: TripId,
    seatId: SeatId,
  ): Promise<TripSeatState | undefined>

  listByTripId(
    tripId: TripId,
  ): Promise<readonly TripSeatState[]>

  save(
    state: TripSeatState,
  ): Promise<void>

  deleteByTripAndSeat(
    tripId: TripId,
    seatId: SeatId,
  ): Promise<void>

  deleteByTripId(
    tripId: TripId,
  ): Promise<void>
}
