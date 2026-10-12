import { Download } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { CsvFile } from '@/features/exports/application/trip-history-csv'
import { downloadCsv } from '@/features/exports/application/download-csv'
import { Button } from '@/shared/ui/Button'

interface CsvExportButtonProps {
  label: string
  successMessage: string
  disabled?: boolean
  createFile: (clock: Date) => CsvFile
}

export function CsvExportButton({ label, successMessage, disabled, createFile }: CsvExportButtonProps) {
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null)
  const locked = useRef(false)
  const releaseTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(releaseTimer.current), [])

  function handleExport() {
    if (disabled || locked.current) return
    locked.current = true
    try {
      downloadCsv(createFile(new Date()))
      setFeedback('success')
    } catch {
      setFeedback('error')
    } finally {
      releaseTimer.current = window.setTimeout(() => { locked.current = false }, 500)
    }
  }

  return <div className="mt-4 min-w-0">
    <Button variant="secondary" className="w-full sm:w-auto" disabled={disabled} onClick={handleExport}>
      <Download aria-hidden="true" size={17} className="shrink-0" />{label}
    </Button>
    <p role="status" aria-atomic="true" className="mt-2 text-sm text-primary">{feedback === 'success' ? successMessage : ''}</p>
    {feedback === 'error' && <p role="alert" className="mt-2 text-sm text-danger">Não foi possível exportar o CSV.</p>}
  </div>
}
