import { describe, expect, it, vi } from 'vitest'
import type { BusId, BusLayoutId } from '@/features/buses/domain/ids'
import type { Bus } from '@/features/buses/domain/bus'
import type { BusLayout } from '@/features/buses/domain/bus-layout'
import type { PassengerId } from '@/features/passengers/domain/ids'
import type { Passenger } from '@/features/passengers/domain/passenger'
import type { SeatId } from '@/features/seat-map/domain/ids'
import type { SeatLayoutElement } from '@/features/seat-map/domain/seat'
import type { TripId, TripSeatStateId } from '@/features/trips/domain/ids'
import type { Trip, TripStatus } from '@/features/trips/domain/trip'
import type { TripSeatState } from '@/features/trips/domain/trip-seat-state'
import { getTripHistoryDetails } from './get-trip-history-details'
import { listTripHistory } from './list-trip-history'
import { getHistoryEndedAt, projectTripHistory, type HistoricalTrip, type TripHistoryDependencies } from './trip-history'
import { filterTripHistory } from './trip-history-search'

const timestamps = { createdAt: '2026-10-01T00:00:00Z', updatedAt: '2026-10-01T00:00:00Z' }
const busId = 'bus' as BusId
const layoutId = 'layout' as BusLayoutId
const bus: Bus = { id: busId, name: 'Expresso Sertão', status: 'ACTIVE', activeLayoutId: layoutId, ...timestamps }
const passenger: Passenger = { id: 'passenger' as PassengerId, name: 'Cicero Thyago de Oliveira Fernandes', displayName: 'Thyago', phone: '85912345678', documentType: 'CPF', documentNumber: '12345678901', ...timestamps }
function seat(number: string, row = 1): SeatLayoutElement {
  return { id: ('seat-'+number) as SeatId, kind: 'seat', seatNumber: number, seatType: 'STANDARD', position: { deck: 1, row, column: 1 } }
}
const layout: BusLayout = { id: layoutId, busId, name: 'Layout original', version: 1, elements: [seat('01'), seat('02', 2), seat('03', 3), seat('04', 4)], ...timestamps }
function trip(id = 'trip', status: TripStatus = 'COMPLETED'): Trip {
  return { id: id as TripId, busId, layoutId, origin: 'Iguatu', destination: 'Fortaleza', departureAt: '2026-10-01T08:00:00Z', status, ...timestamps }
}
const historicalTrip = trip() as HistoricalTrip
function state(number: string, status: TripSeatState['status'] = 'OCCUPIED', passengerId?: PassengerId): TripSeatState {
  const base = { id: ('state-'+number) as TripSeatStateId, tripId: historicalTrip.id, seatId: ('seat-'+number) as SeatId, ...timestamps }
  return status === 'BLOCKED' ? { ...base, status } : { ...base, status, passengerId }
}
function project(states: readonly TripSeatState[] = [], currentLayout: BusLayout | undefined = layout, passengers: readonly Passenger[] = [passenger]) {
  return projectTripHistory(historicalTrip, bus, currentLayout, states, passengers)
}
function dependencies(trips: readonly Trip[] = [historicalTrip], states: readonly TripSeatState[] = []): TripHistoryDependencies {
  return {
    tripRepository: { list: vi.fn(async () => trips), getById: vi.fn(async (id) => trips.find((t) => t.id === id)), listByBusId: vi.fn(async () => trips), save: vi.fn(async () => {}), delete: vi.fn(async () => {}) },
    busRepository: { list: vi.fn(async () => [bus]), getById: vi.fn(async () => bus), save: vi.fn(async () => {}), saveWithLayout: vi.fn(async () => {}), delete: vi.fn(async () => {}) },
    busLayoutRepository: { getById: vi.fn(async () => layout), getByBusAndVersion: vi.fn(async () => layout), listByBusId: vi.fn(async () => [layout]), save: vi.fn(async () => {}), delete: vi.fn(async () => {}) },
    passengerRepository: { list: vi.fn(async () => [passenger]), getById: vi.fn(async () => passenger), save: vi.fn(async () => {}), delete: vi.fn(async () => {}) },
    tripSeatStateRepository: { listByTripId: vi.fn(async (id) => states.filter((s) => s.tripId === id)), getByTripAndSeat: vi.fn(async () => undefined), save: vi.fn(async () => {}), deleteByTripAndSeat: vi.fn(async () => {}), deleteByTripId: vi.fn(async () => {}) },
  }
}

describe('history application queries', () => {
  it('lists only completed/cancelled trips, using existing history order', async () => {
    const deps = dependencies([
      trip('active', 'ACTIVE'), trip('planned', 'PLANNED'),
      { ...trip('c'), completedAt: '2026-10-03T00:00:00Z' },
      { ...trip('b', 'CANCELLED'), cancelledAt: '2026-10-04T00:00:00Z' },
      { ...trip('a', 'CANCELLED'), cancelledAt: '2026-10-04T00:00:00Z' },
      { ...trip('fallback'), departureAt: '2026-10-02T00:00:00Z' },
    ])
    expect((await listTripHistory(deps)).map((s) => s.trip.id)).toEqual(['a', 'b', 'c', 'fallback'])
    expect(deps.tripSeatStateRepository.listByTripId).toHaveBeenCalledTimes(4)
    expect(deps.passengerRepository.list).toHaveBeenCalledTimes(1)
    expect(deps.passengerRepository.getById).not.toHaveBeenCalled()
    expect(deps.busRepository.getById).toHaveBeenCalledTimes(1)
    expect(deps.busLayoutRepository.getById).toHaveBeenCalledTimes(1)
  })
  it('returns an empty list without reading unrelated data', async () => {
    const deps = dependencies([trip('a', 'ACTIVE')])
    expect(await listTripHistory(deps)).toEqual([])
    expect(deps.passengerRepository.list).not.toHaveBeenCalled()
    expect(deps.tripSeatStateRepository.listByTripId).not.toHaveBeenCalled()
  })
  it.each(['COMPLETED', 'CANCELLED'] as const)('accepts %s details', async (status) => {
    expect((await getTripHistoryDetails(historicalTrip.id, dependencies([trip('trip', status)]))).status).toBe('ready')
  })
  it.each(['ACTIVE', 'PLANNED'] as const)('guards %s before reading detail dependencies', async (status) => {
    const deps = dependencies([trip('trip', status)])
    expect(await getTripHistoryDetails(historicalTrip.id, deps)).toEqual({ status: 'notHistorical' })
    expect(deps.busRepository.getById).not.toHaveBeenCalled()
    expect(deps.tripSeatStateRepository.listByTripId).not.toHaveBeenCalled()
  })
  it('returns notFound for a missing trip', async () => {
    expect(await getTripHistoryDetails('missing' as TripId, dependencies())).toEqual({ status: 'notFound' })
  })
  it('propagates failures for the page to present an alert', async () => {
    const deps = dependencies()
    vi.mocked(deps.tripRepository.list).mockRejectedValueOnce(Error('Read failed'))
    await expect(listTripHistory(deps)).rejects.toThrow('Read failed')
    vi.mocked(deps.tripSeatStateRepository.listByTripId).mockRejectedValueOnce(Error('Read failed'))
    await expect(getTripHistoryDetails(historicalTrip.id, deps)).rejects.toThrow('Read failed')
  })
  it('queries history without changing any persisted records', async () => {
    const states = [state('01', 'OCCUPIED', passenger.id)]
    const deps = dependencies([historicalTrip], states)
    const before = JSON.stringify({ historicalTrip, states, passenger, bus, layout })
    await listTripHistory(deps)
    await getTripHistoryDetails(historicalTrip.id, deps)
    expect(JSON.stringify({ historicalTrip, states, passenger, bus, layout })).toBe(before)
    for (const repo of Object.values(deps)) {
      expect(repo.save).not.toHaveBeenCalled()
      if ('delete' in repo) expect(repo.delete).not.toHaveBeenCalled()
    }
    expect(deps.tripSeatStateRepository.deleteByTripId).not.toHaveBeenCalled()
    expect(deps.tripSeatStateRepository.deleteByTripAndSeat).not.toHaveBeenCalled()
    expect(deps.busRepository.saveWithLayout).not.toHaveBeenCalled()
  })
})

describe('history derived occupancy and references', () => {
  it('derives all seats as free when there are no states', () => {
    expect(project().seatSummary).toMatchObject({ totalSeats: 4, free: 4, occupied: 0, reserved: 0, blocked: 0 })
  })
  it('counts occupied, reserved, blocked and implicit free seats', () => {
    expect(project([state('01'), state('02', 'RESERVED'), state('03', 'BLOCKED')]).seatSummary)
      .toMatchObject({ totalSeats: 4, free: 1, occupied: 1, reserved: 1, blocked: 1 })
  })
  it.each(['OCCUPIED', 'RESERVED'] as const)('counts a valid passenger in %s', (status) => {
    expect(project([state('01', status, passenger.id)]).assignedPassengerCount).toBe(1)
  })
  it('does not count missing or unassigned passengers', () => {
    const result = project([state('01'), state('02', 'RESERVED', 'missing' as PassengerId)])
    expect(result.assignedPassengerCount).toBe(0)
    expect(result.seats[1].state?.passengerId).toBe('missing')
    expect(result.seats[1].passenger).toBeUndefined()
  })
  it('ignores a corrupt passengerId on a blocked state', () => {
    const corrupt = { ...state('01', 'BLOCKED'), passengerId: passenger.id } as unknown as TripSeatState
    expect(project([corrupt]).assignedPassengerCount).toBe(0)
    expect(project([corrupt]).seats[0].passenger).toBeUndefined()
  })
  it('counts a repeated passenger once across different seats', () => {
    expect(project([state('01', 'OCCUPIED', passenger.id), state('02', 'RESERVED', passenger.id)]).assignedPassengerCount).toBe(1)
  })
  it('deduplicates states deterministically, latest timestamp then ID wins', () => {
    const old = state('01')
    const latest = { ...state('01', 'RESERVED'), id: 'z' as TripSeatStateId, updatedAt: '2026-10-02T00:00:00Z' }
    const tied = { ...state('01', 'BLOCKED'), id: 'a' as TripSeatStateId, updatedAt: latest.updatedAt }
    for (const states of [[latest, old, tied], [old, tied, latest]]) {
      expect(project(states).seatSummary).toMatchObject({ occupied: 0, reserved: 1, blocked: 0, free: 3 })
    }
  })
  it('excludes another trip and retains orphan associations outside the summary/map', () => {
    const result = project([{ ...state('01'), tripId: 'other' as TripId }, state('missing', 'RESERVED', passenger.id)])
    expect(result.seatSummary.free).toBe(4)
    expect(result.assignedPassengerCount).toBe(0)
    expect(result.seats.at(-1)).toMatchObject({ seat: undefined, passenger: { id: passenger.id } })
  })
  it('ignores an invalid persisted status instead of making counts negative', () => {
    const invalid = { ...state('01'), status: 'INVALID' } as unknown as TripSeatState
    expect(project([invalid]).seatSummary.free).toBe(4)
  })
  it('counts repeated layout seat IDs once', () => {
    expect(project([], { ...layout, elements: [...layout.elements, seat('01')] }).seatSummary.totalSeats).toBe(4)
  })
  it('keeps missing bus history available', () => {
    expect(projectTripHistory(historicalTrip, undefined, layout, [], []).bus).toBeUndefined()
  })
  it('makes a missing layout unavailable without losing orphan associations', () => {
    const result = projectTripHistory(historicalTrip, bus, undefined, [state('01', 'OCCUPIED', passenger.id)], [passenger])
    expect(result.layoutStatus).toBe('missing')
    expect(result.layout).toBeUndefined()
    expect(result.seatSummary.free).toBe(0)
    expect(result.seats[0].passenger?.id).toBe(passenger.id)
  })
  it('rejects a layout from another bus', () => {
    const result = project([], { ...layout, busId: 'other' as BusId })
    expect(result.layoutStatus).toBe('inconsistent')
    expect(result.layout).toBeUndefined()
  })
  it('orders numeric and alphanumeric seat numbers naturally', () => {
    const result = project([], { ...layout, elements: ['10', '2B', '2A', '1'].map((n, i) => seat(n, i+1)) })
    expect(result.seats.map((s) => s.seat?.seatNumber)).toEqual(['1', '2A', '2B', '10'])
  })
  it('projects current names and omits phone, documents and passenger notes', () => {
    const result = project([state('01', 'OCCUPIED', passenger.id)], layout, [{ ...passenger, name: 'Nome atual', notes: 'Privado' }])
    expect(result.seats[0].passenger).toEqual({ id: passenger.id, name: 'Nome atual', displayName: 'Thyago' })
    expect(JSON.stringify(result)).not.toContain(passenger.documentNumber)
    expect(JSON.stringify(result)).not.toContain(passenger.phone)
    expect(JSON.stringify(result)).not.toContain('Privado')
  })
  it.each(['COMPLETED', 'CANCELLED'] as const)('falls back to departure for missing/invalid %s ending', (status) => {
    expect(getHistoryEndedAt({ ...historicalTrip, status })).toBe(historicalTrip.departureAt)
    expect(getHistoryEndedAt({ ...historicalTrip, status, completedAt: 'invalid', cancelledAt: 'invalid' })).toBe(historicalTrip.departureAt)
  })
})

describe('history search and filters', () => {
  const item = project([state('01', 'OCCUPIED', passenger.id)])
  it.each(['iguatu', 'fortaleza', 'expresso', 'cicero', 'thyago', '01', '  SERTÃO  ', 'sertao'])('finds operational field %s', (query) => {
    expect(filterTripHistory([item], query, 'ALL')).toEqual([item])
  })
  it.each(['85912345678', '12345678901', 'CPF', 'RG'])('does not search private data %s', (query) => {
    expect(filterTripHistory([item], query, 'ALL')).toEqual([])
  })
  it('combines query and status with AND', () => {
    const cancelled = { ...item, trip: { ...historicalTrip, id: 'cancelled' as TripId, status: 'CANCELLED' as const } }
    expect(filterTripHistory([item, cancelled], 'Thyago', 'COMPLETED')).toEqual([item])
    expect(filterTripHistory([item, cancelled], 'Thyago', 'CANCELLED')).toEqual([cancelled])
    expect(filterTripHistory([item, cancelled], 'missing', 'COMPLETED')).toEqual([])
    expect(filterTripHistory([item, cancelled], '  ', 'ALL')).toEqual([item, cancelled])
  })
})
