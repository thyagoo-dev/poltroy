import {
  describe,
  expect,
  it,
} from 'vitest'

import {
  busLayoutPresets,
  createBusLayoutElements,
} from '@/features/buses/application/bus-layout-presets'
import type { BusLayout } from '@/features/buses/domain/bus-layout'
import { validateBusLayout } from '@/features/buses/domain/bus-layout'
import type {
  BusId,
  BusLayoutId,
} from '@/features/buses/domain/ids'

describe('bus layout presets', () => {
  it.each(busLayoutPresets)('preserva numeração, IDs e orientação para $id', (preset) => {
    const elements = createBusLayoutElements(preset.id)
    const seats = elements.filter((element) => element.kind === 'seat')
    expect(seats.map((seat) => seat.seatNumber)).toEqual(
      Array.from({ length: preset.seatCount }, (_, index) => String(index + 1).padStart(2, '0')),
    )
    expect(new Set(elements.map((element) => element.id)).size).toBe(elements.length)
    const driver = elements.find((element) => element.kind === 'driver')!
    const door = elements.find((element) => element.kind === 'door')!
    expect(driver.position).toEqual({ deck: 1, row: 1, column: 1 })
    expect(door.position).toEqual({ deck: 1, row: 1, column: preset.configuration === '2+2' ? 5 : 4 })
    expect(elements.find((element) => element.kind === 'aisle')?.position).toEqual({
      deck: 1, row: 2, column: 3, rowSpan: Math.ceil(preset.seatCount / (preset.configuration === '2+2' ? 4 : 3)),
    })
  })

  it('gera a última fileira parcial de 46 pelo algoritmo comum', () => {
    const seats = createBusLayoutElements('conventional-46').filter((element) => element.kind === 'seat')
    expect(seats.slice(-2).map((seat) => ({ number: seat.seatNumber, ...seat.position }))).toEqual([
      { number: '45', deck: 1, row: 13, column: 1 },
      { number: '46', deck: 1, row: 13, column: 2 },
    ])
  })
  it.each(
    busLayoutPresets,
  )(
    'gera $seatCount assentos para $name',
    (preset) => {
      const elements =
        createBusLayoutElements(
          preset.id,
        )

      const seats =
        elements.filter(
          (element) =>
            element.kind ===
            'seat',
        )

      expect(
        seats,
      ).toHaveLength(
        preset.seatCount,
      )
    },
  )

  it.each(
    busLayoutPresets,
  )(
    'gera um layout válido para $name',
    (preset) => {
      const layout: BusLayout = {
        id: 'layout-test' as BusLayoutId,
        busId: 'bus-test' as BusId,

        name: preset.name,
        version: 1,

        elements:
          createBusLayoutElements(
            preset.id,
          ),

        createdAt:
          '2026-10-09T00:00:00.000Z',

        updatedAt:
          '2026-10-09T00:00:00.000Z',
      }

      expect(
        validateBusLayout(
          layout,
        ),
      ).toEqual([])
    },
  )
})
