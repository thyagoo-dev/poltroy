import { describe, expect, it } from 'vitest'

import type { BusLayout } from '@/features/buses/domain/bus-layout'
import type { BusId, BusLayoutId } from '@/features/buses/domain/ids'
import type { PassengerId } from '@/features/passengers/domain/ids'
import type { Passenger } from '@/features/passengers/domain/passenger'
import type { LayoutElementId, SeatId } from '@/features/seat-map/domain/ids'
import type { SeatLayoutElement } from '@/features/seat-map/domain/seat'
import type { TripId, TripSeatStateId } from '@/features/trips/domain/ids'
import type { PersistedSeatStatus, TripSeatState } from '@/features/trips/domain/trip-seat-state'
import { matchesOperationalSeatFilter, type OperationalSeatFilter } from '@/features/trips/domain/operational-seat-filter'
import { summarizeOperationalSeats } from '@/features/trips/domain/operational-seat-summary'

const timestamp = '2026-10-09T00:00:00.000Z'
const passenger: Passenger = {
  id: 'joao' as PassengerId,
  name: 'João da Silva',
  phone: '(88) 99999-1234',
  createdAt: timestamp,
  updatedAt: timestamp,
}
const seats: SeatLayoutElement[] = Array.from({ length: 10 }, (_, index) => ({
  id: `seat-${index + 1}` as SeatId,
  kind: 'seat',
  seatNumber: String(index + 1).padStart(2, '0'),
  seatType: 'STANDARD',
  position: { deck: 1, row: index + 1, column: 1 },
}))
const layout: BusLayout = {
  id: 'layout' as BusLayoutId,
  busId: 'bus' as BusId,
  name: 'Teste',
  version: 1,
  elements: seats,
  createdAt: timestamp,
  updatedAt: timestamp,
}
function state(index: number, status: PersistedSeatStatus, passengerId?: PassengerId): TripSeatState {
  const base = {
    id: `state-${index}` as TripSeatStateId,
    tripId: 'trip' as TripId,
    seatId: seats[index].id,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
  return status === 'BLOCKED' ? { ...base, status } : { ...base, status, passengerId }
}

describe('Resumo operacional', () => {
  it('calcula dez assentos com cobertura de passageiros apenas nos ocupados/reservados', () => {
    const result = summarizeOperationalSeats(layout, [
      state(0, 'OCCUPIED', passenger.id), state(1, 'OCCUPIED'),
      state(2, 'RESERVED', passenger.id), state(3, 'RESERVED', passenger.id),
      state(4, 'BLOCKED'), state(5, 'BLOCKED'),
    ])
    expect(result).toEqual({ totalSeats: 10, free: 4, occupied: 2, reserved: 2, blocked: 2, withPassenger: 3, withoutPassenger: 1 })
  })
  it('considera todos livres quando não há estados', () => {
    expect(summarizeOperationalSeats(layout, [])).toEqual({ totalSeats: 10, free: 10, occupied: 0, reserved: 0, blocked: 0, withPassenger: 0, withoutPassenger: 0 })
  })
  it('ignora estados fora do layout e elementos estruturais', () => {
    const result = summarizeOperationalSeats({ ...layout, elements: [...seats, { kind: 'driver', id: 'driver' as LayoutElementId, position: { deck: 1, row: 11, column: 1 } }] }, [
      { ...state(0, 'OCCUPIED', passenger.id), seatId: 'foreign-seat' as SeatId },
    ])
    expect(result.totalSeats).toBe(10)
    expect(result.free).toBe(10)
    expect(result.withPassenger).toBe(0)
  })
})

describe('Filtros operacionais', () => {
  const candidates = [undefined, state(0, 'OCCUPIED'), state(0, 'RESERVED'), state(0, 'BLOCKED'), state(0, 'OCCUPIED', passenger.id), state(0, 'RESERVED', passenger.id)]
  it.each<[OperationalSeatFilter, boolean[]]>([
    ['ALL', [true, true, true, true, true, true]],
    ['FREE', [true, false, false, false, false, false]],
    ['OCCUPIED', [false, true, false, false, true, false]],
    ['RESERVED', [false, false, true, false, false, true]],
    ['BLOCKED', [false, false, false, true, false, false]],
    ['WITHOUT_PASSENGER', [false, true, true, false, false, false]],
  ])('%s inclui somente os estados correspondentes', (filter, expected) => {
    expect(candidates.map((candidate) => matchesOperationalSeatFilter({ seat: seats[0], state: candidate, passenger, filter, search: '' }))).toEqual(expected)
  })
})

describe('Busca operacional', () => {
  it('busca displayName sem usar CPF ou RG', () => {
    const person = { ...passenger, displayName: 'Apelido', documentType: 'CPF' as const, documentNumber: '98765432109' }
    const assigned = state(0, 'RESERVED', person.id)
    const match = (search: string) => matchesOperationalSeatFilter({ seat: seats[0], state: assigned, passenger: person, filter: 'ALL', search })
    expect(match('apelido')).toBe(true)
    expect(match('João')).toBe(true)
    expect(match('98765432109')).toBe(false)
    expect(match('987.654.321-09')).toBe(false)
    expect(matchesOperationalSeatFilter({ seat: seats[0], state: assigned, passenger: { ...person, documentType: 'RG', documentNumber: 'documento-unico' }, filter: 'ALL', search: 'documento-unico' })).toBe(false)
  })
  const seat = { ...seats[0], seatNumber: '18' }
  const assigned = state(0, 'RESERVED', passenger.id)
  it.each(['18', '8', 'joão', 'JOÃO', '1234', '  João  ', '', '   '])('encontra assento ou passageiro usando %j', (search) => {
    expect(matchesOperationalSeatFilter({ seat, state: assigned, passenger, filter: 'ALL', search })).toBe(true)
  })
  it('rejeita nome que não corresponde', () => {
    expect(matchesOperationalSeatFilter({ seat, state: assigned, passenger, filter: 'ALL', search: 'Maria' })).toBe(false)
  })
  it('não encontra passageiro ausente mesmo havendo uma referência no estado', () => {
    expect(matchesOperationalSeatFilter({ seat, state: assigned, filter: 'ALL', search: 'João' })).toBe(false)
    expect(matchesOperationalSeatFilter({ seat, state: assigned, filter: 'ALL', search: '18' })).toBe(true)
  })
  it('não pesquisa dados de passageiro que não está associado ao estado', () => {
    expect(matchesOperationalSeatFilter({ seat, passenger, filter: 'ALL', search: 'João' })).toBe(false)
    expect(matchesOperationalSeatFilter({ seat, state: state(0, 'BLOCKED'), passenger, filter: 'ALL', search: '1234' })).toBe(false)
  })
  it('combina filtro RESERVED e nome João com AND', () => {
    const maria = { ...passenger, id: 'maria' as PassengerId, name: 'Maria' }
    const matches = [
      { state: assigned, passenger },
      { state: state(0, 'OCCUPIED', passenger.id), passenger },
      { state: state(0, 'RESERVED', maria.id), passenger: maria },
    ].map((candidate) => matchesOperationalSeatFilter({ seat, ...candidate, filter: 'RESERVED', search: 'João' }))
    expect(matches).toEqual([true, false, false])
  })
})
