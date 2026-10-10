import { Check } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'

import type { OperationalSeatFilter } from '@/features/trips/domain/operational-seat-filter'
import { operationalFilterOptions } from '@/features/trips/ui/operational-filter-options'
import { Button } from '@/shared/ui/Button'

interface OperationalFilterSheetProps {
  open: boolean
  filter: OperationalSeatFilter
  onSelect: (filter: OperationalSeatFilter) => void
  onClose: () => void
}

export function OperationalFilterSheet({ open, filter, onSelect, onClose }: OperationalFilterSheetProps) {
  const titleId = useId()
  const descriptionId = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      dialog.scrollTop = 0
      dialog.querySelector<HTMLButtonElement>('[aria-pressed="true"]')?.focus()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    <dialog ref={dialogRef} aria-labelledby={titleId} aria-describedby={descriptionId}
      onCancel={(event) => { event.preventDefault(); onClose() }}
      className="m-0 mt-auto top-[env(safe-area-inset-top)] w-full max-w-none max-h-[calc(100dvh-env(safe-area-inset-top))] overflow-y-auto rounded-t-sheet border border-border bg-surface p-0 text-foreground shadow-raised backdrop:bg-black/65 sm:m-auto sm:max-w-sm sm:rounded-card">
      <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <h2 id={titleId} className="text-lg font-semibold">Filtros</h2>
        <p id={descriptionId} className="mt-1 text-xs leading-5 text-muted">Sem passageiro: assentos ocupados ou reservados sem associação.</p>
        <div role="group" aria-label="Filtrar assentos" className="mt-3 grid gap-1">
          {operationalFilterOptions.map(([value, label]) => (
            <Button key={value} variant={filter === value ? 'primary' : 'ghost'}
              className="justify-between" aria-pressed={filter === value}
              onClick={() => { onSelect(value); onClose() }}>
              {label}
              {filter === value && <Check aria-hidden="true" size={16} />}
            </Button>
          ))}
        </div>
        <Button variant="ghost" fullWidth className="mt-2" onClick={onClose}>Fechar</Button>
      </div>
    </dialog>
  )
}
