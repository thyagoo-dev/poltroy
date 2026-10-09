import type { LayoutElementId } from '@/features/seat-map/domain/ids'
import type {
  LayoutGridPosition,
  SeatLayoutElement,
} from '@/features/seat-map/domain/seat'

export type StructuralLayoutElementKind =
  | 'driver'
  | 'door'
  | 'toilet'
  | 'stairs'
  | 'aisle'
  | 'technical'

export interface StructuralLayoutElement {
  id: LayoutElementId

  kind: StructuralLayoutElementKind

  label?: string

  position: LayoutGridPosition
}

export type BusLayoutElement =
  | SeatLayoutElement
  | StructuralLayoutElement
