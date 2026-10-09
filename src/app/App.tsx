import {
  BusFront,
  Plus,
  Settings,
  Trash2,
} from 'lucide-react'

import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { IconButton } from '@/shared/ui/IconButton'

const palette = [
  {
    label: 'Primária',
    value: '#55DED7',
    className: 'bg-primary',
  },
  {
    label: 'Sucesso',
    value: '#5DD6A4',
    className: 'bg-success',
  },
  {
    label: 'Aviso',
    value: '#F2C25D',
    className: 'bg-warning',
  },
  {
    label: 'Perigo',
    value: '#FF7B7F',
    className: 'bg-danger',
  },
  {
    label: 'Reservado',
    value: '#F2A45B',
    className: 'bg-reserved',
  },
  {
    label: 'Superfície',
    value: '#102128',
    className: 'bg-surface-raised',
  },
] as const

function App() {
  return (
    <main
      className="
        min-h-dvh
        px-[var(--poltroy-space-page-inline)]
        py-[var(--poltroy-space-page-block)]
      "
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-5">
          <div
            className="
              flex size-12 items-center justify-center
              rounded-control border border-primary/15
              bg-primary/10 text-primary
              shadow-soft
            "
          >
            <BusFront
              aria-hidden="true"
              size={24}
              strokeWidth={1.8}
            />
          </div>

          <div className="max-w-3xl">
            <span
              className="
                text-xs font-bold tracking-[0.18em]
                text-primary
              "
            >
              POLTROY · DESIGN SYSTEM
            </span>

            <h1
              className="
                mt-3
                text-4xl font-bold tracking-[-0.045em]
                text-foreground
                sm:text-5xl
              "
            >
              Fundação visual.
            </h1>

            <p
              className="
                mt-4 max-w-2xl
                text-base leading-7 text-muted
              "
            >
              Primeiros tokens e componentes reutilizáveis do Poltroy,
              preparados para uma interface mobile-first, acessível e
              consistente.
            </p>
          </div>
        </header>

        <section aria-labelledby="colors-title">
          <Card padding="lg">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
                Tokens
              </p>

              <h2
                id="colors-title"
                className="mt-2 text-xl font-semibold text-foreground"
              >
                Paleta semântica
              </h2>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {palette.map((color) => (
                <div key={color.label}>
                  <div
                    className={`
                      h-16 rounded-control border border-white/5
                      ${color.className}
                    `}
                  />

                  <p className="mt-2 text-sm font-medium text-foreground">
                    {color.label}
                  </p>

                  <p className="mt-0.5 text-xs text-subtle">
                    {color.value}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section aria-labelledby="buttons-title">
            <Card className="h-full" padding="lg">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
                Componentes
              </p>

              <h2
                id="buttons-title"
                className="mt-2 text-xl font-semibold text-foreground"
              >
                Botões
              </h2>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button>
                  <Plus
                    aria-hidden="true"
                    size={18}
                  />

                  Nova viagem
                </Button>

                <Button variant="secondary">
                  Secundário
                </Button>

                <Button variant="ghost">
                  Discreto
                </Button>

                <Button variant="danger">
                  <Trash2
                    aria-hidden="true"
                    size={17}
                  />

                  Excluir
                </Button>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <IconButton
                  aria-label="Adicionar ônibus"
                  variant="primary"
                >
                  <Plus
                    aria-hidden="true"
                    size={20}
                  />
                </IconButton>

                <IconButton
                  aria-label="Abrir configurações"
                >
                  <Settings
                    aria-hidden="true"
                    size={19}
                  />
                </IconButton>

                <IconButton
                  aria-label="Excluir item"
                  variant="danger"
                >
                  <Trash2
                    aria-hidden="true"
                    size={18}
                  />
                </IconButton>
              </div>
            </Card>
          </section>

          <section aria-labelledby="surfaces-title">
            <Card
              className="h-full"
              variant="raised"
              padding="lg"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
                Soft UI
              </p>

              <h2
                id="surfaces-title"
                className="mt-2 text-xl font-semibold text-foreground"
              >
                Superfícies
              </h2>

              <p className="mt-3 leading-7 text-muted">
                Profundidade discreta, contraste suficiente e sombras
                suaves. O neumorphism será utilizado apenas como acabamento
                visual, nunca como substituto da hierarquia e da
                acessibilidade.
              </p>

              <Card
                className="mt-6"
                variant="soft"
                padding="sm"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="
                      size-2.5 rounded-full
                      bg-success
                      shadow-[0_0_16px_rgba(93,214,164,0.35)]
                    "
                  />

                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Design System ativo
                    </p>

                    <p className="mt-0.5 text-xs text-muted">
                      Etapa 02 · Fundação visual
                    </p>
                  </div>
                </div>
              </Card>
            </Card>
          </section>
        </div>

        <section aria-labelledby="seat-status-title">
          <Card padding="lg">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
              Preparação de domínio
            </p>

            <h2
              id="seat-status-title"
              className="mt-2 text-xl font-semibold text-foreground"
            >
              Estados de assento
            </h2>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-control border border-seat-free/35 bg-seat-free/8 p-4">
                <span className="block size-2.5 rounded-full bg-seat-free" />

                <strong className="mt-4 block text-sm text-foreground">
                  Livre
                </strong>

                <span className="mt-1 block text-xs text-muted">
                  FREE
                </span>
              </div>

              <div className="rounded-control border border-seat-occupied/35 bg-seat-occupied/8 p-4">
                <span className="block size-2.5 rounded-full bg-seat-occupied" />

                <strong className="mt-4 block text-sm text-foreground">
                  Ocupado
                </strong>

                <span className="mt-1 block text-xs text-muted">
                  OCCUPIED
                </span>
              </div>

              <div className="rounded-control border border-seat-reserved/35 bg-seat-reserved/8 p-4">
                <span className="block size-2.5 rounded-full bg-seat-reserved" />

                <strong className="mt-4 block text-sm text-foreground">
                  Reservado
                </strong>

                <span className="mt-1 block text-xs text-muted">
                  RESERVED
                </span>
              </div>

              <div className="rounded-control border border-seat-blocked/35 bg-seat-blocked/8 p-4">
                <span className="block size-2.5 rounded-full bg-seat-blocked" />

                <strong className="mt-4 block text-sm text-foreground">
                  Bloqueado
                </strong>

                <span className="mt-1 block text-xs text-muted">
                  BLOCKED
                </span>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </main>
  )
}

export default App
