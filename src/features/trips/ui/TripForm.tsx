import {
  useMemo,
  useState,
  type FormEvent,
} from 'react'

import type { BusSummary } from '@/features/buses/application/list-buses'
import type { BusId } from '@/features/buses/domain/ids'
import type { Trip } from '@/features/trips/domain/trip'
import {
  fromDateTimeLocalInputValue,
  toDateTimeLocalInputValue,
} from '@/shared/lib/date-time'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'

export interface TripFormValues {
  busId: BusId

  origin: string
  destination: string

  departureAt: string
  arrivalEstimateAt?: string

  notes?: string
}

interface TripFormProps {
  mode: 'create' | 'edit'

  trip?: Trip

  buses:
    readonly BusSummary[]

  preferredBusId?:
    | BusId
    | null

  isSubmitting?: boolean

  onSubmit: (
    values: TripFormValues,
  ) => Promise<void>

  onCancel: () => void
}

export function TripForm({
  mode,
  trip,
  buses,
  preferredBusId,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: TripFormProps) {
  const [
    busId,
    setBusId,
  ] =
    useState<BusId | ''>(() => trip?.busId ??
      buses.find(({ bus }) => bus.id === preferredBusId && bus.status === 'ACTIVE')?.bus.id ??
      buses.find(({ bus }) => bus.status === 'ACTIVE')?.bus.id ?? '')

  const [
    origin,
    setOrigin,
  ] = useState(trip?.origin ?? '')

  const [
    destination,
    setDestination,
  ] = useState(trip?.destination ?? '')

  const [
    departureAt,
    setDepartureAt,
  ] = useState(() => toDateTimeLocalInputValue(trip?.departureAt))

  const [
    arrivalEstimateAt,
    setArrivalEstimateAt,
  ] = useState(() => toDateTimeLocalInputValue(trip?.arrivalEstimateAt))

  const [
    notes,
    setNotes,
  ] = useState(trip?.notes ?? '')

  const [
    validationError,
    setValidationError,
  ] = useState<
    string | null
  >(null)

  const selectableBuses =
    useMemo(
      () =>
        buses.filter(
          ({ bus }) =>
            bus.status ===
              'ACTIVE' ||
            bus.id ===
              trip?.busId,
        ),
      [
        buses,
        trip?.busId,
      ],
    )


  const selectedBusSummary =
    buses.find(
      ({ bus }) =>
        bus.id === busId,
    )

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (!busId) {
      setValidationError(
        'Selecione um ônibus.',
      )

      return
    }

    if (!origin.trim()) {
      setValidationError(
        'Informe a origem.',
      )

      return
    }

    if (
      !destination.trim()
    ) {
      setValidationError(
        'Informe o destino.',
      )

      return
    }

    if (!departureAt) {
      setValidationError(
        'Informe a data e hora de saída.',
      )

      return
    }

    try {
      const normalizedDeparture =
        fromDateTimeLocalInputValue(
          departureAt,
        )

      const normalizedArrival =
        arrivalEstimateAt
          ? fromDateTimeLocalInputValue(
              arrivalEstimateAt,
            )
          : undefined

      setValidationError(
        null,
      )

      await onSubmit({
        busId,

        origin,
        destination,

        departureAt:
          normalizedDeparture,

        arrivalEstimateAt:
          normalizedArrival,

        notes,
      })
    } catch (
      caughtError
    ) {
      setValidationError(
        caughtError instanceof
          Error
          ? caughtError.message
          : 'Verifique os dados informados.',
      )
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <label
          htmlFor="trip-bus"
          className="text-sm font-semibold text-foreground"
        >
          Ônibus
        </label>

        <Select
          id="trip-bus"
          className="mt-2"
          value={busId}
          onChange={(event) =>
            setBusId(
              event.target
                .value as BusId,
            )
          }
          required
        >
          <option
            value=""
            disabled
          >
            Selecione
          </option>

          {selectableBuses.map(
            ({
              bus,
              seatCount,
            }) => (
              <option
                key={bus.id}
                value={bus.id}
                disabled={
                  bus.status ===
                  'ARCHIVED'
                }
              >
                {bus.name} ·{' '}
                {seatCount}{' '}
                lugares
                {bus.status ===
                'ARCHIVED'
                  ? ' · Arquivado'
                  : ''}
              </option>
            ),
          )}
        </Select>

        {selectedBusSummary && (
          <p className="mt-2 text-xs leading-5 text-subtle">
            {
              selectedBusSummary
                .activeLayout
                ?.name
            }{' '}
            ·{' '}
            {
              selectedBusSummary
                .seatCount
            }{' '}
            lugares
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="trip-origin"
            className="text-sm font-semibold text-foreground"
          >
            Origem
          </label>

          <Input
            id="trip-origin"
            className="mt-2"
            value={origin}
            onChange={(event) =>
              setOrigin(
                event.target.value,
              )
            }
            placeholder="Ex.: Iguatu"
            autoComplete="off"
            maxLength={100}
          />
        </div>

        <div>
          <label
            htmlFor="trip-destination"
            className="text-sm font-semibold text-foreground"
          >
            Destino
          </label>

          <Input
            id="trip-destination"
            className="mt-2"
            value={destination}
            onChange={(event) =>
              setDestination(
                event.target.value,
              )
            }
            placeholder="Ex.: Fortaleza"
            autoComplete="off"
            maxLength={100}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="trip-departure"
            className="text-sm font-semibold text-foreground"
          >
            Saída
          </label>

          <Input
            id="trip-departure"
            className="mt-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary"
            type="datetime-local"
            value={departureAt}
            onChange={(event) =>
              setDepartureAt(
                event.target.value,
              )
            }
          />
        </div>

        <div>
          <label
            htmlFor="trip-arrival"
            className="text-sm font-semibold text-foreground"
          >
            Chegada estimada
          </label>

          <Input
            id="trip-arrival"
            className="mt-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary"
            type="datetime-local"
            value={
              arrivalEstimateAt
            }
            onChange={(event) =>
              setArrivalEstimateAt(
                event.target.value,
              )
            }
          />

          <p className="mt-1.5 text-xs text-subtle">
            Opcional
          </p>
        </div>
      </div>

      <div>
        <label
          htmlFor="trip-notes"
          className="text-sm font-semibold text-foreground"
        >
          Observações
        </label>

        <textarea
          id="trip-notes"
          className="
            mt-2 min-h-24 w-full
            resize-y
            rounded-control
            border border-border
            bg-surface-raised
            px-3.5 py-3
            text-sm text-foreground
            outline-none
            placeholder:text-subtle
            transition-[border-color,box-shadow]
            focus:border-primary
            focus:ring-2
            focus:ring-primary
          "
          value={notes}
          onChange={(event) =>
            setNotes(
              event.target.value,
            )
          }
          placeholder="Informações adicionais da viagem..."
          maxLength={500}
        />
      </div>

      {validationError && (
        <p
          role="alert"
          className="
            rounded-control
            border border-danger/20
            bg-danger/10
            px-3 py-2.5
            text-sm text-danger
          "
        >
          {validationError}
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
        <Button
          type="button"
          variant="ghost"
          disabled={
            isSubmitting
          }
          onClick={
            onCancel
          }
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          disabled={
            isSubmitting
          }
        >
          {isSubmitting
            ? 'Salvando...'
            : mode ===
                'create'
              ? 'Criar viagem'
              : 'Salvar alterações'}
        </Button>
      </div>
    </form>
  )
}
