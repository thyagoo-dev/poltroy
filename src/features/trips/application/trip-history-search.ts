import type { HistoricalTrip, TripHistorySummary } from './trip-history'

export type TripHistoryFilter = 'ALL' | HistoricalTrip['status']

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase('pt-BR').normalize('NFD').replace(/\p{Diacritic}/gu, '')
}

export function filterTripHistory(items: readonly TripHistorySummary[], query: string, filter: TripHistoryFilter): readonly TripHistorySummary[] {
  const term = normalize(query)
  return items.filter(({ trip, bus, seats }) => {
    if (filter !== 'ALL' && trip.status !== filter) return false
    if (!term) return true
    const values = [trip.origin, trip.destination, bus?.name ?? '', ...seats.flatMap(({ seat, passenger }) =>
      [seat?.seatNumber ?? '', passenger?.name ?? '', passenger?.displayName ?? ''])]
    return values.some((value) => normalize(value).includes(term))
  })
}
