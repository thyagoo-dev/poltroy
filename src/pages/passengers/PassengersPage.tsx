import { Plus, UsersRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'

import { listPassengersAction } from '@/app/services/passenger-actions'
import type { Passenger } from '@/features/passengers/domain/passenger'
import { resolvePassengerDisplayName } from '@/features/passengers/domain/passenger-display-name'
import { matchesPassengerSearch } from '@/features/passengers/domain/passenger-search'
import { Card } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'

export function PassengersPage() {
  const [passengers, setPassengers] = useState<readonly Passenger[]>([])
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

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
    window.scrollTo(0, 0)
    headingRef.current?.focus({ preventScroll: true })
  }, [])

  const filtered = passengers.filter((passenger) => matchesPassengerSearch(passenger, query))

  return (
    <div className="mx-auto w-full max-w-6xl">
      <section aria-labelledby="passengers-page-title" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">Pessoas</p>
          <h2 ref={headingRef} tabIndex={-1} id="passengers-page-title" className="mt-2 text-2xl font-bold tracking-[-0.035em] focus-visible:rounded-control focus-visible:outline-2 focus-visible:outline-primary sm:text-3xl">Passageiros</h2>
          <p className="mt-2 leading-7 text-muted">Cadastre passageiros e consulte seus dados, mesmo offline.</p>
        </div>
        <Link to="/passengers/new" className="inline-flex min-h-11 max-w-full items-center justify-center gap-2 rounded-control bg-primary px-4 py-2 text-sm font-semibold text-on-primary! shadow-control hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"><Plus aria-hidden="true" size={17} />Novo passageiro</Link>
      </section>

      {error && <p role="alert" className="mt-4 text-sm text-danger">{error}</p>}

      <div className="mt-6">
        <label htmlFor="passenger-search" className="text-sm font-semibold">Buscar passageiros</label>
        <Input id="passenger-search" type="search" className="mt-2" placeholder="Nome, nome de exibição, telefone ou documento"
          value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>

      {isLoading ? <p role="status" className="mt-6 text-sm text-muted">Carregando passageiros...</p>
        : !error && filtered.length === 0 ? (
          <Card className="mt-6 text-center" padding="lg">
            <UsersRound aria-hidden="true" className="mx-auto text-primary" size={27} />
            <h3 className="mt-4 text-lg font-semibold">{passengers.length ? 'Nenhum passageiro encontrado' : 'Nenhum passageiro cadastrado'}</h3>
            <p className="mt-2 text-sm text-muted">{passengers.length ? 'Tente outro nome, telefone ou documento.' : 'Use Novo passageiro para começar.'}</p>
          </Card>
        ) : (
          <ul aria-label="Passageiros cadastrados" className="mt-4 grid gap-3 md:grid-cols-2">
            {filtered.map((passenger) => (
              <li key={passenger.id} className="min-w-0">
                <Card padding="md" className="h-full">
                  <h3 className="break-words font-semibold">{passenger.name}</h3>
                  <p className="mt-1 break-words text-xs text-subtle">No mapa: {resolvePassengerDisplayName(passenger)}</p>
                  {passenger.phone && <p className="mt-1 break-words text-sm text-muted">{passenger.phone}</p>}
                  <Link to={`/passengers/${encodeURIComponent(passenger.id)}`} aria-label={`Ver detalhes de ${passenger.name}`}
                    className="mt-4 inline-flex min-h-11 items-center justify-center rounded-control border border-border bg-surface-raised px-3.5 py-2 text-sm font-semibold text-foreground! shadow-soft hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">Ver passageiro</Link>
                </Card>
              </li>
            ))}
          </ul>
        )}
    </div>
  )
}
