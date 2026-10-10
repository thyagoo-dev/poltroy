import type { LayoutDeckModel } from '@/features/seat-map/domain/layout-engine'
import type { BusLayoutElement } from '@/features/seat-map/domain/layout-element'

/**
 * Display compatibility only. A deck must have exactly one driver and door,
 * both single-cell elements on its first row. Custom/ambiguous pairs stay intact.
 * Only their columns are swapped; persisted elements and seat IDs never change.
 */
export function orientFrontElements(
  elements: readonly BusLayoutElement[],
): readonly BusLayoutElement[] {
  const replacements = new Map<BusLayoutElement, number>()
  const decks = new Set(elements.map((element) => element.position.deck))

  for (const deck of decks) {
    const deckElements = elements.filter((element) => element.position.deck === deck)
    const drivers = deckElements.filter((element) => element.kind === 'driver')
    const doors = deckElements.filter((element) => element.kind === 'door')
    if (drivers.length !== 1 || doors.length !== 1) continue

    const driver = drivers[0]!
    const door = doors[0]!
    const frontRow = Math.min(...deckElements.map((element) => element.position.row))
    const isFrontCell = (element: BusLayoutElement) =>
      element.position.row === frontRow &&
      (element.position.rowSpan ?? 1) === 1 &&
      (element.position.columnSpan ?? 1) === 1

    if (!isFrontCell(driver) || !isFrontCell(door) || driver.position.column <= door.position.column) continue
    replacements.set(driver, door.position.column)
    replacements.set(door, driver.position.column)
  }

  if (!replacements.size) return elements
  return elements.map((element) => {
    const column = replacements.get(element)
    return column === undefined ? element : { ...element, position: { ...element.position, column } }
  })
}

/** A seat anywhere in a column takes priority over a partial/custom aisle. */
export function getLayoutColumnRoles(deck: LayoutDeckModel): readonly ('seat' | 'aisle')[] {
  return Array.from({ length: deck.columnCount }, (_, index) => {
    const column = index + 1
    const coversColumn = (kind: 'seat' | 'aisle') => deck.placements.some((placement) =>
      placement.element.kind === kind && placement.column <= column && placement.columnEnd >= column)
    return coversColumn('aisle') && !coversColumn('seat') ? 'aisle' : 'seat'
  })
}
