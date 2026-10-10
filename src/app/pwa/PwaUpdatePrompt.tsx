import { RefreshCw } from 'lucide-react'
import { useRef, useState } from 'react'

import { useRegisterPwa } from '@/app/pwa/use-register-pwa'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'

export function PwaUpdatePrompt() {
  const { needRefresh: [needRefresh, setNeedRefresh], updateServiceWorker, registrationError } = useRegisterPwa()
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const updateInFlight = useRef(false)

  async function handleUpdate() {
    if (updateInFlight.current) return
    updateInFlight.current = true
    setIsUpdating(true)
    setUpdateError(null)
    try {
      await updateServiceWorker(true)
    } catch {
      updateInFlight.current = false
      setIsUpdating(false)
      setUpdateError('Não foi possível atualizar. Tente novamente.')
    }
  }

  return (
    <>
      {registrationError && <p role="alert" className="mb-4 text-sm text-warning">{registrationError}</p>}
      {needRefresh && (
        <Card className="mb-4" padding="md">
          <section aria-label="Atualização do aplicativo" aria-busy={isUpdating}>
            <div role="status" aria-atomic="true" className="flex items-start gap-3">
              <RefreshCw aria-hidden="true" className="mt-0.5 shrink-0 text-primary" size={20} />
              <div>
                <h2 className="text-sm font-semibold">Nova versão disponível</h2>
                <p className="mt-1 text-sm leading-6 text-muted">Uma atualização do Poltroy está pronta. Atualize quando terminar sua operação.</p>
              </div>
            </div>
            {updateError && <p role="alert" className="mt-3 text-sm text-danger">{updateError}</p>}
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <Button size="sm" variant="ghost" disabled={isUpdating} onClick={() => setNeedRefresh(false)}>Agora não</Button>
              <Button size="sm" disabled={isUpdating} onClick={() => void handleUpdate()}>{isUpdating ? 'Atualizando...' : 'Atualizar'}</Button>
            </div>
          </section>
        </Card>
      )}
    </>
  )
}
