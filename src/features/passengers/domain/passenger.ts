import type { PassengerId } from '@/features/passengers/domain/ids'
import type { EntityTimestamps } from '@/shared/domain/entity'

export type PassengerDocumentType = 'CPF' | 'RG'

export interface Passenger extends EntityTimestamps {
  id: PassengerId

  name: string
  displayName?: string

  phone?: string
  documentType?: PassengerDocumentType
  documentNumber?: string
  notes?: string
}
