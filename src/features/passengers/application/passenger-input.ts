import type { PassengerDocumentType } from '@/features/passengers/domain/passenger'
import { countPassengerCharacters, PASSENGER_DISPLAY_NAME_MAX } from '@/features/passengers/domain/passenger-display-name'
import { normalizePassengerDocument } from '@/features/passengers/domain/passenger-document'

export interface PassengerInputFields {
  name: string
  displayName: string
  phone?: string
  documentType?: PassengerDocumentType
  documentNumber?: string
  notes?: string
}

export function normalizePassengerFields(input: PassengerInputFields): PassengerInputFields {
  const name = input.name.trim()
  if (!name) throw new Error('Nome é obrigatório.')
  const displayName = input.displayName?.trim()
  if (!displayName) throw new Error('Nome de exibição é obrigatório.')
  if (countPassengerCharacters(displayName) > PASSENGER_DISPLAY_NAME_MAX) {
    throw new Error(`Nome de exibição deve conter no máximo ${PASSENGER_DISPLAY_NAME_MAX} caracteres.`)
  }

  return {
    name,
    displayName,
    phone: input.phone?.trim() || undefined,
    ...normalizePassengerDocument(input.documentType, input.documentNumber),
    notes: input.notes?.trim() || undefined,
  }
}
