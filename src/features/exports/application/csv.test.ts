import { describe, expect, it } from 'vitest'
import { escapeCsvCell, neutralizeSpreadsheetFormula, serializeCsv } from './csv'

describe('spreadsheet formula neutralization', () => {
  it.each(['=1+1', '+SUM(A1:A2)', '-1+2', '@SUM(1,2)', '\t=CMD()', '\r=CMD()', '   =CMD()', '\n@CMD()', '\u00a0\uFEFF=CMD()', ' \ttexto', '\rtexto', '\u0000=CMD()'])('prefixes %j without removing its original content', (value) => {
    expect(neutralizeSpreadsheetFormula(value)).toBe("'" + value)
    expect(escapeCsvCell(value)).toBe('"\'' + value.replaceAll('"', '""') + '"')
  })
  it.each(['João', ' Iguatu ', '01', 'linha 1\nlinha 2', "'=1+1", 'texto =SUM(1,2)', ''])('preserves ordinary text %j', (value) => {
    expect(neutralizeSpreadsheetFormula(value)).toBe(value)
  })
})

describe('CSV serialization', () => {
  it('quotes every cell, doubles quotes and preserves delimiter/newline inside a cell', () => {
    expect(serializeCsv([['João "Júnior"', 'Iguatu; Ceará', 'linha 1\nlinha 2']]))
      .toBe('\uFEFF"João ""Júnior""";"Iguatu; Ceará";"linha 1\nlinha 2"\r\n')
  })
  it('uses one UTF-8 BOM, semicolons and CRLF between records, including the last', () => {
    const csv = serializeCsv([['Cabeçalho', 'Ação'], ['São João', 2]])
    expect(csv).toBe('\uFEFF"Cabeçalho";"Ação"\r\n"São João";"2"\r\n')
    expect([...new TextEncoder().encode(csv).slice(0, 3)]).toEqual([239, 187, 191])
  })
  it('exports absent cells as empty, preserves zero, and neutralizes negative numeric values', () => {
    expect(serializeCsv([[null, undefined, '', 0, -2]])).toBe('\uFEFF"";"";"";"0";"\'-2"\r\n')
  })
})
