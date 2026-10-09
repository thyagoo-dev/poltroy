import {
  describe,
  expect,
  it,
} from 'vitest'

import type {
  BusId,
  BusLayoutId,
} from '@/features/buses/domain/ids'
import {
  type BusLayout,
  validateBusLayout,
} from '@/features/buses/domain/bus-layout'
import type {
  LayoutElementId,
  SeatId,
} from '@/features/seat-map/domain/ids'

const busId = 'bus-1' as BusId
const layoutId = 'layout-1' as BusLayoutId

function createLayout(
  elements: BusLayout['elements'],
): BusLayout {
  return {
    id: layoutId,
    busId,

    name: 'Layout principal',
    version: 1,

    elements,

    createdAt: '2026-10-09T00:00:00.000Z',
    updatedAt: '2026-10-09T00:00:00.000Z',
  }
}

describe('validateBusLayout', () => {
  it('aceita um layout básico válido', () => {
    const layout = createLayout([
      {
        id: 'seat-1' as SeatId,
        kind: 'seat',
        seatNumber: '01',
        seatType: 'STANDARD',
        position: {
          deck: 1,
          row: 1,
          column: 1,
        },
      },
      {
        id: 'driver-1' as LayoutElementId,
        kind: 'driver',
        position: {
          deck: 1,
          row: 1,
          column: 4,
        },
      },
    ])

    expect(validateBusLayout(layout)).toEqual([])
  })

  it('detecta números de assento duplicados', () => {
    const layout = createLayout([
      {
        id: 'seat-1' as SeatId,
        kind: 'seat',
        seatNumber: '01',
        seatType: 'STANDARD',
        position: {
          deck: 1,
          row: 1,
          column: 1,
        },
      },
      {
        id: 'seat-2' as SeatId,
        kind: 'seat',
        seatNumber: '01',
        seatType: 'STANDARD',
        position: {
          deck: 1,
          row: 2,
          column: 1,
        },
      },
    ])

    expect(validateBusLayout(layout)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'DUPLICATE_SEAT_NUMBER',
        }),
      ]),
    )
  })

  it('detecta identificação de elemento duplicada', () => {
    const duplicatedId =
      'element-1' as LayoutElementId

    const layout = createLayout([
      {
        id: duplicatedId,
        kind: 'driver',
        position: {
          deck: 1,
          row: 1,
          column: 4,
        },
      },
      {
        id: duplicatedId,
        kind: 'door',
        position: {
          deck: 1,
          row: 2,
          column: 4,
        },
      },
    ])

    expect(validateBusLayout(layout)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'DUPLICATE_ELEMENT_ID',
        }),
      ]),
    )
  })

  it('detecta posições inválidas no grid', () => {
    const layout = createLayout([
      {
        id: 'seat-1' as SeatId,
        kind: 'seat',
        seatNumber: '01',
        seatType: 'STANDARD',
        position: {
          deck: 0,
          row: 1,
          column: 1,
        },
      },
    ])

    expect(validateBusLayout(layout)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'INVALID_GRID_POSITION',
        }),
      ]),
    )
  })

  it('detecta versão inválida', () => {
    const layout: BusLayout = {
      ...createLayout([]),
      version: 0,
    }

    expect(validateBusLayout(layout)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'INVALID_VERSION',
        }),
      ]),
    )
  })
})
