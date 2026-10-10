import type { LocalDataSnapshot } from '@/features/backup/domain/backup-document'

export interface BackupRepository {
  exportSnapshot(): Promise<LocalDataSnapshot>
  replaceAll(snapshot: LocalDataSnapshot): Promise<void>
}
