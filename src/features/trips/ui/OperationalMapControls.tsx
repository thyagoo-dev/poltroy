import { useId } from 'react'

import type { OperationalSeatFilter } from '@/features/trips/domain/operational-seat-filter'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'

const filters: readonly [OperationalSeatFilter, string][] = [
  ['ALL', 'Todos'],
  ['FREE', 'Livre'],
  ['OCCUPIED', 'Ocupado'],
  ['RESERVED', 'Reservado'],
  ['BLOCKED', 'Bloqueado'],
  ['WITHOUT_PASSENGER', 'Sem passageiro'],
]

interface OperationalMapControlsProps {
  filter: OperationalSeatFilter
  search: string
  matchCount: number
  onFilterChange: (filter: OperationalSeatFilter) => void
  onSearchChange: (search: string) => void
  onClear: () => void
}

export function OperationalMapControls({ filter, search, matchCount, onFilterChange, onSearchChange, onClear }: OperationalMapControlsProps) {
  const id = useId()
  const hasCriteria = filter !== 'ALL' || search.length > 0
  return (
    <section aria-label="Busca e filtros do mapa" className="mb-6 space-y-4">
      <div>
        <label htmlFor={`${id}-search`} className="text-sm font-semibold">Buscar assento ou passageiro</label>
        <Input id={`${id}-search`} type="search" className="mt-2" placeholder="Número do assento, nome ou telefone"
          value={search} onChange={(event) => onSearchChange(event.target.value)} />
      </div>
      <div role="group" aria-label="Filtrar assentos" className="flex flex-wrap gap-2">
        {filters.map(([value, label]) => (
          <Button key={value} size="sm" variant={filter === value ? 'primary' : 'secondary'}
            aria-pressed={filter === value} onClick={() => onFilterChange(value)}>
            {filter === value && <span aria-hidden="true">✓</span>}{label}
          </Button>
        ))}
      </div>
      {hasCriteria && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p role="status" aria-atomic="true" className="text-sm text-muted">
            {matchCount} {matchCount === 1 ? 'assento encontrado' : 'assentos encontrados'}
          </p>
          <Button variant="ghost" size="sm" onClick={onClear}>Limpar filtros</Button>
          <p className="w-full text-xs leading-5 text-subtle">Assentos fora da busca ou filtro ficam atenuados e continuam disponíveis para edição.</p>
        </div>
      )}
    </section>
  )
}
