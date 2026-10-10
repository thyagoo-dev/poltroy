import type { PoltroyBackup } from '@/features/backup/domain/backup-document'
import type { BusId, BusLayoutId } from '@/features/buses/domain/ids'
import type { PassengerId } from '@/features/passengers/domain/ids'
import type { SeatId } from '@/features/seat-map/domain/ids'
import type { TripId, TripSeatStateId } from '@/features/trips/domain/ids'

export function backupFixture(prefix = 'a'): PoltroyBackup {
  const timestamp = '2026-10-10T12:00:00.000Z'
  const times = { createdAt: timestamp, updatedAt: timestamp }
  const busId = `${prefix}-bus` as BusId
  const layoutId = `${prefix}-layout` as BusLayoutId
  const passengerId = `${prefix}-passenger` as PassengerId
  const tripId = `${prefix}-trip` as TripId
  const seatId = `${prefix}-seat-01` as SeatId
  return {
    app: 'POLTROY', backupVersion: 1, exportedAt: timestamp,
    data: {
      buses: [{ id: busId, name: 'Ônibus de teste', activeLayoutId: layoutId, status: 'ACTIVE', ...times }],
      busLayouts: [{ id: layoutId, busId, name: 'Layout de teste', version: 1, ...times, elements: [
        { id: seatId, kind: 'seat', seatNumber: '01', seatType: 'STANDARD', position: { deck: 1, row: 1, column: 1 } },
        { id: `${prefix}-seat-02` as SeatId, kind: 'seat', seatNumber: '02', seatType: 'STANDARD', position: { deck: 1, row: 1, column: 2 } },
      ] }],
      trips: [{ id: tripId, busId, layoutId, origin: 'Origem de teste', destination: 'Destino de teste', departureAt: timestamp, status: 'PLANNED', ...times }],
      passengers: [{ id: passengerId, name: 'Passageiro de teste', phone: '00000000000', notes: 'Dados fictícios', ...times }],
      tripSeatStates: [{ id: `${prefix}-state` as TripSeatStateId, tripId, seatId, status: 'RESERVED', passengerId, ...times }],
    },
  }
}

export function emptyBackupFixture(): PoltroyBackup {
  return { ...backupFixture(), data: { buses: [], busLayouts: [], trips: [], passengers: [], tripSeatStates: [] } }
}
