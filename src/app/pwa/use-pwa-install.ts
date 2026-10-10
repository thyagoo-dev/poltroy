import { createContext, useContext, useEffect, useRef, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

interface PwaInstallState {
  isInstalled: boolean
  canInstall: boolean
  isInstalling: boolean
  error: string | null
  install: () => Promise<void>
}

export const PwaInstallContext = createContext<PwaInstallState | null>(null)

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || (navigator as Navigator & { standalone?: boolean }).standalone === true
}

export function usePwaInstall() {
  const [isInstalled, setIsInstalled] = useState(isStandalone)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalling, setIsInstalling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const installInFlight = useRef(false)

  useEffect(() => {
    const displayMode = window.matchMedia('(display-mode: standalone)')
    function handlePrompt(event: Event) {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
      setError(null)
    }
    function handleInstalled() {
      setIsInstalled(true)
      setDeferredPrompt(null)
      setError(null)
    }
    function handleDisplayMode() {
      setIsInstalled(isStandalone())
    }
    window.addEventListener('beforeinstallprompt', handlePrompt)
    window.addEventListener('appinstalled', handleInstalled)
    displayMode.addEventListener('change', handleDisplayMode)
    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt)
      window.removeEventListener('appinstalled', handleInstalled)
      displayMode.removeEventListener('change', handleDisplayMode)
    }
  }, [])

  async function install() {
    if (!deferredPrompt || isInstalled || installInFlight.current) return
    installInFlight.current = true
    setIsInstalling(true)
    setError(null)
    try {
      await deferredPrompt.prompt()
      await deferredPrompt.userChoice
    } catch {
      setError('Não foi possível abrir a instalação. Tente pelo menu do navegador.')
    } finally {
      // The browser's installation event can only be used once.
      setDeferredPrompt(null)
      installInFlight.current = false
      setIsInstalling(false)
    }
  }

  return { isInstalled, canInstall: deferredPrompt !== null && !isInstalled, isInstalling, error, install }
}

export function usePwaInstallation() {
  const context = useContext(PwaInstallContext)
  if (!context) throw new Error('PwaInstallProvider não encontrado.')
  return context
}
