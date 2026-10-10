import type { BackupRepository } from '@/features/backup/application/backup-repository'
import { validatePoltroyBackup } from '@/features/backup/application/validate-backup'

export async function restoreBackup(input: unknown, repository: BackupRepository): Promise<void> {
  // Revalidate at the write boundary, even when the UI already showed a preview.
  const result = validatePoltroyBackup(input)
  if (!result.success) throw new Error(result.issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n'))
  await repository.replaceAll(result.backup.data)
}
