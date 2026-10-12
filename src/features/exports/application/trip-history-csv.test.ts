import { describe, expect, it } from 'vitest'
import type { BusId, BusLayoutId } from '@/features/buses/domain/ids'
import type { BusLayout } from '@/features/buses/domain/bus-layout'
import type { Bus } from '@/features/buses/domain/bus'
import type { Passenger } from '@/features/passengers/domain/passenger'
import type { PassengerId } from '@/features/passengers/domain/ids'
import type { SeatId } from '@/features/seat-map/domain/ids'
import type { SeatLayoutElement } from '@/features/seat-map/domain/seat'
import type { TripId, TripSeatStateId } from '@/features/trips/domain/ids'
import type { TripSeatState } from '@/features/trips/domain/trip-seat-state'
import { projectTripHistory, type HistoricalTrip } from '@/features/trips/application/trip-history'
import { filterTripHistory } from '@/features/trips/application/trip-history-search'
import { formatHistoryEnd } from '@/features/trips/application/format-history-end'
import { formatDateTime } from '@/shared/lib/date-time'
import { createTripHistoryCsv, createTripManifestCsv } from './trip-history-csv'

const timestamps = { createdAt: '2026-10-01T00:00:00Z', updatedAt: '2026-10-01T00:00:00Z' }
const busId = 'bus' as BusId
const layoutId = 'layout' as BusLayoutId
const clock = new Date(2026, 9, 11, 23, 30)
const trip: HistoricalTrip = { id: 'trip' as TripId, busId, layoutId, origin: 'Iguatu; Ceará', destination: 'São João', departureAt: '2026-10-01T08:00:00Z', completedAt: '2026-10-01T14:00:00Z', status: 'COMPLETED', notes: 'PRIVATE_TRIP_NOTES', ...timestamps }
const bus: Bus = { id: busId, name: 'Expresso Sertão', status: 'ACTIVE', activeLayoutId: layoutId, ...timestamps }
const passenger: Passenger = { id: 'p' as PassengerId, name: 'João "Júnior"', displayName: 'João', phone: '85987654321', documentType: 'CPF', documentNumber: '98765432100', notes: 'PRIVATE_PASSENGER_NOTES', ...timestamps }
const rgPassenger: Passenger = { ...passenger, id: 'rg' as PassengerId, documentType: 'RG', documentNumber: 'PRIVATE_RG_NUMBER' }
const seat = (number: string): SeatLayoutElement => ({ id: ('s'+number) as SeatId, kind: 'seat', seatNumber: number, seatType: 'STANDARD', position: { deck: 1, row: Number(number), column: 1 } })
const layout: BusLayout = { id: layoutId, busId, name: 'Layout original', version: 1, elements: ['01', '02', '03', '04', '05', '06'].map(seat), ...timestamps }
function state(number: string, status: TripSeatState['status'], passengerId?: PassengerId): TripSeatState {
  const base = { id: ('state'+number) as TripSeatStateId, tripId: trip.id, seatId: ('s'+number) as SeatId, ...timestamps }
  return status === 'BLOCKED' ? { ...base, status } : { ...base, status, passengerId }
}
const states = [state('02', 'OCCUPIED', passenger.id), state('03', 'RESERVED', rgPassenger.id), state('04', 'BLOCKED'), state('05', 'OCCUPIED'), state('06', 'OCCUPIED', 'missing' as PassengerId), state('orphan', 'RESERVED', passenger.id)]
const details = projectTripHistory(trip, bus, layout, states, [passenger, rgPassenger])

// Independent reader checks actual tabular structure, including embedded newlines.
function readCsv(content: string): string[][] {
  expect(content.startsWith('\uFEFF')).toBe(true)
  const rows: string[][] = []
  let row: string[] = []
  const cell = /"((?:""|[^"])*)"(;|\r\n)/gy
  cell.lastIndex = 1
  while (cell.lastIndex < content.length) {
    const match = cell.exec(content)
    if (!match) throw new Error('Invalid quoted CSV')
    row.push(match[1].replaceAll('""', '"'))
    if (match[2] === '\r\n') { rows.push(row); row = [] }
  }
  expect(row).toEqual([])
  return rows
}

describe('history CSV', () => {
  it('exports headers in order, friendly status, local dates and existing summaries', () => {
    const rows = readCsv(createTripHistoryCsv([details], clock).content)
    expect(rows[0]).toEqual(['ID da viagem', 'Status', 'Origem', 'Destino', 'Saída planejada', 'Início real', 'Encerramento', 'Ônibus', 'Layout', 'Situação do layout', 'Total de poltronas', 'Livres', 'Ocupadas', 'Reservadas', 'Bloqueadas', 'Passageiros associados'])
    expect(rows[1]).toEqual(['trip', 'Concluída', 'Iguatu; Ceará', 'São João', formatDateTime(trip.departureAt), '', formatHistoryEnd(trip), 'Expresso Sertão', 'Layout original', 'Disponível', '6', '1', '3', '1', '1', '2'])
  })
  it('exports exactly the query/status intersection supplied by the page', () => {
    const items = [details, { ...details, trip: { ...trip, id: 'other' as TripId, origin: 'Sobral' } }, { ...details, trip: { ...trip, id: 'cancelled' as TripId, status: 'CANCELLED' as const } }]
    expect(readCsv(createTripHistoryCsv(filterTripHistory(items, '', 'COMPLETED'), clock).content)).toHaveLength(3)
    expect(readCsv(createTripHistoryCsv(filterTripHistory(items, 'Iguatu', 'COMPLETED'), clock).content)).toHaveLength(2)
  })
  it('exports cancelled status and actual start; flags an unrecorded ending', () => {
    const value = { ...details, trip: { ...trip, status: 'CANCELLED' as const, cancelledAt: undefined, startedAt: trip.departureAt } }
    const row = readCsv(createTripHistoryCsv([value], clock).content)[1]
    expect(row[1]).toBe('Cancelada')
    expect(row[5]).toBe(formatDateTime(trip.departureAt))
    expect(row[6]).toContain('referência: saída; encerramento não registrado')
  })
  it.each(['missing', 'inconsistent'] as const)('leaves unavailable %s counts empty rather than reporting zero occupancy', (layoutStatus) => {
    const row = readCsv(createTripHistoryCsv([{ ...details, layout: undefined, layoutStatus }], clock).content)[1]
    expect(row[9]).toBe(layoutStatus === 'missing' ? 'Não encontrado' : 'Incompatível com o ônibus')
    expect(row.slice(10)).toEqual(['', '', '', '', '', ''])
  })
  it('supports a header-only pure report without a page download', () => {
    expect(readCsv(createTripHistoryCsv([], clock).content)).toHaveLength(1)
  })
})

describe('trip manifest CSV', () => {
  it('exports all seats in projection order, including free and orphan states', () => {
    const rows = readCsv(createTripManifestCsv(details, clock).content)
    expect(rows[0]).toEqual(['ID da viagem', 'Status da viagem', 'Origem', 'Destino', 'Saída planejada', 'Encerramento', 'Ônibus', 'Layout', 'Poltrona', 'Status da poltrona', 'Passageiro', 'Nome de exibição'])
    expect(rows.slice(1).map(row => row.slice(8))).toEqual([
      ['01', 'Livre', '', ''], ['02', 'Ocupada', 'João "Júnior"', 'João'], ['03', 'Reservada', 'João "Júnior"', 'João'],
      ['04', 'Bloqueada', '', ''], ['05', 'Ocupada', '', ''], ['06', 'Ocupada', 'Passageiro não encontrado', ''], ['Indisponível', 'Reservada', 'João "Júnior"', 'João'],
    ])
    expect(rows.every(row => row.length === 12)).toBe(true)
  })
  it('does not leak a passenger accidentally supplied for a blocked or free seat', () => {
    const value = { ...details, seats: details.seats.map(entry => ({ ...entry, passenger: { id: passenger.id, name: passenger.name, displayName: 'João' } })) }
    const rows = readCsv(createTripManifestCsv(value, clock).content)
    expect(rows[1].slice(10)).toEqual(['', ''])
    expect(rows[4].slice(10)).toEqual(['', ''])
  })
  it.each(['missing', 'inconsistent'] as const)('keeps orphan rows when bus/layout are %s', (layoutStatus) => {
    const value = { ...details, bus: undefined, layout: undefined, layoutStatus, seats: details.seats.filter(entry => entry.state).map(entry => ({ ...entry, seat: undefined })) }
    const rows = readCsv(createTripManifestCsv(value, clock).content)
    expect(rows).toHaveLength(7)
    expect(rows[1][6]).toBe('Ônibus não encontrado')
    expect(rows[1][7]).toBe(layoutStatus === 'missing' ? 'Layout não encontrado' : 'Layout incompatível')
    expect(rows.slice(1).every(row => row[8] === 'Indisponível')).toBe(true)
  })
})

describe('report safety, privacy and filenames', () => {
  it('neutralizes malicious trip, bus, layout and passenger cells in both reports', () => {
    const value = { ...details, trip: { ...trip, origin: '=SUM(1,2)', destination: '+CMD' }, bus: { ...bus, name: '@danger' }, layout: { ...layout, name: '\t=LAYOUT()' }, seats: details.seats.map(entry => ({ ...entry, passenger: { id: passenger.id, name: '-1+1', displayName: '  =TEST' } })) }
    const history = readCsv(createTripHistoryCsv([value], clock).content)[1]
    expect(history[2]).toBe("'=SUM(1,2)")
    expect(history[3]).toBe("'+CMD")
    expect(history[7]).toBe("'@danger")
    expect(history[8]).toBe("'\t=LAYOUT()")
    expect(readCsv(createTripManifestCsv(value, clock).content)[2].slice(10)).toEqual(["'-1+1", "'  =TEST"])
  })
  it('omits CPF/RG, phone and both types of notes, without mutating any input', () => {
    const before = JSON.stringify({ details, trip, bus, layout, states, passenger, rgPassenger })
    const files = [createTripHistoryCsv([details], clock), createTripManifestCsv(details, clock)]
    for (const file of files) for (const marker of ['85987654321', '98765432100', 'PRIVATE_RG_NUMBER', 'PRIVATE_PASSENGER_NOTES', 'PRIVATE_TRIP_NOTES', 'documentNumber', 'documentType']) {
      expect(file.content).not.toContain(marker)
      expect(file.filename).not.toContain(marker)
    }
    expect(JSON.stringify({ details, trip, bus, layout, states, passenger, rgPassenger })).toBe(before)
  })
  it('uses a supplied local clock and non-personal deterministic filenames', () => {
    expect(createTripHistoryCsv([details], clock).filename).toBe('poltroy-historico-2026-10-11.csv')
    expect(createTripManifestCsv(details, clock).filename).toBe('poltroy-manifesto-2026-10-11-trip.csv')
  })
  it('sanitizes forbidden filename characters, controls, traversal and bounds the ID', () => {
    const id = '../\\:*?"<>|\u0000\r\n' + 'a'.repeat(200)
    const filename = createTripManifestCsv({ ...details, trip: { ...trip, id: id as TripId } }, clock).filename
    expect(filename).not.toMatch(/[\\/:*?"<>|]/u)
    expect(filename).not.toContain('..')
    expect(filename.length).toBe('poltroy-manifesto-2026-10-11-'.length + 100 + 4)
  })
  it('uses a safe fallback for an empty ID and rejects an invalid clock', () => {
    expect(createTripManifestCsv({ ...details, trip: { ...trip, id: '' as TripId } }, clock).filename).toBe('poltroy-manifesto-2026-10-11-viagem.csv')
    expect(() => createTripHistoryCsv([details], new Date('invalid'))).toThrow('Data de exportação inválida.')
  })
  it('keeps long names, routes and embedded newlines intact in a 1000-trip dataset', () => {
    const longOrigin = 'Iguatu; Ceará "Centro"\n' + 'RotaLonga'.repeat(30)
    const items = Array.from({ length: 1000 }, (_, index) => ({ ...details, trip: { ...trip, id: ('trip-'+index) as TripId, origin: longOrigin } }))
    const rows = readCsv(createTripHistoryCsv(items, clock).content)
    expect(rows).toHaveLength(1001)
    expect(rows.slice(1).every(row => row.length === 16 && row[2] === longOrigin)).toBe(true)
  })
})
