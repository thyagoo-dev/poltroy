import { getTripHistoryDetails } from '@/features/trips/application/get-trip-history-details'
import { listTripHistory } from '@/features/trips/application/list-trip-history'
import type { TripId } from '@/features/trips/domain/ids'
import { busLayoutRepository, busRepository, passengerRepository, tripRepository, tripSeatStateRepository } from '@/infrastructure/repositories/repositories'

const dependencies = { busLayoutRepository, busRepository, passengerRepository, tripRepository, tripSeatStateRepository }

export function listTripHistoryAction() {
  return listTripHistory(dependencies)
}

export function getTripHistoryDetailsAction(id: TripId) {
  return getTripHistoryDetails(id, dependencies)
}
