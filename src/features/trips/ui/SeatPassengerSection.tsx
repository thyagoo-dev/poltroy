import { useId, useState } from 'react'
import { Link } from 'react-router'

import type { PassengerId } from '@/features/passengers/domain/ids'
import type { Passenger } from '@/features/passengers/domain/passenger'
import { resolvePassengerDisplayName } from '@/features/passengers/domain/passenger-display-name'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'

interface SeatPassengerSectionProps {
  passengers: readonly Passenger[]
  passengerId?: PassengerId
  isPending: boolean
  onSelect: (passengerId: PassengerId | null) => void
}

export function SeatPassengerSection({ passengers, passengerId, isPending, onSelect }: SeatPassengerSectionProps) {
  const id = useId()
  const [query, setQuery] = useState('')
  const search = query.trim().toLocaleLowerCase()
  const filtered = passengers.filter((item) => item.name.toLocaleLowerCase().includes(search)
    || resolvePassengerDisplayName(item).toLocaleLowerCase().includes(search)
    || item.phone?.toLocaleLowerCase().includes(search))

  return (
    <section aria-labelledby={`${id}-title`} className="mt-5 border-t border-border pt-5">
      <h3 id={`${id}-title`} className="font-semibold">Associação de passageiro</h3>
      {passengerId && (
        <Button className="mt-3" variant="ghost" disabled={isPending} onClick={() => onSelect(null)}>Remover associação</Button>
      )}
      <label htmlFor={`${id}-search`} className="mt-4 block text-sm font-semibold">
        {passengerId ? 'Alterar passageiro' : 'Escolher passageiro'}
      </label>
      <Input id={`${id}-search`} className="mt-2" type="search" placeholder="Buscar por nome ou telefone"
        value={query} disabled={isPending} onChange={(event) => setQuery(event.target.value)} />
      <ul aria-label="Escolher passageiro" className="mt-2 max-h-44 space-y-2 overflow-y-auto p-1">
        {filtered.map((item) => (
          <li key={item.id}>
            <Button variant="secondary" fullWidth className="justify-start text-left" disabled={isPending}
              aria-pressed={item.id === passengerId} onClick={() => onSelect(item.id)}>
              <span className="min-w-0 py-2">
                <span className="block break-words">{item.name}{item.id === passengerId ? ' · Associado' : ''}</span>
                {item.phone && <span className="mt-1 block break-words text-xs font-normal text-muted">{item.phone}</span>}
              </span>
            </Button>
          </li>
        ))}
      </ul>
      {filtered.length === 0 && <p role="status" className="mt-2 text-sm text-muted">
        {passengers.length ? 'Nenhum passageiro encontrado.' : 'Nenhum passageiro cadastrado.'}
      </p>}
      <Link to="/passengers" aria-disabled={isPending} tabIndex={isPending ? -1 : undefined}
        onClick={(event) => { if (isPending) event.preventDefault() }}
        className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-primary! hover:underline focus-visible:rounded-control">
        Gerenciar passageiros
      </Link>
    </section>
  )
}
