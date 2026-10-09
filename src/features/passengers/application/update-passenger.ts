import { normalizePassengerFields, type PassengerInputFields } from '@/features/passengers/application/passenger-input'
import type { PassengerRepository } from '@/features/passengers/application/passenger-repository'
import type { PassengerId } from '@/features/passengers/domain/ids'
import type { Passenger } from '@/features/passengers/domain/passenger'
import { toIsoTimestamp } from '@/shared/lib/timestamps'

export interface UpdatePassengerInput extends PassengerInputFields {
  id: PassengerId
}

export async function updatePassenger(
  input: UpdatePassengerInput,
  repository: PassengerRepository,
): Promise<Passenger> {
  const existing = await repository.getById(input.id)
  if (!existing) throw new Error('Passageiro não encontrado.')

  const passenger: Passenger = {
    ...existing,
    ...normalizePassengerFields(input),
    updatedAt: toIsoTimestamp(),
  }
  await repository.save(passenger)
  return passenger
}
