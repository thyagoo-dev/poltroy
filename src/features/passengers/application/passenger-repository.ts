import type { PassengerId } from '@/features/passengers/domain/ids'
import type { Passenger } from '@/features/passengers/domain/passenger'

export interface PassengerRepository {
  getById(
    id: PassengerId,
  ): Promise<Passenger | undefined>

  list(): Promise<readonly Passenger[]>

  save(passenger: Passenger): Promise<void>

  delete(id: PassengerId): Promise<void>
}
