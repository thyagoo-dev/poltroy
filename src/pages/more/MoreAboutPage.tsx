import { BusFront } from 'lucide-react'

import { MorePageHeader } from '@/pages/more/MorePageHeader'
import { Card } from '@/shared/ui/Card'

export function MoreAboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <MorePageHeader title="Sobre" description="Informações do Poltroy." />
      <Card className="mt-6" padding="lg">
        <div className="flex items-center gap-3">
          <BusFront aria-hidden="true" className="shrink-0 text-primary" size={25} />
          <h3 className="text-lg font-bold text-primary">POLTROY</h3>
        </div>
        <p className="mt-3 leading-7 text-muted">Gerenciamento operacional de viagens, passageiros e assentos de ônibus.</p>
        <section aria-labelledby="about-operation-title" className="mt-6 border-t border-border pt-5">
          <h3 id="about-operation-title" className="font-semibold">Funcionamento atual</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted">
            <li>Dados mantidos localmente neste dispositivo.</li>
            <li>Uso offline após o primeiro carregamento da aplicação.</li>
            <li>Aplicativo instalável quando oferecido pelo navegador.</li>
            <li>Backup e restauração manuais disponíveis.</li>
          </ul>
        </section>
        <section aria-labelledby="about-privacy-title" className="mt-6 border-t border-border pt-5">
          <h3 id="about-privacy-title" className="font-semibold">Privacidade</h3>
          <p className="mt-3 text-sm leading-6 text-muted">Nesta versão, os dados operacionais são armazenados localmente neste dispositivo. Você pode criar backups manualmente e deve guardar esses arquivos em local seguro.</p>
        </section>
      </Card>
    </div>
  )
}
