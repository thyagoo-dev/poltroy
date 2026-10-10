import {
  useEffect,
  useLayoutEffect,
  useRef,
  useId,
} from 'react'

import { Button } from '@/shared/ui/Button'

interface ConfirmDialogProps {
  open: boolean

  title: string
  description: string

  confirmLabel?: string
  cancelLabel?: string

  isPending?: boolean
  error?: string | null

  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isPending = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId()
  const descriptionId = useId()

  const dialogRef =
    useRef<HTMLDialogElement>(
      null,
    )

  useLayoutEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    function handleCancel(event: Event) {
      event.preventDefault()
      if (!isPending) onCancel()
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (dialog?.open && isPending && event.key === 'Escape') {
        event.preventDefault()
      }
    }
    dialog.addEventListener('cancel', handleCancel)
    document.addEventListener('keydown', handleKeyDown, true)
    return () => {
      dialog.removeEventListener('cancel', handleCancel)
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [isPending, onCancel])

  useEffect(() => {
    const dialog =
      dialogRef.current

    if (!dialog) {
      return
    }

    if (
      open &&
      !dialog.open
    ) {
      dialog.showModal()
      return
    }

    if (
      !open &&
      dialog.open
    ) {
      dialog.close()
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-busy={isPending}
      className="
        m-0 mt-auto
        top-[env(safe-area-inset-top)]
        w-full max-w-none max-h-[calc(100dvh-env(safe-area-inset-top))] overflow-y-auto
        [overflow-wrap:anywhere]
        rounded-t-sheet
        border border-border
        bg-surface
        p-0
        text-foreground
        shadow-raised
        backdrop:bg-black/65
        sm:m-auto
        sm:max-w-md
        sm:rounded-card
      "
    >
      <div className="p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:p-6 sm:pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <h2 id={titleId} className="text-lg font-semibold tracking-[-0.02em]">
          {title}
        </h2>

        <p id={descriptionId} className="mt-2 text-sm leading-6 text-muted">
          {description}
        </p>

        {error && <p role="alert" className="mt-4 rounded-control border border-danger/20 bg-danger/10 px-3 py-2.5 text-sm text-danger">{error}</p>}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={isPending}
          >
            {cancelLabel}
          </Button>

          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending
              ? 'Aguarde...'
              : confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  )
}
