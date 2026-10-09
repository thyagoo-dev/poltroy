import {
  useEffect,
  useState,
} from 'react'

import {
  getBusAction,
  listBusesAction,
} from '@/app/services/bus-actions'
import type { Bus } from '@/features/buses/domain/bus'
import { useBusSelectionStore } from '@/features/buses/ui/bus-selection-store'

export function useActiveBus() {
  const activeBusId =
    useBusSelectionStore(
      (state) =>
        state.activeBusId,
    )

  const revision =
    useBusSelectionStore(
      (state) =>
        state.revision,
    )

  const selectBus =
    useBusSelectionStore(
      (state) =>
        state.selectBus,
    )

  const clearBus =
    useBusSelectionStore(
      (state) =>
        state.clearBus,
    )

  const [
    activeBus,
    setActiveBus,
  ] = useState<
    Bus | undefined
  >()

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadActiveBus() {
      setIsLoading(true)

      try {
        if (activeBusId) {
          const bus =
            await getBusAction(
              activeBusId,
            )

          if (
            bus &&
            bus.status === 'ACTIVE'
          ) {
            if (!cancelled) {
              setActiveBus(bus)
            }

            return
          }

          if (cancelled) {
            return
          }

          clearBus()
          return
        }

        const buses =
          await listBusesAction()

        const firstActiveBus =
          buses.find(
            ({ bus }) =>
              bus.status ===
              'ACTIVE',
          )

        if (cancelled) {
          return
        }

        if (firstActiveBus) {
          selectBus(
            firstActiveBus.bus.id,
          )

          return
        }

        if (!cancelled) {
          setActiveBus(undefined)
        }
      } catch {
        if (!cancelled) {
          setActiveBus(undefined)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadActiveBus()

    return () => {
      cancelled = true
    }
  }, [
    activeBusId,
    revision,
    selectBus,
    clearBus,
  ])

  return {
    activeBus,
    activeBusId,
    isLoading,
  }
}
