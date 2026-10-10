import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { restoreBackup } from '@/features/backup/application/restore-backup'
import { backupFixture, emptyBackupFixture } from '@/features/backup/test/backup-fixtures'
import { PoltroyDatabase } from '@/infrastructure/database/poltroy-database'
import { DexieBackupRepository } from '@/infrastructure/repositories/dexie-backup-repository'

let database: PoltroyDatabase
let repository: DexieBackupRepository

beforeEach(async () => {
  database = new PoltroyDatabase(`poltroy-backup-test-${crypto.randomUUID()}`)
  repository = new DexieBackupRepository(database)
  await database.open()
})
afterEach(async () => {
  vi.restoreAllMocks()
  await database.delete()
})

describe('Dexie backup repository', () => {
  it('exporta snapshot consistente em transação readonly dos cinco stores', async () => {
    const input = backupFixture()
    await repository.replaceAll(input.data)
    const transaction = vi.spyOn(database, 'transaction')
    expect(await repository.exportSnapshot()).toEqual(input.data)
    expect(transaction).toHaveBeenCalledWith('r', [database.buses, database.busLayouts, database.trips, database.passengers, database.tripSeatStates], expect.any(Function))
  })

  it('substitui Dataset A por B completamente nos cinco stores', async () => {
    await repository.replaceAll(backupFixture('a').data)
    await restoreBackup(backupFixture('b'), repository)
    expect(await repository.exportSnapshot()).toEqual(backupFixture('b').data)
  })

  it('rollback integral preserva A quando falha na última escrita depois de clear e quatro imports', async () => {
    const original = backupFixture('a').data
    await repository.replaceAll(original)
    const failure = vi.spyOn(database.tripSeatStates, 'bulkPut').mockRejectedValueOnce(new Error('Falha na última tabela'))
    await expect(restoreBackup(backupFixture('b'), repository)).rejects.toThrow('Falha na última tabela')
    expect(failure).toHaveBeenCalledOnce()
    expect(await repository.exportSnapshot()).toEqual(original)
  })

  it('rollback integral preserva A em erro real de constraint dentro da transação', async () => {
    const original = backupFixture('a').data
    await repository.replaceAll(original)
    const invalid = backupFixture('b').data
    invalid.tripSeatStates.push({ ...invalid.tripSeatStates[0], id: backupFixture('c').data.tripSeatStates[0].id })
    // Bypass the application validator only in this test to exercise the real DB constraint.
    await expect(repository.replaceAll(invalid)).rejects.toThrow()
    expect(await repository.exportSnapshot()).toEqual(original)
  })

  it('backup inválido é rejeitado sem abrir transação de escrita', async () => {
    const original = backupFixture().data
    await repository.replaceAll(original)
    const transaction = vi.spyOn(database, 'transaction')
    await expect(restoreBackup({ app: 'OUTRO' }, repository)).rejects.toThrow()
    expect(transaction).not.toHaveBeenCalled()
    expect(await repository.exportSnapshot()).toEqual(original)
  })

  it('restaura backup vazio e exporta cinco arrays vazios', async () => {
    await repository.replaceAll(backupFixture().data)
    await restoreBackup(emptyBackupFixture(), repository)
    expect(await repository.exportSnapshot()).toEqual(emptyBackupFixture().data)
  })
})
