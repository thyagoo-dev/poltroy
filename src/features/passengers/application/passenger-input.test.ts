import { describe, expect, it } from 'vitest'

import { normalizePassengerFields, type PassengerInputFields } from '@/features/passengers/application/passenger-input'

const base: PassengerInputFields = { name: '  Cicero Thyago  ', displayName: '  Thyago  ', phone: '  123  ', notes: '  Teste  ' }

describe('Passenger v2 normalization', () => {
  it('normaliza todos os campos e representa ausência com undefined explícito', () => {
    expect(normalizePassengerFields(base)).toEqual({ name: 'Cicero Thyago', displayName: 'Thyago', phone: '123', notes: 'Teste', documentType: undefined, documentNumber: undefined })
  })
  it.each(['', '   '])('exige nome %j', (name) => expect(() => normalizePassengerFields({ ...base, name })).toThrow(/nome é obrigatório/i))
  it.each(['', '   ', undefined])('exige nome de exibição %j', (displayName) => {
    expect(() => normalizePassengerFields({ ...base, displayName: displayName as string })).toThrow(/exibição é obrigatório/i)
  })
  it.each(['1234567890123456', '😀'.repeat(16)])('aceita 16 pontos de código', (displayName) => {
    expect(normalizePassengerFields({ ...base, displayName }).displayName).toBe(displayName)
  })
  it.each(['12345678901234567', '😀'.repeat(17)])('rejeita 17 pontos de código', (displayName) => {
    expect(() => normalizePassengerFields({ ...base, displayName })).toThrow(/16 caracteres/i)
  })
  it('limpa phone/notes opcionais vazios', () => {
    expect(normalizePassengerFields({ ...base, phone: ' ', notes: ' ' })).toMatchObject({ phone: undefined, notes: undefined })
  })
  it('CPF formatado vira canônico sem validar dígitos verificadores', () => {
    expect(normalizePassengerFields({ ...base, documentType: 'CPF', documentNumber: '123.456.789-01' })).toMatchObject({ documentType: 'CPF', documentNumber: '12345678901' })
  })
  it.each(['123', '123456789012', 'abc'])('rejeita CPF com tamanho incorreto', (documentNumber) => {
    expect(() => normalizePassengerFields({ ...base, documentType: 'CPF', documentNumber })).toThrow(/11 dígitos/i)
  })
  it('não persiste tipo quando número está vazio; limpa os dois campos', () => {
    expect(normalizePassengerFields({ ...base, documentType: 'CPF', documentNumber: ' ' })).toMatchObject({ documentType: undefined, documentNumber: undefined })
  })
  it('rejeita número sem tipo', () => expect(() => normalizePassengerFields({ ...base, documentNumber: '123' })).toThrow(/tipo/i))
  it('rejeita tipo desconhecido mesmo sem número', () => {
    expect(() => normalizePassengerFields({ ...base, documentType: 'CNH' as never })).toThrow(/CPF ou RG/i)
  })
  it('permite 32 caracteres de RG e rejeita 33', () => {
    expect(normalizePassengerFields({ ...base, documentType: 'RG', documentNumber: 'A'.repeat(32) }).documentNumber).toHaveLength(32)
    expect(() => normalizePassengerFields({ ...base, documentType: 'RG', documentNumber: 'A'.repeat(33) })).toThrow(/32 caracteres/i)
  })
})
