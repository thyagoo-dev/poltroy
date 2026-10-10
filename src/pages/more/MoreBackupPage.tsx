import { LocalDataBackupCard } from '@/features/backup/ui/LocalDataBackupCard'
import { MorePageHeader } from '@/pages/more/MorePageHeader'

export function MoreBackupPage() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <MorePageHeader title="Backup e restauração" description="Proteja uma cópia dos dados armazenados neste dispositivo." />
      <LocalDataBackupCard />
    </div>
  )
}
