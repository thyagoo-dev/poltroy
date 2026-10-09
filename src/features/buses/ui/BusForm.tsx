import {
  useState,
  type FormEvent,
} from 'react'

import {
  busLayoutPresets,
  type BusLayoutPresetId,
} from '@/features/buses/application/bus-layout-presets'
import type { Bus } from '@/features/buses/domain/bus'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'

export interface BusFormValues {
  name: string
  plate: string
  model: string

  presetId:
    BusLayoutPresetId
}

interface BusFormProps {
  mode: 'create' | 'edit'

  bus?: Bus

  isSubmitting?: boolean

  onSubmit: (
    values: BusFormValues,
  ) => Promise<void>

  onCancel: () => void
}

const defaultPreset:
  BusLayoutPresetId =
  'conventional-44'

export function BusForm({
  mode,
  bus,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: BusFormProps) {
  const [
    name,
    setName,
  ] = useState(bus?.name ?? '')

  const [
    plate,
    setPlate,
  ] = useState(bus?.plate ?? '')

  const [
    model,
    setModel,
  ] = useState(bus?.model ?? '')

  const [
    presetId,
    setPresetId,
  ] =
    useState<BusLayoutPresetId>(
      defaultPreset,
    )

  const [
    validationError,
    setValidationError,
  ] = useState<string | null>(
    null,
  )

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (!name.trim()) {
      setValidationError(
        'Informe um nome para o ônibus.',
      )

      return
    }

    setValidationError(null)

    await onSubmit({
      name,
      plate,
      model,
      presetId,
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <label
          htmlFor="bus-name"
          className="text-sm font-semibold text-foreground"
        >
          Nome do ônibus
        </label>

        <p className="mt-1 text-xs leading-5 text-muted">
          Um nome fácil de reconhecer durante a operação.
        </p>

        <Input
          id="bus-name" aria-describedby={validationError ? "bus-name-error" : undefined}
          className="mt-2"
          value={name}
          onChange={(event) =>
            setName(
              event.target.value,
            )
          }
          placeholder="Ex.: Expresso Litoral - 01"
          autoComplete="off"
          maxLength={80}
          aria-invalid={
            validationError
              ? true
              : undefined
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="bus-plate"
            className="text-sm font-semibold text-foreground"
          >
            Placa
          </label>

          <Input
            id="bus-plate"
            className="mt-2 uppercase"
            value={plate}
            onChange={(event) =>
              setPlate(
                event.target.value,
              )
            }
            placeholder="ABC1D23"
            autoComplete="off"
            maxLength={10}
          />
        </div>

        <div>
          <label
            htmlFor="bus-model"
            className="text-sm font-semibold text-foreground"
          >
            Modelo
          </label>

          <Input
            id="bus-model"
            className="mt-2"
            value={model}
            onChange={(event) =>
              setModel(
                event.target.value,
              )
            }
            placeholder="Ex.: Paradiso G8"
            autoComplete="off"
            maxLength={80}
          />
        </div>
      </div>

      {mode === 'create' && (
        <div>
          <label
            htmlFor="bus-layout"
            className="text-sm font-semibold text-foreground"
          >
            Configuração inicial
          </label>

          <p className="mt-1 text-xs leading-5 text-muted">
            O layout poderá ser refinado posteriormente.
          </p>

          <Select
            id="bus-layout"
            className="mt-2"
            value={presetId}
            onChange={(event) =>
              setPresetId(
                event.target
                  .value as BusLayoutPresetId,
              )
            }
          >
            {busLayoutPresets.map(
              (preset) => (
                <option
                  key={preset.id}
                  value={preset.id}
                >
                  {preset.name} ·{' '}
                  {preset.seatCount}{' '}
                  lugares
                </option>
              ),
            )}
          </Select>

          <p className="mt-2 text-xs leading-5 text-subtle">
            {
              busLayoutPresets.find(
                (preset) =>
                  preset.id ===
                  presetId,
              )?.description
            }
          </p>
        </div>
      )}

      {validationError && (
        <p
          role="alert" id="bus-name-error"
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

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? 'Salvando...'
            : mode === 'create'
              ? 'Adicionar ônibus'
              : 'Salvar alterações'}
        </Button>
      </div>
    </form>
  )
}
