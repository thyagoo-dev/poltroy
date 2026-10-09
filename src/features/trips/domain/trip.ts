import type {
  BusId,
  BusLayoutId,
} from '@/features/buses/domain/ids'
import type { TripId } from '@/features/trips/domain/ids'
import type { EntityTimestamps } from '@/shared/domain/entity'

export type TripStatus =
  | 'PLANNED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED'

export interface Trip extends EntityTimestamps {
  id: TripId

  busId: BusId
  layoutId: BusLayoutId

  origin: string
  destination: string

  departureAt: string
  arrivalEstimateAt?: string

  status: TripStatus

  notes?: string

  startedAt?: string
  completedAt?: string
  cancelledAt?: string
}
