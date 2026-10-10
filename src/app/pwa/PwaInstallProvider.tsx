import type { ReactNode } from 'react'

import { PwaInstallContext, usePwaInstall } from '@/app/pwa/use-pwa-install'

export function PwaInstallProvider({ children }: { children: ReactNode }) {
  const installation = usePwaInstall()
  return <PwaInstallContext.Provider value={installation}>{children}</PwaInstallContext.Provider>
}
