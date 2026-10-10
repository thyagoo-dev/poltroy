import { useEffect, useRef } from 'react'

import { PassengerBackLink } from '@/pages/passengers/PassengerBackLink'
import { Card } from '@/shared/ui/Card'

interface PassengerLoadStateProps {
  status: 'loading' | 'not-found' | 'error'
}

export function PassengerLoadState({ status }: PassengerLoadStateProps) {
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    window.scrollTo(0, 0)
    if (status !== 'loading') heading.current?.focus({ preventScroll: true })
  }, [status])

  return (
    <div className="mx-auto w-full max-w-3xl">
      <PassengerBackLink />
      <Card padding="lg">
        <h2 ref={heading} tabIndex={-1} className="break-words text-2xl font-bold tracking-[-0.035em] focus-visible:rounded-control focus-visible:outline-2 focus-visible:outline-primary">
          {status === 'loading' ? 'Carregando passageiro' : status === 'not-found' ? 'Passageiro não encontrado' : 'Não foi possível carregar o passageiro'}
        </h2>
        <p className="mt-3 leading-7 text-muted" role={status === 'error' ? 'alert' : 'status'}>
          {status === 'loading' ? 'Buscando os dados do cadastro...' : status === 'not-found' ? 'O passageiro pode ter sido removido ou o endereço está incorreto.' : 'Tente abrir o cadastro novamente mais tarde.'}
        </p>
      </Card>
    </div>
  )
}
