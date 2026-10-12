import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { listTripHistoryAction } from '@/app/services/trip-history-actions'
import type { TripHistorySummary } from '@/features/trips/application/trip-history'
import { filterTripHistory, type TripHistoryFilter } from '@/features/trips/application/trip-history-search'
import { MorePageHeader } from '@/pages/more/MorePageHeader'
import { HistoryOccupancy, HistoryStatus } from './HistoryTripSummary'
import { formatHistoryEnd } from '@/features/trips/application/format-history-end'
import { createTripHistoryCsv } from '@/features/exports/application/trip-history-csv'
import { CsvExportButton } from '@/features/exports/ui/CsvExportButton'
import { formatDateTime } from '@/shared/lib/date-time'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'

const filters = [{ value: 'ALL', label: 'Todas' }, { value: 'COMPLETED', label: 'Concluídas' }, { value: 'CANCELLED', label: 'Canceladas' }] as const

export function HistoryPage() {
  const [items, setItems] = useState<readonly TripHistorySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<TripHistoryFilter>('ALL')
  useEffect(() => {
    let cancelled = false
    void listTripHistoryAction().then((result) => { if (!cancelled) { setItems(result); setLoading(false) } })
      .catch(() => { if (!cancelled) { setError(true); setLoading(false) } })
    return () => { cancelled = true }
  }, [])
  const visible = useMemo(() => filterTripHistory(items, query, filter), [items, query, filter])
  return (
    <div className="mx-auto w-full max-w-4xl">
      <MorePageHeader title="Histórico operacional" description="Consulte viagens encerradas e ocupação final." backLabel="Voltar" />
      <div className="mt-6">
        <label htmlFor="history-search" className="text-sm font-semibold">Buscar no histórico</label>
        <Input id="history-search" type="search" className="mt-2" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rota, ônibus, passageiro ou poltrona" />
      </div>
      <div role="group" aria-label="Filtrar histórico por status" className="mt-4 flex flex-wrap gap-2">
        {filters.map(({ value, label }) => <Button key={value} variant={filter === value ? 'primary' : 'secondary'} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</Button>)}
      </div>
      <CsvExportButton label="Exportar CSV" successMessage="CSV exportado." disabled={loading || error || visible.length === 0} createFile={(clock) => createTripHistoryCsv(visible, clock)} />
      {loading ? <p role="status" className="mt-6 text-sm text-muted">Carregando histórico...</p>
        : error ? <p role="alert" className="mt-6 text-sm text-danger">Não foi possível carregar o histórico.</p>
          : <>
            <p role="status" className="mt-4 text-sm text-muted">{visible.length} {visible.length === 1 ? 'viagem encontrada' : 'viagens encontradas'}</p>
            {!items.length ? <Card className="mt-6"><h3 className="font-semibold">Nenhuma viagem no histórico</h3><p className="mt-2 text-sm leading-6 text-muted">Viagens concluídas ou canceladas aparecerão aqui.</p></Card>
              : !visible.length ? <p className="mt-6 text-sm text-muted">Nenhuma viagem encontrada para esta busca e filtro.</p>
                : <ul aria-label="Viagens no histórico" className="mt-6 grid min-w-0 gap-4 md:grid-cols-2">
                  {visible.map((details) => <li key={details.trip.id} className="min-w-0"><Card className="h-full">
                    <h3 className="break-words text-lg font-semibold">{details.trip.origin} → {details.trip.destination}</h3>
                    <div className="mt-3"><HistoryStatus status={details.trip.status} /></div>
                    <p className="mt-3 break-words text-sm text-muted">Saída: {formatDateTime(details.trip.departureAt)}</p>
                    <p className="mt-1 break-words text-xs text-subtle">Encerramento: {formatHistoryEnd(details.trip)}</p>
                    <p className="my-3 break-words text-sm font-semibold">{details.bus?.name ?? 'Ônibus não encontrado'}</p>
                    <HistoryOccupancy details={details} />
                    <Link to={`/more/history/${encodeURIComponent(details.trip.id)}`} aria-label={`Ver histórico de ${details.trip.origin} para ${details.trip.destination}`} className="mt-4 inline-flex min-h-11 max-w-full items-center justify-center rounded-control border border-border px-4 py-2 text-sm font-semibold text-primary! hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Ver histórico</Link>
                  </Card></li>)}
                </ul>}
          </>}
    </div>
  )
}
