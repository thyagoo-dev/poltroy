import { createBackup } from '@/features/backup/application/create-backup'
import { restoreBackup } from '@/features/backup/application/restore-backup'
import { useBusSelectionStore } from '@/features/buses/ui/bus-selection-store'
import { useTripOperationStore } from '@/features/trips/ui/trip-operation-store'
import { backupRepository } from '@/infrastructure/repositories/repositories'

export function exportBackupAction() {
  return createBackup(backupRepository)
}

export async function restoreBackupAction(input: unknown) {
  await restoreBackup(input, backupRepository)
  // Context is only reset after the five-store transaction has committed.
  useTripOperationStore.getState().clearOperationalTrip()
  useBusSelectionStore.getState().clearBus()
}
