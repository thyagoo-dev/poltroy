import { useEffect, useRef, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export function useRegisterPwa() {
  const registrationRef = useRef<ServiceWorkerRegistration | undefined>(undefined)
  const [registrationError, setRegistrationError] = useState<string | null>(null)
  const registration = useRegisterSW({
    onRegisteredSW(_url, serviceWorkerRegistration) {
      registrationRef.current = serviceWorkerRegistration
    },
    onRegisterError() {
      setRegistrationError('Não foi possível preparar o aplicativo para uso offline. Recarregue quando houver conexão para tentar novamente.')
    },
  })

  useEffect(() => {
    function checkForUpdate() {
      const current = registrationRef.current
      if (navigator.onLine && current && !current.installing) {
        // A failed update check must not interrupt local operations.
        void current.update().catch(() => undefined)
      }
    }
    function handleVisibility() {
      if (document.visibilityState === 'visible') checkForUpdate()
    }
    const interval = window.setInterval(checkForUpdate, 60 * 60 * 1000)
    window.addEventListener('online', checkForUpdate)
    window.addEventListener('focus', checkForUpdate)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('online', checkForUpdate)
      window.removeEventListener('focus', checkForUpdate)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  return { ...registration, registrationError }
}
