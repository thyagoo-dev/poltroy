export interface PassengerInputFields {
  name: string
  phone?: string
  notes?: string
}

export function normalizePassengerFields(input: PassengerInputFields): PassengerInputFields {
  const name = input.name.trim()
  if (!name) throw new Error('Nome é obrigatório.')

  return {
    name,
    phone: input.phone?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
  }
}
