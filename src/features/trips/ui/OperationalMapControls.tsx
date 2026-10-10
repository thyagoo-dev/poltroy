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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-4">
        <div className="min-w-0 flex-1">
          <label htmlFor={`${id}-search`} className="text-sm font-semibold">Buscar assento ou passageiro</label>
          <Input id={`${id}-search`} type="search" className="mt-1" placeholder="Número do assento, nome ou telefone"
            value={search} onChange={(event) => onSearchChange(event.target.value)} />
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <p className="min-w-0 text-sm text-muted">Status: <strong className="text-foreground">{filterLabel}</strong></p>
          <Button variant="secondary" size="sm" className="shrink-0" aria-haspopup="dialog"
            aria-expanded={filterOpen} onClick={() => setFilterOpen(true)}>
            <SlidersHorizontal aria-hidden="true" size={16} />Filtros
          </Button>
        </div>
      </div>
      {hasCriteria && (
        <div className="flex flex-wrap items-center justify-between gap-x-2">
          <p role="status" aria-atomic="true" className="text-xs text-muted">
            {matchCount} {matchCount === 1 ? 'assento encontrado' : 'assentos encontrados'}
          </p>
          <Button variant="ghost" size="sm" onClick={onClear}>Limpar filtros</Button>
        </div>
      )}
      <OperationalFilterSheet open={filterOpen} filter={filter} onSelect={onFilterChange} onClose={() => setFilterOpen(false)} />
    </section>
  )
}
