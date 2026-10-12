import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { getTripHistoryDetailsAction } from '@/app/services/trip-history-actions'
import type { TripHistoryDetailsResult } from '@/features/trips/application/get-trip-history-details'
import type { TripId } from '@/features/trips/domain/ids'
import { resolveSeatStatus } from '@/features/trips/domain/trip-seat-state'
import { seatStatusVisuals } from '@/features/trips/ui/seat-status-visuals'
import { HistoricalSeatView } from '@/features/trips/ui/HistoricalSeatView'
import { BusMap } from '@/features/seat-map/ui/BusMap'
import { MorePageHeader } from '@/pages/more/MorePageHeader'
import { HistoryOccupancy, HistoryStatus } from './HistoryTripSummary'
import { formatHistoryEnd } from '@/features/trips/application/format-history-end'
import { createTripManifestCsv } from '@/features/exports/application/trip-history-csv'
import { CsvExportButton } from '@/features/exports/ui/CsvExportButton'
import { formatDateTime } from '@/shared/lib/date-time'
import { Card } from '@/shared/ui/Card'

type LoadState = TripHistoryDetailsResult | { status: 'loading' | 'error' }

export function HistoryDetailsPage() {
  const { tripId } = useParams()
  return <HistoryDetailsContent key={tripId} tripId={tripId} />
}

function HistoryDetailsContent({ tripId }: { tripId?: string }) {
  const [result, setResult] = useState<LoadState>({ status: 'loading' })
  useEffect(() => {
    let cancelled = false
    void getTripHistoryDetailsAction((tripId ?? '') as TripId).then((value) => { if (!cancelled) setResult(value) })
      .catch(() => { if (!cancelled) setResult({ status: 'error' }) })
    return () => { cancelled = true }
  }, [tripId])
  const details = result.status === 'ready' ? result.details : undefined
  const trip = details?.trip
  const associations = details?.seats.filter((entry) => entry.state?.status === 'OCCUPIED' || entry.state?.status === 'RESERVED') ?? []
  const seatById = new Map(details?.seats.map((entry) => [entry.seatId, entry]))
  return (
    <div className="mx-auto w-full max-w-4xl">
      <MorePageHeader title="Histórico da viagem" description="Consulta de leitura da viagem encerrada." backTo="/more/history" backLabel="Voltar ao histórico" />
      {result.status === 'loading' && <p role="status" className="mt-6 text-sm text-muted">Carregando histórico...</p>}
      {result.status === 'error' && <p role="alert" className="mt-6 text-sm text-danger">Não foi possível carregar esta viagem.</p>}
      {result.status === 'notFound' && <p className="mt-6 font-semibold">Viagem não encontrada</p>}
      {result.status === 'notHistorical' && <p className="mt-6 text-sm text-muted">Esta viagem ainda não faz parte do histórico.</p>}
      {details && trip && <>
        <CsvExportButton label="Exportar manifesto CSV" successMessage="Manifesto exportado." createFile={(clock) => createTripManifestCsv(details, clock)} />
        <Card className="mt-6">
          <h3 className="break-words text-xl font-semibold">{trip.origin} → {trip.destination}</h3>
          <div className="mt-3"><HistoryStatus status={trip.status} /></div>
          <dl className="mt-5 grid min-w-0 gap-4 sm:grid-cols-2">
            {[
              ['Ônibus', details.bus?.name ?? 'Ônibus não encontrado'],
              ['Layout', details.layout?.name ?? (details.layoutStatus === 'inconsistent' ? 'Layout incompatível com o ônibus da viagem' : 'Layout não encontrado')],
              ['Saída planejada', formatDateTime(trip.departureAt)],
              ...(trip.startedAt ? [['Início real', formatDateTime(trip.startedAt)]] : []),
              [trip.status === 'COMPLETED' ? 'Conclusão' : 'Cancelamento', formatHistoryEnd(trip)],
              ...(trip.arrivalEstimateAt ? [['Previsão de chegada', formatDateTime(trip.arrivalEstimateAt)]] : []),
            ].map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-sm font-semibold text-muted">{label}</dt><dd className="mt-1 break-words text-sm leading-6">{value}</dd></div>)}
          </dl>
          {trip.notes && <div className="mt-5"><h4 className="text-sm font-semibold">Observações</h4><p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-muted">{trip.notes}</p></div>}
          <div className="mt-5 border-t border-border pt-4"><HistoryOccupancy details={details} /></div>
        </Card>
        <section className="mt-8" aria-labelledby="history-passengers-title">
          <h3 id="history-passengers-title" className="text-lg font-semibold">Passageiros e poltronas</h3>
          {!associations.length ? <p className="mt-3 text-sm text-muted">Nenhum assento ocupado ou reservado nesta viagem.</p>
            : <ul className="mt-4 space-y-3">{associations.map((entry) => <li key={entry.seatId}><Card>
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{entry.seat ? `Poltrona ${entry.seat.seatNumber}` : 'Poltrona indisponível'} · {seatStatusVisuals[resolveSeatStatus(entry.state)].label}</p>
                  <p className="mt-1 break-words font-semibold">{entry.passenger?.name ?? (entry.state?.passengerId ? 'Passageiro não encontrado' : 'Sem passageiro associado')}</p>
                  {entry.passenger && <p className="mt-1 break-words text-sm text-muted">No mapa: {entry.passenger.displayName}</p>}
                </div>
                {entry.passenger && <Link to={`/passengers/${encodeURIComponent(entry.passenger.id)}`} aria-label={`Ver passageiro ${entry.passenger.name}`} className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-control border border-border px-3 py-2 text-sm font-semibold text-primary! hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Ver passageiro</Link>}
              </div>
            </Card></li>)}</ul>}
        </section>
        <section className="mt-8 min-w-0" aria-labelledby="history-map-title">
          <h3 id="history-map-title" className="mb-4 text-lg font-semibold">Mapa histórico</h3>
          {details.layout ? <BusMap layout={details.layout} renderElement={(placement) => placement.element.kind === 'seat'
            ? <HistoricalSeatView placement={placement} entry={seatById.get(placement.element.id)} /> : null} />
            : <p className="rounded-control border border-border bg-surface-soft p-4 text-sm leading-6 text-muted">{details.layoutStatus === 'inconsistent' ? 'Mapa indisponível: o layout pertence a outro ônibus.' : 'Mapa indisponível: layout não encontrado.'}</p>}
        </section>
        {details.layout && details.seats.some((entry) => !entry.seat) && <p className="mt-4 text-sm leading-6 text-muted">Há estados de poltronas ausentes do layout. Eles não entram no mapa ou no resumo; associações aparecem como poltrona indisponível.</p>}
        <p className="mt-6 text-xs leading-5 text-subtle">Os nomes exibidos são os atuais do cadastro. Esta consulta não é um registro imutável de alterações.</p>
      </>}
    </div>
  )
}
