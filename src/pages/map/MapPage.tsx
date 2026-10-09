import {
  BusFront,
  Plus,
  TriangleAlert,
} from 'lucide-react'
import { Link } from 'react-router'

import { useActiveBusLayout } from '@/app/hooks/use-active-bus-layout'
import { useOperationalTripMap } from '@/app/hooks/use-operational-trip-map'
import { setTripSeatStatusAction } from '@/app/services/trip-actions'
import type { SeatId } from '@/features/seat-map/domain/ids'
import { BusMap } from '@/features/seat-map/ui/BusMap'
import type { SeatStatus } from '@/features/trips/domain/trip-seat-state'
import { OperationalBusMap } from '@/features/trips/ui/OperationalBusMap'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'

export function MapPage() {
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
      ? `${operationalMap.trip.origin} → ${operationalMap.trip.destination}.`
      : physicalMap.activeBus
        ? `Visualização estrutural de ${physicalMap.activeBus.name}.`
        : 'Selecione um ônibus para visualizar sua configuração.'

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

        <p className="max-w-2xl leading-7 text-muted">
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

              <p className="mt-2 text-sm leading-6 text-muted">
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
            <Card
              className="mt-6"
              padding="md"
            >
              <div
                className="
                  flex flex-col gap-4
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">
                      {
                        operationalMap
                          .trip.origin
                      }
                      {' → '}
                      {
                        operationalMap
                          .trip.destination
                      }
                    </p>

                    <span
                      className="
                        rounded-pill
                        border border-success/20
                        bg-success/10
                        px-2 py-1
                        text-[0.625rem]
                        font-bold uppercase
                        tracking-[0.08em]
                        text-success
                      "
                    >
                      {operationalMap
                        .trip.status ===
                      'ACTIVE'
                        ? 'Em andamento'
                        : 'Planejada'}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-muted">
                    {
                      operationalMap
                        .bus.name
                    }
                    {' · '}
                    {
                      operationalMap
                        .layout.name
                    }
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={
                    operationalMap
                      .clearOperationalTrip
                  }
                >
                  Sair da viagem
                </Button>
              </div>
            </Card>

            <Card
              className="mt-4"
              variant="raised"
              padding="lg"
            >
              <OperationalBusMap
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
            </Card>
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
                focus-visible:ring-primary/55
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
          <Card
            className="mt-6"
            variant="raised"
            padding="lg"
          >
            <BusMap
              key={physicalMap.activeLayout.id}
              layout={
                physicalMap
                  .activeLayout
              }
            />
          </Card>

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
    </div>
  )
}
