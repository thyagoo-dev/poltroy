import {
  ArrowLeft,
  Map,
} from 'lucide-react'
import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <div
      className="
        flex min-h-[60dvh]
        items-center justify-center
      "
    >
      <div className="max-w-md text-center">
        <div
          className="
            mx-auto
            flex size-14 items-center justify-center
            rounded-card
            border border-border
            bg-surface
            text-muted
            shadow-soft
          "
        >
          <Map
            aria-hidden="true"
            size={25}
            strokeWidth={1.7}
          />
        </div>

        <p
          className="
            mt-6
            text-xs font-bold
            tracking-[0.16em]
            text-primary
          "
        >
          ERRO 404
        </p>

        <h2
          className="
            mt-2
            text-2xl font-bold
            tracking-[-0.035em]
            text-foreground
          "
        >
          Página não encontrada
        </h2>

        <p className="mt-3 leading-7 text-muted">
          O endereço informado não corresponde a nenhuma área do
          Poltroy.
        </p>

        <Link
          to="/"
          className="
            mx-auto mt-6
            inline-flex min-h-11
            items-center justify-center gap-2
            rounded-control
            bg-primary
            px-4
            text-sm font-semibold
            text-on-primary!
            shadow-control
            transition-colors
            hover:bg-primary-hover
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-primary/55
            focus-visible:ring-offset-2
            focus-visible:ring-offset-background
            motion-reduce:transition-none
          "
        >
          <ArrowLeft
            aria-hidden="true"
            size={17}
          />

          Voltar ao mapa
        </Link>
      </div>
    </div>
  )
}
