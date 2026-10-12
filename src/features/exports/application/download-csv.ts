import type { CsvFile } from './trip-history-csv'

export function downloadCsv(file: CsvFile): void {
  const blob = new Blob([file.content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  let anchor: HTMLAnchorElement | undefined
  try {
    anchor = document.createElement('a')
    anchor.href = url
    anchor.download = file.filename
    document.body.append(anchor)
    anchor.click()
  } finally {
    anchor?.remove()
    // Let the browser consume the download, including when click throws.
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}
