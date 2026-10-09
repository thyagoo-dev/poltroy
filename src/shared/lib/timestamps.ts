import type { EntityTimestamps } from '@/shared/domain/entity'

export function toIsoTimestamp(
  date: Date = new Date(),
): string {
  return date.toISOString()
}

export function createEntityTimestamps(
  date: Date = new Date(),
): EntityTimestamps {
  const timestamp = toIsoTimestamp(date)

  return {
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}
