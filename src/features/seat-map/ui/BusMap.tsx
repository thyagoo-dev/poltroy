import {
  Armchair,
} from 'lucide-react'
import {
  Fragment,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'

import type { BusLayout } from '@/features/buses/domain/bus-layout'
import type { StructuralLayoutElementKind } from '@/features/seat-map/domain/layout-element'
import {
  buildLayoutModel,
  type LayoutElementPlacement,
} from '@/features/seat-map/domain/layout-engine'
import { LayoutElementView } from '@/features/seat-map/ui/LayoutElementView'
import { structuralElementVisuals } from '@/features/seat-map/ui/layout-element-visuals'
import { getLayoutColumnRoles, orientFrontElements } from '@/features/seat-map/ui/seat-map-presentation'
import { cn } from '@/shared/lib/cn'

interface BusMapProps {
  layout: BusLayout

  renderElement?: (
    placement:
      LayoutElementPlacement,
  ) => ReactNode
}

const structuralElementOrder:
  readonly StructuralLayoutElementKind[] =
  [
    'driver',
    'door',
    'aisle',
    'toilet',
    'stairs',
    'technical',
  ]

export function BusMap({
  layout,
  renderElement,
}: BusMapProps) {
  const [
    selectedDeck,
    setSelectedDeck,
  ] = useState<
    number | null
  >(null)

  const layoutResult =
    useMemo(() => {
      try {
        return {
          model:
            buildLayoutModel(
              orientFrontElements(layout.elements),
            ),

          error: null,
        }
      } catch (
        caughtError
      ) {
        return {
          model: null,

          error:
            caughtError instanceof
            Error
              ? caughtError.message
              : 'Não foi possível montar o mapa do ônibus.',
        }
      }
    }, [layout])

  if (
    layoutResult.error ||
    !layoutResult.model
  ) {
    return (
      <div
        role="alert"
        className="
          rounded-control
          border border-danger/20
          bg-danger/10
          px-4 py-4
        "
      >
        <p className="font-semibold text-danger">
          Layout inválido
        </p>

        <p className="mt-1 text-sm leading-6 text-muted">
          {layoutResult.error}
        </p>
      </div>
    )
  }

  const { model } =
    layoutResult

  if (
    model.collisions.length >
    0
  ) {
    return (
      <div
        role="alert"
        className="
          rounded-control
          border border-danger/20
          bg-danger/10
          px-4 py-4
        "
      >
        <p className="font-semibold text-danger">
          Não foi possível exibir o mapa
        </p>

        <p className="mt-1 text-sm leading-6 text-muted">
          O layout contém elementos ocupando a mesma célula lógica.
        </p>
      </div>
    )
  }

  if (
    model.decks.length === 0
  ) {
    return (
      <div
        className="
          rounded-control
          border border-border
          bg-surface-soft
          px-4 py-6
          text-center
        "
      >
        <p className="text-sm text-muted">
          Este layout ainda não possui elementos.
        </p>
      </div>
    )
  }

  const activeDeck =
    model.decks.find(
      ({ deck }) =>
        deck ===
        selectedDeck,
    ) ??
    model.decks[0]

  if (!activeDeck) {
    return null
  }

  const columnRoles = getLayoutColumnRoles(activeDeck)
  const aisleCount = columnRoles.filter((role) => role === 'aisle').length
  const seatColumnCount = Math.max(1, activeDeck.columnCount - aisleCount)
  // The scroller is the query container. Its useful width minus the vehicle's
  // 14px frame, gaps and aisle tracks is shared by seat tracks (44–76px).
  const gridStyle = {
    '--seat-map-seat-width': `clamp(2.75rem, calc((100cqw - 0.875rem - ${aisleCount} * var(--seat-map-aisle-width) - ${activeDeck.columnCount - 1} * var(--seat-map-gap)) / ${seatColumnCount}), 4.75rem)`,
    gridTemplateColumns: columnRoles.map((role) => role === 'aisle'
      ? 'var(--seat-map-aisle-width)' : 'var(--seat-map-seat-width)').join(' '),
    gridAutoRows: 'var(--seat-map-row-height)',
  } as CSSProperties

  const availableStructuralKinds =
    structuralElementOrder.filter(
      (kind) =>
        activeDeck.placements.some(
          ({ element }) =>
            element.kind ===
            kind,
        ),
    )

  return (
    <section
      aria-label={`Mapa do layout ${layout.name}`}
      className="min-w-0"
    >
      <div
        className="
          flex flex-col gap-4
          sm:flex-row
          sm:items-start
          sm:justify-between
        "
      >
        <div>
          <h3 className="font-semibold text-foreground">
            {layout.name}
          </h3>

          <p className="mt-1 text-sm text-muted">
            {activeDeck.seatCount}{' '}
            assentos
          </p>
        </div>

        {model.decks.length >
          1 && (
          <div
            role="group"
            aria-label="Andar do ônibus"
            className="
              flex w-fit max-w-full flex-wrap
              rounded-control
              border border-border
              bg-surface
              p-1
            "
          >
            {model.decks.map(
              ({ deck }) => {
                const isActive =
                  deck ===
                  activeDeck.deck

                return (
                  <button
                    key={deck}
                    type="button"
                    aria-pressed={
                      isActive
                    }
                    onClick={() =>
                      setSelectedDeck(
                        deck,
                      )
                    }
                    className={cn(
                      'min-h-11',
                      'rounded-[0.7rem]',
                      'px-3',
                      'text-xs font-semibold',
                      'transition-colors',
                      'focus-visible:outline-none',
                      'focus-visible:ring-2',
                      'focus-visible:ring-primary',
                      isActive
                        ? 'bg-primary/5 text-primary'
                        : 'text-muted hover:bg-surface-soft hover:text-foreground',
                    )}
                  >
                    Andar {deck}
                  </button>
                )
              },
            )}
          </div>
        )}
      </div>

      <div
        className="
          mt-4 min-w-0
          overflow-x-auto [container-type:inline-size]
          pb-2
          [--seat-map-aisle-width:1.125rem]
          [--seat-map-gap:0.375rem]
          [--seat-map-row-height:4.25rem]
          sm:[--seat-map-aisle-width:1.5rem]
          sm:[--seat-map-gap:0.5rem]
          sm:[--seat-map-row-height:4.5rem]
        "
      >
        <div
          className="
            mx-auto
            w-fit min-w-fit
            rounded-sheet
            border border-border
            bg-surface
            px-1.5 pb-4 pt-3
          "
        >
          <div
            className="
              mx-auto
              flex w-fit
              items-center gap-2
              rounded-pill
              border border-border
              bg-surface-soft
              px-3 py-1.5
            "
          >
            <span
              aria-hidden="true"
              className="
                size-1.5
                rounded-full
                bg-primary
              "
            />

            <span
              className="
                text-[0.625rem]
                font-bold
                uppercase
                tracking-[0.14em]
                text-subtle
              "
            >
              Frente
            </span>
          </div>

          <div
            className="
              mt-3 grid w-max
              gap-[var(--seat-map-gap)]
            "
            style={gridStyle}
          >
            {activeDeck.placements.map(
              (placement) => (
                <Fragment
                  key={String(
                    placement.element.id,
                  )}
                >
                  {renderElement?.(
                    placement,
                  ) ?? (
                    <LayoutElementView
                      placement={
                        placement
                      }
                    />
                  )}
                </Fragment>
              ),
            )}
          </div>
        </div>
      </div>

      <div
        className="
          mt-5
          flex flex-wrap
          items-center
          gap-x-4 gap-y-3
        "
        aria-label="Legenda do mapa"
      >
        <div className="flex items-center gap-2">
          <span
            className="
              flex size-7
              items-center justify-center
              rounded-[0.55rem]
              border border-border-strong
              bg-surface-raised
              text-muted
            "
          >
            <Armchair
              aria-hidden="true"
              size={14}
            />
          </span>

          <span className="text-xs text-muted">
            Assento
          </span>
        </div>

        {availableStructuralKinds.map(
          (kind) => {
            const {
              icon: Icon,
              label,
            } =
              structuralElementVisuals[
                kind
              ]

            return (
              <div
                key={kind}
                className="flex items-center gap-2"
              >
                <span
                  className="
                    flex size-7
                    items-center justify-center
                    rounded-[0.55rem]
                    bg-surface-soft
                    text-subtle
                  "
                >
                  <Icon
                    aria-hidden="true"
                    size={14}
                  />
                </span>

                <span className="text-xs text-muted">
                  {label}
                </span>
              </div>
            )
          },
        )}
      </div>

      <p
        className="
          mt-5
          border-t border-border
          pt-4
          text-xs leading-5
          text-subtle
        "
      >
        A configuração física pertence à versão do layout associada a esta visualização.
      </p>
    </section>
  )
}
