import {
  CalendarDays,
  Plus,
} from 'lucide-react'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Link, useNavigate } from 'react-router'

import { listBusesAction } from '@/app/services/bus-actions'
import {
  cancelTripAction,
  completeTripAction,
  createTripAction,
  listTripsAction,
  startTripAction,
  updateTripAction,
} from '@/app/services/trip-actions'
import type { BusSummary } from '@/features/buses/application/list-buses'
import type { TripSummary } from '@/features/trips/application/list-trips'
import type { Trip } from '@/features/trips/domain/trip'
import { compareTripsByDeparture, compareTripsByHistory } from '@/features/trips/domain/trip-ordering'
import {
  TripForm,
  type TripFormValues,
} from '@/features/trips/ui/TripForm'
import { useTripOperationStore } from '@/features/trips/ui/trip-operation-store'
import { TripCard } from '@/features/trips/ui/TripCard'
import { useBusSelectionStore } from '@/features/buses/ui/bus-selection-store'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'

type FormState =
  | {
      type: 'create'
    }
  | {
      type: 'edit'
      trip: Trip
    }
  | null

export function TripsPage() {
  const tripActionInFlight = useRef(false)
  const [completeTarget, setCompleteTarget] = useState<Trip | null>(null)
  const navigate = useNavigate()
  const operationalTripId = useTripOperationStore((state) => state.operationalTripId)
  const selectOperationalTrip = useTripOperationStore((state) => state.selectOperationalTrip)
  const clearOperationalTrip = useTripOperationStore((state) => state.clearOperationalTrip)
  const activeBusId =
    useBusSelectionStore(
      (state) =>
        state.activeBusId,
    )

  const selectBus =
    useBusSelectionStore(
      (state) =>
        state.selectBus,
    )

  const [
    trips,
    setTrips,
  ] = useState<
    readonly TripSummary[]
  >([])

  const [
    buses,
    setBuses,
  ] = useState<
    readonly BusSummary[]
  >([])

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false)

  const [
    formState,
    setFormState,
  ] =
    useState<FormState>(null)

  const [
    cancelTarget,
    setCancelTarget,
  ] =
    useState<Trip | null>(
      null,
    )

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    )

  const [
    message,
    setMessage,
  ] =
    useState<string | null>(
      null,
    )

  const loadData =
    useCallback(async () => {
      setIsLoading(true)

      try {
        const [
          tripResult,
          busResult,
        ] =
          await Promise.all([
            listTripsAction(),
            listBusesAction(),
          ])

        setTrips(
          tripResult,
        )

        setBuses(
          busResult,
        )
      } catch {
        setError(
          'Não foi possível carregar as viagens.',
        )
      } finally {
        setIsLoading(false)
      }
    }, [])

  useEffect(() => {
    let cancelled = false
    void Promise.all([listTripsAction(), listBusesAction()])
      .then(([tripResult, busResult]) => {
        if (!cancelled) {
          setTrips(tripResult)
          setBuses(busResult)
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Não foi possível carregar as viagens.')
          setIsLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [])

  const activeBuses =
    useMemo(
      () =>
        buses.filter(
          ({ bus }) =>
            bus.status ===
            'ACTIVE',
        ),
      [buses],
    )

  const activeTrips =
    useMemo(
      () =>
        trips.filter(
          ({ trip }) =>
            trip.status ===
            'ACTIVE',
        ).sort((a, b) => compareTripsByDeparture(a.trip, b.trip)),
      [trips],
    )

  const plannedTrips =
    useMemo(
      () =>
        trips.filter(
          ({ trip }) =>
            trip.status ===
            'PLANNED',
        ).sort((a, b) => compareTripsByDeparture(a.trip, b.trip)),
      [trips],
    )

  const historyTrips =
    useMemo(
      () =>
        trips.filter(
          ({ trip }) =>
            trip.status ===
              'COMPLETED' ||
            trip.status ===
              'CANCELLED',
        ).sort((a, b) => compareTripsByHistory(a.trip, b.trip)),
      [trips],
    )

  async function handleCreate(
    values: TripFormValues,
  ) {
    setIsSubmitting(true)
    setError(null)
    setMessage(null)

    try {
      await createTripAction(
        values,
      )

      setFormState(null)

      setMessage(
        'Viagem criada com sucesso.',
      )

      await loadData()
    } catch (
      caughtError
    ) {
      setError(
        caughtError instanceof
          Error
          ? caughtError.message
          : 'Não foi possível criar a viagem.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUpdate(
    trip: Trip,
    values: TripFormValues,
  ) {
    setIsSubmitting(true)
    setError(null)
    setMessage(null)

    try {
      await updateTripAction({
        id: trip.id,
        ...values,
      })

      setFormState(null)

      setMessage(
        'Viagem atualizada.',
      )

      await loadData()
    } catch (
      caughtError
    ) {
      setError(
        caughtError instanceof
          Error
          ? caughtError.message
          : 'Não foi possível atualizar a viagem.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleStart(
    trip: Trip,
  ) {
    if (tripActionInFlight.current || isSubmitting) return
    tripActionInFlight.current = true
    setIsSubmitting(true)
    setError(null)
    setMessage(null)

    try {
      const updatedTrip =
        await startTripAction(
          trip.id,
        )

      selectBus(
        updatedTrip.busId,
      )

      selectOperationalTrip(updatedTrip.id)

      navigate('/')
    } catch (
      caughtError
    ) {
      setError(
        caughtError instanceof
          Error
          ? caughtError.message
          : 'Não foi possível iniciar a viagem.',
      )
    } finally {
      tripActionInFlight.current = false
      setIsSubmitting(false)
    }
  }

  async function handleComplete() {
    if (!completeTarget || tripActionInFlight.current || isSubmitting) return
    const trip = completeTarget
    tripActionInFlight.current = true
    setIsSubmitting(true)
    setError(null)
    setMessage(null)

    try {
      await completeTripAction(
        trip.id,
      )

      if (operationalTripId === trip.id) clearOperationalTrip()
      setCompleteTarget(null)

      setMessage(
        'Viagem concluída.',
      )

      await loadData()
    } catch (
      caughtError
    ) {
      setError(
        caughtError instanceof
          Error
          ? caughtError.message
          : 'Não foi possível concluir a viagem.',
      )
    } finally {
      tripActionInFlight.current = false
      setIsSubmitting(false)
    }
  }

  async function handleCancel() {
    if (!cancelTarget || tripActionInFlight.current || isSubmitting) {
      return
    }

    tripActionInFlight.current = true
    setIsSubmitting(true)
    setError(null)
    setMessage(null)

    try {
      await cancelTripAction(
        cancelTarget.id,
      )

      if (operationalTripId === cancelTarget.id) clearOperationalTrip()

      setCancelTarget(null)

      setMessage(
        'Viagem cancelada.',
      )

      await loadData()
    } catch (
      caughtError
    ) {
      setError(
        caughtError instanceof
          Error
          ? caughtError.message
          : 'Não foi possível cancelar a viagem.',
      )
    } finally {
      tripActionInFlight.current = false
      setIsSubmitting(false)
    }
  }

  function openForm(nextFormState: NonNullable<FormState>) {
    setError(null)
    setMessage(null)
    setFormState(nextFormState)
  }

  function closeForm() {
    setError(null)
    setFormState(null)
  }

  function handleOpenMap(summary: TripSummary) {
    selectBus(summary.trip.busId)
    selectOperationalTrip(summary.trip.id)
    navigate('/')
  }

  function renderTripGrid(
    summaries:
      readonly TripSummary[],
  ) {
    return (
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {summaries.map(
          (summary) => (
            <TripCard
              isPending={isSubmitting}
              key={
                summary.trip.id
              }
              summary={
                summary
              }
              onOpenMap={() => handleOpenMap(summary)}
              onEdit={() =>
                openForm({
                  type: 'edit',
                  trip:
                    summary.trip,
                })
              }
              onStart={() =>
                void handleStart(
                  summary.trip,
                )
              }
              onComplete={() => {
                setError(null)
                setCompleteTarget(summary.trip)
              }}
              onCancel={() =>
                setCancelTarget(
                  summary.trip,
                )
              }
            />
          ),
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div
        className="
          flex flex-col gap-4
          sm:flex-row
          sm:items-start
          sm:justify-between
        "
      >
        <section
          aria-labelledby="trips-page-title"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
            Operação
          </p>

          <h2
            id="trips-page-title"
            className="
              mt-2
              text-2xl font-bold
              tracking-[-0.035em]
              text-foreground
              sm:text-3xl
            "
          >
            Viagens
          </h2>

          <p className="mt-2 max-w-2xl leading-7 text-muted">
            Planeje, inicie e acompanhe as viagens da frota.
          </p>
        </section>

        {!formState &&
          activeBuses.length >
            0 && (
          <Button
            onClick={() =>
              openForm({
                type: 'create',
              })
            }
          >
            <Plus
              aria-hidden="true"
              size={18}
            />

            Nova viagem
          </Button>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="
            mt-5
            rounded-control
            border border-danger/20
            bg-danger/10
            px-4 py-3
            text-sm text-danger
          "
        >
          {error}
        </div>
      )}

      {message && (
        <div
          role="status"
          className="
            mt-5
            rounded-control
            border border-success/20
            bg-success/10
            px-4 py-3
            text-sm text-success
          "
        >
          {message}
        </div>
      )}

      {activeBuses.length ===
        0 &&
        !isLoading && (
        <Card
          className="mt-6"
          padding="lg"
        >
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-foreground">
                Adicione um ônibus primeiro
              </h3>

              <p className="mt-1 text-sm leading-6 text-muted">
                Uma viagem precisa estar associada a um veículo e a uma versão do seu layout.
              </p>
            </div>

            <Link
              to="/buses"
              className="
                inline-flex min-h-11
                shrink-0 items-center
                justify-center
                rounded-control
                bg-primary
                px-4
                text-sm font-semibold
                text-on-primary!
              "
            >
              Gerenciar ônibus
            </Link>
          </div>
        </Card>
      )}

      {formState && (
        <Card
          className="mt-6"
          variant="raised"
          padding="lg"
        >
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              {formState.type ===
              'create'
                ? 'Nova viagem'
                : 'Editar viagem'}
            </p>

            <h3 className="mt-2 text-xl font-semibold tracking-[-0.025em]">
              {formState.type ===
              'create'
                ? 'Planejar viagem'
                : `${formState.trip.origin} → ${formState.trip.destination}`}
            </h3>
          </div>

          <TripForm
            key={formState.type === 'edit' ? formState.trip.id : 'create'}
            mode={
              formState.type
            }
            trip={
              formState.type ===
              'edit'
                ? formState.trip
                : undefined
            }
            buses={buses}
            preferredBusId={
              activeBusId
            }
            isSubmitting={
              isSubmitting
            }
            onCancel={closeForm}
            onSubmit={(values) =>
              formState.type ===
              'create'
                ? handleCreate(
                    values,
                  )
                : handleUpdate(
                    formState.trip,
                    values,
                  )
            }
          />
        </Card>
      )}

      {isLoading ? (
        <Card
          className="mt-6"
          padding="lg"
        >
          <p className="text-sm text-muted">
            Carregando viagens...
          </p>
        </Card>
      ) : trips.length ===
        0 ? (
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
                flex size-14
                items-center justify-center
                rounded-card
                border border-primary/15
                bg-primary/10
                text-primary
              "
            >
              <CalendarDays
                aria-hidden="true"
                size={27}
              />
            </div>

            <h3 className="mt-5 text-lg font-semibold text-foreground">
              Nenhuma viagem planejada
            </h3>

            <p className="mt-2 text-sm leading-6 text-muted">
              Crie a primeira viagem para começar a organizar a operação dos ônibus.
            </p>
          </div>
        </Card>
      ) : (
        <>
          {activeTrips.length >
            0 && (
            <section
              className="mt-8"
              aria-labelledby="active-trips-title"
            >
              <div className="flex items-center justify-between">
                <h3
                  id="active-trips-title"
                  className="text-lg font-semibold text-success"
                >
                  Em andamento
                </h3>

                <span className="text-sm text-subtle">
                  {
                    activeTrips.length
                  }
                </span>
              </div>

              {renderTripGrid(
                activeTrips,
              )}
            </section>
          )}

          {plannedTrips.length >
            0 && (
            <section
              className="mt-8"
              aria-labelledby="planned-trips-title"
            >
              <div className="flex items-center justify-between">
                <h3
                  id="planned-trips-title"
                  className="text-lg font-semibold text-foreground"
                >
                  Planejadas
                </h3>

                <span className="text-sm text-subtle">
                  {
                    plannedTrips.length
                  }
                </span>
              </div>

              {renderTripGrid(
                plannedTrips,
              )}
            </section>
          )}

          {historyTrips.length >
            0 && (
            <section
              className="mt-10"
              aria-labelledby="history-trips-title"
            >
              <div className="flex items-center justify-between">
                <h3
                  id="history-trips-title"
                  className="text-lg font-semibold text-muted"
                >
                  Histórico
                </h3>

                <span className="text-sm text-subtle">
                  {
                    historyTrips.length
                  }
                </span>
              </div>

              {renderTripGrid(
                historyTrips,
              )}
            </section>
          )}
        </>
      )}

      <ConfirmDialog open={completeTarget !== null} title="Concluir viagem?"
        description={completeTarget ? `${completeTarget.origin} → ${completeTarget.destination} será movida para o histórico e o mapa deixará de ser editável.` : ''}
        confirmLabel="Concluir viagem" cancelLabel="Voltar" isPending={isSubmitting} error={error}
        onConfirm={() => void handleComplete()} onCancel={() => {
          setCompleteTarget(null)
          setError(null)
        }} />

      <ConfirmDialog
        open={
          cancelTarget !== null
        }
        title="Cancelar viagem?"
        description={
          cancelTarget
            ? `A viagem ${cancelTarget.origin} → ${cancelTarget.destination} será mantida no histórico como cancelada.`
            : ''
        }
        confirmLabel="Cancelar viagem"
        isPending={
          isSubmitting
        }
        onCancel={() =>
          setCancelTarget(null)
        }
        onConfirm={() =>
          void handleCancel()
        }
      />
    </div>
  )
}
