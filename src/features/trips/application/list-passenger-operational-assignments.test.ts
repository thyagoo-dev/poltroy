import { describe, expect, it, vi } from 'vitest'
import type { Bus } from '@/features/buses/domain/bus'
import type { BusLayout } from '@/features/buses/domain/bus-layout'
import type { BusId, BusLayoutId } from '@/features/buses/domain/ids'
import type { PassengerId } from '@/features/passengers/domain/ids'
import type { SeatId } from '@/features/seat-map/domain/ids'
import type { TripRepository } from '@/features/trips/application/trip-repository'
import type { TripSeatStateRepository } from '@/features/trips/application/trip-seat-state-repository'
import { listPassengerOperationalAssignments } from '@/features/trips/application/list-passenger-operational-assignments'
import type { TripId, TripSeatStateId } from '@/features/trips/domain/ids'
import type { Trip } from '@/features/trips/domain/trip'
import type { TripSeatState } from '@/features/trips/domain/trip-seat-state'

const timestamps = { createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' }
const passengerId = 'p1' as PassengerId
function trip(id: string, status: Trip['status'] = 'PLANNED', departureAt = '2026-10-10T12:00:00Z'): Trip {
  return { ...timestamps, id: id as TripId, busId: id as BusId, layoutId: id as BusLayoutId, origin: 'Iguatu', destination: 'Fortaleza', status, departureAt }
}
function state(t: Trip, passenger = passengerId, status: 'OCCUPIED' | 'RESERVED' = 'OCCUPIED', seat = 'seat-01'): TripSeatState {
  return { ...timestamps, id: `${t.id}-${seat}` as TripSeatStateId, tripId: t.id, seatId: seat as SeatId, passengerId: passenger, status }
}
function setup(trips: Trip[], states: TripSeatState[]) {
  const buses = new Map(trips.map((t) => [t.busId, { ...timestamps, id: t.busId, name: `Bus ${t.id}`, activeLayoutId: t.layoutId, status: 'ACTIVE' } satisfies Bus]))
  const layouts = new Map(trips.map((t) => [t.layoutId, { ...timestamps, id: t.layoutId, busId: t.busId, name: 'Layout', version: 1, elements: [{ id: 'seat-01' as SeatId, kind: 'seat', seatNumber: '01', seatType: 'STANDARD', position: { deck: 1, row: 1, column: 1 } }] } satisfies BusLayout]))
  const list = vi.fn(async () => trips)
  const listByTripId = vi.fn(async (id: TripId) => states.filter((s) => s.tripId === id))
  const dependencies = {
    tripRepository: { list } as unknown as TripRepository,
    busRepository: { getById: vi.fn(async (id: BusId) => buses.get(id)), list: vi.fn(), save: vi.fn(), saveWithLayout: vi.fn(), delete: vi.fn() },
    busLayoutRepository: { getById: vi.fn(async (id: BusLayoutId) => layouts.get(id)), getByBusAndVersion: vi.fn(), listByBusId: vi.fn(), save: vi.fn(), delete: vi.fn() },
    tripSeatStateRepository: { listByTripId } as unknown as TripSeatStateRepository,
  }
  return { buses, layouts, dependencies, run: () => listPassengerOperationalAssignments(dependencies), list, listByTripId }
}

describe('passenger operational assignments', () => {
  it('ACTIVE wins even when PLANNED departs earlier', async () => {
    const active = trip('active', 'ACTIVE', '2027-01-01T12:00:00Z'), planned = trip('planned')
    const result = await setup([planned, active], [state(planned), state(active)]).run()
    expect(result.get(passengerId)).toMatchObject({ tripId: active.id, busName: 'Bus active', seatNumber: '01', tripStatus: 'ACTIVE' })
  })
  it.each(['ACTIVE', 'PLANNED'] as const)('orders %s by departure and then id', async (status) => {
    const later = trip('later', status, '2026-11-01T12:00:00Z'), b = trip('b', status), a = trip('a', status)
    expect((await setup([later, b, a], [state(later), state(b), state(a)]).run()).get(passengerId)?.tripId).toBe(a.id)
  })
  it('ignores completed and cancelled trips without loading their states', async () => {
    const trips = [trip('history', 'COMPLETED'), trip('cancelled', 'CANCELLED')]
    const fixture = setup(trips, trips.map((t) => state(t)))
    expect((await fixture.run()).size).toBe(0)
    expect(fixture.listByTripId).not.toHaveBeenCalled()
  })
  it.each(['OCCUPIED', 'RESERVED'] as const)('derives %s associations', async (status) => {
    const t = trip('t')
    expect((await setup([t], [state(t, passengerId, status)]).run()).get(passengerId)?.seatId).toBe('seat-01')
  })
  it('ignores blocked seats, seats without passengers and structural/missing seats', async () => {
    const t = trip('t'), blocked = { ...state(t), status: 'BLOCKED' } as unknown as TripSeatState
    const anonymous = { ...state(t), passengerId: undefined }
    expect((await setup([t], [blocked, anonymous, state(t, passengerId, 'OCCUPIED', 'missing')]).run()).size).toBe(0)
  })
  it.each(['bus', 'layout', 'seat', 'layout-bus'] as const)('skips invalid %s and continues with the next trip', async (missing) => {
    const invalid = trip('invalid', 'ACTIVE'), valid = trip('valid')
    const fixture = setup([invalid, valid], [state(invalid), state(valid)])
    if (missing === 'bus') fixture.buses.delete(invalid.busId)
    if (missing === 'layout') fixture.layouts.delete(invalid.layoutId)
    if (missing === 'seat') fixture.layouts.get(invalid.layoutId)!.elements = []
    if (missing === 'layout-bus') fixture.layouts.get(invalid.layoutId)!.busId = 'other' as BusId
    expect((await fixture.run()).get(passengerId)?.tripId).toBe(valid.id)
  })
  it('resolves passengers independently and reads states once per relevant trip', async () => {
    const a = trip('a', 'ACTIVE'), b = trip('b'), history = trip('history', 'COMPLETED')
    const fixture = setup([b, history, a], [state(a), state(b), state(b, 'p2' as PassengerId, 'RESERVED', 'seat-02')])
    fixture.layouts.get(b.layoutId)!.elements.push({ id: 'seat-02' as SeatId, kind: 'seat', seatNumber: '02', seatType: 'STANDARD', position: { deck: 1, row: 1, column: 2 } })
    const result = await fixture.run()
    expect(result.get(passengerId)?.tripId).toBe(a.id)
    expect(result.get('p2' as PassengerId)).toMatchObject({ tripId: b.id, seatId: 'seat-02', seatNumber: '02' })
    expect(fixture.list).toHaveBeenCalledTimes(1)
    expect(fixture.listByTripId.mock.calls).toEqual([[a.id], [b.id]])
  })
  it('propagates operational read failure for the page fallback', async () => {
    const fixture = setup([trip('a')], [])
    fixture.listByTripId.mockRejectedValueOnce(new Error('read failed'))
    await expect(fixture.run()).rejects.toThrow('read failed')
  })
})
