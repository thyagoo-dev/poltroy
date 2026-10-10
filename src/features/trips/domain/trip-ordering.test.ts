import { describe, expect, it } from 'vitest'

import type { BusId, BusLayoutId } from '@/features/buses/domain/ids'
import type { TripId } from '@/features/trips/domain/ids'
import type { Trip } from '@/features/trips/domain/trip'
import { compareTripsByDeparture, compareTripsByHistory } from '@/features/trips/domain/trip-ordering'

function trip(id: string, overrides: Partial<Trip> = {}): Trip {
  return {
    id: id as TripId, busId: 'bus' as BusId, layoutId: 'layout' as BusLayoutId,
    origin: 'Iguatu', destination: 'Fortaleza', status: 'PLANNED',
    departureAt: '2026-10-09T08:00:00.000Z', createdAt: '2026-10-09T00:00:00.000Z', updatedAt: '2026-10-09T00:00:00.000Z',
    ...overrides,
  }
}

describe('Ordenação de viagens', () => {
  it.each(['PLANNED', 'ACTIVE'] as const)('%s usa saída crescente', (status) => {
    const trips = [trip('late', { status, departureAt: '2026-10-09T15:00:00.000Z' }), trip('early', { status })]
    expect([...trips].sort(compareTripsByDeparture).map((item) => item.id)).toEqual(['early', 'late'])
  })
  it('histórico usa término mais recente primeiro com fallback na saída', () => {
    const trips = [
      trip('completed', { status: 'COMPLETED', completedAt: '2026-10-09T12:00:00.000Z' }),
      trip('cancelled', { status: 'CANCELLED', cancelledAt: '2026-10-09T16:00:00.000Z' }),
      trip('fallback', { status: 'COMPLETED', departureAt: '2026-10-09T14:00:00.000Z' }),
    ]
    expect(trips.sort(compareTripsByHistory).map((item) => item.id)).toEqual(['cancelled', 'fallback', 'completed'])
  })
  it('desempata pelo id independentemente da ordem de entrada', () => {
    const trips = [trip('b'), trip('a')]
    for (const comparator of [compareTripsByDeparture, compareTripsByHistory]) {
      expect([...trips].sort(comparator).map((item) => item.id)).toEqual(['a', 'b'])
      expect([...trips].reverse().sort(comparator).map((item) => item.id)).toEqual(['a', 'b'])
      expect(comparator(trips[0], trips[0])).toBe(0)
    }
  })
  it('compara instantes equivalentes com offsets diferentes', () => {
    expect(compareTripsByDeparture(trip('a', { departureAt: '2026-10-09T05:00:00-03:00' }), trip('b'))).toBeLessThan(0)
  })
  it('aplica fallback para timestamp de término inválido', () => {
    const first = trip('a', { status: 'CANCELLED', cancelledAt: 'invalid', departureAt: '2026-10-09T18:00:00.000Z' })
    const second = trip('b', { status: 'COMPLETED', completedAt: '2026-10-09T12:00:00.000Z' })
    expect(compareTripsByHistory(first, second)).toBeLessThan(0)
  })
})
