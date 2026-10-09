import {
  Archive,
  BusFront,
  Copy,
  Pencil,
  Plus,
  RotateCcw,
} from 'lucide-react'
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useNavigate } from 'react-router'

import {
  archiveBusAction,
  createBusAction,
  duplicateBusAction,
  listBusesAction,
  restoreBusAction,
  updateBusAction,
} from '@/app/services/bus-actions'
import type { BusSummary } from '@/features/buses/application/list-buses'
import type { Bus } from '@/features/buses/domain/bus'
import {
  BusForm,
  type BusFormValues,
} from '@/features/buses/ui/BusForm'
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
      bus: Bus
    }
  | null

export function BusesPage() {
  const navigate = useNavigate()

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

  const clearBus =
    useBusSelectionStore(
      (state) =>
        state.clearBus,
    )

  const refreshActiveBus =
    useBusSelectionStore(
      (state) =>
        state.refreshActiveBus,
    )

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
    archiveTarget,
    setArchiveTarget,
  ] =
    useState<Bus | null>(null)

  const [
    error,
    setError,
  ] =
    useState<string | null>(null)

  const [
    message,
    setMessage,
  ] =
    useState<string | null>(null)

  const loadBuses =
    useCallback(async () => {
      try {
        const result =
          await listBusesAction()

        setBuses(result)
      } catch {
        setError(
          'Não foi possível carregar os ônibus.',
        )
      } finally {
        setIsLoading(false)
      }
    }, [])

  useEffect(() => {
    let cancelled = false

    void listBusesAction()
      .then((result) => {
        if (!cancelled) {
          setBuses(result)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Não foi possível carregar os ônibus.')
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
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

  const archivedBuses =
    useMemo(
      () =>
        buses.filter(
          ({ bus }) =>
            bus.status ===
            'ARCHIVED',
        ),
      [buses],
    )

  async function handleCreate(
    values: BusFormValues,
  ) {
    setIsSubmitting(true)
    setError(null)

    try {
      const bus =
        await createBusAction({
          name: values.name,
          plate: values.plate,
          model: values.model,
          presetId:
            values.presetId,
        })

      selectBus(bus.id)

      setFormState(null)

      setMessage(
        'Ônibus adicionado e selecionado.',
      )

      await loadBuses()
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Não foi possível adicionar o ônibus.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUpdate(
    bus: Bus,
    values: BusFormValues,
  ) {
    setIsSubmitting(true)
    setError(null)

    try {
      await updateBusAction({
        id: bus.id,

        name: values.name,
        plate: values.plate,
        model: values.model,
      })

      if (
        activeBusId ===
        bus.id
      ) {
        refreshActiveBus()
      }

      setFormState(null)

      setMessage(
        'Dados do ônibus atualizados.',
      )

      await loadBuses()
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Não foi possível atualizar o ônibus.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDuplicate(
    bus: Bus,
  ) {
    setError(null)

    try {
      await duplicateBusAction(
        bus.id,
      )

      setMessage(
        'Ônibus duplicado com sucesso.',
      )

      await loadBuses()
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Não foi possível duplicar o ônibus.',
      )
    }
  }

  async function handleArchive() {
    if (!archiveTarget) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await archiveBusAction(
        archiveTarget.id,
      )

      if (
        activeBusId ===
        archiveTarget.id
      ) {
        clearBus()
      }

      setArchiveTarget(null)

      setMessage(
        'Ônibus arquivado.',
      )

      await loadBuses()
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Não foi possível arquivar o ônibus.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRestore(
    bus: Bus,
  ) {
    setError(null)

    try {
      await restoreBusAction(
        bus.id,
      )

      setMessage(
        'Ônibus restaurado.',
      )

      await loadBuses()
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Não foi possível restaurar o ônibus.',
      )
    }
  }

  function handleSelect(
    bus: Bus,
  ) {
    selectBus(bus.id)

    navigate('/')
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
          aria-labelledby="buses-page-title"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
            Frota
          </p>

          <h2
            id="buses-page-title"
            className="
              mt-2
              text-2xl font-bold
              tracking-[-0.035em]
              text-foreground
              sm:text-3xl
            "
          >
            Seus ônibus
          </h2>

          <p className="mt-2 max-w-2xl leading-7 text-muted">
            Cadastre os veículos e escolha qual será utilizado na operação atual.
          </p>
        </section>

        {!formState && (
          <Button
            onClick={() =>
              setFormState({
                type: 'create',
              })
            }
          >
            <Plus
              aria-hidden="true"
              size={18}
            />

            Adicionar ônibus
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
                ? 'Novo ônibus'
                : 'Editar ônibus'}
            </p>

            <h3 className="mt-2 text-xl font-semibold tracking-[-0.025em]">
              {formState.type ===
              'create'
                ? 'Adicionar à frota'
                : formState.bus.name}
            </h3>
          </div>

          <BusForm key={formState.type === 'edit' ? formState.bus.id : 'create'}
            mode={formState.type}
            bus={
              formState.type ===
              'edit'
                ? formState.bus
                : undefined
            }
            isSubmitting={
              isSubmitting
            }
            onCancel={() =>
              setFormState(null)
            }
            onSubmit={(values) =>
              formState.type ===
              'create'
                ? handleCreate(
                    values,
                  )
                : handleUpdate(
                    formState.bus,
                    values,
                  )
            }
          />
        </Card>
      )}

      <section
        className="mt-8"
        aria-labelledby="active-buses-title"
      >
        <div className="flex items-center justify-between gap-4">
          <h3
            id="active-buses-title"
            className="text-lg font-semibold tracking-[-0.02em]"
          >
            Ativos
          </h3>

          {!isLoading && (
            <span className="text-sm text-subtle">
              {activeBuses.length}
            </span>
          )}
        </div>

        {isLoading ? (
          <Card
            className="mt-4"
            padding="lg"
          >
            <p className="text-sm text-muted">
              Carregando ônibus...
            </p>
          </Card>
        ) : activeBuses.length ===
          0 ? (
          <Card
            className="
              mt-4
              flex min-h-56
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
                <BusFront
                  aria-hidden="true"
                  size={27}
                />
              </div>

              <h4 className="mt-5 font-semibold text-foreground">
                Sua frota está vazia
              </h4>

              <p className="mt-2 text-sm leading-6 text-muted">
                Adicione o primeiro ônibus para começar a preparar viagens e mapas de assentos.
              </p>
            </div>
          </Card>
        ) : (
          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            {activeBuses.map(
              ({
                bus,
                activeLayout,
                seatCount,
              }) => {
                const selected =
                  bus.id ===
                  activeBusId

                return (
                  <Card
                    key={bus.id}
                    variant={
                      selected
                        ? 'raised'
                        : 'default'
                    }
                    padding="lg"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="
                          flex size-11 shrink-0
                          items-center justify-center
                          rounded-control
                          border border-primary/15
                          bg-primary/10
                          text-primary
                        "
                      >
                        <BusFront
                          aria-hidden="true"
                          size={21}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="break-words font-semibold text-foreground">
                            {bus.name}
                          </h4>

                          {selected && (
                            <span
                              className="
                                rounded-pill
                                bg-primary/10
                                px-2 py-1
                                text-[0.625rem]
                                font-bold
                                uppercase
                                tracking-[0.08em]
                                text-primary
                              "
                            >
                              Selecionado
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-sm text-muted">
                          {activeLayout?.name ??
                            'Layout indisponível'}
                          {' · '}
                          {seatCount}{' '}
                          lugares
                        </p>

                        {(bus.plate ||
                          bus.model) && (
                          <p className="mt-2 text-xs text-subtle">
                            {[
                              bus.plate,
                              bus.model,
                            ]
                              .filter(Boolean)
                              .join(
                                ' · ',
                              )}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {!selected && (
                        <Button
                          size="sm"
                          onClick={() =>
                            handleSelect(
                              bus,
                            )
                          }
                        >
                          Selecionar
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          setFormState({
                            type: 'edit',
                            bus,
                          })
                        }
                      >
                        <Pencil
                          aria-hidden="true"
                          size={15}
                        />

                        Editar
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          void handleDuplicate(
                            bus,
                          )
                        }
                      >
                        <Copy
                          aria-hidden="true"
                          size={15}
                        />

                        Duplicar
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setArchiveTarget(
                            bus,
                          )
                        }
                      >
                        <Archive
                          aria-hidden="true"
                          size={15}
                        />

                        Arquivar
                      </Button>
                    </div>
                  </Card>
                )
              },
            )}
          </div>
        )}
      </section>

      {archivedBuses.length >
        0 && (
        <section
          className="mt-10"
          aria-labelledby="archived-buses-title"
        >
          <div className="flex items-center justify-between gap-4">
            <h3
              id="archived-buses-title"
              className="text-lg font-semibold tracking-[-0.02em] text-muted"
            >
              Arquivados
            </h3>

            <span className="text-sm text-subtle">
              {
                archivedBuses.length
              }
            </span>
          </div>

          <div className="mt-4 grid gap-3 xl:grid-cols-2">
            {archivedBuses.map(
              ({
                bus,
                seatCount,
              }) => (
                <Card
                  key={bus.id}
                  variant="soft"
                  padding="md"
                >
                  <div className="flex items-center gap-4">
                    <BusFront
                      aria-hidden="true"
                      className="shrink-0 text-subtle"
                      size={20}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-muted">
                        {bus.name}
                      </p>

                      <p className="mt-1 text-xs text-subtle">
                        {seatCount}{' '}
                        lugares
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        void handleRestore(
                          bus,
                        )
                      }
                    >
                      <RotateCcw
                        aria-hidden="true"
                        size={15}
                      />

                      Restaurar
                    </Button>
                  </div>
                </Card>
              ),
            )}
          </div>
        </section>
      )}

      <ConfirmDialog
        open={
          archiveTarget !== null
        }
        title="Arquivar ônibus?"
        description={
          archiveTarget
            ? `"${archiveTarget.name}" deixará de aparecer entre os ônibus ativos. Os dados e o layout continuarão armazenados e poderão ser restaurados posteriormente.`
            : ''
        }
        confirmLabel="Arquivar"
        isPending={isSubmitting}
        onCancel={() =>
          setArchiveTarget(null)
        }
        onConfirm={() =>
          void handleArchive()
        }
      />
    </div>
  )
}
