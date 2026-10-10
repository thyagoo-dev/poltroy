import { PwaInstallCard } from '@/app/pwa/PwaInstallCard'
import { MorePageHeader } from '@/pages/more/MorePageHeader'

export function MoreAppPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <MorePageHeader title="Aplicativo" description="Instale o Poltroy e use a experiência de aplicativo no dispositivo." />
      <PwaInstallCard />
    </div>
  )
}
