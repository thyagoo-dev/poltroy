function pad(
  value: number,
) {
  return value
    .toString()
    .padStart(2, '0')
}

export function toDateTimeLocalInputValue(
  isoTimestamp:
    | string
    | undefined,
) {
  if (!isoTimestamp) {
    return ''
  }

  const date =
    new Date(
      isoTimestamp,
    )

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return ''
  }

  return [
    date.getFullYear(),
    '-',
    pad(
      date.getMonth() +
        1,
    ),
    '-',
    pad(
      date.getDate(),
    ),
    'T',
    pad(
      date.getHours(),
    ),
    ':',
    pad(
      date.getMinutes(),
    ),
  ].join('')
}

export function fromDateTimeLocalInputValue(
  value: string,
) {
  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    throw new Error(
      'Data e hora inválidas.',
    )
  }

  return date.toISOString()
}

const dateTimeFormatter =
  new Intl.DateTimeFormat(
    'pt-BR',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    },
  )

export function formatDateTime(
  isoTimestamp: string,
) {
  const date =
    new Date(
      isoTimestamp,
    )

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return isoTimestamp
  }

  return dateTimeFormatter.format(
    date,
  )
}
