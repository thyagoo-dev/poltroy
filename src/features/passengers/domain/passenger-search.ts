import type { Passenger } from '@/features/passengers/domain/passenger'
import { resolvePassengerDisplayName } from '@/features/passengers/domain/passenger-display-name'
import { normalizeDocumentSearchTerm } from '@/features/passengers/domain/passenger-document'

export function matchesPassengerSearch(passenger: Passenger, query: string): boolean {
  const term = query.trim().toLocaleLowerCase()
  if (!term) return true
  if ([passenger.name, resolvePassengerDisplayName(passenger), passenger.phone]
    .some((value) => value?.toLocaleLowerCase().includes(term))) return true
  const documentTerm = normalizeDocumentSearchTerm(query)
  return Boolean(documentTerm && passenger.documentNumber
    && normalizeDocumentSearchTerm(passenger.documentNumber).includes(documentTerm))
}
