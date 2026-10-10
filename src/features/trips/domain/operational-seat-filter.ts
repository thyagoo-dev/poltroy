import type { Passenger } from '@/features/passengers/domain/passenger'
import type { SeatLayoutElement } from '@/features/seat-map/domain/seat'
import { resolveSeatStatus, type SeatStatus, type TripSeatState } from '@/features/trips/domain/trip-seat-state'

export type OperationalSeatFilter = 'ALL' | SeatStatus | 'WITHOUT_PASSENGER'

interface OperationalSeatFilterInput {
  seat: SeatLayoutElement
  state?: TripSeatState
  passenger?: Passenger
  filter: OperationalSeatFilter
  search: string
}

export function matchesOperationalSeatFilter({ seat, state, passenger, filter, search }: OperationalSeatFilterInput): boolean {
  const matchesStatus = filter === 'ALL'
    || (filter === 'WITHOUT_PASSENGER'
      ? (state?.status === 'OCCUPIED' || state?.status === 'RESERVED') && !state.passengerId
      : resolveSeatStatus(state) === filter)
  if (!matchesStatus) return false

  const term = search.trim().toLocaleLowerCase()
  if (!term) return true
  if (seat.seatNumber.toLocaleLowerCase().includes(term)) return true

  const isAssociatedPassenger = (state?.status === 'OCCUPIED' || state?.status === 'RESERVED')
    && passenger !== undefined && state.passengerId === passenger.id
  return Boolean(isAssociatedPassenger && (
    passenger.name.toLocaleLowerCase().includes(term)
    || passenger.phone?.toLocaleLowerCase().includes(term)
  ))
}
