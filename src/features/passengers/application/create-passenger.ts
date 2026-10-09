import { normalizePassengerFields, type PassengerInputFields } from '@/features/passengers/application/passenger-input'
import type { PassengerRepository } from '@/features/passengers/application/passenger-repository'
import type { PassengerId } from '@/features/passengers/domain/ids'
import type { Passenger } from '@/features/passengers/domain/passenger'
import { createEntityId } from '@/shared/lib/create-entity-id'
import { createEntityTimestamps } from '@/shared/lib/timestamps'

export async function createPassenger(
  input: PassengerInputFields,
  repository: PassengerRepository,
): Promise<Passenger> {
  const passenger: Passenger = {
    id: createEntityId<PassengerId>(),
    ...normalizePassengerFields(input),
    ...createEntityTimestamps(),
  }
  await repository.save(passenger)
  return passenger
}
