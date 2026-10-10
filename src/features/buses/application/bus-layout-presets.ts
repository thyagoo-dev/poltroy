import type { BusLayoutElement } from '@/features/seat-map/domain/layout-element'
import type {
  LayoutElementId,
  SeatId,
} from '@/features/seat-map/domain/ids'
import type { SeatType } from '@/features/seat-map/domain/seat'
import { createEntityId } from '@/shared/lib/create-entity-id'

export type BusLayoutPresetId =
  | 'conventional-46'
  | 'conventional-44'
  | 'executive-40'
  | 'sleeper-30'

export interface BusLayoutPreset {
  id: BusLayoutPresetId

  name: string
  description: string

  configuration: '2+2' | '2+1'

  seatCount: number
  seatType: SeatType
}

export const busLayoutPresets: readonly BusLayoutPreset[] = [
  {
    id: 'conventional-44',

    name: 'Convencional 2+2',
    description:
      'Configuração inicial com 44 lugares e corredor central.',

    configuration: '2+2',

    seatCount: 44,
    seatType: 'STANDARD',
  },

  {
    id: 'conventional-46',
    name: 'Convencional 2+2',
    description: 'Configuração com 46 lugares e corredor central.',
    configuration: '2+2',
    seatCount: 46,
    seatType: 'STANDARD',
  },

  {
    id: 'executive-40',

    name: 'Executivo 2+2',
    description:
      'Configuração inicial com 40 lugares e maior espaçamento entre fileiras.',

    configuration: '2+2',

    seatCount: 40,
    seatType: 'EXECUTIVE',
  },

  {
    id: 'sleeper-30',

    name: 'Leito 2+1',
    description:
      'Configuração inicial com 30 lugares distribuídos em duas poltronas de um lado e uma do outro.',

    configuration: '2+1',

    seatCount: 30,
    seatType: 'SLEEPER',
  },
]

export function getBusLayoutPreset(
  presetId: BusLayoutPresetId,
): BusLayoutPreset {
  const preset = busLayoutPresets.find(
    ({ id }) => id === presetId,
  )

  if (!preset) {
    throw new Error(
      `Preset de layout "${presetId}" não encontrado.`,
    )
  }

  return preset
}

function formatSeatNumber(
  seatNumber: number,
) {
  return seatNumber
    .toString()
    .padStart(2, '0')
}

function createTwoByTwoSeats(
  seatCount: number,
  seatType: SeatType,
): BusLayoutElement[] {
  const elements: BusLayoutElement[] = []

  const seatColumns = [
    1,
    2,
    4,
    5,
  ] as const

  const rows = Math.ceil(
    seatCount / seatColumns.length,
  )

  let currentSeat = 1

  for (
    let rowIndex = 0;
    rowIndex < rows;
    rowIndex += 1
  ) {
    const row = rowIndex + 2

    for (const column of seatColumns) {
      if (currentSeat > seatCount) {
        break
      }

      elements.push({
        id: createEntityId<SeatId>(),

        kind: 'seat',

        seatNumber:
          formatSeatNumber(currentSeat),

        seatType,

        position: {
          deck: 1,
          row,
          column,
        },
      })

      currentSeat += 1
    }
  }

  elements.push({
    id: createEntityId<LayoutElementId>(),

    kind: 'aisle',

    label: 'Corredor',

    position: {
      deck: 1,
      row: 2,
      column: 3,
      rowSpan: rows,
    },
  })

  elements.push({
    id: createEntityId<LayoutElementId>(),

    kind: 'driver',

    label: 'Motorista',

    position: {
      deck: 1,
      row: 1,
      column: 1,
    },
  })

  elements.push({
    id: createEntityId<LayoutElementId>(),

    kind: 'door',

    label: 'Entrada',

    position: {
      deck: 1,
      row: 1,
      column: 5,
    },
  })

  return elements
}

function createTwoByOneSeats(
  seatCount: number,
  seatType: SeatType,
): BusLayoutElement[] {
  const elements: BusLayoutElement[] = []

  const seatColumns = [
    1,
    2,
    4,
  ] as const

  const rows = Math.ceil(
    seatCount / seatColumns.length,
  )

  let currentSeat = 1

  for (
    let rowIndex = 0;
    rowIndex < rows;
    rowIndex += 1
  ) {
    const row = rowIndex + 2

    for (const column of seatColumns) {
      if (currentSeat > seatCount) {
        break
      }

      elements.push({
        id: createEntityId<SeatId>(),

        kind: 'seat',

        seatNumber:
          formatSeatNumber(currentSeat),

        seatType,

        position: {
          deck: 1,
          row,
          column,
        },
      })

      currentSeat += 1
    }
  }

  elements.push({
    id: createEntityId<LayoutElementId>(),

    kind: 'aisle',

    label: 'Corredor',

    position: {
      deck: 1,
      row: 2,
      column: 3,
      rowSpan: rows,
    },
  })

  elements.push({
    id: createEntityId<LayoutElementId>(),

    kind: 'driver',

    label: 'Motorista',

    position: {
      deck: 1,
      row: 1,
      column: 1,
    },
  })

  elements.push({
    id: createEntityId<LayoutElementId>(),

    kind: 'door',

    label: 'Entrada',

    position: {
      deck: 1,
      row: 1,
      column: 4,
    },
  })

  return elements
}

export function createBusLayoutElements(
  presetId: BusLayoutPresetId,
): readonly BusLayoutElement[] {
  const preset =
    getBusLayoutPreset(presetId)

  if (
    preset.configuration === '2+2'
  ) {
    return createTwoByTwoSeats(
      preset.seatCount,
      preset.seatType,
    )
  }

  return createTwoByOneSeats(
    preset.seatCount,
    preset.seatType,
  )
}
