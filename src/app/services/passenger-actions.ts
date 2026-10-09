import { createPassenger } from '@/features/passengers/application/create-passenger'
import { listPassengers } from '@/features/passengers/application/list-passengers'
import type { PassengerInputFields } from '@/features/passengers/application/passenger-input'
import { updatePassenger, type UpdatePassengerInput } from '@/features/passengers/application/update-passenger'
import { passengerRepository } from '@/infrastructure/repositories/repositories'

export function createPassengerAction(input: PassengerInputFields) {
  return createPassenger(input, passengerRepository)
}

export function updatePassengerAction(input: UpdatePassengerInput) {
  return updatePassenger(input, passengerRepository)
}

export function listPassengersAction() {
  return listPassengers(passengerRepository)
}
