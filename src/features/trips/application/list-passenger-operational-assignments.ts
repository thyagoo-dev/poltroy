import type { PassengerId } from '@/features/passengers/domain/ids'
import type { SeatId } from '@/features/seat-map/domain/ids'
import { listTrips, type ListTripsDependencies } from '@/features/trips/application/list-trips'
import type { TripSeatStateRepository } from '@/features/trips/application/trip-seat-state-repository'
import { compareTripsByDeparture } from '@/features/trips/domain/trip-ordering'
import type { Trip } from '@/features/trips/domain/trip'

export interface PassengerOperationalAssignment {
  passengerId: PassengerId
  tripId: Trip['id']
  tripStatus: 'ACTIVE' | 'PLANNED'
  departureAt: string
  busId: Trip['busId']
  busName: string
  seatId: SeatId
  seatNumber: string
}

export async function listPassengerOperationalAssignments(
  dependencies: ListTripsDependencies & { tripSeatStateRepository: TripSeatStateRepository },
): Promise<ReadonlyMap<PassengerId, PassengerOperationalAssignment>> {
  const summaries = await listTrips(dependencies)
  const active = summaries.filter(({ trip }) => trip.status === 'ACTIVE')
  const planned = summaries.filter(({ trip }) => trip.status === 'PLANNED')
  const byDeparture = (a: typeof summaries[number], b: typeof summaries[number]) => compareTripsByDeparture(a.trip, b.trip)
  const candidates = [...active.sort(byDeparture), ...planned.sort(byDeparture)]
    .filter(({ bus, layout, trip }) => bus && layout && layout.busId === trip.busId)
  // One state read per relevant trip, independent of the passenger count.
  const statesByTrip = await Promise.all(candidates.map(({ trip }) => dependencies.tripSeatStateRepository.listByTripId(trip.id)))
  const assignments = new Map<PassengerId, PassengerOperationalAssignment>()
  candidates.forEach(({ trip, bus, layout }, index) => {
    if (!bus || !layout || (trip.status !== 'ACTIVE' && trip.status !== 'PLANNED')) return
    const seats = new Map(layout.elements.filter((element) => element.kind === 'seat').map((seat) => [seat.id, seat]))
    for (const state of statesByTrip[index]) {
      if (state.tripId !== trip.id || (state.status !== 'OCCUPIED' && state.status !== 'RESERVED') || !state.passengerId || assignments.has(state.passengerId)) continue
      const seat = seats.get(state.seatId)
      if (!seat?.seatNumber.trim()) continue
      assignments.set(state.passengerId, {
        passengerId: state.passengerId, tripId: trip.id, tripStatus: trip.status,
        departureAt: trip.departureAt, busId: bus.id, busName: bus.name,
        seatId: seat.id, seatNumber: seat.seatNumber,
      })
    }
  })
  return assignments
}
