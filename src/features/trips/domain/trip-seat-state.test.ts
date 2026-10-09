import {
  describe,
  expect,
  it,
} from 'vitest'

import type { SeatId } from '@/features/seat-map/domain/ids'
import type {
  TripId,
  TripSeatStateId,
} from '@/features/trips/domain/ids'
import {
  canSeatStatusHavePassenger,
  isSeatFree,
  resolveSeatStatus,
  type TripSeatState,
} from '@/features/trips/domain/trip-seat-state'

const tripId = 'trip-1' as TripId
const seatId = 'seat-18' as SeatId

const baseState = {
  id: 'trip-seat-state-1' as TripSeatStateId,
  tripId,
  seatId,
  createdAt: '2026-10-09T00:00:00.000Z',
  updatedAt: '2026-10-09T00:00:00.000Z',
}

describe('resolveSeatStatus', () => {
  it('considera livre quando não existe estado persistido', () => {
    expect(resolveSeatStatus(undefined)).toBe('FREE')
  })

  it.each([
    'OCCUPIED',
    'RESERVED',
    'BLOCKED',
  ] as const)(
    'preserva o estado persistido %s',
    (status) => {
      const state: TripSeatState = {
        ...baseState,
        status,
      }

      expect(resolveSeatStatus(state)).toBe(status)
    },
  )
})

describe('isSeatFree', () => {
  it('retorna true quando não existe estado persistido', () => {
    expect(isSeatFree(undefined)).toBe(true)
  })

  it('retorna false quando existe estado persistido', () => {
    const state: TripSeatState = {
      ...baseState,
      status: 'OCCUPIED',
    }

    expect(isSeatFree(state)).toBe(false)
  })
})

describe('canSeatStatusHavePassenger', () => {
  it.each([
    'OCCUPIED',
    'RESERVED',
  ] as const)(
    'permite passageiro no estado %s',
    (status) => {
      expect(
        canSeatStatusHavePassenger(status),
      ).toBe(true)
    },
  )

  it.each([
    'FREE',
    'BLOCKED',
  ] as const)(
    'não associa passageiro diretamente ao estado %s',
    (status) => {
      expect(
        canSeatStatusHavePassenger(status),
      ).toBe(false)
    },
  )
})
