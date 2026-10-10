import {
  Route,
  TriangleAlert,
} from 'lucide-react'
import { Link } from 'react-router'
import { useRef, useState } from 'react'

import { useOperationalTripMap } from '@/app/hooks/use-operational-trip-map'
import { completeTripAction, startTripAction, setTripSeatPassengerAction, setTripSeatStatusAction } from '@/app/services/trip-actions'
import type { PassengerId } from '@/features/passengers/domain/ids'
import type { SeatId } from '@/features/seat-map/domain/ids'
import type { SeatStatus } from '@/features/trips/domain/trip-seat-state'
import { OperationalBusMap } from '@/features/trips/ui/OperationalBusMap'
import { OperationalTripSummary } from '@/features/trips/ui/OperationalTripSummary'
import { OperationalTripActionsSheet } from '@/features/trips/ui/OperationalTripActionsSheet'
import type { Trip } from '@/features/trips/domain/trip'
import { useBusSelectionStore } from '@/features/buses/ui/bus-selection-store'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'

export function MapPage() {
  const [pendingAction, setPendingAction] = useState<'start' | 'complete' | null>(null)
  const [tripActionError, setTripActionError] = useState<string | null>(null)
  const [completeTarget, setCompleteTarget] = useState<Trip | null>(null)
  const [tripActionsOpen, setTripActionsOpen] = useState(false)
  const tripActionInFlight = useRef(false)
  const selectBus = useBusSelectionStore((state) => state.selectBus)
  const operationalMap =
    useOperationalTripMap()

  const hasOperationalTrip =
    operationalMap
      .operationalTripId !== null

  async function handleSeatStatusChange(
    seatId: SeatId,
    status: SeatStatus,
  ) {
    if (
      !operationalMap.trip
    ) {
      return
    }

    await setTripSeatStatusAction({
      tripId:
        operationalMap.trip.id,

      seatId,
      status,
    })

    operationalMap.refresh()
  }

  async function handleSeatPassengerChange(seatId: SeatId, passengerId: PassengerId | null) {
    if (!operationalMap.trip) return
    await setTripSeatPassengerAction({ tripId: operationalMap.trip.id, seatId, passengerId })
    operationalMap.refresh()
  }

  async function handleStartTrip() {
    if (!operationalMap.trip || tripActionInFlight.current) return
    tripActionInFlight.current = true
    setPendingAction('start')
    setTripActionError(null)
    try {
      const updatedTrip = await startTripAction(operationalMap.trip.id)
      selectBus(updatedTrip.busId)
      operationalMap.refresh(updatedTrip)
      setTripActionsOpen(false)
    } catch (caughtError) {
      setTripActionError(caughtError instanceof Error ? caughtError.message : 'Não foi possível iniciar a viagem.')
    } finally {
      tripActionInFlight.current = false
      setPendingAction(null)
    }
  }

  async function handleCompleteTrip() {
    if (!completeTarget || tripActionInFlight.current) return
    tripActionInFlight.current = true
    setPendingAction('complete')
    setTripActionError(null)
    try {
      await completeTripAction(completeTarget.id)
      setCompleteTarget(null)
      operationalMap.clearOperationalTrip()
    } catch (caughtError) {
      setTripActionError(caughtError instanceof Error ? caughtError.message : 'Não foi possível concluir a viagem.')
    } finally {
      tripActionInFlight.current = false
      setPendingAction(null)
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      {hasOperationalTrip ? (
        operationalMap.isLoading ? (
          <Card
            className="
              flex min-h-80
              items-center justify-center
            "
            padding="lg"
          >
            <p role="status" className="text-sm text-muted">
              Carregando viagem...
            </p>
          </Card>
        ) : operationalMap.error ||
          !operationalMap.trip ||
          !operationalMap.layout ||
          !operationalMap.bus ? (
          <Card
            className="
              flex min-h-72
              items-center justify-center
            "
            padding="lg"
          >
            <div className="max-w-md text-center">
              <div
                className="
                  mx-auto
                  flex size-14
                  items-center justify-center
                  rounded-card
                  border border-warning/20
                  bg-warning/10
                  text-warning
                "
              >
                <TriangleAlert
                  aria-hidden="true"
                  size={25}
                />
              </div>

              <h2 className="mt-5 text-lg font-semibold text-foreground">
                Viagem indisponível
              </h2>

              <p role="alert" className="mt-2 text-sm leading-6 text-muted">
                {operationalMap.error ??
                  'Não foi possível carregar esta viagem.'}
              </p>

              <Button
                className="mt-5"
                variant="secondary"
                onClick={
                  operationalMap
                    .clearOperationalTrip
                }
              >
                Fechar viagem
              </Button>
            </div>
          </Card>
        ) : (
          <>
            <OperationalTripSummary trip={operationalMap.trip} layout={operationalMap.layout} states={operationalMap.seatStates}
              actionsOpen={tripActionsOpen} onOpenActions={() => {
                setTripActionError(null)
                setTripActionsOpen(true)
              }} />
            <OperationalTripActionsSheet open={tripActionsOpen} trip={operationalMap.trip}
              pendingAction={pendingAction} error={tripActionError} onStart={() => void handleStartTrip()}
              onComplete={() => {
                setTripActionsOpen(false)
                setTripActionError(null)
                setCompleteTarget(operationalMap.trip ?? null)
              }} onExit={() => {
                setTripActionsOpen(false)
                setTripActionError(null)
                operationalMap.clearOperationalTrip()
              }} onClose={() => setTripActionsOpen(false)} />

            <div className="mt-3 min-w-0">
              <OperationalBusMap
                passengers={operationalMap.passengers}
                onChangePassenger={handleSeatPassengerChange}
                key={operationalMap.trip.id}
                layout={
                  operationalMap.layout
                }
                states={
                  operationalMap
                    .seatStates
                }
                onChangeStatus={
                  handleSeatStatusChange
                }
              />
            </div>
          </>
        )
      ) : (
        <Card className="flex min-h-72 items-center justify-center" padding="lg">
          <div className="max-w-md text-center">
            <Route aria-hidden="true" size={27} className="mx-auto text-primary" />
            <h2 className="mt-4 text-lg font-semibold">Nenhuma viagem aberta no mapa</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Abra uma viagem planejada ou em andamento para visualizar assentos, passageiros e estados da operação.
            </p>
            <Link to="/trips" className="mx-auto mt-5 inline-flex min-h-11 items-center justify-center rounded-control bg-primary px-4 text-sm font-semibold text-on-primary! shadow-control hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface">
              Ver viagens
            </Link>
          </div>
        </Card>
      )}
      <ConfirmDialog open={completeTarget !== null} title="Concluir viagem?"
        description={completeTarget ? `${completeTarget.origin} → ${completeTarget.destination} será movida para o histórico e o mapa deixará de ser editável.` : ''}
        confirmLabel="Concluir viagem" cancelLabel="Voltar" pendingLabel="Concluindo..." isPending={pendingAction === 'complete'} error={tripActionError}
        onConfirm={() => void handleCompleteTrip()} onCancel={() => {
          setCompleteTarget(null)
          setTripActionError(null)
        }} />
    </div>
  )
}
