import {
  useEffect,
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
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId()
  const descriptionId = useId()

  const dialogRef =
    useRef<HTMLDialogElement>(
      null,
    )

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
      onCancel={(event) => {
        event.preventDefault()

        if (!isPending) {
          onCancel()
        }
      }}
      className="
        m-0 mt-auto
        w-full max-w-none max-h-dvh
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
      <div className="p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:p-6">
        <h2 id={titleId} className="text-lg font-semibold tracking-[-0.02em]">
          {title}
        </h2>

        <p id={descriptionId} className="mt-2 text-sm leading-6 text-muted">
          {description}
        </p>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
