import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'

import { updatePassengerAction } from '@/app/services/passenger-actions'
import type { PassengerInputFields } from '@/features/passengers/application/passenger-input'
import { PassengerForm } from '@/features/passengers/ui/PassengerForm'
import { PassengerBackLink } from '@/pages/passengers/PassengerBackLink'
import { PassengerLoadState } from '@/pages/passengers/PassengerLoadState'
import { usePassenger } from '@/pages/passengers/use-passenger'
import { Card } from '@/shared/ui/Card'

export function PassengerEditPage() {
  const { passengerId } = useParams()
  const result = usePassenger(passengerId)
  const navigate = useNavigate()
  const saving = useRef(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  useEffect(() => { window.scrollTo(0, 0) }, [passengerId])

  if (result.status !== 'ready') return <PassengerLoadState status={result.status} />
  const passenger = result.passenger
  const detailsPath = `/passengers/${encodeURIComponent(passenger.id)}`

  async function handleSubmit(values: PassengerInputFields) {
    if (saving.current) return
    saving.current = true
    setIsSubmitting(true)
    try {
      await updatePassengerAction({ id: passenger.id, ...values })
      navigate(detailsPath, { replace: true, state: { passengerFeedback: 'updated' } })
    } catch {
      throw new Error('Não foi possível atualizar o passageiro. Tente novamente.')
    } finally {
      saving.current = false
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <PassengerBackLink to={detailsPath}>Cadastro do passageiro</PassengerBackLink>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">Pessoas</p>
      <h2 className="mt-2 text-2xl font-bold tracking-[-0.035em] sm:text-3xl">Editar passageiro</h2>
      <p className="mt-2 break-words leading-7 text-muted">Atualize os dados de {passenger.name}.</p>
      <Card className="mt-6" padding="lg">
        <PassengerForm key={passenger.id} passenger={passenger} isSubmitting={isSubmitting}
          onSubmit={handleSubmit} onCancel={() => navigate(detailsPath)} />
      </Card>
    </div>
  )
}
