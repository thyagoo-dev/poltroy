import { Plus, UsersRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { createPassengerAction, listPassengersAction, updatePassengerAction } from '@/app/services/passenger-actions'
import type { PassengerInputFields } from '@/features/passengers/application/passenger-input'
import type { Passenger } from '@/features/passengers/domain/passenger'
import { PassengerForm } from '@/features/passengers/ui/PassengerForm'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'

export function PassengersPage() {
  const [passengers, setPassengers] = useState<readonly Passenger[]>([])
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formState, setFormState] = useState<{ passenger?: Passenger } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const formHeadingRef = useRef<HTMLHeadingElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    let cancelled = false
    void listPassengersAction().then((result) => {
      if (!cancelled) setPassengers(result)
    }).catch(() => {
      if (!cancelled) setError('Não foi possível carregar os passageiros.')
    }).finally(() => {
      if (!cancelled) setIsLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (formState) formHeadingRef.current?.scrollIntoView({ block: 'nearest' })
  }, [formState])

  function closeForm() {
    setFormState(null)
    requestAnimationFrame(() => triggerRef.current?.focus())
  }

  async function handleSubmit(values: PassengerInputFields) {
    setIsSubmitting(true)
    setMessage(null)
    try {
      const saved = formState?.passenger
        ? await updatePassengerAction({ id: formState.passenger.id, ...values })
        : await createPassengerAction(values)
      setPassengers((current) => [...current.filter((passenger) => passenger.id !== saved.id), saved]
        .sort((a, b) => a.name.localeCompare(b.name)))
      setMessage('Passageiro salvo com sucesso.')
      closeForm()
    } finally {
      setIsSubmitting(false)
    }
  }

  const search = query.trim().toLocaleLowerCase()
  const filtered = passengers.filter((passenger) => passenger.name.toLocaleLowerCase().includes(search)
    || passenger.phone?.toLocaleLowerCase().includes(search))

  return (
    <div className="mx-auto w-full max-w-6xl">
      <section aria-labelledby="passengers-page-title" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">Pessoas</p>
          <h2 id="passengers-page-title" className="mt-2 text-2xl font-bold tracking-[-0.035em] sm:text-3xl">Passageiros</h2>
          <p className="mt-2 leading-7 text-muted">Cadastre passageiros e consulte seus dados, mesmo offline.</p>
        </div>
        <Button disabled={isLoading || Boolean(error) || Boolean(formState)} onClick={(event) => {
          triggerRef.current = event.currentTarget
          setMessage(null)
          setFormState({})
        }}><Plus aria-hidden="true" size={17} />Novo passageiro</Button>
      </section>

      {message && <p role="status" className="mt-4 text-sm text-success">{message}</p>}
      {error && <p role="alert" className="mt-4 text-sm text-danger">{error}</p>}

      {formState && (
        <Card className="mt-6" padding="lg">
          <h3 ref={formHeadingRef} className="mb-5 text-lg font-semibold">{formState.passenger ? 'Editar passageiro' : 'Novo passageiro'}</h3>
          <PassengerForm key={formState.passenger?.id ?? 'create'} passenger={formState.passenger}
            isSubmitting={isSubmitting} onSubmit={handleSubmit} onCancel={closeForm} />
        </Card>
      )}

      <div className="mt-6">
        <label htmlFor="passenger-search" className="text-sm font-semibold">Buscar passageiros</label>
        <Input id="passenger-search" type="search" className="mt-2" placeholder="Nome ou telefone"
          value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>

      {isLoading ? <p role="status" className="mt-6 text-sm text-muted">Carregando passageiros...</p>
        : !error && filtered.length === 0 ? (
          <Card className="mt-6 text-center" padding="lg">
            <UsersRound aria-hidden="true" className="mx-auto text-primary" size={27} />
            <h3 className="mt-4 text-lg font-semibold">{passengers.length ? 'Nenhum passageiro encontrado' : 'Nenhum passageiro cadastrado'}</h3>
            <p className="mt-2 text-sm text-muted">{passengers.length ? 'Tente outro nome ou telefone.' : 'Use Novo passageiro para começar.'}</p>
          </Card>
        ) : (
          <ul aria-label="Passageiros cadastrados" className="mt-4 grid gap-3 md:grid-cols-2">
            {filtered.map((passenger) => (
              <li key={passenger.id} className="min-w-0">
                <Card padding="md" className="h-full">
                  <h3 className="break-words font-semibold">{passenger.name}</h3>
                  {passenger.phone && <p className="mt-1 break-words text-sm text-muted">{passenger.phone}</p>}
                  {passenger.notes && <p className="mt-2 line-clamp-2 break-words text-sm leading-6 text-subtle">{passenger.notes}</p>}
                  <Button variant="secondary" size="sm" className="mt-4" disabled={Boolean(formState)}
                    aria-label={`Editar ${passenger.name}`} onClick={(event) => {
                      triggerRef.current = event.currentTarget
                      setMessage(null)
                      setFormState({ passenger })
                    }}>Editar</Button>
                </Card>
              </li>
            ))}
          </ul>
        )}
    </div>
  )
}
