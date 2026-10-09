export interface TripInputFields {
  origin: string
  destination: string

  departureAt: string
  arrivalEstimateAt?: string

  notes?: string
}

export interface NormalizedTripFields {
  origin: string
  destination: string

  departureAt: string
  arrivalEstimateAt?: string

  notes?: string
}

function normalizeRequiredText(
  value: string,
  fieldName: string,
) {
  const normalized =
    value.trim()

  if (!normalized) {
    throw new Error(
      `${fieldName} é obrigatório.`,
    )
  }

  return normalized
}

function normalizeOptionalText(
  value: string | undefined,
) {
  const normalized =
    value?.trim()

  return normalized || undefined
}

function normalizeTimestamp(
  value: string,
  fieldName: string,
) {
  const timestamp =
    Date.parse(value)

  if (
    Number.isNaN(timestamp)
  ) {
    throw new Error(
      `${fieldName} possui uma data inválida.`,
    )
  }

  return new Date(
    timestamp,
  ).toISOString()
}

export function normalizeTripFields(
  input: TripInputFields,
): NormalizedTripFields {
  const origin =
    normalizeRequiredText(
      input.origin,
      'Origem',
    )

  const destination =
    normalizeRequiredText(
      input.destination,
      'Destino',
    )

  if (
    origin.localeCompare(
      destination,
      undefined,
      {
        sensitivity: 'base',
      },
    ) === 0
  ) {
    throw new Error(
      'Origem e destino precisam ser diferentes.',
    )
  }

  const departureAt =
    normalizeTimestamp(
      input.departureAt,
      'Data de saída',
    )

  const arrivalEstimateAt =
    input.arrivalEstimateAt
      ? normalizeTimestamp(
          input.arrivalEstimateAt,
          'Previsão de chegada',
        )
      : undefined

  if (
    arrivalEstimateAt &&
    Date.parse(
      arrivalEstimateAt,
    ) <=
      Date.parse(
        departureAt,
      )
  ) {
    throw new Error(
      'A previsão de chegada precisa ser posterior à saída.',
    )
  }

  return {
    origin,
    destination,

    departureAt,
    arrivalEstimateAt,

    notes:
      normalizeOptionalText(
        input.notes,
      ),
  }
}
