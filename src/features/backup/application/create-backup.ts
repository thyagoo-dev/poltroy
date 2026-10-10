import type { BackupRepository } from '@/features/backup/application/backup-repository'
import { BACKUP_COLLECTIONS, POLTROY_BACKUP_VERSION, type CurrentDataSnapshot, type PoltroyBackup } from '@/features/backup/domain/backup-document'
import { resolvePassengerDisplayName } from '@/features/passengers/domain/passenger-display-name'

export async function createBackup(repository: BackupRepository): Promise<PoltroyBackup> {
  const snapshot = structuredClone(await repository.exportSnapshot())
  const data: CurrentDataSnapshot = {
    ...snapshot,
    passengers: snapshot.passengers.map((passenger) => {
      const serialized = { ...passenger, displayName: resolvePassengerDisplayName(passenger) }
      for (const key of ['phone', 'notes', 'documentType', 'documentNumber'] as const) {
        if (serialized[key] === undefined) delete serialized[key]
      }
      return serialized
    }),
  }
  for (const collection of BACKUP_COLLECTIONS) data[collection].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
  return { app: 'POLTROY', backupVersion: POLTROY_BACKUP_VERSION, exportedAt: new Date().toISOString(), data }
}

export function backupFilename(exportedAt: string): string {
  return `poltroy-backup-${new Date(exportedAt).toISOString().replaceAll(':', '-').replace(/\.\d{3}Z$/, 'Z')}.json`
}
