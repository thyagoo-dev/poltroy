import { describe, expect, it, vi } from 'vitest'

import { backupFilename, createBackup } from '@/features/backup/application/create-backup'
import { validatePoltroyBackup } from '@/features/backup/application/validate-backup'
import { restoreBackup } from '@/features/backup/application/restore-backup'
import { backupFixture, backupV2Fixture } from '@/features/backup/test/backup-fixtures'

describe('backup application actions', () => {
  it('exporta fallback legacy sem escrever no banco ou modificar o snapshot', async () => {
    const data = backupFixture().data
    const before = structuredClone(data)
    const replaceAll = vi.fn()
    const result = await createBackup({ exportSnapshot: async () => data, replaceAll })
    expect(data).toEqual(before)
    expect(replaceAll).not.toHaveBeenCalled()
    expect(result.data.passengers[0].displayName).toBe('Passageiro de te')
    expect(result.data.passengers[0].documentType).toBeUndefined()
    expect(validatePoltroyBackup(result).success).toBe(true)
  })

  it('exporta e restaura v2 preservando documento e associações', async () => {
    const data = backupV2Fixture().data
    Object.assign(data.passengers[0], { displayName: 'Thyago', documentType: 'CPF', documentNumber: '12345678901', notes: undefined })
    const result = await createBackup({ exportSnapshot: async () => data, replaceAll: vi.fn() })
    const replaceAll = vi.fn()
    const validated = validatePoltroyBackup(result)
    expect(validated.success).toBe(true)
    if (!validated.success) return
    await restoreBackup(validated.backup, { exportSnapshot: vi.fn(), replaceAll })
    expect(replaceAll).toHaveBeenCalledExactlyOnceWith(result.data)
    expect(result.data.tripSeatStates).toEqual(data.tripSeatStates)
    expect(result.data.passengers[0]).toMatchObject({ displayName: 'Thyago', documentType: 'CPF', documentNumber: '12345678901' })
  })
  it('exporta todas as coleções, metadados atuais e ordenação por ID', async () => {
    const data = backupFixture('z').data
    data.passengers.push(backupFixture('a').data.passengers[0])
    const before = Date.now()
    const result = await createBackup({ exportSnapshot: async () => structuredClone(data), replaceAll: vi.fn() })
    expect(result.app).toBe('POLTROY')
    expect(result.backupVersion).toBe(2)
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
    expect(replaceAll).toHaveBeenCalledExactlyOnceWith(backupV2Fixture().data)
  })

  it('propaga erro de persistência sem esconder falha', async () => {
    await expect(restoreBackup(backupFixture(), { exportSnapshot: vi.fn(), replaceAll: async () => { throw new Error('Falha de escrita') } })).rejects.toThrow('Falha de escrita')
  })
})
