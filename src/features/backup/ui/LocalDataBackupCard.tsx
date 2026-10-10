import { Download, Upload } from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'

import { exportBackupAction, restoreBackupAction } from '@/app/services/backup-actions'
import { backupFilename } from '@/features/backup/application/create-backup'
import { parsePoltroyBackup } from '@/features/backup/application/validate-backup'
import type { BackupIssue, PoltroyBackup } from '@/features/backup/domain/backup-document'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'

const MAX_BACKUP_FILE_BYTES = 50 * 1024 * 1024
const collectionLabels = {
  buses: 'Ônibus',
  busLayouts: 'Layouts',
  trips: 'Viagens',
  passengers: 'Passageiros',
  tripSeatStates: 'Estados de assentos',
} as const

export function LocalDataBackupCard() {
  const fileInput = useRef<HTMLInputElement>(null)
  const previewTitle = useRef<HTMLHeadingElement>(null)
  const operationInFlight = useRef(false)
  const [busy, setBusy] = useState<'export' | 'read' | 'restore' | null>(null)
  const [preview, setPreview] = useState<PoltroyBackup | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [issues, setIssues] = useState<readonly BackupIssue[]>([])
  const [restoreError, setRestoreError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')

  async function handleExport() {
    if (operationInFlight.current) return
    operationInFlight.current = true
    setBusy('export')
    setIssues([])
    setFeedback('')
    let objectUrl: string | undefined
    try {
      const backup = await exportBackupAction()
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
      objectUrl = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = objectUrl
      anchor.download = backupFilename(backup.exportedAt)
      document.body.append(anchor)
      anchor.click()
      anchor.remove()
      setFeedback('Backup exportado.')
    } catch {
      setIssues([{ path: 'exportação', message: 'Não foi possível exportar os dados locais. Tente novamente.' }])
    } finally {
      // Allow the browser to consume the download before releasing its URL.
      if (objectUrl) {
        const url = objectUrl
        window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      }
      operationInFlight.current = false
      setBusy(null)
    }
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const file = input.files?.[0]
    input.value = ''
    if (!file || operationInFlight.current) return
    operationInFlight.current = true
    setBusy('read')
    setPreview(null)
    setIssues([])
    setFeedback('')
    setRestoreError(null)
    try {
      if (file.size > MAX_BACKUP_FILE_BYTES) {
        setIssues([{ path: 'arquivo', message: 'O backup excede o limite de 50 MiB.' }])
        return
      }
      const result = parsePoltroyBackup(await file.text())
      if (!result.success) setIssues(result.issues)
      else {
        setPreview(result.backup)
        window.requestAnimationFrame(() => previewTitle.current?.focus())
      }
    } catch {
      setIssues([{ path: 'arquivo', message: 'Não foi possível ler o arquivo selecionado.' }])
    } finally {
      operationInFlight.current = false
      setBusy(null)
    }
  }

  async function handleRestore() {
    if (!preview || operationInFlight.current) return
    operationInFlight.current = true
    setBusy('restore')
    setRestoreError(null)
    try {
      await restoreBackupAction(preview)
      setFeedback('Backup restaurado. O POLTROY será recarregado para aplicar os dados.')
      window.location.reload()
    } catch {
      setRestoreError('Não foi possível concluir a restauração. Tente novamente.')
      operationInFlight.current = false
      setBusy(null)
    }
  }

  return (
    <Card className="mt-6" padding="md">
      <section aria-labelledby="local-backup-title" aria-busy={busy !== null}>
        <h3 id="local-backup-title" className="font-semibold">Backup e restauração</h3>
        <p className="mt-2 text-sm leading-6 text-muted">Mantenha uma cópia dos dados armazenados neste dispositivo. Exportação e restauração funcionam também offline.</p>
        <p className="mt-3 text-sm leading-6 text-muted">O backup pode conter nomes, telefones, observações e dados operacionais. Guarde o arquivo em local seguro.</p>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button variant="secondary" disabled={busy !== null} onClick={() => void handleExport()}>
            <Download aria-hidden="true" size={17} />
            {busy === 'export' ? 'Exportando...' : 'Exportar backup'}
          </Button>
          <Button id="select-backup-file" variant="secondary" disabled={busy !== null} onClick={() => fileInput.current?.click()}>
            <Upload aria-hidden="true" size={17} />
            {busy === 'read' ? 'Validando...' : 'Restaurar backup'}
          </Button>
          <input ref={fileInput} type="file" accept=".json,application/json" aria-label="Selecionar arquivo de backup" className="hidden" onChange={(event) => void handleFile(event)} />
        </div>

        <div role="status" aria-atomic="true" className="mt-3 text-sm text-primary">{feedback}</div>
        {issues.length > 0 && <div role="alert" className="mt-4 rounded-control border border-danger/20 bg-danger/10 p-3 text-sm">
          <p className="font-semibold">Não foi possível usar este backup.</p>
          <ul className="mt-2 list-inside list-disc space-y-2 break-words [overflow-wrap:anywhere]">
            {issues.slice(0, 5).map((issue, index) => <li key={`${issue.path}-${index}`}><span className="font-medium">{issue.path}:</span> {issue.message}</li>)}
          </ul>
          {issues.length > 5 && <p className="mt-2">Há outros erros no arquivo. Revise o backup antes de tentar novamente.</p>}
        </div>}

        {preview && <section aria-labelledby="backup-preview-title" className="mt-4 max-h-[calc(100dvh-var(--poltroy-shell-header-height)-var(--poltroy-mobile-nav-clearance)-env(safe-area-inset-top)-env(safe-area-inset-bottom))] overflow-y-auto rounded-control border border-border bg-surface-soft p-4 lg:max-h-[calc(100dvh-var(--poltroy-shell-header-height)-env(safe-area-inset-top)-env(safe-area-inset-bottom))]">
          <h4 ref={previewTitle} tabIndex={-1} id="backup-preview-title" className="font-semibold focus-visible:outline-2 focus-visible:outline-primary">Backup válido</h4>
          <p className="mt-2 text-sm text-muted">Exportado em: <time dateTime={preview.exportedAt}>{new Date(preview.exportedAt).toLocaleString('pt-BR')}</time></p>
          <dl className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            {Object.entries(collectionLabels).map(([key, label]) => <div key={key} className="flex justify-between gap-3">
              <dt className="text-muted">{label}</dt>
              <dd className="font-semibold">{preview.data[key as keyof typeof collectionLabels].length}</dd>
            </div>)}
          </dl>
          <p className="mt-4 text-sm leading-6 text-muted">A restauração substitui todos os dados locais atuais. Nenhuma alteração foi feita ainda.</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" disabled={busy !== null} onClick={() => { setPreview(null); setFeedback('Prévia cancelada. Os dados locais não foram alterados.'); document.getElementById('select-backup-file')?.focus() }}>Cancelar</Button>
            <Button disabled={busy !== null} onClick={() => { setRestoreError(null); setConfirmOpen(true) }}>Restaurar este backup</Button>
          </div>
        </section>}
      </section>
      <ConfirmDialog
        open={confirmOpen}
        title="Substituir dados locais?"
        description="Todos os dados atuais do POLTROY neste dispositivo serão substituídos pelos dados deste backup. Esta ação não pode ser desfeita, a menos que você tenha outro backup."
        confirmLabel="Substituir e restaurar"
        cancelLabel="Voltar"
        isPending={busy === 'restore'}
        error={restoreError}
        onConfirm={() => void handleRestore()}
        onCancel={() => { setConfirmOpen(false); setRestoreError(null) }}
      />
    </Card>
  )
}
