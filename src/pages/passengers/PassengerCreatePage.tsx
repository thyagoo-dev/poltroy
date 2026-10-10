import { useRef, useState } from 'react'
import { useNavigate } from 'react-router'

import { createPassengerAction } from '@/app/services/passenger-actions'
import type { PassengerInputFields } from '@/features/passengers/application/passenger-input'
import { PassengerForm } from '@/features/passengers/ui/PassengerForm'
import { PassengerBackLink } from '@/pages/passengers/PassengerBackLink'
import { Card } from '@/shared/ui/Card'

export function PassengerCreatePage() {
  const navigate = useNavigate()
  const saving = useRef(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(values: PassengerInputFields) {
    if (saving.current) return
    saving.current = true
    setIsSubmitting(true)
    try {
      const passenger = await createPassengerAction(values)
      navigate(`/passengers/${encodeURIComponent(passenger.id)}`, { replace: true, state: { passengerFeedback: 'created' } })
    } catch {
      throw new Error('Não foi possível criar o passageiro. Tente novamente.')
    } finally {
      saving.current = false
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <PassengerBackLink />
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">Pessoas</p>
      <h2 className="mt-2 text-2xl font-bold tracking-[-0.035em] sm:text-3xl">Novo passageiro</h2>
      <p className="mt-2 leading-7 text-muted">Cadastre os dados do passageiro.</p>
      <Card className="mt-6" padding="lg">
        <PassengerForm isSubmitting={isSubmitting} onSubmit={handleSubmit} onCancel={() => navigate('/passengers')} />
      </Card>
    </div>
  )
}
