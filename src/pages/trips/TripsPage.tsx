import {
  CalendarDays,
  Route,
} from 'lucide-react'

import { Card } from '@/shared/ui/Card'

export function TripsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <section
        aria-labelledby="trips-page-title"
        className="flex flex-col gap-2"
      >
        <p
          className="
            text-xs font-semibold uppercase
            tracking-[0.14em]
            text-subtle
          "
        >
          Operação
        </p>

        <h2
          id="trips-page-title"
          className="
            text-2xl font-bold
            tracking-[-0.035em]
            text-foreground
            sm:text-3xl
          "
        >
          Viagens
        </h2>

        <p className="max-w-2xl leading-7 text-muted">
          Gerencie viagens atuais, futuras e finalizadas.
        </p>
      </section>

      <Card
        className="
          mt-6
          flex min-h-64
          items-center justify-center
        "
        padding="lg"
      >
        <div className="max-w-md text-center">
          <div
            className="
              mx-auto
              flex size-14 items-center justify-center
              rounded-card
              border border-primary/15
              bg-primary/10
              text-primary
            "
          >
            <Route
              aria-hidden="true"
              size={27}
              strokeWidth={1.7}
            />
          </div>

          <h3
            className="
              mt-5 text-lg font-semibold
              tracking-[-0.02em]
              text-foreground
            "
          >
            Nenhuma viagem ainda
          </h3>

          <p className="mt-2 text-sm leading-6 text-muted">
            A criação e o gerenciamento de viagens serão conectados
            aqui quando implementarmos o domínio da aplicação.
          </p>

          <div
            className="
              mx-auto mt-5
              flex w-fit items-center gap-2
              rounded-pill
              border border-border
              bg-surface-soft
              px-3 py-2
              text-xs text-subtle
            "
          >
            <CalendarDays
              aria-hidden="true"
              size={14}
            />

            Viagens ainda não implementadas
          </div>
        </div>
      </Card>
    </div>
  )
}
