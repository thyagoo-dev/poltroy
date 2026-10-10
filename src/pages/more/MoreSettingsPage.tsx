import { Settings } from 'lucide-react'

import { MorePageHeader } from '@/pages/more/MorePageHeader'
import { Card } from '@/shared/ui/Card'

export function MoreSettingsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <MorePageHeader title="Configurações" description="Preferências do Poltroy ficarão disponíveis aqui." />
      <Card className="mt-6" padding="lg">
        <Settings aria-hidden="true" className="text-muted" size={24} />
        <p className="mt-4 font-semibold">Nenhuma preferência configurável no momento.</p>
        <p className="mt-2 text-sm leading-6 text-muted">Novas opções poderão ser adicionadas conforme o produto evoluir.</p>
      </Card>
    </div>
  )
}
