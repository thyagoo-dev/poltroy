import { useEffect, useId, useLayoutEffect, useRef } from 'react'

import type { Trip } from '@/features/trips/domain/trip'
import { Button } from '@/shared/ui/Button'

interface OperationalTripActionsSheetProps {
  open: boolean
  trip: Trip
  pendingAction: 'start' | 'complete' | null
  error: string | null
  onStart: () => void
  onComplete: () => void
  onExit: () => void
  onClose: () => void
}

export function OperationalTripActionsSheet({ open, trip, pendingAction, error, onStart, onComplete, onExit, onClose }: OperationalTripActionsSheetProps) {
  const titleId = useId()
  const descriptionId = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const isPending = pendingAction !== null

  useLayoutEffect(() => {
    function handleDialogKeyDown(event: KeyboardEvent) {
      const dialog = dialogRef.current
      if (!dialog?.open) return
      if (isPending && event.key === 'Escape') event.preventDefault()
      if (event.key !== 'Tab') return

      const buttons = [...dialog.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')]
      const first = buttons[0]
      const last = buttons.at(-1)
      if (!first) {
        event.preventDefault()
        dialog.focus()
      } else if (!dialog.contains(document.activeElement) || (!event.shiftKey && document.activeElement === last)) {
        event.preventDefault()
        first.focus()
      } else if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
        event.preventDefault()
        last?.focus()
      }
    }
    document.addEventListener('keydown', handleDialogKeyDown, true)
    return () => document.removeEventListener('keydown', handleDialogKeyDown, true)
  }, [isPending])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      dialog.scrollTop = 0
      dialog.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true })
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    <dialog ref={dialogRef} tabIndex={-1} aria-labelledby={titleId} aria-describedby={descriptionId} aria-busy={isPending}
      onCancel={(event) => { event.preventDefault(); if (!isPending) onClose() }}
      className="m-0 mt-auto top-[env(safe-area-inset-top)] w-full max-w-none max-h-[calc(100dvh-env(safe-area-inset-top))] overflow-y-auto [overflow-wrap:anywhere] rounded-t-sheet border border-border bg-surface p-0 text-foreground shadow-raised backdrop:bg-black/65 sm:m-auto sm:max-w-sm sm:rounded-card">
      <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <h2 id={titleId} className="text-lg font-semibold">Ações da viagem</h2>
        <p id={descriptionId} className="mt-1 text-sm leading-6 text-muted">{trip.origin} → {trip.destination}</p>
        {error && <p role="alert" className="mt-3 rounded-control border border-danger/20 bg-danger/10 px-3 py-2.5 text-sm text-danger">{error}</p>}
        <div className="mt-4 grid gap-2">
          {trip.status === 'PLANNED' && <Button disabled={isPending} onClick={onStart}>{pendingAction === 'start' ? 'Iniciando...' : 'Iniciar viagem'}</Button>}
          {trip.status === 'ACTIVE' && <Button disabled={isPending} onClick={onComplete}>Concluir viagem</Button>}
          <Button variant="secondary" disabled={isPending} onClick={onExit}>Sair do mapa</Button>
          <Button variant="ghost" disabled={isPending} onClick={onClose}>Fechar</Button>
        </div>
      </div>
    </dialog>
  )
}
