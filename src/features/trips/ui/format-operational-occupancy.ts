import type { OperationalSeatSummary } from '@/features/trips/domain/operational-seat-summary'

export function formatOperationalOccupancy(summary: Pick<OperationalSeatSummary, 'occupied' | 'reserved' | 'blocked' | 'free'>): string {
  const parts = [
    summary.occupied > 0 ? `${summary.occupied} ${summary.occupied === 1 ? 'ocupado' : 'ocupados'}` : '',
    summary.reserved > 0 ? `${summary.reserved} ${summary.reserved === 1 ? 'reservado' : 'reservados'}` : '',
    summary.blocked > 0 ? `${summary.blocked} ${summary.blocked === 1 ? 'bloqueado' : 'bloqueados'}` : '',
    `${summary.free} ${summary.free === 1 ? 'livre' : 'livres'}`,
  ]
  return parts.filter(Boolean).join(' · ')
}
