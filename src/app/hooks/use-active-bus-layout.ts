import { useEffect, useState } from 'react'

import { useActiveBus } from '@/app/hooks/use-active-bus'
import { getBusLayoutAction } from '@/app/services/bus-actions'
import type { BusLayout } from '@/features/buses/domain/bus-layout'
import type { BusLayoutId } from '@/features/buses/domain/ids'

interface ActiveLayoutState {
  id: BusLayoutId
  layout: BusLayout | undefined
  error: string | null
}

export function useActiveBusLayout() {
  const {
    activeBus,
    activeBusId,
    isLoading: isLoadingBus,
  } = useActiveBus()

  const currentBus = activeBus?.id === activeBusId ? activeBus : undefined
  const activeLayoutId = currentBus?.activeLayoutId
  const [layoutState, setLayoutState] = useState<ActiveLayoutState>()

  useEffect(() => {
    if (!activeLayoutId) {
      return
    }

    let cancelled = false

    void getBusLayoutAction(activeLayoutId)
      .then((layout) => {
        if (!cancelled) {
          setLayoutState({
            id: activeLayoutId,
            layout,
            error: layout
              ? null
              : 'O layout ativo deste ônibus não foi encontrado.',
          })
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLayoutState({
            id: activeLayoutId,
            layout: undefined,
            error: 'Não foi possível carregar o layout do ônibus.',
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [activeLayoutId])

  const currentLayoutState = activeLayoutId && layoutState?.id === activeLayoutId
    ? layoutState
    : undefined

  return {
    activeBus: currentBus,
    activeBusId,
    activeLayout: currentLayoutState?.layout,
    isLoading: isLoadingBus
      || Boolean(activeBusId && !currentBus)
      || Boolean(activeLayoutId && !currentLayoutState),
    error: currentLayoutState?.error ?? null,
  }
}
