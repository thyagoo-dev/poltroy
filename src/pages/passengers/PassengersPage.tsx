import { Plus, UsersRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'

import { listPassengersAction } from '@/app/services/passenger-actions'
import { listPassengerOperationalAssignmentsAction } from '@/app/services/trip-actions'
import type { PassengerId } from '@/features/passengers/domain/ids'
import type { Passenger } from '@/features/passengers/domain/passenger'
import { PassengerListCard } from '@/features/passengers/ui/PassengerListCard'
import type { PassengerOperationalAssignment } from '@/features/trips/application/list-passenger-operational-assignments'
import { matchesPassengerSearch } from '@/features/passengers/domain/passenger-search'
import { Card } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'

export function PassengersPage() {
  const [passengers, setPassengers] = useState<readonly Passenger[]>([])
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [assignments, setAssignments] = useState<ReadonlyMap<PassengerId, PassengerOperationalAssignment>>(new Map())
  const [assignmentWarning, setAssignmentWarning] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    let cancelled = false
    void Promise.allSettled([listPassengersAction(), listPassengerOperationalAssignmentsAction()]).then(([people, operational]) => {
      if (cancelled) return
      if (people.status === 'fulfilled') setPassengers(people.value)
      else setError('Não foi possível carregar os passageiros.')
      if (operational.status === 'fulfilled') setAssignments(operational.value)
      else setAssignmentWarning(true)
      setIsLoading(false)
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
      {!error && assignmentWarning && <p role="status" className="mt-4 text-sm text-muted">Não foi possível carregar ônibus e assentos. Os dados dos passageiros continuam disponíveis.</p>}

      <div className="mt-6">
        <label htmlFor="passenger-search" className="text-sm font-semibold">Buscar passageiros</label>
        <Input id="passenger-search" type="search" className="mt-2" placeholder="Nome, nome de exibição, telefone ou documento"
          value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>

      <p role="status" aria-atomic="true" className="sr-only">{!isLoading && !error && query.trim()
        ? `${filtered.length} ${filtered.length === 1 ? 'passageiro encontrado' : 'passageiros encontrados'}.` : ''}</p>

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
                <PassengerListCard passenger={passenger} assignment={assignments.get(passenger.id)} />
              </li>
            ))}
          </ul>
        )}
    </div>
  )
}
