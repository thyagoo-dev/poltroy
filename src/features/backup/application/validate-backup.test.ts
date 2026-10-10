import { describe, expect, it } from 'vitest'

import { MAX_BACKUP_LAYOUT_CELLS, parsePoltroyBackup, validatePoltroyBackup } from '@/features/backup/application/validate-backup'
import type { PoltroyBackupInput } from '@/features/backup/domain/backup-document'
import type { BusLayoutElement } from '@/features/seat-map/domain/layout-element'
import { backupFixture, backupV2Fixture, emptyBackupFixture } from '@/features/backup/test/backup-fixtures'

describe('backup validation', () => {
  it('converte v1 em memória sem alterar IDs, timestamps, associações ou input', () => {
    const input = backupFixture()
    const before = structuredClone(input)
    const result = validatePoltroyBackup(input)
    expect(input).toEqual(before)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.backup.backupVersion).toBe(2)
    expect(result.backup.data.passengers[0]).toEqual({ ...before.data.passengers[0], displayName: 'Passageiro de te' })
    expect(result.backup.data.tripSeatStates).toEqual(before.data.tripSeatStates)
    expect(validatePoltroyBackup(result.backup).success).toBe(true)
  })

  it('preserva os campos antigos também na revalidação v2 após converter v1', () => {
    const input = backupFixture()
    Object.assign(input.data.passengers[0], { name: '  Nome antigo  ', phone: '  123  ', notes: '  Observação  ' })
    const first = validatePoltroyBackup(input)
    expect(first.success).toBe(true)
    if (!first.success) return
    const second = validatePoltroyBackup(first.backup)
    expect(second).toEqual(first)
    expect(first.backup.data.passengers[0]).toMatchObject(input.data.passengers[0])
  })

  it.each([
    ['CPF', '12345678901'], ['RG', 'ab-12 / X'],
  ] as const)('aceita e preserva documento %s em v2, inclusive na revalidação do preview', (documentType, documentNumber) => {
    const input = backupV2Fixture()
    Object.assign(input.data.passengers[0], { documentType, documentNumber })
    const result = validatePoltroyBackup(input)
    expect(result).toEqual({ success: true, backup: input })
    if (result.success) expect(validatePoltroyBackup(result.backup)).toEqual(result)
  })

  it.each([
    { displayName: undefined }, { displayName: '' }, { displayName: ' ' }, { displayName: 'x'.repeat(17) },
    { documentType: 'CPF' }, { documentNumber: '12345678901' },
    { documentType: 'CPF', documentNumber: '' }, { documentType: 'CPF', documentNumber: '123' },
    { documentType: 'CPF', documentNumber: '123.456.789-01' }, { documentType: 'CPF', documentNumber: '123456789012' },
    { documentType: 'CNH', documentNumber: '12345678901' }, { documentType: 'RG', documentNumber: 'x'.repeat(33) },
  ])('rejeita campos v2 inválidos antes da escrita: %j', (fields) => {
    const input = backupV2Fixture()
    Object.assign(input.data.passengers[0], fields)
    expect(validatePoltroyBackup(input).success).toBe(false)
  })
  it('aceita versão 1 com dados, sem modificar os valores persistidos', () => {
    const input = backupFixture()
    input.data.passengers[0].name = '  Nome preservado  '
    expect(validatePoltroyBackup(input)).toEqual({ success: true, backup: { ...input, backupVersion: 2, data: { ...input.data, passengers: [{ ...input.data.passengers[0], displayName: 'Nome preservado' }] } } })
  })

  it('aceita cinco coleções vazias', () => {
    expect(validatePoltroyBackup(emptyBackupFixture()).success).toBe(true)
  })

  it('aceita timestamps ISO com offset', () => {
    const input = backupFixture()
    input.exportedAt = '2026-10-10T09:00:00-03:00'
    expect(validatePoltroyBackup(input).success).toBe(true)
  })

  it('não exige datas lifecycle opcionais de backups antigos', () => {
    const input = backupFixture()
    input.data.trips[0].status = 'COMPLETED'
    expect(validatePoltroyBackup(input).success).toBe(true)
  })

  it('aceita o mesmo passageiro em viagens diferentes', () => {
    const input = backupFixture()
    const other = backupFixture('b')
    input.data.trips.push(other.data.trips[0])
    input.data.buses.push(other.data.buses[0])
    input.data.busLayouts.push(other.data.busLayouts[0])
    input.data.tripSeatStates.push({ ...other.data.tripSeatStates[0], status: 'RESERVED', passengerId: input.data.passengers[0].id })
    expect(validatePoltroyBackup(input).success).toBe(true)
  })

  it.each(['OCCUPIED', 'RESERVED'] as const)('aceita %s com passageiro válido', (status) => {
    const input = backupFixture()
    Object.assign(input.data.tripSeatStates[0], { status })
    expect(validatePoltroyBackup(input).success).toBe(true)
  })

  it('aceita BLOCKED sem passageiro', () => {
    const input = backupFixture()
    delete input.data.tripSeatStates[0].passengerId
    Object.assign(input.data.tripSeatStates[0], { status: 'BLOCKED' })
    expect(validatePoltroyBackup(input).success).toBe(true)
  })

  it('rejeita JSON malformado', () => {
    expect(parsePoltroyBackup('{')).toEqual({ success: false, issues: [{ path: 'backup', message: 'O arquivo não contém JSON válido.' }] })
  })

  it.each([null, [], 42, 'texto'])('rejeita top-level não objeto: %j', (input) => {
    expect(validatePoltroyBackup(input).success).toBe(false)
  })

  const invalidCases: [string, (backup: PoltroyBackupInput) => void, string][] = [
    ['outro aplicativo', (b) => Object.assign(b, { app: 'OUTRO' }), 'app'],
    ['versão futura', (b) => Object.assign(b, { backupVersion: 99 }), 'backupVersion'],
    ['data ausente', (b) => Reflect.deleteProperty(b, 'data'), 'data'],
    ['coleção ausente', (b) => Reflect.deleteProperty(b.data, 'passengers'), 'data.passengers'],
    ['coleção não array', (b) => Object.assign(b.data, { trips: {} }), 'data.trips'],
    ['exportedAt inválido', (b) => { b.exportedAt = 'inválido' }, 'exportedAt'],
    ['exportedAt sem ISO', (b) => { b.exportedAt = '10/10/2026' }, 'exportedAt'],
    ['entidade não objeto', (b) => Object.assign(b.data, { passengers: [null] }), 'data.passengers[0]'],
    ['id vazio', (b) => Object.assign(b.data.buses[0], { id: '  ' }), 'data.buses[0].id'],
    ['id não string', (b) => Object.assign(b.data.trips[0], { id: 123 }), 'data.trips[0].id'],
    ['status bus inválido', (b) => Object.assign(b.data.buses[0], { status: 'UNKNOWN' }), 'data.buses[0].status'],
    ['timestamp bus inválido', (b) => { b.data.buses[0].createdAt = 'inválido' }, 'data.buses[0].createdAt'],
    ['archivedAt inválido', (b) => { b.data.buses[0].archivedAt = 'inválido' }, 'data.buses[0].archivedAt'],
    ['plate não string', (b) => Object.assign(b.data.buses[0], { plate: 12 }), 'data.buses[0].plate'],
    ['nome passageiro vazio', (b) => { b.data.passengers[0].name = '  ' }, 'data.passengers[0].name'],
    ['phone não string', (b) => Object.assign(b.data.passengers[0], { phone: null }), 'data.passengers[0].phone'],
    ['notes não string', (b) => Object.assign(b.data.passengers[0], { notes: {} }), 'data.passengers[0].notes'],
    ['status trip inválido', (b) => Object.assign(b.data.trips[0], { status: 'UNKNOWN' }), 'data.trips[0].status'],
    ['departureAt inválido', (b) => { b.data.trips[0].departureAt = 'inválido' }, 'data.trips[0].departureAt'],
    ['arrivalEstimateAt inválido', (b) => { b.data.trips[0].arrivalEstimateAt = 'inválido' }, 'data.trips[0].arrivalEstimateAt'],
    ['ACTIVE com conclusão', (b) => Object.assign(b.data.trips[0], { status: 'ACTIVE', completedAt: b.exportedAt }), 'data.trips[0]'],
    ['PLANNED com início', (b) => { b.data.trips[0].startedAt = b.exportedAt }, 'data.trips[0]'],
    ['COMPLETED com cancelamento', (b) => Object.assign(b.data.trips[0], { status: 'COMPLETED', cancelledAt: b.exportedAt }), 'data.trips[0]'],
    ['CANCELLED com conclusão', (b) => Object.assign(b.data.trips[0], { status: 'CANCELLED', completedAt: b.exportedAt }), 'data.trips[0]'],
    ['conclusão antes do início', (b) => Object.assign(b.data.trips[0], { status: 'COMPLETED', startedAt: b.exportedAt, completedAt: '2026-10-09T12:00:00Z' }), 'data.trips[0].completedAt'],
    ['cancelamento antes do início', (b) => Object.assign(b.data.trips[0], { status: 'CANCELLED', startedAt: b.exportedAt, cancelledAt: '2026-10-09T12:00:00Z' }), 'data.trips[0].cancelledAt'],
    ['FREE persistido', (b) => Object.assign(b.data.tripSeatStates[0], { status: 'FREE' }), 'data.tripSeatStates[0].status'],
    ['BLOCKED com passageiro', (b) => Object.assign(b.data.tripSeatStates[0], { status: 'BLOCKED' }), 'data.tripSeatStates[0].passengerId'],
    ['layout ativo inexistente', (b) => Object.assign(b.data.buses[0], { activeLayoutId: 'missing' }), 'data.buses[0].activeLayoutId'],
    ['bus do layout inexistente', (b) => Object.assign(b.data.busLayouts[0], { busId: 'missing' }), 'data.busLayouts[0].busId'],
    ['bus da trip inexistente', (b) => Object.assign(b.data.trips[0], { busId: 'missing' }), 'data.trips[0].busId'],
    ['layout da trip inexistente', (b) => Object.assign(b.data.trips[0], { layoutId: 'missing' }), 'data.trips[0].layoutId'],
    ['trip do estado inexistente', (b) => Object.assign(b.data.tripSeatStates[0], { tripId: 'missing' }), 'data.tripSeatStates[0].tripId'],
    ['seat fora do layout', (b) => Object.assign(b.data.tripSeatStates[0], { seatId: 'missing' }), 'data.tripSeatStates[0].seatId'],
    ['passageiro inexistente', (b) => Object.assign(b.data.tripSeatStates[0], { passengerId: 'missing' }), 'data.tripSeatStates[0].passengerId'],
    ['busId+version duplicado', (b) => b.data.busLayouts.push({ ...b.data.busLayouts[0], id: backupFixture('b').data.busLayouts[0].id }), 'data.busLayouts[1].version'],
    ['tripId+seatId duplicado', (b) => b.data.tripSeatStates.push({ ...b.data.tripSeatStates[0], id: backupFixture('b').data.tripSeatStates[0].id }), 'data.tripSeatStates[1].seatId'],
    ['passageiro em dois assentos', (b) => b.data.tripSeatStates.push({ ...b.data.tripSeatStates[0], id: backupFixture('b').data.tripSeatStates[0].id, seatId: b.data.busLayouts[0].elements[1].id as typeof b.data.tripSeatStates[0]['seatId'] }), 'data.tripSeatStates[1].passengerId'],
    ['versão layout inválida', (b) => { b.data.busLayouts[0].version = 0 }, 'data.busLayouts[0].version'],
    ['elements não array', (b) => Object.assign(b.data.busLayouts[0], { elements: {} }), 'data.busLayouts[0].elements'],
    ['kind inválido', (b) => Object.assign(b.data.busLayouts[0].elements[0], { kind: 'unknown' }), 'data.busLayouts[0].elements[0].kind'],
    ['seatType inválido', (b) => Object.assign(b.data.busLayouts[0].elements[0], { seatType: 'unknown' }), 'data.busLayouts[0].elements[0].seatType'],
    ['position inválida', (b) => Object.assign(b.data.busLayouts[0].elements[0], { position: null }), 'data.busLayouts[0].elements[0].position'],
    ['posição zero', (b) => { b.data.busLayouts[0].elements[0].position.row = 0 }, 'data.busLayouts[0].elements[0].position.row'],
    ['span inválido', (b) => { b.data.busLayouts[0].elements[0].position.columnSpan = -1 }, 'data.busLayouts[0].elements[0].position.columnSpan'],
    ['span excessivo', (b) => { b.data.busLayouts[0].elements[0].position.rowSpan = MAX_BACKUP_LAYOUT_CELLS + 1 }, 'data.busLayouts[0].elements'],
    ['coordenada final insegura', (b) => Object.assign(b.data.busLayouts[0].elements[0].position, { row: Number.MAX_SAFE_INTEGER, rowSpan: 10 }), 'data.busLayouts[0].elements'],
    ['colisão de grid', (b) => { b.data.busLayouts[0].elements[1].position.column = 1 }, 'data.busLayouts[0].elements'],
    ['número assento duplicado', (b) => Object.assign(b.data.busLayouts[0].elements[1], { seatNumber: '01' }), 'data.busLayouts[0].elements'],
    ['id elemento duplicado', (b) => Object.assign(b.data.busLayouts[0].elements[1], { id: b.data.busLayouts[0].elements[0].id }), 'data.busLayouts[0].elements'],
  ]
  it.each(invalidCases)('rejeita %s antes da escrita', (_name, mutate, path) => {
    const input = backupFixture()
    mutate(input)
    const result = validatePoltroyBackup(input)
    expect(result.success).toBe(false)
    if (!result.success) expect(result.issues.some((issue) => issue.path === path)).toBe(true)
  })

  it.each(['buses', 'busLayouts', 'passengers', 'trips', 'tripSeatStates'] as const)('rejeita IDs duplicados em %s', (key) => {
    const input = backupFixture()
    Object.assign(input.data, { [key]: [...input.data[key], structuredClone(input.data[key][0])] })
    const result = validatePoltroyBackup(input)
    expect(result.success).toBe(false)
    if (!result.success) expect(result.issues).toContainEqual({ path: `data.${key}[1].id`, message: 'ID duplicado nesta coleção.' })
  })

  it.each(['bus', 'trip'] as const)('rejeita layout de outro ônibus no %s', (entity) => {
    const input = backupFixture()
    const other = backupFixture('b')
    input.data.buses.push(other.data.buses[0])
    input.data.busLayouts.push(other.data.busLayouts[0])
    if (entity === 'bus') input.data.buses[0].activeLayoutId = other.data.busLayouts[0].id
    else input.data.trips[0].layoutId = other.data.busLayouts[0].id
    expect(validatePoltroyBackup(input).success).toBe(false)
  })

  it('rejeita estado que aponta para elemento estrutural', () => {
    const input = backupFixture()
    const seat = input.data.busLayouts[0].elements[0]
    const structural: BusLayoutElement = { id: seat.id as never, kind: 'driver', position: seat.position, label: 'Motorista' }
    input.data.busLayouts[0].elements = [structural, input.data.busLayouts[0].elements[1]]
    expect(validatePoltroyBackup(input).success).toBe(false)
  })

  it('descarta campos desconhecidos e __proto__ sem propagá-los', () => {
    const input: unknown = JSON.parse(JSON.stringify(backupFixture()).replace('"name":"Passageiro de teste"', '"name":"Passageiro de teste","__proto__":{"polluted":true},"extra":"ignorar"'))
    const result = validatePoltroyBackup(input)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(Object.hasOwn(result.backup.data.passengers[0], '__proto__')).toBe(false)
      expect(Object.hasOwn(result.backup.data.passengers[0], 'extra')).toBe(false)
      expect(result.backup.data).toEqual(backupV2Fixture().data)
    }
  })

  it('rejeita array esparso sem lançar exceção', () => {
    const input = backupFixture()
    Object.assign(input.data, { passengers: new Array(1) })
    expect(validatePoltroyBackup(input).success).toBe(false)
  })
})
