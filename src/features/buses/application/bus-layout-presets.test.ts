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
