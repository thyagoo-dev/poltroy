import type { PassengerId } from '@/features/passengers/domain/ids'
import type { SeatId } from '@/features/seat-map/domain/ids'
import type {
  TripId,
  TripSeatStateId,
} from '@/features/trips/domain/ids'
import type { EntityTimestamps } from '@/shared/domain/entity'

export type PersistedSeatStatus =
  | 'OCCUPIED'
  | 'RESERVED'
  | 'BLOCKED'

export type SeatStatus =
  | 'FREE'
  | PersistedSeatStatus

interface TripSeatStateBase extends EntityTimestamps {
  id: TripSeatStateId

  tripId: TripId
  seatId: SeatId

  notes?: string
}

export interface OccupiedTripSeatState
  extends TripSeatStateBase {
  status: 'OCCUPIED'

  passengerId?: PassengerId
}

export interface ReservedTripSeatState
  extends TripSeatStateBase {
  status: 'RESERVED'

  passengerId?: PassengerId
}

export interface BlockedTripSeatState
  extends TripSeatStateBase {
  status: 'BLOCKED'

  passengerId?: never
}

export type TripSeatState =
  | OccupiedTripSeatState
  | ReservedTripSeatState
  | BlockedTripSeatState

export function resolveSeatStatus(
  state: TripSeatState | undefined,
): SeatStatus {
  return state?.status ?? 'FREE'
}

export function canSeatStatusHavePassenger(
  status: SeatStatus,
) {
  return (
    status === 'OCCUPIED' ||
    status === 'RESERVED'
  )
}

export function isSeatFree(
  state: TripSeatState | undefined,
) {
  return state === undefined
}
