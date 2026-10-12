import type { TripHistorySummary } from '@/features/trips/application/trip-history'
import { formatHistoryEnd } from '@/features/trips/application/format-history-end'
import { resolveSeatStatus, canSeatStatusHavePassenger } from '@/features/trips/domain/trip-seat-state'
import { formatDateTime } from '@/shared/lib/date-time'
import { serializeCsv } from './csv'

export interface CsvFile { filename: string; content: string }

const historyHeaders = ['ID da viagem', 'Status', 'Origem', 'Destino', 'Saída planejada', 'Início real', 'Encerramento', 'Ônibus', 'Layout', 'Situação do layout', 'Total de poltronas', 'Livres', 'Ocupadas', 'Reservadas', 'Bloqueadas', 'Passageiros associados'] as const
const manifestHeaders = ['ID da viagem', 'Status da viagem', 'Origem', 'Destino', 'Saída planejada', 'Encerramento', 'Ônibus', 'Layout', 'Poltrona', 'Status da poltrona', 'Passageiro', 'Nome de exibição'] as const
const tripLabels = { COMPLETED: 'Concluída', CANCELLED: 'Cancelada' } as const
const layoutLabels = { available: 'Disponível', missing: 'Não encontrado', inconsistent: 'Incompatível com o ônibus' } as const
const seatLabels = { FREE: 'Livre', OCCUPIED: 'Ocupada', RESERVED: 'Reservada', BLOCKED: 'Bloqueada' } as const

function localDate(clock: Date): string {
  if (!Number.isFinite(clock.getTime())) throw new Error('Data de exportação inválida.')
  return `${String(clock.getFullYear()).padStart(4, '0')}-${String(clock.getMonth() + 1).padStart(2, '0')}-${String(clock.getDate()).padStart(2, '0')}`
}

function layoutName(details: TripHistorySummary): string {
  return details.layout?.name ?? (details.layoutStatus === 'inconsistent' ? 'Layout incompatível' : 'Layout não encontrado')
}

function safeTripId(id: string): string {
  // Bounded ASCII identifier: no separators, controls, path traversal or personal names.
  return id.replace(/[^a-zA-Z0-9_-]/gu, '_').slice(0, 100) || 'viagem'
}

export function createTripHistoryCsv(items: readonly TripHistorySummary[], clock: Date): CsvFile {
  return {
    filename: `poltroy-historico-${localDate(clock)}.csv`,
    content: serializeCsv([historyHeaders, ...items.map(({ trip, bus, layout, layoutStatus, seatSummary, assignedPassengerCount }) => [
      trip.id, tripLabels[trip.status], trip.origin, trip.destination, formatDateTime(trip.departureAt),
      trip.startedAt ? formatDateTime(trip.startedAt) : '', formatHistoryEnd(trip), bus?.name ?? 'Ônibus não encontrado',
      layout?.name ?? (layoutStatus === 'inconsistent' ? 'Layout incompatível' : 'Layout não encontrado'), layoutLabels[layoutStatus],
      ...(layoutStatus === 'available' ? [seatSummary.totalSeats, seatSummary.free, seatSummary.occupied, seatSummary.reserved, seatSummary.blocked, assignedPassengerCount] : ['', '', '', '', '', '']),
    ])]),
  }
}

export function createTripManifestCsv(details: TripHistorySummary, clock: Date): CsvFile {
  const { trip, bus } = details
  return {
    filename: `poltroy-manifesto-${localDate(clock)}-${safeTripId(trip.id)}.csv`,
    content: serializeCsv([manifestHeaders, ...details.seats.map(({ seat, state, passenger }) => {
      const status = resolveSeatStatus(state)
      const associated = canSeatStatusHavePassenger(status)
      return [trip.id, tripLabels[trip.status], trip.origin, trip.destination, formatDateTime(trip.departureAt),
        formatHistoryEnd(trip), bus?.name ?? 'Ônibus não encontrado', layoutName(details), seat?.seatNumber ?? 'Indisponível',
        seatLabels[status], associated ? passenger?.name ?? (state?.passengerId ? 'Passageiro não encontrado' : '') : '',
        associated ? passenger?.displayName ?? '' : '']
    })]),
  }
}
