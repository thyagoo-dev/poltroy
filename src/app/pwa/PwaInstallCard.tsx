import { Download, Smartphone } from 'lucide-react'

import { usePwaInstallation } from '@/app/pwa/use-pwa-install'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'

export function PwaInstallCard() {
  const { isInstalled, canInstall, isInstalling, error, install } = usePwaInstallation()

  return (
    <Card className="mt-6" padding="md">
      <section aria-labelledby="pwa-install-title" aria-busy={isInstalling}>
        <div className="flex items-start gap-3">
          <Smartphone aria-hidden="true" className="mt-0.5 shrink-0 text-primary" size={22} />
          <div>
            <h3 id="pwa-install-title" className="font-semibold">Aplicativo</h3>
            <p className="mt-1 text-sm text-muted">POLTROY</p>
          </div>
        </div>
        <p role="status" aria-atomic="true" className="mt-4 text-sm font-medium">
          {isInstalled ? 'Aplicativo instalado' : canInstall ? 'Disponível para instalação' : 'Usando no navegador'}
        </p>
        {!isInstalled && <p className="mt-2 text-sm leading-6 text-muted">
          {canInstall ? 'Instale para abrir o Poltroy como aplicativo e acessar seus dados locais mesmo sem conexão.' : 'A instalação pode estar disponível pelo menu do navegador.'}
        </p>}
        {canInstall && <Button className="mt-4" disabled={isInstalling} onClick={() => void install()}>
          <Download aria-hidden="true" size={17} />
          {isInstalling ? 'Aguarde...' : 'Instalar aplicativo'}
        </Button>}
        {error && <p role="alert" className="mt-3 text-sm text-danger">{error}</p>}
      </section>
    </Card>
  )
}
