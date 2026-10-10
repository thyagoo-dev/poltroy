import {
  Info,
  Settings,
} from 'lucide-react'

import { Card } from '@/shared/ui/Card'
import { PwaInstallCard } from '@/app/pwa/PwaInstallCard'
import { LocalDataBackupCard } from '@/features/backup/ui/LocalDataBackupCard'

const futureSections = [
  {
    label: 'Configurações',
    description: 'Preferências gerais do Poltroy.',
    icon: Settings,
  },
  {
    label: 'Sobre',
    description: 'Informações da aplicação e versão.',
    icon: Info,
  },
] as const

export function MorePage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <section
        aria-labelledby="more-page-title"
        className="flex flex-col gap-2"
      >
        <p
          className="
            text-xs font-semibold uppercase
            tracking-[0.14em]
            text-subtle
          "
        >
          Sistema
        </p>

        <h2
          id="more-page-title"
          className="
            text-2xl font-bold
            tracking-[-0.035em]
            text-foreground
            sm:text-3xl
          "
        >
          Mais
        </h2>

        <p className="max-w-2xl leading-7 text-muted">
          Configurações e recursos secundários ficarão organizados
          nesta área.
        </p>
      </section>

      <PwaInstallCard />
      <LocalDataBackupCard />

      <Card
        className="mt-6"
        padding="none"
      >
        <div className="divide-y divide-border">
          {futureSections.map((section) => {
            const Icon = section.icon

            return (
              <div
                key={section.label}
                className="
                  flex items-center gap-4
                  px-5 py-4
                  sm:px-6
                "
              >
                <div
                  className="
                    flex size-10 shrink-0
                    items-center justify-center
                    rounded-control
                    bg-surface-soft
                    text-muted
                  "
                >
                  <Icon
                    aria-hidden="true"
                    size={19}
                    strokeWidth={1.8}
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {section.label}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted">
                    {section.description}
                  </p>
                </div>

                <span
                  className="
                    ml-auto shrink-0
                    rounded-pill
                    border border-border
                    px-2 py-1
                    text-[0.625rem] font-semibold
                    uppercase tracking-[0.08em]
                    text-subtle
                  "
                >
                  Futuro
                </span>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
