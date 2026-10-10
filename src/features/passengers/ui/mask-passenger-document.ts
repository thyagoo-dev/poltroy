import type { PassengerDocumentType } from '@/features/passengers/domain/passenger'
import { normalizeCpfNumber } from '@/features/passengers/domain/passenger-document'

/** List presentation only. Always hide at least one character, even in legacy data. */
export function maskPassengerDocument(type?: PassengerDocumentType, value?: string): string | undefined {
  if (!type || !value?.trim()) return undefined
  const normalized = type === 'CPF' ? normalizeCpfNumber(value) : value.trim()
  const characters = Array.from(normalized)
  if (!characters.length) return undefined
  if (type === 'CPF' && characters.length === 11) return `•••.•••.•••-${normalized.slice(-2)}`
  const visible = Math.min(characters.length - 1, type === 'RG' && characters.length > 4 ? 4 : 2)
  return '•'.repeat(characters.length - visible) + characters.slice(characters.length - visible).join('')
}
