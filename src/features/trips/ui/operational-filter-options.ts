import type { OperationalSeatFilter } from '@/features/trips/domain/operational-seat-filter'

export const operationalFilterOptions: readonly [OperationalSeatFilter, string][] = [
  ['ALL', 'Todos'],
  ['FREE', 'Livre'],
  ['OCCUPIED', 'Ocupado'],
  ['RESERVED', 'Reservado'],
  ['BLOCKED', 'Bloqueado'],
  ['WITHOUT_PASSENGER', 'Sem passageiro'],
]
