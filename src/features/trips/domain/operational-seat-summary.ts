import type { BusLayout } from '@/features/buses/domain/bus-layout'
import { resolveSeatStatus, type TripSeatState } from '@/features/trips/domain/trip-seat-state'

export interface OperationalSeatSummary {
  totalSeats: number
  free: number
  occupied: number
  reserved: number
  blocked: number
  withPassenger: number
  withoutPassenger: number
}

export function summarizeOperationalSeats(
  layout: BusLayout,
  states: readonly TripSeatState[],
): OperationalSeatSummary {
  const stateBySeatId = new Map(states.map((state) => [state.seatId, state]))
  const summary: OperationalSeatSummary = {
    totalSeats: 0,
    free: 0,
    occupied: 0,
    reserved: 0,
    blocked: 0,
    withPassenger: 0,
    withoutPassenger: 0,
  }

  for (const element of layout.elements) {
    if (element.kind !== 'seat') continue
    summary.totalSeats += 1
    const state = stateBySeatId.get(element.id)
    const status = resolveSeatStatus(state)
    switch (status) {
      case 'FREE': summary.free += 1; break
      case 'OCCUPIED': summary.occupied += 1; break
      case 'RESERVED': summary.reserved += 1; break
      case 'BLOCKED': summary.blocked += 1; break
    }
    if (state?.status === 'OCCUPIED' || state?.status === 'RESERVED') {
      if (state.passengerId) summary.withPassenger += 1
      else summary.withoutPassenger += 1
    }
  }
  return summary
}
