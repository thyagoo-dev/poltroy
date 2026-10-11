import { compareTripsByHistory } from '@/features/trips/domain/trip-ordering'
import { listTripSeatStates } from '@/features/trips/application/list-trip-seat-states'
import { isHistoricalTrip, projectTripHistory, type TripHistoryDependencies, type TripHistorySummary } from './trip-history'

export async function listTripHistory(dependencies: TripHistoryDependencies): Promise<readonly TripHistorySummary[]> {
  const trips = (await dependencies.tripRepository.list()).filter(isHistoricalTrip).sort(compareTripsByHistory)
  if (!trips.length) return []
  const [buses, layouts, passengers] = await Promise.all([
    Promise.all([...new Set(trips.map((t) => t.busId))].map((id) => dependencies.busRepository.getById(id))),
    Promise.all([...new Set(trips.map((t) => t.layoutId))].map((id) => dependencies.busLayoutRepository.getById(id))),
    dependencies.passengerRepository.list(),
  ])
  const busById = new Map(buses.filter((b) => b !== undefined).map((b) => [b.id, b]))
  const layoutById = new Map(layouts.filter((l) => l !== undefined).map((l) => [l.id, l]))
  return Promise.all(trips.map(async (trip) => projectTripHistory(trip, busById.get(trip.busId), layoutById.get(trip.layoutId),
    await listTripSeatStates(trip.id, dependencies.tripSeatStateRepository), passengers)))
}
