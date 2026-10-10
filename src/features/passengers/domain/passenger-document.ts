import type { PassengerDocumentType } from '@/features/passengers/domain/passenger'
import { countPassengerCharacters } from '@/features/passengers/domain/passenger-display-name'

export const PASSENGER_RG_MAX = 32

export function normalizeCpfNumber(value: string): string {
  return value.replace(/\D/g, '')
}

export function formatCpf(value: string): string {
  const digits = normalizeCpfNumber(value).slice(0, 11)
  return digits.replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3}\.\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3}\.\d{3}\.\d{3})(\d)/, '$1-$2')
}

export function normalizeDocumentSearchTerm(value: string): string {
  return value.trim().toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu, '')
}

export function normalizePassengerDocument(documentType?: PassengerDocumentType, documentNumber?: string): {
  documentType: PassengerDocumentType | undefined
  documentNumber: string | undefined
} {
  if (documentType !== undefined && documentType !== 'CPF' && documentType !== 'RG') {
    throw new Error('Tipo de documento deve ser CPF ou RG.')
  }
  const number = documentNumber?.trim()
  // A selected UI type with an empty number means no identification.
  if (!number) return { documentType: undefined, documentNumber: undefined }
  if (!documentType) throw new Error('Selecione o tipo de documento.')
  const normalized = documentType === 'CPF' ? normalizeCpfNumber(number) : number
  if (documentType === 'CPF' && normalized.length !== 11) throw new Error('CPF deve conter 11 dígitos.')
  if (documentType === 'RG' && countPassengerCharacters(normalized) > PASSENGER_RG_MAX) {
    throw new Error(`RG deve conter no máximo ${PASSENGER_RG_MAX} caracteres.`)
  }
  return { documentType, documentNumber: normalized }
}
