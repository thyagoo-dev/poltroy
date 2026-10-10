import {
  BusFront,
  Plus,
  TriangleAlert,
} from 'lucide-react'
import { Link } from 'react-router'
import { useRef, useState } from 'react'

import { useActiveBusLayout } from '@/app/hooks/use-active-bus-layout'
import { useOperationalTripMap } from '@/app/hooks/use-operational-trip-map'
import { completeTripAction, startTripAction, setTripSeatPassengerAction, setTripSeatStatusAction } from '@/app/services/trip-actions'
import type { PassengerId } from '@/features/passengers/domain/ids'
import type { SeatId } from '@/features/seat-map/domain/ids'
import { BusMap } from '@/features/seat-map/ui/BusMap'
import type { SeatStatus } from '@/features/trips/domain/trip-seat-state'
import { OperationalBusMap } from '@/features/trips/ui/OperationalBusMap'
import { OperationalTripPanel } from '@/features/trips/ui/OperationalTripPanel'
import type { Trip } from '@/features/trips/domain/trip'
import { useBusSelectionStore } from '@/features/buses/ui/bus-selection-store'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'

export function MapPage() {
  const [pendingAction, setPendingAction] = useState<'start' | 'complete' | null>(null)
  const [tripActionError, setTripActionError] = useState<string | null>(null)
  const [completeTarget, setCompleteTarget] = useState<Trip | null>(null)
  const tripActionInFlight = useRef(false)
  const selectBus = useBusSelectionStore((state) => state.selectBus)
  const physicalMap =
    useActiveBusLayout()

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

  const pageDescription =
    operationalMap.trip
      ? 'Prepare os assentos e acompanhe a operação da viagem.'
      : physicalMap.activeBus
        ? `Visualização estrutural de ${physicalMap.activeBus.name}.`
        : 'Selecione um ônibus para visualizar sua configuração.'

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
      <section
        aria-labelledby="map-page-title"
        className="flex flex-col gap-2"
      >
        <p
          className="
            text-xs font-semibold uppercase
            tracking-[0.14em]
            text-subtle
          "
        >
          Operação
        </p>

        <h2
          id="map-page-title"
          className="
            text-2xl font-bold
            tracking-[-0.035em]
            text-foreground
            sm:text-3xl
          "
        >
          Mapa de assentos
        </h2>

        <p className="max-w-2xl leading-7 text-muted [overflow-wrap:anywhere]">
          {pageDescription}
        </p>
      </section>

      {hasOperationalTrip ? (
        operationalMap.isLoading ? (
          <Card
            className="
              mt-6
              flex min-h-80
              items-center justify-center
            "
            padding="lg"
          >
            <p className="text-sm text-muted">
              Carregando viagem...
            </p>
          </Card>
        ) : operationalMap.error ||
          !operationalMap.trip ||
          !operationalMap.layout ||
          !operationalMap.bus ? (
          <Card
            className="
              mt-6
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

              <h3 className="mt-5 text-lg font-semibold text-foreground">
                Viagem indisponível
              </h3>

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
                Voltar ao mapa físico
              </Button>
            </div>
          </Card>
        ) : (
          <>
            <OperationalTripPanel trip={operationalMap.trip} bus={operationalMap.bus} layout={operationalMap.layout}
              pendingAction={pendingAction} error={tripActionError} onStart={() => void handleStartTrip()}
              onComplete={() => {
                setTripActionError(null)
                setCompleteTarget(operationalMap.trip ?? null)
              }} onExit={() => {
                setTripActionError(null)
                operationalMap.clearOperationalTrip()
              }} />

            <div className="mt-6 min-w-0">
              <OperationalBusMap
                passengers={operationalMap.passengers}
                onChangePassenger={handleSeatPassengerChange}
                key={operationalMap.trip.id}
                trip={
                  operationalMap.trip
                }
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
      ) : physicalMap.isLoading ? (
        <Card
          className="
            mt-6
            flex min-h-80
            items-center justify-center
          "
          padding="lg"
        >
          <p className="text-sm text-muted">
            Carregando mapa...
          </p>
        </Card>
      ) : !physicalMap.activeBus ? (
        <Card
          className="
            mt-6
            flex min-h-80
            items-center justify-center
            sm:min-h-96
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
                border border-primary/15
                bg-primary/10
                text-primary
              "
            >
              <BusFront
                aria-hidden="true"
                size={27}
              />
            </div>

            <h3 className="mt-5 text-lg font-semibold text-foreground">
              Nenhum ônibus selecionado
            </h3>

            <p className="mt-2 text-sm leading-6 text-muted">
              Adicione ou selecione um ônibus para visualizar o mapa físico.
            </p>

            <Link
              to="/buses"
              className="
                mx-auto mt-5
                inline-flex min-h-11
                items-center justify-center
                gap-2
                rounded-control
                bg-primary
                px-4
                text-sm font-semibold
                text-on-primary!
                shadow-control
                transition-colors
                hover:bg-primary-hover
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-primary
              "
            >
              <Plus
                aria-hidden="true"
                size={17}
              />

              Gerenciar ônibus
            </Link>
          </div>
        </Card>
      ) : physicalMap.error ||
        !physicalMap.activeLayout ? (
        <Card
          className="mt-6"
          padding="lg"
        >
          <p className="text-sm text-danger">
            {physicalMap.error ??
              'Layout indisponível.'}
          </p>
        </Card>
      ) : (
        <>
          <div className="mt-6 min-w-0">
            <BusMap
              key={physicalMap.activeLayout.id}
              layout={
                physicalMap
                  .activeLayout
              }
            />
          </div>

          <Card
            className="mt-4"
            padding="md"
          >
            <p className="text-sm leading-6 text-muted">
              Este é o mapa físico do ônibus. Para alterar estados dos assentos, abra uma viagem planejada ou em andamento em{' '}
              <Link
                to="/trips"
                className="font-semibold text-primary! hover:underline"
              >
                Viagens
              </Link>
              .
            </p>
          </Card>
        </>
      )}
      <ConfirmDialog open={completeTarget !== null} title="Concluir viagem?"
        description={completeTarget ? `${completeTarget.origin} → ${completeTarget.destination} será movida para o histórico e o mapa deixará de ser editável.` : ''}
        confirmLabel="Concluir viagem" cancelLabel="Voltar" isPending={pendingAction === 'complete'} error={tripActionError}
        onConfirm={() => void handleCompleteTrip()} onCancel={() => {
          setCompleteTarget(null)
          setTripActionError(null)
        }} />
    </div>
  )
}
