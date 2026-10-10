import { useId, useState, type FormEvent } from 'react'

import type { PassengerInputFields } from '@/features/passengers/application/passenger-input'
import type { Passenger } from '@/features/passengers/domain/passenger'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'

interface PassengerFormProps {
  passenger?: Passenger
  isSubmitting: boolean
  onSubmit: (values: PassengerInputFields) => Promise<void>
  onCancel: () => void
}

export function PassengerForm({ passenger, isSubmitting, onSubmit, onCancel }: PassengerFormProps) {
  const id = useId()
  const [name, setName] = useState(passenger?.name ?? '')
  const [phone, setPhone] = useState(passenger?.phone ?? '')
  const [notes, setNotes] = useState(passenger?.notes ?? '')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return
    setError(null)
    if (!name.trim()) {
      setError('Nome é obrigatório.')
      return
    }
    try {
      await onSubmit({ name, phone, notes })
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Não foi possível salvar o passageiro.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" aria-busy={isSubmitting}>
      <div>
        <label htmlFor={`${id}-name`} className="text-sm font-semibold">Nome *</label>
        <Input id={`${id}-name`} className="mt-2" autoComplete="name" autoFocus required
          value={name} onChange={(event) => setName(event.target.value)} disabled={isSubmitting}
          aria-invalid={Boolean(error && !name.trim())} aria-describedby={error ? `${id}-error` : undefined} />
      </div>
      <div>
        <label htmlFor={`${id}-phone`} className="text-sm font-semibold">Telefone</label>
        <Input id={`${id}-phone`} className="mt-2" type="tel" autoComplete="tel"
          value={phone} onChange={(event) => setPhone(event.target.value)} disabled={isSubmitting} />
      </div>
      <div>
        <label htmlFor={`${id}-notes`} className="text-sm font-semibold">Observações</label>
        <textarea id={`${id}-notes`} rows={3} disabled={isSubmitting}
          className="mt-2 min-h-24 w-full resize-y rounded-control border border-border bg-surface-raised px-3.5 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary disabled:bg-surface-soft disabled:text-muted"
          value={notes} onChange={(event) => setNotes(event.target.value)} />
      </div>
      {error && <p id={`${id}-error`} role="alert" className="rounded-control border border-danger/20 bg-danger/10 px-3 py-2.5 text-sm text-danger">{error}</p>}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
        <Button variant="ghost" disabled={isSubmitting} onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : passenger ? 'Salvar alterações' : 'Criar passageiro'}
        </Button>
      </div>
    </form>
  )
}
