import { describe, expect, it } from 'vitest'

import { createBusLayoutElements } from '@/features/buses/application/bus-layout-presets'
import type { LayoutElementId } from '@/features/seat-map/domain/ids'
import { buildLayoutModel } from '@/features/seat-map/domain/layout-engine'
import type { BusLayoutElement } from '@/features/seat-map/domain/layout-element'
import { getLayoutColumnRoles, orientFrontElements } from '@/features/seat-map/ui/seat-map-presentation'

function legacyElements() {
  return createBusLayoutElements('conventional-44').map((element) => {
    if (element.kind !== 'driver' && element.kind !== 'door') return element
    return { ...element, position: { ...element.position, column: element.kind === 'driver' ? 5 : 1 } }
  })
}

describe('front presentation compatibility', () => {
  it('corrige o legado sem mutar entrada, assentos ou IDs; é idempotente', () => {
    const elements = legacyElements()
    const before = JSON.stringify(elements)
    for (const element of elements) {
      Object.freeze(element.position)
      Object.freeze(element)
    }
    Object.freeze(elements)
    const shown = orientFrontElements(elements)
    expect(shown.find((element) => element.kind === 'driver')?.position.column).toBe(1)
    expect(shown.find((element) => element.kind === 'door')?.position.column).toBe(5)
    expect(shown.map((element) => element.id)).toEqual(elements.map((element) => element.id))
    expect(shown.filter((element) => element.kind === 'seat')).toEqual(elements.filter((element) => element.kind === 'seat'))
    expect(shown.filter((element) => element.kind === 'seat').every((element) => elements.includes(element))).toBe(true)
    expect(JSON.stringify(elements)).toBe(before)
    expect(orientFrontElements(shown)).toBe(shown)
    expect(buildLayoutModel(shown).collisions).toEqual([])
  })

  it('mantém layouts já orientados', () => {
    const elements = createBusLayoutElements('sleeper-30')
    expect(orientFrontElements(elements)).toBe(elements)
  })

  it('mantém caso ambíguo com mais de uma porta', () => {
    const elements = legacyElements()
    elements.push({ id: 'extra-door' as LayoutElementId, kind: 'door', position: { deck: 1, row: 13, column: 5 } })
    expect(orientFrontElements(elements)).toBe(elements)
  })

  it('não troca elementos em fileiras diferentes ou fora da frente', () => {
    for (const sameRow of [false, true]) {
      const elements = legacyElements().map((element) => element.kind === 'driver' || (sameRow && element.kind === 'door')
        ? { ...element, position: { ...element.position, row: 3 } } : element)
      expect(orientFrontElements(elements)).toBe(elements)
    }
  })

  it('não troca referências customizadas com spans', () => {
    const elements = legacyElements().map((element) => element.kind === 'driver'
      ? { ...element, position: { ...element.position, columnSpan: 2 } } : element)
    expect(orientFrontElements(elements)).toBe(elements)
  })

  it('normaliza por deck, preservando outro deck sem par frontal', () => {
    const elements: BusLayoutElement[] = [...legacyElements(), {
      id: 'upper-door' as LayoutElementId, kind: 'door', position: { deck: 2, row: 1, column: 2 },
    }]
    const shown = orientFrontElements(elements)
    expect(shown.find((element) => element.kind === 'driver')?.position.column).toBe(1)
    expect(shown.at(-1)).toBe(elements.at(-1))
  })
})

describe('column roles', () => {
  it.each(['conventional-46', 'conventional-44', 'executive-40', 'sleeper-30'] as const)(
    'deriva corredor e colunas de assento para %s', (preset) => {
      const deck = buildLayoutModel(createBusLayoutElements(preset)).decks[0]!
      expect(getLayoutColumnRoles(deck)).toEqual(preset === 'sleeper-30'
        ? ['seat', 'seat', 'aisle', 'seat'] : ['seat', 'seat', 'aisle', 'seat', 'seat'])
    },
  )

  it('preserva largura de uma coluna quando corredor parcial compartilha assento com span', () => {
    const elements = createBusLayoutElements('sleeper-30').map((element) => element.kind === 'aisle'
      ? { ...element, position: { ...element.position, row: 3, rowSpan: 9 } }
      : element.kind === 'seat' && element.seatNumber === '02'
        ? { ...element, position: { ...element.position, columnSpan: 2 } } : element)
    const deck = buildLayoutModel(elements).decks[0]!
    expect(getLayoutColumnRoles(deck)).toEqual(['seat', 'seat', 'seat', 'seat'])
  })

  it('deriva corredores com span em layout largo sem deslocar placements', () => {
    const elements = createBusLayoutElements('sleeper-30').map((element) => element.kind === 'aisle'
      ? { ...element, position: { ...element.position, column: 6, columnSpan: 2 } }
      : element.kind === 'door' ? { ...element, position: { ...element.position, column: 12 } } : element)
    const deck = buildLayoutModel(elements).decks[0]!
    const roles = getLayoutColumnRoles(deck)
    expect(roles).toHaveLength(12)
    expect(roles.filter((role) => role === 'aisle')).toHaveLength(2)
    expect(roles.slice(5, 7)).toEqual(['aisle', 'aisle'])
    expect(deck.placements.find((placement) => placement.element.kind === 'door')?.column).toBe(12)
  })
})
