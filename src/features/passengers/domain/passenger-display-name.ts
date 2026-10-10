import type { Passenger } from '@/features/passengers/domain/passenger'

export const PASSENGER_DISPLAY_NAME_MAX = 16

export function countPassengerCharacters(value: string): number {
  return Array.from(value).length
}

/** Legacy compatibility only: the first 16 Unicode code points of the trimmed
 * full name, with trailing whitespace removed. No nickname inference or writes. */
export function resolvePassengerDisplayName(passenger: Pick<Passenger, 'name' | 'displayName'>): string {
  return passenger.displayName?.trim()
    || Array.from(passenger.name.trim()).slice(0, PASSENGER_DISPLAY_NAME_MAX).join('').trimEnd()
}
