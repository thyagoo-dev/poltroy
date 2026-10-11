import type { TripId } from '@/features/trips/domain/ids'
import { listTripSeatStates } from '@/features/trips/application/list-trip-seat-states'
import { isHistoricalTrip, projectTripHistory, type TripHistoryDependencies, type TripHistorySummary } from './trip-history'

export type TripHistoryDetailsResult =
  | { status: 'notFound' }
  | { status: 'notHistorical' }
  | { status: 'ready'; details: TripHistorySummary }

export async function getTripHistoryDetails(id: TripId, dependencies: TripHistoryDependencies): Promise<TripHistoryDetailsResult> {
  const trip = await dependencies.tripRepository.getById(id)
  if (!trip) return { status: 'notFound' }
  if (!isHistoricalTrip(trip)) return { status: 'notHistorical' }
  const [bus, layout, states, passengers] = await Promise.all([
    dependencies.busRepository.getById(trip.busId),
    dependencies.busLayoutRepository.getById(trip.layoutId),
    listTripSeatStates(id, dependencies.tripSeatStateRepository),
    dependencies.passengerRepository.list(),
  ])
  return { status: 'ready', details: projectTripHistory(trip, bus, layout, states, passengers) }
}
