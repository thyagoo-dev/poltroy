import { describe, expect, it } from 'vitest'

import { formatOperationalOccupancy } from '@/features/trips/ui/format-operational-occupancy'

describe('formatOperationalOccupancy', () => {
  it.each([
    [{ occupied: 0, reserved: 0, blocked: 0, free: 46 }, '46 livres'],
    [{ occupied: 1, reserved: 0, blocked: 0, free: 45 }, '1 ocupado · 45 livres'],
    [{ occupied: 2, reserved: 0, blocked: 0, free: 44 }, '2 ocupados · 44 livres'],
    [{ occupied: 0, reserved: 1, blocked: 0, free: 1 }, '1 reservado · 1 livre'],
    [{ occupied: 0, reserved: 0, blocked: 1, free: 0 }, '1 bloqueado · 0 livres'],
    [{ occupied: 2, reserved: 2, blocked: 2, free: 40 }, '2 ocupados · 2 reservados · 2 bloqueados · 40 livres'],
    [{ occupied: 1, reserved: 1, blocked: 1, free: 43 }, '1 ocupado · 1 reservado · 1 bloqueado · 43 livres'],
  ])('formats counts in operational order: %j', (summary, expected) => {
    expect(formatOperationalOccupancy(summary)).toBe(expected)
  })
})
