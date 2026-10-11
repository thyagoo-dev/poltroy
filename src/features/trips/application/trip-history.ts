import type { BusLayoutRepository } from '@/features/buses/application/bus-layout-repository'
import type { BusRepository } from '@/features/buses/application/bus-repository'
import type { BusLayout } from '@/features/buses/domain/bus-layout'
import type { Bus } from '@/features/buses/domain/bus'
import type { PassengerRepository } from '@/features/passengers/application/passenger-repository'
import type { Passenger } from '@/features/passengers/domain/passenger'
import { resolvePassengerDisplayName } from '@/features/passengers/domain/passenger-display-name'
import type { SeatLayoutElement } from '@/features/seat-map/domain/seat'
import type { TripRepository } from '@/features/trips/application/trip-repository'
import type { TripSeatStateRepository } from '@/features/trips/application/trip-seat-state-repository'
import { summarizeOperationalSeats, type OperationalSeatSummary } from '@/features/trips/domain/operational-seat-summary'
import type { Trip } from '@/features/trips/domain/trip'
import { canSeatStatusHavePassenger, type TripSeatState } from '@/features/trips/domain/trip-seat-state'

export type HistoricalTrip = Trip & { status: 'COMPLETED' | 'CANCELLED' }
export type HistoryPassenger = Pick<Passenger, 'id' | 'name'> & { displayName: string }

export interface HistoricalSeat {
  seatId: TripSeatState['seatId']
  seat?: SeatLayoutElement
  state?: TripSeatState
  passenger?: HistoryPassenger
}

export interface TripHistorySummary {
  trip: HistoricalTrip
  bus?: Pick<Bus, 'id' | 'name'>
  layout?: BusLayout
  layoutStatus: 'available' | 'missing' | 'inconsistent'
  seatSummary: OperationalSeatSummary
  assignedPassengerCount: number
  seats: readonly HistoricalSeat[]
}

export interface TripHistoryDependencies {
  tripRepository: TripRepository
  busRepository: BusRepository
  busLayoutRepository: BusLayoutRepository
  tripSeatStateRepository: TripSeatStateRepository
  passengerRepository: PassengerRepository
}

export function isHistoricalTrip(trip: Trip): trip is HistoricalTrip {
  return trip.status === 'COMPLETED' || trip.status === 'CANCELLED'
}

export function getHistoryEndedAt(trip: HistoricalTrip): string {
  const endedAt = trip.status === 'COMPLETED' ? trip.completedAt : trip.cancelledAt
  return endedAt && Number.isFinite(Date.parse(endedAt)) ? endedAt : trip.departureAt
}

const seatNumberOrder = new Intl.Collator('pt-BR', { numeric: true, sensitivity: 'base' })

export function compareHistoricalSeats(a: HistoricalSeat, b: HistoricalSeat): number {
  // Unknown seats follow known ones; IDs break ties even for inconsistent input.
  return Number(!a.seat) - Number(!b.seat)
    || seatNumberOrder.compare(a.seat?.seatNumber ?? '', b.seat?.seatNumber ?? '')
    || (a.seatId < b.seatId ? -1 : a.seatId > b.seatId ? 1 : 0)
}

export function projectTripHistory(
  trip: HistoricalTrip,
  bus: Bus | undefined,
  candidateLayout: BusLayout | undefined,
  states: readonly TripSeatState[],
  passengers: readonly Passenger[],
): TripHistorySummary {
  const layoutStatus = !candidateLayout ? 'missing'
    : candidateLayout.busId !== trip.busId ? 'inconsistent' : 'available'
  const layout = layoutStatus === 'available' ? candidateLayout : undefined
  const seatById = new Map(layout?.elements.filter((e) => e.kind === 'seat').map((e) => [e.id, e]))
  const stateBySeatId = new Map<TripSeatState['seatId'], TripSeatState>()
  // Keep one deterministic, latest valid state per seat without mutating storage.
  for (const state of [...states].sort((a, b) =>
    (Date.parse(a.updatedAt) || 0) - (Date.parse(b.updatedAt) || 0)
      || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))) {
    if (state.tripId === trip.id && ['OCCUPIED', 'RESERVED', 'BLOCKED'].includes(state.status)) {
      stateBySeatId.set(state.seatId, state)
    }
  }
  const passengerById = new Map(passengers.map((p) => [p.id, p]))
  const seats = [...new Set([...seatById.keys(), ...stateBySeatId.keys()])].map((seatId): HistoricalSeat => {
    const state = stateBySeatId.get(seatId)
    const passenger = state && canSeatStatusHavePassenger(state.status) && state.passengerId
      ? passengerById.get(state.passengerId) : undefined
    return {
      seatId, seat: seatById.get(seatId), state,
      passenger: passenger ? { id: passenger.id, name: passenger.name, displayName: resolvePassengerDisplayName(passenger) } : undefined,
    }
  }).sort(compareHistoricalSeats)
  const validStates = seats.filter((s) => s.seat && s.state).map((s) => s.state!)
  const seatSummary = layout
    ? summarizeOperationalSeats({ ...layout, elements: [...seatById.values()] }, validStates)
    : { totalSeats: 0, free: 0, occupied: 0, reserved: 0, blocked: 0, withPassenger: 0, withoutPassenger: 0 }
  const assignedPassengerCount = new Set(seats.filter((s) => s.seat && s.passenger).map((s) => s.passenger!.id)).size
  return { trip, bus: bus ? { id: bus.id, name: bus.name } : undefined, layout, layoutStatus, seatSummary, assignedPassengerCount, seats }
}
