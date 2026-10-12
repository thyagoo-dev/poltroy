import { getHistoryEndedAt, type HistoricalTrip } from './trip-history'
import { formatDateTime } from '@/shared/lib/date-time'

export function formatHistoryEnd(trip: HistoricalTrip) {
  const recorded = trip.status === 'COMPLETED' ? trip.completedAt : trip.cancelledAt
  const formatted = formatDateTime(getHistoryEndedAt(trip))
  return recorded && Number.isFinite(Date.parse(recorded)) ? formatted : `${formatted} (referência: saída; encerramento não registrado)`
}
