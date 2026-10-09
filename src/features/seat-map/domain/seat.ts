import type { SeatId } from '@/features/seat-map/domain/ids'

export type SeatType =
  | 'STANDARD'
  | 'EXECUTIVE'
  | 'SEMI_SLEEPER'
  | 'SLEEPER'
  | 'ACCESSIBLE'

export interface LayoutGridPosition {
  deck: number

  row: number
  column: number

  rowSpan?: number
  columnSpan?: number
}

export interface SeatLayoutElement {
  id: SeatId

  kind: 'seat'

  seatNumber: string
  seatType: SeatType

  position: LayoutGridPosition
}
