import { create } from 'zustand'

import type { TripId } from '@/features/trips/domain/ids'

const STORAGE_KEY =
  'poltroy.operational-trip-id'

interface TripOperationState {
  operationalTripId:
    | TripId
    | null

  selectOperationalTrip: (
    id: TripId,
  ) => void

  clearOperationalTrip:
    () => void
}

function getStoredTripId():
  | TripId
  | null {
  if (
    typeof window ===
    'undefined'
  ) {
    return null
  }

  const value =
    window.localStorage.getItem(
      STORAGE_KEY,
    )

  return value
    ? (value as TripId)
    : null
}

export const useTripOperationStore =
  create<TripOperationState>(
    (set) => ({
      operationalTripId:
        getStoredTripId(),

      selectOperationalTrip: (
        id,
      ) => {
        if (
          typeof window !==
          'undefined'
        ) {
          window.localStorage.setItem(
            STORAGE_KEY,
            id,
          )
        }

        set({
          operationalTripId:
            id,
        })
      },

      clearOperationalTrip:
        () => {
          if (
            typeof window !==
            'undefined'
          ) {
            window.localStorage.removeItem(
              STORAGE_KEY,
            )
          }

          set({
            operationalTripId:
              null,
          })
        },
    }),
  )
