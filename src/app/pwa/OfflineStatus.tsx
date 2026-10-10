import { WifiOff } from 'lucide-react'

import { useOnlineStatus } from '@/app/hooks/use-online-status'

export function OfflineStatus() {
  const isOnline = useOnlineStatus()

  return (
    <div role="status" aria-atomic="true">
      {!isOnline && (
        <div className="mb-4 flex items-start gap-3 rounded-control border border-warning/20 bg-warning/10 px-4 py-3 text-sm">
          <WifiOff aria-hidden="true" className="mt-0.5 shrink-0 text-warning" size={18} />
          <div>
            <p className="font-semibold">Sem conexão</p>
            <p className="mt-1 text-muted">Os dados locais continuam disponíveis.</p>
          </div>
        </div>
      )}
    </div>
  )
}
