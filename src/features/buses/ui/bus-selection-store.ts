import { create } from 'zustand'

import type { BusId } from '@/features/buses/domain/ids'

const STORAGE_KEY =
  'poltroy.active-bus-id'

interface BusSelectionState {
  activeBusId: BusId | null

  revision: number

  selectBus: (
    id: BusId,
  ) => void

  clearBus: () => void

  refreshActiveBus: () => void
}

function getStoredBusId():
  | BusId
  | null {
  if (
    typeof window === 'undefined'
  ) {
    return null
  }

  const value =
    window.localStorage.getItem(
      STORAGE_KEY,
    )

  return value
    ? (value as BusId)
    : null
}

export const useBusSelectionStore =
  create<BusSelectionState>(
    (set) => ({
      activeBusId:
        getStoredBusId(),

      revision: 0,

      selectBus: (id) => {
        window.localStorage.setItem(
          STORAGE_KEY,
          id,
        )

        set({
          activeBusId: id,
        })
      },

      clearBus: () => {
        window.localStorage.removeItem(
          STORAGE_KEY,
        )

        set({
          activeBusId: null,
        })
      },

      refreshActiveBus: () => {
        set((state) => ({
          revision:
            state.revision + 1,
        }))
      },
    }),
  )
