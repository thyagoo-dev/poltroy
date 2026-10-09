import {
  Ban,
  Bookmark,
  Check,
  UserRound,
  type LucideIcon,
} from 'lucide-react'

import type { SeatStatus } from '@/features/trips/domain/trip-seat-state'

interface SeatStatusVisual {
  label: string
  icon: LucideIcon
  className: string
}

export const seatStatusVisuals:
  Record<
    SeatStatus,
    SeatStatusVisual
  > = {
  FREE: {
    label: 'Livre',
    icon: Check,

    className:
      'border-seat-free/40 bg-seat-free/10 text-seat-free',
  },

  OCCUPIED: {
    label: 'Ocupado',
    icon: UserRound,

    className:
      'border-seat-occupied/40 bg-seat-occupied/10 text-seat-occupied',
  },

  RESERVED: {
    label: 'Reservado',
    icon: Bookmark,

    className:
      'border-seat-reserved/40 bg-seat-reserved/10 text-seat-reserved',
  },

  BLOCKED: {
    label: 'Bloqueado',
    icon: Ban,

    className:
      'border-seat-blocked/40 bg-seat-blocked/10 text-seat-blocked',
  },
}
