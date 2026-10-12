export type CsvCell = string | number | null | undefined

export function neutralizeSpreadsheetFormula(value: string): string {
  // Keep the original text, including whitespace. Quotes alone do not prevent formulas.
  const leading = value.match(/^[\s\p{Cc}]*/u)?.[0] ?? ''
  const significant = value.slice(leading.length)
  return /^[=+\-@]/u.test(significant) || /\p{Cc}/u.test(leading)
    ? `'${value}` : value
}

export function escapeCsvCell(value: CsvCell): string {
  const safe = neutralizeSpreadsheetFormula(value == null ? '' : String(value))
  return `"${safe.replaceAll('"', '""')}"`
}

export function serializeCsv(rows: readonly (readonly CsvCell[])[]): string {
  return '\uFEFF' + rows.map((row) => row.map(escapeCsvCell).join(';')).join('\r\n') + '\r\n'
}
