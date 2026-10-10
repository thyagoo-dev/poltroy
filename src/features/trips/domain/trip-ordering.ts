import type { Trip } from '@/features/trips/domain/trip'

function timestamp(value: string | undefined): number | undefined {
  if (!value) return undefined
  const result = Date.parse(value)
  return Number.isNaN(result) ? undefined : result
}

function compareIds(a: Trip, b: Trip) {
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
}

export function compareTripsByDeparture(a: Trip, b: Trip): number {
  return (timestamp(a.departureAt) ?? 0) - (timestamp(b.departureAt) ?? 0) || compareIds(a, b)
}

function historyTimestamp(trip: Trip): number {
  const endedAt = trip.status === 'COMPLETED' ? trip.completedAt : trip.cancelledAt
  return timestamp(endedAt) ?? timestamp(trip.departureAt) ?? 0
}

export function compareTripsByHistory(a: Trip, b: Trip): number {
  return historyTimestamp(b) - historyTimestamp(a) || compareIds(a, b)
}
