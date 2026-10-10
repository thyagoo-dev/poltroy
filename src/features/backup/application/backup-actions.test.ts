import { describe, expect, it, vi } from 'vitest'

import { backupFilename, createBackup } from '@/features/backup/application/create-backup'
import { restoreBackup } from '@/features/backup/application/restore-backup'
import { backupFixture } from '@/features/backup/test/backup-fixtures'

describe('backup application actions', () => {
  it('exporta todas as coleções, metadados atuais e ordenação por ID', async () => {
    const data = backupFixture('z').data
    data.passengers.push(backupFixture('a').data.passengers[0])
    const before = Date.now()
    const result = await createBackup({ exportSnapshot: async () => structuredClone(data), replaceAll: vi.fn() })
    expect(result.app).toBe('POLTROY')
    expect(result.backupVersion).toBe(1)
    expect(Date.parse(result.exportedAt)).toBeGreaterThanOrEqual(before)
    expect(Date.parse(result.exportedAt)).toBeLessThanOrEqual(Date.now())
    expect(Object.keys(result.data)).toEqual(['buses', 'busLayouts', 'trips', 'passengers', 'tripSeatStates'])
    expect(result.data.passengers.map((p) => p.id)).toEqual(['a-passenger', 'z-passenger'])
    expect(result.data.buses).toEqual(data.buses)
    expect(result.data.busLayouts).toEqual(data.busLayouts)
    expect(result.data.trips).toEqual(data.trips)
    expect(result.data.tripSeatStates).toEqual(data.tripSeatStates)
    expect(data.passengers[0].id).toBe('z-passenger')
  })

  it('gera filename UTC seguro para Windows, sem dados pessoais', () => {
    expect(backupFilename('2026-10-10T12:34:56.789Z')).toBe('poltroy-backup-2026-10-10T12-34-56Z.json')
  })

  it('revalida e impede chamar replaceAll para backup inválido', async () => {
    const replaceAll = vi.fn()
    await expect(restoreBackup({ app: 'OUTRO' }, { exportSnapshot: vi.fn(), replaceAll })).rejects.toThrow('não é um backup')
    expect(replaceAll).not.toHaveBeenCalled()
  })

  it('entrega somente snapshot validado e sanitizado ao repository', async () => {
    const input = backupFixture()
    Object.assign(input.data.passengers[0], { extra: true })
    const replaceAll = vi.fn()
    await restoreBackup(input, { exportSnapshot: vi.fn(), replaceAll })
    expect(replaceAll).toHaveBeenCalledExactlyOnceWith(backupFixture().data)
  })

  it('propaga erro de persistência sem esconder falha', async () => {
    await expect(restoreBackup(backupFixture(), { exportSnapshot: vi.fn(), replaceAll: async () => { throw new Error('Falha de escrita') } })).rejects.toThrow('Falha de escrita')
  })
})
