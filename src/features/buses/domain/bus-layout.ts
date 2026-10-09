import type {
  BusId,
  BusLayoutId,
} from '@/features/buses/domain/ids'
import type { BusLayoutElement } from '@/features/seat-map/domain/layout-element'
import type { EntityTimestamps } from '@/shared/domain/entity'

export interface BusLayout extends EntityTimestamps {
  id: BusLayoutId
  busId: BusId

  name: string
  version: number

  elements: readonly BusLayoutElement[]
}

export type BusLayoutValidationIssueCode =
  | 'INVALID_VERSION'
  | 'DUPLICATE_ELEMENT_ID'
  | 'EMPTY_SEAT_NUMBER'
  | 'DUPLICATE_SEAT_NUMBER'
  | 'INVALID_GRID_POSITION'
  | 'INVALID_GRID_SPAN'

export interface BusLayoutValidationIssue {
  code: BusLayoutValidationIssueCode
  message: string
}

function isPositiveInteger(value: number) {
  return Number.isInteger(value) && value >= 1
}

export function validateBusLayout(
  layout: BusLayout,
): readonly BusLayoutValidationIssue[] {
  const issues: BusLayoutValidationIssue[] = []

  if (!isPositiveInteger(layout.version)) {
    issues.push({
      code: 'INVALID_VERSION',
      message: 'A versão do layout deve ser um inteiro positivo.',
    })
  }

  const elementIds = new Set<string>()
  const seatNumbers = new Set<string>()

  for (const element of layout.elements) {
    const elementId = String(element.id)

    if (elementIds.has(elementId)) {
      issues.push({
        code: 'DUPLICATE_ELEMENT_ID',
        message: `O elemento "${elementId}" está duplicado no layout.`,
      })
    }

    elementIds.add(elementId)

    const {
      deck,
      row,
      column,
      rowSpan,
      columnSpan,
    } = element.position

    if (
      !isPositiveInteger(deck) ||
      !isPositiveInteger(row) ||
      !isPositiveInteger(column)
    ) {
      issues.push({
        code: 'INVALID_GRID_POSITION',
        message: `O elemento "${elementId}" possui uma posição inválida.`,
      })
    }

    if (
      (rowSpan !== undefined &&
        !isPositiveInteger(rowSpan)) ||
      (columnSpan !== undefined &&
        !isPositiveInteger(columnSpan))
    ) {
      issues.push({
        code: 'INVALID_GRID_SPAN',
        message: `O elemento "${elementId}" possui uma dimensão inválida.`,
      })
    }

    if (element.kind !== 'seat') {
      continue
    }

    const normalizedSeatNumber =
      element.seatNumber.trim().toLowerCase()

    if (!normalizedSeatNumber) {
      issues.push({
        code: 'EMPTY_SEAT_NUMBER',
        message: `O assento "${elementId}" precisa possuir identificação.`,
      })

      continue
    }

    if (seatNumbers.has(normalizedSeatNumber)) {
      issues.push({
        code: 'DUPLICATE_SEAT_NUMBER',
        message: `O assento "${element.seatNumber}" está duplicado no layout.`,
      })
    }

    seatNumbers.add(normalizedSeatNumber)
  }

  return issues
}
