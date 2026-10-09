import type { PassengerRepository } from '@/features/passengers/application/passenger-repository'

export function listPassengers(repository: PassengerRepository) {
  return repository.list()
}
