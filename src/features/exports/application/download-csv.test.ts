import { afterEach, describe, expect, it, vi } from 'vitest'
import { downloadCsv } from './download-csv'

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals() })

function browser(clickError = false) {
  const click = vi.fn(() => { if (clickError) throw new Error('Download unavailable') })
  const anchor = { href: '', download: '', click, remove: vi.fn() }
  const append = vi.fn()
  const createObjectURL = vi.fn((blob: Blob) => { expect(blob).toBeInstanceOf(Blob); return 'blob:qa-csv' })
  const revokeObjectURL = vi.fn()
  vi.stubGlobal('document', { createElement: vi.fn(() => anchor), body: { append } })
  vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })
  vi.stubGlobal('window', { setTimeout })
  return { anchor, append, createObjectURL, revokeObjectURL }
}

describe('browser CSV download lifecycle', () => {
  it('downloads a UTF-8 CSV Blob and delays object URL cleanup', async () => {
    vi.useFakeTimers()
    const api = browser()
    downloadCsv({ filename: 'report.csv', content: '\uFEFF"Ação"\r\n' })
    const blob = api.createObjectURL.mock.calls[0][0]
    expect(blob.type).toBe('text/csv;charset=utf-8')
    expect([...new Uint8Array(await blob.arrayBuffer()).slice(0, 3)]).toEqual([239, 187, 191])
    expect(api.anchor.download).toBe('report.csv')
    expect(api.anchor.href).toBe('blob:qa-csv')
    expect(api.append).toHaveBeenCalledWith(api.anchor)
    expect(api.anchor.click).toHaveBeenCalledOnce()
    expect(api.anchor.remove).toHaveBeenCalledOnce()
    expect(api.revokeObjectURL).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1000)
    expect(api.revokeObjectURL).toHaveBeenCalledWith('blob:qa-csv')
  })
  it('removes the anchor and revokes the object URL even when click fails', () => {
    vi.useFakeTimers()
    const api = browser(true)
    expect(() => downloadCsv({ filename: 'report.csv', content: '' })).toThrow('Download unavailable')
    expect(api.anchor.remove).toHaveBeenCalledOnce()
    vi.advanceTimersByTime(1000)
    expect(api.revokeObjectURL).toHaveBeenCalledOnce()
  })
})
