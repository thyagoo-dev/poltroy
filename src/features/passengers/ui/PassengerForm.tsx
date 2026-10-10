import { IdCard, MessageSquare, Phone, User } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'

import { normalizePassengerFields, type PassengerInputFields } from '@/features/passengers/application/passenger-input'
import type { Passenger, PassengerDocumentType } from '@/features/passengers/domain/passenger'
import { countPassengerCharacters, PASSENGER_DISPLAY_NAME_MAX, resolvePassengerDisplayName } from '@/features/passengers/domain/passenger-display-name'
import { formatCpf, normalizeCpfNumber, PASSENGER_RG_MAX } from '@/features/passengers/domain/passenger-document'
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
  const [displayName, setDisplayName] = useState(passenger ? resolvePassengerDisplayName(passenger) : '')
  const [phone, setPhone] = useState(passenger?.phone ?? '')
  const [documentType, setDocumentType] = useState<PassengerDocumentType>(passenger?.documentType ?? 'CPF')
  const [documentNumber, setDocumentNumber] = useState(passenger?.documentNumber ?? '')
  const [notes, setNotes] = useState(passenger?.notes ?? '')
  const [error, setError] = useState<string | null>(null)
  const displayCount = countPassengerCharacters(displayName.trim())

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return
    setError(null)
    try {
      const values = normalizePassengerFields({ name, displayName, phone, documentType, documentNumber, notes })
      await onSubmit(values)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Não foi possível salvar o passageiro.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" aria-busy={isSubmitting}>
      <div>
        <label htmlFor={`${id}-name`} className="inline-flex items-center gap-2 text-sm font-semibold"><User aria-hidden="true" size={15} />Nome completo *</label>
        <Input id={`${id}-name`} className="mt-2" autoComplete="name" autoFocus required
          value={name} onChange={(event) => setName(event.target.value)} disabled={isSubmitting}
          aria-invalid={Boolean(error && !name.trim())} aria-describedby={error ? `${id}-error` : undefined} />
      </div>
      <div>
        <label htmlFor={`${id}-display-name`} className="text-sm font-semibold">Nome de exibição *</label>
        <Input id={`${id}-display-name`} className="mt-2" required value={displayName}
          onChange={(event) => setDisplayName(event.target.value)} disabled={isSubmitting}
          aria-invalid={displayCount > PASSENGER_DISPLAY_NAME_MAX || Boolean(error && !displayName.trim())}
          aria-describedby={`${id}-display-help${error ? ` ${id}-error` : ''}`} />
        <p id={`${id}-display-help`} className="mt-1 flex flex-wrap justify-between gap-2 text-xs text-muted">
          <span>Como aparecerá no mapa</span><span>{displayCount}/{PASSENGER_DISPLAY_NAME_MAX}</span>
        </p>
      </div>
      <div>
        <label htmlFor={`${id}-phone`} className="inline-flex items-center gap-2 text-sm font-semibold"><Phone aria-hidden="true" size={15} />Telefone</label>
        <Input id={`${id}-phone`} className="mt-2" type="tel" autoComplete="tel"
          value={phone} onChange={(event) => setPhone(event.target.value)} disabled={isSubmitting} />
      </div>
      <fieldset disabled={isSubmitting} className="min-w-0">
        <legend className="inline-flex items-center gap-2 text-sm font-semibold"><IdCard aria-hidden="true" size={15} />Identificação opcional</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {(['CPF', 'RG'] as const).map((value) => (
            <label key={value} className="inline-flex min-h-11 items-center gap-2 rounded-control border border-border bg-surface px-3.5 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:text-primary has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary">
              <input type="radio" name={`${id}-document-type`} value={value} checked={documentType === value}
                className="size-4 accent-primary" onChange={() => {
                  setDocumentType(value)
                  if (value === 'CPF') setDocumentNumber(normalizeCpfNumber(documentNumber).slice(0, 11))
                }} />{value}
            </label>
          ))}
        </div>
        <label htmlFor={`${id}-document-number`} className="mt-3 block text-sm font-semibold">Número do documento</label>
        <Input id={`${id}-document-number`} className="mt-2" autoComplete="off"
          inputMode={documentType === 'CPF' ? 'numeric' : 'text'}
          placeholder={documentType === 'CPF' ? '000.000.000-00' : `RG (até ${PASSENGER_RG_MAX} caracteres)`}
          value={documentType === 'CPF' ? formatCpf(documentNumber) : documentNumber}
          onChange={(event) => setDocumentNumber(documentType === 'CPF' ? normalizeCpfNumber(event.target.value).slice(0, 11) : event.target.value)}
          aria-describedby={`${id}-document-help${error ? ` ${id}-error` : ''}`} />
        <p id={`${id}-document-help`} className="mt-1 text-xs text-muted">Deixe o número vazio para não informar identificação.</p>
        {documentNumber && <Button variant="ghost" size="sm" className="mt-1" onClick={() => setDocumentNumber('')}>Remover identificação</Button>}
      </fieldset>
      <div>
        <label htmlFor={`${id}-notes`} className="inline-flex items-center gap-2 text-sm font-semibold"><MessageSquare aria-hidden="true" size={15} />Observações</label>
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
