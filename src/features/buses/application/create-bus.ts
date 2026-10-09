import type { BusRepository } from '@/features/buses/application/bus-repository'
import {
  createBusLayoutElements,
  getBusLayoutPreset,
  type BusLayoutPresetId,
} from '@/features/buses/application/bus-layout-presets'
import {
  type BusLayout,
  validateBusLayout,
} from '@/features/buses/domain/bus-layout'
import type { Bus } from '@/features/buses/domain/bus'
import type {
  BusId,
  BusLayoutId,
} from '@/features/buses/domain/ids'
import { createEntityId } from '@/shared/lib/create-entity-id'
import { createEntityTimestamps } from '@/shared/lib/timestamps'

export interface CreateBusInput {
  name: string

  plate?: string
  model?: string

  presetId: BusLayoutPresetId
}

export interface CreateBusDependencies {
  busRepository: BusRepository
}

function normalizeRequiredText(
  value: string,
  fieldName: string,
) {
  const normalized = value.trim()

  if (!normalized) {
    throw new Error(
      `${fieldName} é obrigatório.`,
    )
  }

  return normalized
}

function normalizeOptionalText(
  value: string | undefined,
) {
  const normalized = value?.trim()

  return normalized || undefined
}

export async function createBus(
  input: CreateBusInput,
  dependencies: CreateBusDependencies,
): Promise<Bus> {
  const name = normalizeRequiredText(
    input.name,
    'Nome do ônibus',
  )

  const preset =
    getBusLayoutPreset(input.presetId)

  const busId = createEntityId<BusId>()

  const layoutId =
    createEntityId<BusLayoutId>()

  const timestamps =
    createEntityTimestamps()

  const layout: BusLayout = {
    id: layoutId,
    busId,

    name: preset.name,
    version: 1,

    elements:
      createBusLayoutElements(
        preset.id,
      ),

    ...timestamps,
  }

  const layoutIssues =
    validateBusLayout(layout)

  if (layoutIssues.length > 0) {
    throw new Error(
      `O layout inicial do ônibus é inválido: ${layoutIssues[0]?.message}`,
    )
  }

  const bus: Bus = {
    id: busId,

    name,

    plate: normalizeOptionalText(
      input.plate,
    )?.toUpperCase(),

    model: normalizeOptionalText(
      input.model,
    ),

    activeLayoutId: layoutId,

    status: 'ACTIVE',

    ...timestamps,
  }

  await dependencies.busRepository
    .saveWithLayout(
      bus,
      layout,
    )

  return bus
}
