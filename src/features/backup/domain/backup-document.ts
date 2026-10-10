import type { Bus } from '@/features/buses/domain/bus'
import type { BusLayout } from '@/features/buses/domain/bus-layout'
import type { Passenger } from '@/features/passengers/domain/passenger'
import type { Trip } from '@/features/trips/domain/trip'
import type { TripSeatState } from '@/features/trips/domain/trip-seat-state'

export const POLTROY_BACKUP_VERSION = 1
export const BACKUP_COLLECTIONS = ['buses', 'busLayouts', 'trips', 'passengers', 'tripSeatStates'] as const

export interface LocalDataSnapshot {
  buses: Bus[]
  busLayouts: BusLayout[]
  trips: Trip[]
  passengers: Passenger[]
  tripSeatStates: TripSeatState[]
}

export interface PoltroyBackup {
  app: 'POLTROY'
  backupVersion: typeof POLTROY_BACKUP_VERSION
  exportedAt: string
  data: LocalDataSnapshot
}

export interface BackupIssue {
  path: string
  message: string
}

export type BackupValidationResult =
  | { success: true; backup: PoltroyBackup }
  | { success: false; issues: readonly BackupIssue[] }
