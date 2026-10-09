import type { BusLayoutElement } from '@/features/seat-map/domain/layout-element'

export interface LayoutGridCell {
  readonly deck: number
  readonly row: number
  readonly column: number
}

export interface LayoutElementPlacement {
  readonly element: BusLayoutElement

  readonly deck: number

  readonly row: number
  readonly column: number

  readonly rowSpan: number
  readonly columnSpan: number

  readonly rowEnd: number
  readonly columnEnd: number
}

export interface LayoutCollision {
  readonly cell: LayoutGridCell

  readonly elementIds: readonly string[]
}

export interface LayoutDeckModel {
  readonly deck: number

  readonly rowCount: number
  readonly columnCount: number

  readonly elementCount: number
  readonly seatCount: number

  readonly placements: readonly LayoutElementPlacement[]
}

export interface LayoutModel {
  readonly decks: readonly LayoutDeckModel[]

  readonly totalElements: number
  readonly totalSeats: number

  readonly collisions: readonly LayoutCollision[]
}

function isPositiveInteger(
  value: number,
) {
  return (
    Number.isInteger(value) &&
    value >= 1
  )
}

export function hasValidLayoutElementGeometry(
  element: BusLayoutElement,
) {
  const {
    deck,
    row,
    column,
    rowSpan,
    columnSpan,
  } = element.position

  return (
    isPositiveInteger(deck) &&
    isPositiveInteger(row) &&
    isPositiveInteger(column) &&
    isPositiveInteger(
      rowSpan ?? 1,
    ) &&
    isPositiveInteger(
      columnSpan ?? 1,
    )
  )
}

export function getLayoutElementPlacement(
  element: BusLayoutElement,
): LayoutElementPlacement {
  if (
    !hasValidLayoutElementGeometry(
      element,
    )
  ) {
    throw new Error(
      `O elemento "${String(element.id)}" possui geometria inválida.`,
    )
  }

  const rowSpan =
    element.position.rowSpan ?? 1

  const columnSpan =
    element.position.columnSpan ?? 1

  return {
    element,

    deck: element.position.deck,

    row: element.position.row,
    column:
      element.position.column,

    rowSpan,
    columnSpan,

    rowEnd:
      element.position.row +
      rowSpan -
      1,

    columnEnd:
      element.position.column +
      columnSpan -
      1,
  }
}

function createCellKey(
  cell: LayoutGridCell,
) {
  return [
    cell.deck,
    cell.row,
    cell.column,
  ].join(':')
}

function getOccupiedCells(
  placement: LayoutElementPlacement,
): readonly LayoutGridCell[] {
  const cells: LayoutGridCell[] =
    []

  for (
    let row = placement.row;
    row <= placement.rowEnd;
    row += 1
  ) {
    for (
      let column =
        placement.column;
      column <=
      placement.columnEnd;
      column += 1
    ) {
      cells.push({
        deck: placement.deck,
        row,
        column,
      })
    }
  }

  return cells
}

export function findLayoutCollisions(
  elements: readonly BusLayoutElement[],
): readonly LayoutCollision[] {
  const occupiedCells = new Map<
    string,
    {
      cell: LayoutGridCell
      elementIds: string[]
    }
  >()

  for (const element of elements) {
    if (
      !hasValidLayoutElementGeometry(
        element,
      )
    ) {
      continue
    }

    const placement =
      getLayoutElementPlacement(
        element,
      )

    for (
      const cell of getOccupiedCells(
        placement,
      )
    ) {
      const key =
        createCellKey(cell)

      const existing =
        occupiedCells.get(key)

      if (existing) {
        existing.elementIds.push(
          String(element.id),
        )

        continue
      }

      occupiedCells.set(key, {
        cell,
        elementIds: [
          String(element.id),
        ],
      })
    }
  }

  return [...occupiedCells.values()]
    .filter(
      ({ elementIds }) =>
        elementIds.length > 1,
    )
    .map(
      ({
        cell,
        elementIds,
      }) => ({
        cell,
        elementIds,
      }),
    )
    .sort((a, b) => {
      return (
        a.cell.deck -
          b.cell.deck ||
        a.cell.row -
          b.cell.row ||
        a.cell.column -
          b.cell.column
      )
    })
}

function comparePlacements(
  a: LayoutElementPlacement,
  b: LayoutElementPlacement,
) {
  return (
    a.row -
      b.row ||
    a.column -
      b.column ||
    String(a.element.id).localeCompare(
      String(b.element.id),
    )
  )
}

export function buildLayoutModel(
  elements: readonly BusLayoutElement[],
): LayoutModel {
  const invalidElement =
    elements.find(
      (element) =>
        !hasValidLayoutElementGeometry(
          element,
        ),
    )

  if (invalidElement) {
    throw new Error(
      `Não é possível montar o layout: o elemento "${String(invalidElement.id)}" possui geometria inválida.`,
    )
  }

  const placements =
    elements.map(
      getLayoutElementPlacement,
    )

  const placementsByDeck =
    new Map<
      number,
      LayoutElementPlacement[]
    >()

  for (
    const placement of placements
  ) {
    const currentDeck =
      placementsByDeck.get(
        placement.deck,
      )

    if (currentDeck) {
      currentDeck.push(
        placement,
      )

      continue
    }

    placementsByDeck.set(
      placement.deck,
      [placement],
    )
  }

  const decks: LayoutDeckModel[] =
    [...placementsByDeck.entries()]
      .sort(
        ([deckA], [deckB]) =>
          deckA - deckB,
      )
      .map(
        ([
          deck,
          deckPlacements,
        ]) => {
          const sortedPlacements = [
            ...deckPlacements,
          ].sort(
            comparePlacements,
          )

          const rowCount =
            Math.max(
              ...sortedPlacements.map(
                (placement) =>
                  placement.rowEnd,
              ),
            )

          const columnCount =
            Math.max(
              ...sortedPlacements.map(
                (placement) =>
                  placement.columnEnd,
              ),
            )

          const seatCount =
            sortedPlacements.filter(
              ({ element }) =>
                element.kind ===
                'seat',
            ).length

          return {
            deck,

            rowCount,
            columnCount,

            elementCount:
              sortedPlacements.length,

            seatCount,

            placements:
              sortedPlacements,
          }
        },
      )

  return {
    decks,

    totalElements:
      elements.length,

    totalSeats:
      elements.filter(
        (element) =>
          element.kind === 'seat',
      ).length,

    collisions:
      findLayoutCollisions(
        elements,
      ),
  }
}
