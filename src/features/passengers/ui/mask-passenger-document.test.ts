import { describe, expect, it } from 'vitest'
import { maskPassengerDocument } from '@/features/passengers/ui/mask-passenger-document'

describe('list document privacy', () => {
  it.each(['12345678901', ' 123.456.789-01 '])('masks CPF %s', (value) => {
    expect(maskPassengerDocument('CPF', value)).toBe('•••.•••.•••-01')
  })
  it('trims RG and preserves only its last four characters', () => {
    expect(maskPassengerDocument('RG', ' MG-12.345.678 ')).toBe('•••••••••.678')
  })
  it.each([['A', '•'], ['AB', '•B'], ['ABC', '•BC'], ['ABCD', '••CD'], ['ABCDE', '•BCDE']])('never exposes the complete short RG %s', (value, expected) => {
    expect(maskPassengerDocument('RG', value)).toBe(expected)
    expect(maskPassengerDocument('RG', value)).not.toBe(value)
  })
  it('handles Unicode RG characters without splitting them', () => {
    expect(maskPassengerDocument('RG', '😀AB')).toBe('•AB')
  })
  it.each(['1', '12', '123'])('also masks incomplete legacy CPF %s', (value) => {
    expect(maskPassengerDocument('CPF', value)).not.toBe(value)
  })
  it.each([undefined, '', '  '])('omits absent documents %s', (value) => {
    expect(maskPassengerDocument('RG', value)).toBeUndefined()
  })
  it('omits a number without a type and a CPF without digits', () => {
    expect(maskPassengerDocument(undefined, 'ABC')).toBeUndefined()
    expect(maskPassengerDocument('CPF', ' . - ')).toBeUndefined()
  })
})
