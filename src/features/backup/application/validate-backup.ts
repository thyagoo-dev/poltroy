import {
  POLTROY_BACKUP_VERSION,
  BACKUP_COLLECTIONS,
  type BackupIssue,
  type BackupValidationResult,
  type LocalDataSnapshot,
} from '@/features/backup/domain/backup-document'
import type { Bus } from '@/features/buses/domain/bus'
import { validateBusLayout, type BusLayout } from '@/features/buses/domain/bus-layout'
import type { BusId, BusLayoutId } from '@/features/buses/domain/ids'
import type { PassengerId } from '@/features/passengers/domain/ids'
import type { Passenger } from '@/features/passengers/domain/passenger'
import type { BusLayoutElement } from '@/features/seat-map/domain/layout-element'
import type { LayoutElementId, SeatId } from '@/features/seat-map/domain/ids'
import type { TripId, TripSeatStateId } from '@/features/trips/domain/ids'
import type { Trip } from '@/features/trips/domain/trip'
import type { TripSeatState } from '@/features/trips/domain/trip-seat-state'

// Avoid expanding a malicious grid span into millions of collision cells.
export const MAX_BACKUP_LAYOUT_CELLS = 100_000

function isObject(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input)
}

class Reader {
  readonly issues: BackupIssue[] = []

  issue(path: string, message: string) {
    if (this.issues.length < 50) this.issues.push({ path, message })
  }

  object(input: unknown, path: string): Record<string, unknown> {
    if (isObject(input)) return input
    this.issue(path, 'Deve ser um objeto.')
    return {}
  }

  text(input: unknown, path: string, nonempty = true): string {
    if (typeof input === 'string' && (!nonempty || input.trim().length > 0)) return input
    this.issue(path, nonempty ? 'Deve ser um texto não vazio.' : 'Deve ser um texto.')
    return ''
  }

  timestamp(input: unknown, path: string): string {
    const value = this.text(input, path)
    if (value && !Number.isFinite(Date.parse(value))) this.issue(path, 'Data inválida.')
    return value
  }

  timestamps(row: Record<string, unknown>, path: string) {
    return {
      createdAt: this.timestamp(row.createdAt, `${path}.createdAt`),
      updatedAt: this.timestamp(row.updatedAt, `${path}.updatedAt`),
    }
  }

  optionalText<K extends string>(row: Record<string, unknown>, key: K, path: string, date = false): Partial<Record<K, string>> {
    if (!Object.hasOwn(row, key)) return {}
    const value = date ? this.timestamp(row[key], `${path}.${key}`) : this.text(row[key], `${path}.${key}`, false)
    return { [key]: value } as Record<K, string>
  }

  choice<T extends string>(input: unknown, allowed: readonly T[], path: string): T {
    const value = allowed.find((entry) => entry === input)
    if (value) return value
    this.issue(path, `Valor inválido. Use ${allowed.join(', ')}.`)
    return allowed[0]
  }

  integer(input: unknown, path: string): number {
    if (typeof input === 'number' && Number.isSafeInteger(input) && input > 0) return input
    this.issue(path, 'Deve ser um inteiro positivo e seguro.')
    return 0
  }

  array<T>(input: unknown, path: string, parse: (row: Record<string, unknown>, path: string) => T): T[] {
    if (!Array.isArray(input)) {
      this.issue(path, 'Deve ser uma lista.')
      return []
    }
    return Array.from(input, (row: unknown, index) => parse(this.object(row, `${path}[${index}]`), `${path}[${index}]`))
  }
}

function parseSnapshot(data: Record<string, unknown>, reader: Reader): LocalDataSnapshot {
  const buses = reader.array<Bus>(data.buses, 'data.buses', (row, path) => ({
    id: reader.text(row.id, `${path}.id`) as BusId,
    name: reader.text(row.name, `${path}.name`),
    activeLayoutId: reader.text(row.activeLayoutId, `${path}.activeLayoutId`) as BusLayoutId,
    status: reader.choice(row.status, ['ACTIVE', 'ARCHIVED'], `${path}.status`),
    ...reader.timestamps(row, path),
    ...reader.optionalText(row, 'plate', path),
    ...reader.optionalText(row, 'model', path),
    ...reader.optionalText(row, 'archivedAt', path, true),
  }))
  const busLayouts = reader.array<BusLayout>(data.busLayouts, 'data.busLayouts', (row, path) => {
    const layout: BusLayout = {
      id: reader.text(row.id, `${path}.id`) as BusLayoutId,
      busId: reader.text(row.busId, `${path}.busId`) as BusId,
      name: reader.text(row.name, `${path}.name`),
      version: reader.integer(row.version, `${path}.version`),
      ...reader.timestamps(row, path),
      elements: reader.array<BusLayoutElement>(row.elements, `${path}.elements`, (element, elementPath) => {
        const rawPosition = reader.object(element.position, `${elementPath}.position`)
        const position = {
          deck: reader.integer(rawPosition.deck, `${elementPath}.position.deck`),
          row: reader.integer(rawPosition.row, `${elementPath}.position.row`),
          column: reader.integer(rawPosition.column, `${elementPath}.position.column`),
          ...(Object.hasOwn(rawPosition, 'rowSpan') ? { rowSpan: reader.integer(rawPosition.rowSpan, `${elementPath}.position.rowSpan`) } : {}),
          ...(Object.hasOwn(rawPosition, 'columnSpan') ? { columnSpan: reader.integer(rawPosition.columnSpan, `${elementPath}.position.columnSpan`) } : {}),
        }
        const id = reader.text(element.id, `${elementPath}.id`)
        const kind = reader.choice(element.kind, ['seat', 'driver', 'door', 'toilet', 'stairs', 'aisle', 'technical'], `${elementPath}.kind`)
        return kind === 'seat'
          ? {
            id: id as SeatId, kind, position,
            seatNumber: reader.text(element.seatNumber, `${elementPath}.seatNumber`),
            seatType: reader.choice(element.seatType, ['STANDARD', 'EXECUTIVE', 'SEMI_SLEEPER', 'SLEEPER', 'ACCESSIBLE'], `${elementPath}.seatType`),
          }
          : { id: id as LayoutElementId, kind, position, ...reader.optionalText(element, 'label', elementPath) }
      }),
    }
    const cells = layout.elements.reduce((sum, element) => sum + (element.position.rowSpan ?? 1) * (element.position.columnSpan ?? 1), 0)
    const unsafeExtent = layout.elements.some(({ position }) =>
      position.row > Number.MAX_SAFE_INTEGER - ((position.rowSpan ?? 1) - 1)
      || position.column > Number.MAX_SAFE_INTEGER - ((position.columnSpan ?? 1) - 1))
    if (unsafeExtent) {
      reader.issue(`${path}.elements`, 'As dimensões do layout excedem coordenadas inteiras seguras.')
    } else if (cells > MAX_BACKUP_LAYOUT_CELLS) {
      reader.issue(`${path}.elements`, 'O layout excede o limite de 100.000 células para validação segura.')
    } else {
      for (const issue of validateBusLayout(layout)) reader.issue(`${path}.elements`, `${issue.code}: ${issue.message}`)
    }
    return layout
  })
  const passengers = reader.array<Passenger>(data.passengers, 'data.passengers', (row, path) => ({
    id: reader.text(row.id, `${path}.id`) as PassengerId,
    name: reader.text(row.name, `${path}.name`),
    ...reader.timestamps(row, path),
    ...reader.optionalText(row, 'phone', path),
    ...reader.optionalText(row, 'notes', path),
  }))
  const trips = reader.array<Trip>(data.trips, 'data.trips', (row, path) => {
    const trip: Trip = {
      id: reader.text(row.id, `${path}.id`) as TripId,
      busId: reader.text(row.busId, `${path}.busId`) as BusId,
      layoutId: reader.text(row.layoutId, `${path}.layoutId`) as BusLayoutId,
      origin: reader.text(row.origin, `${path}.origin`),
      destination: reader.text(row.destination, `${path}.destination`),
      departureAt: reader.timestamp(row.departureAt, `${path}.departureAt`),
      status: reader.choice(row.status, ['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED'], `${path}.status`),
      ...reader.timestamps(row, path),
      ...reader.optionalText(row, 'notes', path),
      ...reader.optionalText(row, 'arrivalEstimateAt', path, true),
      ...reader.optionalText(row, 'startedAt', path, true),
      ...reader.optionalText(row, 'completedAt', path, true),
      ...reader.optionalText(row, 'cancelledAt', path, true),
    }
    // Lifecycle timestamps remain optional, matching the existing domain contract.
    if (trip.status === 'PLANNED' && (trip.startedAt || trip.completedAt || trip.cancelledAt)) reader.issue(path, 'Viagem planejada não pode ter datas de início, conclusão ou cancelamento.')
    if (trip.status === 'ACTIVE' && (trip.completedAt || trip.cancelledAt)) reader.issue(path, 'Viagem ativa não pode estar concluída ou cancelada.')
    if (trip.status === 'COMPLETED' && trip.cancelledAt) reader.issue(path, 'Viagem concluída não pode estar cancelada.')
    if (trip.status === 'CANCELLED' && trip.completedAt) reader.issue(path, 'Viagem cancelada não pode estar concluída.')
    if (trip.startedAt && trip.completedAt && Date.parse(trip.completedAt) < Date.parse(trip.startedAt)) reader.issue(`${path}.completedAt`, 'A conclusão não pode ocorrer antes do início.')
    if (trip.startedAt && trip.cancelledAt && Date.parse(trip.cancelledAt) < Date.parse(trip.startedAt)) reader.issue(`${path}.cancelledAt`, 'O cancelamento não pode ocorrer antes do início.')
    return trip
  })
  const tripSeatStates = reader.array<TripSeatState>(data.tripSeatStates, 'data.tripSeatStates', (row, path) => {
    const base = {
      id: reader.text(row.id, `${path}.id`) as TripSeatStateId,
      tripId: reader.text(row.tripId, `${path}.tripId`) as TripId,
      seatId: reader.text(row.seatId, `${path}.seatId`) as SeatId,
      ...reader.timestamps(row, path),
      ...reader.optionalText(row, 'notes', path),
    }
    const status = reader.choice(row.status, ['OCCUPIED', 'RESERVED', 'BLOCKED'], `${path}.status`)
    if (status === 'BLOCKED') {
      if (Object.hasOwn(row, 'passengerId')) reader.issue(`${path}.passengerId`, 'Assento bloqueado não pode ter passageiro.')
      return { ...base, status }
    }
    return {
      ...base, status,
      ...(Object.hasOwn(row, 'passengerId') ? { passengerId: reader.text(row.passengerId, `${path}.passengerId`) as PassengerId } : {}),
    }
  })
  return { buses, busLayouts, trips, passengers, tripSeatStates }
}

function validateReferences(data: LocalDataSnapshot, reader: Reader) {
  for (const collection of BACKUP_COLLECTIONS) {
    const ids = new Set<string>()
    data[collection].forEach((row, index) => {
      if (ids.has(row.id)) reader.issue(`data.${collection}[${index}].id`, 'ID duplicado nesta coleção.')
      ids.add(row.id)
    })
  }
  const buses = new Map(data.buses.map((row) => [row.id, row]))
  const layouts = new Map(data.busLayouts.map((row) => [row.id, row]))
  const trips = new Map(data.trips.map((row) => [row.id, row]))
  const passengers = new Set(data.passengers.map((row) => row.id))
  const versions = new Set<string>()
  data.busLayouts.forEach((layout, index) => {
    const path = `data.busLayouts[${index}]`
    if (!buses.has(layout.busId)) reader.issue(`${path}.busId`, 'O ônibus referenciado não existe.')
    const key = JSON.stringify([layout.busId, layout.version])
    if (versions.has(key)) reader.issue(`${path}.version`, 'Versão de layout duplicada para este ônibus.')
    versions.add(key)
  })
  data.buses.forEach((bus, index) => {
    const layout = layouts.get(bus.activeLayoutId)
    if (!layout || layout.busId !== bus.id) reader.issue(`data.buses[${index}].activeLayoutId`, 'O layout ativo deve existir e pertencer a este ônibus.')
  })
  data.trips.forEach((trip, index) => {
    const path = `data.trips[${index}]`
    if (!buses.has(trip.busId)) reader.issue(`${path}.busId`, 'O ônibus referenciado não existe.')
    const layout = layouts.get(trip.layoutId)
    if (!layout || layout.busId !== trip.busId) reader.issue(`${path}.layoutId`, 'O layout deve existir e pertencer ao ônibus da viagem.')
  })
  const seatsByLayout = new Map(data.busLayouts.map((layout) => [layout.id, new Set(layout.elements.filter((e) => e.kind === 'seat').map((e) => String(e.id)))]))
  const seatKeys = new Set<string>()
  const passengerKeys = new Set<string>()
  data.tripSeatStates.forEach((state, index) => {
    const path = `data.tripSeatStates[${index}]`
    const trip = trips.get(state.tripId)
    if (!trip) reader.issue(`${path}.tripId`, 'A viagem referenciada não existe.')
    else if (!seatsByLayout.get(trip.layoutId)?.has(state.seatId)) reader.issue(`${path}.seatId`, 'O assento deve pertencer ao layout da viagem.')
    const key = JSON.stringify([state.tripId, state.seatId])
    if (seatKeys.has(key)) reader.issue(`${path}.seatId`, 'Estado de assento duplicado nesta viagem.')
    seatKeys.add(key)
    if (state.passengerId) {
      if (!passengers.has(state.passengerId)) reader.issue(`${path}.passengerId`, 'O passageiro referenciado não existe.')
      const passengerKey = JSON.stringify([state.tripId, state.passengerId])
      if (passengerKeys.has(passengerKey)) reader.issue(`${path}.passengerId`, 'O passageiro ocupa mais de um assento na mesma viagem.')
      passengerKeys.add(passengerKey)
    }
  })
}

export function validatePoltroyBackup(input: unknown): BackupValidationResult {
  const reader = new Reader()
  const document = reader.object(input, 'backup')
  if (document.app !== 'POLTROY') reader.issue('app', 'Este arquivo não é um backup do POLTROY.')
  if (document.backupVersion !== POLTROY_BACKUP_VERSION) reader.issue('backupVersion', 'Esta versão de backup ainda não é compatível com esta versão do POLTROY.')
  const exportedAt = reader.timestamp(document.exportedAt, 'exportedAt')
  if (exportedAt && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})$/.test(exportedAt)) reader.issue('exportedAt', 'Use um timestamp ISO com fuso horário.')
  const data = parseSnapshot(reader.object(document.data, 'data'), reader)
  validateReferences(data, reader)
  return reader.issues.length
    ? { success: false, issues: reader.issues }
    : { success: true, backup: { app: 'POLTROY', backupVersion: POLTROY_BACKUP_VERSION, exportedAt, data } }
}

export function parsePoltroyBackup(text: string): BackupValidationResult {
  let input: unknown
  try { input = JSON.parse(text) } catch {
    return { success: false, issues: [{ path: 'backup', message: 'O arquivo não contém JSON válido.' }] }
  }
  return validatePoltroyBackup(input)
}
