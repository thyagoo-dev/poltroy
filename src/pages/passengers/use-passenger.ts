import { useEffect, useState } from 'react'

import { getPassengerAction } from '@/app/services/passenger-actions'
import type { PassengerId } from '@/features/passengers/domain/ids'
import type { Passenger } from '@/features/passengers/domain/passenger'

type PassengerState =
  | { status: 'loading' | 'not-found' | 'error'; passenger?: never }
  | { status: 'ready'; passenger: Passenger }

export function usePassenger(passengerId: string | undefined): PassengerState {
  const [result, setResult] = useState<PassengerState & { id: string | undefined }>({ id: passengerId, status: 'loading' })

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const passenger = passengerId ? await getPassengerAction(passengerId as PassengerId) : undefined
        if (!cancelled) setResult(passenger
          ? { id: passengerId, status: 'ready', passenger }
          : { id: passengerId, status: 'not-found' })
      } catch {
        if (!cancelled) setResult({ id: passengerId, status: 'error' })
      }
    }
    void load()
    return () => { cancelled = true }
  }, [passengerId])

  // A parameter change must never expose the previous passenger while loading.
  return result.id === passengerId ? result : { status: 'loading' }
}
