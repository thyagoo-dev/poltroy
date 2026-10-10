import { SlidersHorizontal } from 'lucide-react'
import { useId, useState } from 'react'

import type { OperationalSeatFilter } from '@/features/trips/domain/operational-seat-filter'
import { OperationalFilterSheet } from '@/features/trips/ui/OperationalFilterSheet'
import { operationalFilterOptions } from '@/features/trips/ui/operational-filter-options'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'

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
  const [filterOpen, setFilterOpen] = useState(false)
  const hasCriteria = filter !== 'ALL' || search.trim().length > 0
  const filterLabel = operationalFilterOptions.find(([value]) => value === filter)![1]
  return (
    <section aria-label="Busca e filtros do mapa" className="mb-4 space-y-2">
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <label htmlFor={`${id}-search`} className="sr-only">Buscar assento ou passageiro</label>
          <Input id={`${id}-search`} type="search" className="px-3" placeholder="Buscar assento ou passageiro"
            value={search} onChange={(event) => onSearchChange(event.target.value)} />
        </div>
        <Button variant="secondary" size="sm" className="shrink-0 px-3" aria-haspopup="dialog"
          aria-expanded={filterOpen} onClick={() => setFilterOpen(true)}>
          <SlidersHorizontal aria-hidden="true" size={16} />Filtros
        </Button>
      </div>
      {hasCriteria && (
        <div className="flex flex-wrap items-center justify-between gap-x-2">
          <p role="status" aria-atomic="true" className="min-w-0 text-xs text-muted">
            {filter !== 'ALL' && <span className="font-semibold text-foreground">{filterLabel} · </span>}
            {matchCount} {matchCount === 1 ? 'assento encontrado' : 'assentos encontrados'}
          </p>
          <Button variant="ghost" size="sm" onClick={onClear}>Limpar filtros</Button>
        </div>
      )}
      <OperationalFilterSheet open={filterOpen} filter={filter} onSelect={onFilterChange} onClose={() => setFilterOpen(false)} />
    </section>
  )
}
