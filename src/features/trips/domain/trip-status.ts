import type { TripStatus } from '@/features/trips/domain/trip'

const allowedTransitions:
  Record<
    TripStatus,
    readonly TripStatus[]
  > = {
  PLANNED: [
    'ACTIVE',
    'CANCELLED',
  ],

  ACTIVE: [
    'COMPLETED',
    'CANCELLED',
  ],

  COMPLETED: [],

  CANCELLED: [],
}

export function canTransitionTripStatus(
  currentStatus: TripStatus,
  nextStatus: TripStatus,
) {
  return allowedTransitions[
    currentStatus
  ].includes(nextStatus)
}

export function assertTripStatusTransition(
  currentStatus: TripStatus,
  nextStatus: TripStatus,
) {
  if (
    canTransitionTripStatus(
      currentStatus,
      nextStatus,
    )
  ) {
    return
  }

  throw new Error(
    `Não é possível alterar uma viagem de ${currentStatus} para ${nextStatus}.`,
  )
}
