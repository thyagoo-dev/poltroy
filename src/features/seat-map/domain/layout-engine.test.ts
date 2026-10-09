import {
  describe,
  expect,
  it,
} from 'vitest'

import type { BusLayoutElement } from '@/features/seat-map/domain/layout-element'
import {
  buildLayoutModel,
  findLayoutCollisions,
  getLayoutElementPlacement,
} from '@/features/seat-map/domain/layout-engine'
import type {
  LayoutElementId,
  SeatId,
} from '@/features/seat-map/domain/ids'

function createSeat(
  id: string,
  seatNumber: string,
  row: number,
  column: number,
  deck = 1,
): BusLayoutElement {
  return {
    id: id as SeatId,

    kind: 'seat',

    seatNumber,
    seatType: 'STANDARD',

    position: {
      deck,
      row,
      column,
    },
  }
}

describe(
  'layout engine',
  () => {
    it(
      'calcula as dimensões lógicas do deck',
      () => {
        const elements:
          BusLayoutElement[] =
          [
            createSeat(
              'seat-1',
              '01',
              2,
              1,
            ),

            {
              id: 'driver-1' as LayoutElementId,

              kind: 'driver',

              position: {
                deck: 1,
                row: 1,
                column: 5,
              },
            },
          ]

        const model =
          buildLayoutModel(
            elements,
          )

        expect(
          model.decks,
        ).toHaveLength(1)

        expect(
          model.decks[0],
        ).toMatchObject({
          deck: 1,

          rowCount: 2,
          columnCount: 5,

          elementCount: 2,
          seatCount: 1,
        })

        expect(
          model.totalElements,
        ).toBe(2)

        expect(
          model.totalSeats,
        ).toBe(1)
      },
    )

    it(
      'considera rowSpan e columnSpan nos limites',
      () => {
        const element:
          BusLayoutElement =
          {
            id: 'technical-1' as LayoutElementId,

            kind: 'technical',

            position: {
              deck: 1,

              row: 3,
              column: 2,

              rowSpan: 4,
              columnSpan: 3,
            },
          }

        const placement =
          getLayoutElementPlacement(
            element,
          )

        expect(
          placement,
        ).toMatchObject({
          row: 3,
          column: 2,

          rowSpan: 4,
          columnSpan: 3,

          rowEnd: 6,
          columnEnd: 4,
        })

        const model =
          buildLayoutModel([
            element,
          ])

        expect(
          model.decks[0],
        ).toMatchObject({
          rowCount: 6,
          columnCount: 4,
        })
      },
    )

    it(
      'separa e ordena múltiplos decks',
      () => {
        const elements:
          BusLayoutElement[] =
          [
            createSeat(
              'seat-deck-2',
              '02',
              3,
              4,
              2,
            ),

            createSeat(
              'seat-deck-1',
              '01',
              2,
              1,
              1,
            ),
          ]

        const model =
          buildLayoutModel(
            elements,
          )

        expect(
          model.decks.map(
            ({ deck }) =>
              deck,
          ),
        ).toEqual([
          1,
          2,
        ])

        expect(
          model.decks[0],
        ).toMatchObject({
          rowCount: 2,
          columnCount: 1,
        })

        expect(
          model.decks[1],
        ).toMatchObject({
          rowCount: 3,
          columnCount: 4,
        })
      },
    )

    it(
      'detecta dois elementos na mesma célula',
      () => {
        const collisions =
          findLayoutCollisions([
            createSeat(
              'seat-1',
              '01',
              2,
              1,
            ),

            createSeat(
              'seat-2',
              '02',
              2,
              1,
            ),
          ])

        expect(
          collisions,
        ).toHaveLength(1)

        expect(
          collisions[0],
        ).toEqual({
          cell: {
            deck: 1,
            row: 2,
            column: 1,
          },

          elementIds: [
            'seat-1',
            'seat-2',
          ],
        })
      },
    )

    it(
      'detecta colisão provocada por span',
      () => {
        const aisle:
          BusLayoutElement =
          {
            id: 'aisle-1' as LayoutElementId,

            kind: 'aisle',

            position: {
              deck: 1,

              row: 2,
              column: 3,

              rowSpan: 4,
            },
          }

        const door:
          BusLayoutElement =
          {
            id: 'door-1' as LayoutElementId,

            kind: 'door',

            position: {
              deck: 1,
              row: 5,
              column: 3,
            },
          }

        const collisions =
          findLayoutCollisions([
            aisle,
            door,
          ])

        expect(
          collisions,
        ).toEqual([
          {
            cell: {
              deck: 1,
              row: 5,
              column: 3,
            },

            elementIds: [
              'aisle-1',
              'door-1',
            ],
          },
        ])
      },
    )

    it(
      'recusa montar modelo com geometria inválida',
      () => {
        const invalidSeat:
          BusLayoutElement =
          {
            id: 'seat-invalid' as SeatId,

            kind: 'seat',

            seatNumber: '01',
            seatType: 'STANDARD',

            position: {
              deck: 1,
              row: 0,
              column: 1,
            },
          }

        expect(() =>
          buildLayoutModel([
            invalidSeat,
          ]),
        ).toThrow(
          /geometria inválida/i,
        )
      },
    )
  },
)
