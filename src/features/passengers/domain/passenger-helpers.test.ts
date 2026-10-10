import { describe, expect, it } from 'vitest'

import type { Passenger } from '@/features/passengers/domain/passenger'
import { countPassengerCharacters, resolvePassengerDisplayName } from '@/features/passengers/domain/passenger-display-name'
import { formatCpf, normalizeCpfNumber, normalizeDocumentSearchTerm, normalizePassengerDocument } from '@/features/passengers/domain/passenger-document'
import { matchesPassengerSearch } from '@/features/passengers/domain/passenger-search'

describe('display name compatibility', () => {
  it('usa o displayName com trim, sem mudar capitalização ou objeto', () => {
    const passenger = Object.freeze({ name: 'Cicero Thyago de Oliveira Fernandes', displayName: '  Thyago  ' })
    expect(resolvePassengerDisplayName(passenger)).toBe('Thyago')
    expect(passenger.displayName).toBe('  Thyago  ')
  })
  it.each([undefined, '', '   '])('reduz nome legado pela ordem original, sem inferir apelido: %j', (displayName) => {
    const passenger = Object.freeze({ name: '  Cicero Thyago de Oliveira Fernandes  ', displayName })
    expect(resolvePassengerDisplayName(passenger)).toBe('Cicero Thyago de')
  })
  it('conta e corta Unicode por pontos de código, sem cortar surrogate pairs', () => {
    const name = '😀'.repeat(17)
    expect(countPassengerCharacters(name)).toBe(17)
    expect(resolvePassengerDisplayName({ name })).toBe('😀'.repeat(16))
  })
  it('preserva nomes curtos', () => expect(resolvePassengerDisplayName({ name: '  Ana  ' })).toBe('Ana'))
})

describe('document helpers', () => {
  it.each([
    ['1', '1'], ['12', '12'], ['123', '123'], ['1234', '123.4'],
    ['123456', '123.456'], ['1234567', '123.456.7'], ['123456789', '123.456.789'],
    ['1234567890', '123.456.789-0'], ['12345678901', '123.456.789-01'],
    ['1234567890123', '123.456.789-01'], ['123.456.789-01', '123.456.789-01'],
  ])('formata CPF parcial/completo %s', (value, expected) => expect(formatCpf(value)).toBe(expected))
  it('canonicaliza sem esconder tamanho inválido na aplicação', () => {
    expect(normalizeCpfNumber('123.456.789-01')).toBe('12345678901')
    expect(normalizeCpfNumber('123456789012')).toHaveLength(12)
  })
  it.each(['2002002-5', 'MG-12.345.678', '12A34567', 'Ab 12.3-x'])('preserva RG com letras e pontuação %s', (value) => {
    expect(normalizePassengerDocument('RG', `  ${value}  `)).toEqual({ documentType: 'RG', documentNumber: value })
  })
  it('normaliza documentos para busca sem formatação', () => {
    expect(normalizeDocumentSearchTerm('123.456.789-01')).toBe('12345678901')
    expect(normalizeDocumentSearchTerm(' MG-12.345.678 ')).toBe('mg12345678')
    expect(normalizeDocumentSearchTerm('---')).toBe('')
  })
})

describe('passenger search', () => {
  const passenger = { name: 'Cicero de Oliveira', displayName: 'Thyago', phone: '8599999', documentType: 'CPF', documentNumber: '12345678901' } as Passenger
  it.each(['CICERO', 'thyago', '99999', '12345678901', '123.456.789-01', '  '])('encontra por %j', (query) => {
    expect(matchesPassengerSearch(passenger, query)).toBe(true)
  })
  it('busca RG ignorando pontuação e case', () => {
    expect(matchesPassengerSearch({ ...passenger, documentType: 'RG', documentNumber: 'MG-12.345.678' }, 'mg12345678')).toBe(true)
  })
  it('não transforma pontuação vazia em matching de documento', () => {
    expect(matchesPassengerSearch(passenger, '---')).toBe(false)
    expect(matchesPassengerSearch(passenger, 'ausente')).toBe(false)
  })
})
