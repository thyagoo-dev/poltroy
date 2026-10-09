import {
  archiveBus,
} from '@/features/buses/application/archive-bus'
import {
  createBus,
  type CreateBusInput,
} from '@/features/buses/application/create-bus'
import {
  duplicateBus,
} from '@/features/buses/application/duplicate-bus'
import {
  getBus,
} from '@/features/buses/application/get-bus'
import {
  getBusLayout,
} from '@/features/buses/application/get-bus-layout'
import {
  listBuses,
} from '@/features/buses/application/list-buses'
import {
  restoreBus,
} from '@/features/buses/application/restore-bus'
import {
  updateBus,
  type UpdateBusInput,
} from '@/features/buses/application/update-bus'
import type {
  BusId,
  BusLayoutId,
} from '@/features/buses/domain/ids'
import {
  busLayoutRepository,
  busRepository,
} from '@/infrastructure/repositories/repositories'

export function createBusAction(
  input: CreateBusInput,
) {
  return createBus(
    input,
    {
      busRepository,
    },
  )
}

export function updateBusAction(
  input: UpdateBusInput,
) {
  return updateBus(
    input,
    {
      busRepository,
    },
  )
}

export function archiveBusAction(
  id: BusId,
) {
  return archiveBus(
    id,
    {
      busRepository,
    },
  )
}

export function restoreBusAction(
  id: BusId,
) {
  return restoreBus(
    id,
    {
      busRepository,
    },
  )
}

export function duplicateBusAction(
  id: BusId,
) {
  return duplicateBus(
    id,
    {
      busRepository,
      busLayoutRepository,
    },
  )
}

export function getBusAction(
  id: BusId,
) {
  return getBus(
    id,
    busRepository,
  )
}

export function getBusLayoutAction(
  id: BusLayoutId,
) {
  return getBusLayout(
    id,
    busLayoutRepository,
  )
}

export function listBusesAction() {
  return listBuses({
    busRepository,
    busLayoutRepository,
  })
}
