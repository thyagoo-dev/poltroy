import type { BusRepository } from '@/features/buses/application/bus-repository'
import type { Bus } from '@/features/buses/domain/bus'
import type { BusId } from '@/features/buses/domain/ids'
import { toIsoTimestamp } from '@/shared/lib/timestamps'

export interface UpdateBusInput {
  id: BusId

  name: string

  plate?: string
  model?: string
}

export interface UpdateBusDependencies {
  busRepository: BusRepository
}

function normalizeOptionalText(
  value: string | undefined,
) {
  const normalized = value?.trim()

  return normalized || undefined
}

export async function updateBus(
  input: UpdateBusInput,
  dependencies: UpdateBusDependencies,
): Promise<Bus> {
  const currentBus =
    await dependencies.busRepository
      .getById(input.id)

  if (!currentBus) {
    throw new Error(
      'Ônibus não encontrado.',
    )
  }

  const name = input.name.trim()

  if (!name) {
    throw new Error(
      'Nome do ônibus é obrigatório.',
    )
  }

  const updatedBus: Bus = {
    ...currentBus,

    name,

    plate: normalizeOptionalText(
      input.plate,
    )?.toUpperCase(),

    model: normalizeOptionalText(
      input.model,
    ),

    updatedAt: toIsoTimestamp(),
  }

  await dependencies.busRepository.save(
    updatedBus,
  )

  return updatedBus
}
