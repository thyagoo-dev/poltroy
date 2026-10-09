import {
  BusFront,
  LayoutGrid,
  Plus,
} from 'lucide-react'
import { Link } from 'react-router'

import { useActiveBus } from '@/app/hooks/use-active-bus'
import { Card } from '@/shared/ui/Card'

export function MapPage() {
  const {
    activeBus,
    isLoading,
  } = useActiveBus()

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
            ? `Ônibus atual: ${activeBus.name}.`
            : 'Selecione um ônibus para iniciar a operação.'}
        </p>
      </section>

      <Card
        className="
          mt-6
          flex min-h-80
          items-center justify-center
          sm:min-h-96
        "
        padding="lg"
      >
        {isLoading ? (
          <p className="text-sm text-muted">
            Carregando...
          </p>
        ) : activeBus ? (
          <div className="max-w-md text-center">
            <div
              className="
                mx-auto
                flex size-14 items-center justify-center
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
              {activeBus.name}
            </h3>

            <p className="mt-2 text-sm leading-6 text-muted">
              O ônibus já está cadastrado e persistido localmente. A visualização real dos assentos entra quando implementarmos a engine de layout.
            </p>

            <div
              className="
                mx-auto mt-5
                flex w-fit items-center gap-2
                rounded-pill
                border border-border
                bg-surface-soft
                px-3 py-2
                text-xs text-subtle
              "
            >
              <LayoutGrid
                aria-hidden="true"
                size={14}
              />

              Layout aguardando renderer
            </div>
          </div>
        ) : (
          <div className="max-w-md text-center">
            <div
              className="
                mx-auto
                flex size-14 items-center justify-center
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
              Nenhum ônibus cadastrado
            </h3>

            <p className="mt-2 text-sm leading-6 text-muted">
              Adicione o primeiro veículo da frota para começarmos a preparar o mapa.
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

              Adicionar ônibus
            </Link>
          </div>
        )}
      </Card>
    </div>
  )
}
