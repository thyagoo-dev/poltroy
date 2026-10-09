import {
  BusFront,
  Plus,
  TriangleAlert,
} from 'lucide-react'
import { Link } from 'react-router'

import { useActiveBusLayout } from '@/app/hooks/use-active-bus-layout'
import { BusMap } from '@/features/seat-map/ui/BusMap'
import { Card } from '@/shared/ui/Card'

export function MapPage() {
  const {
    activeBus,
    activeLayout,
    isLoading,
    error,
  } = useActiveBusLayout()

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
          {activeBus
            ? `Visualização estrutural de ${activeBus.name}.`
            : 'Selecione um ônibus para visualizar sua configuração.'}
        </p>
      </section>

      {isLoading ? (
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
      ) : !activeBus ? (
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
                strokeWidth={1.7}
              />
            </div>

            <h3 className="mt-5 text-lg font-semibold tracking-[-0.02em] text-foreground">
              Nenhum ônibus selecionado
            </h3>

            <p className="mt-2 text-sm leading-6 text-muted">
              Adicione ou selecione um ônibus para visualizar o mapa físico de assentos.
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
                focus-visible:ring-offset-2
                focus-visible:ring-offset-background
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
      ) : error || !activeLayout ? (
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
              Layout indisponível
            </h3>

            <p className="mt-2 text-sm leading-6 text-muted">
              {error ??
                'Não foi possível encontrar o layout ativo deste ônibus.'}
            </p>

            <Link
              to="/buses"
              className="
                mt-5
                inline-flex min-h-11
                items-center justify-center
                rounded-control
                border border-border
                bg-surface-raised
                px-4
                text-sm font-semibold
                text-foreground
                transition-colors
                hover:bg-surface-soft
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-primary/55
              "
            >
              Gerenciar ônibus
            </Link>
          </div>
        </Card>
      ) : (
        <Card
          className="mt-6"
          variant="raised"
          padding="lg"
        >
          <BusMap key={String(activeLayout.id)}
            layout={
              activeLayout
            }
          />
        </Card>
      )}
    </div>
  )
}
