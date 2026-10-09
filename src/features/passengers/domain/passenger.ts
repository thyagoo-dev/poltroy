import type { PassengerId } from '@/features/passengers/domain/ids'
import type { EntityTimestamps } from '@/shared/domain/entity'

export interface Passenger extends EntityTimestamps {
  id: PassengerId

  name: string

  phone?: string
  notes?: string
}
