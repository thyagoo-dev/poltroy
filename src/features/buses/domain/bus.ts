import type {
  BusId,
  BusLayoutId,
} from '@/features/buses/domain/ids'
import type { EntityTimestamps } from '@/shared/domain/entity'

export type BusStatus =
  | 'ACTIVE'
  | 'ARCHIVED'

export interface Bus extends EntityTimestamps {
  id: BusId

  name: string

  plate?: string
  model?: string

  activeLayoutId: BusLayoutId

  status: BusStatus

  archivedAt?: string
}
