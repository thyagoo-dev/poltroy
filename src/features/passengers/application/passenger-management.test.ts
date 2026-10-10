import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { createPassenger } from '@/features/passengers/application/create-passenger'
import { listPassengers } from '@/features/passengers/application/list-passengers'
import { updatePassenger } from '@/features/passengers/application/update-passenger'
import type { PassengerId } from '@/features/passengers/domain/ids'
import { PoltroyDatabase } from '@/infrastructure/database/poltroy-database'
import { DexiePassengerRepository } from '@/infrastructure/repositories/dexie-passenger-repository'
import { createEntityId } from '@/shared/lib/create-entity-id'

let database: PoltroyDatabase
let repository: DexiePassengerRepository
beforeEach(async () => {
  database = new PoltroyDatabase(`passengers-test-${createEntityId<string>()}`)
  await database.open()
  repository = new DexiePassengerRepository(database)
})
afterEach(async () => { await database.delete() })

describe('Gerenciamento de passageiros', () => {
  it('persiste campos v2 e remove o par de documento na edição, inclusive após reabrir', async () => {
    const existing = await createPassenger({ name: 'Cicero Thyago de Araujo', displayName: ' Thyago ', documentType: 'CPF', documentNumber: '123.456.789-01' }, repository)
    expect(existing).toMatchObject({ displayName: 'Thyago', documentType: 'CPF', documentNumber: '12345678901' })
    const edited = await updatePassenger({ id: existing.id, name: existing.name, displayName: 'Cicero', documentType: 'RG', documentNumber: ' ab-12 / X ' }, repository)
    expect(edited).toMatchObject({ id: existing.id, createdAt: existing.createdAt, displayName: 'Cicero', documentType: 'RG', documentNumber: 'ab-12 / X' })
    await updatePassenger({ id: existing.id, name: existing.name, displayName: 'Thyago', documentType: 'CPF', documentNumber: '' }, repository)
    database.close()
    await database.open()
    const saved = await repository.getById(existing.id)
    expect(saved?.documentType).toBeUndefined()
    expect(saved?.documentNumber).toBeUndefined()
    expect(saved?.createdAt).toBe(existing.createdAt)
  })

  it('lê legacy sem alterá-lo e materializa displayName somente ao salvar explicitamente', async () => {
    const legacy = { id: 'legacy' as PassengerId, name: 'Nome completo antigo', createdAt: '2020-01-01T00:00:00.000Z', updatedAt: '2020-01-01T00:00:00.000Z' }
    await repository.save(legacy)
    expect(await listPassengers(repository)).toEqual([legacy])
    expect(await repository.getById(legacy.id)).toEqual(legacy)
    const result = await updatePassenger({ id: legacy.id, name: legacy.name, displayName: 'Nome completo an' }, repository)
    expect(result).toMatchObject({ id: legacy.id, createdAt: legacy.createdAt, displayName: 'Nome completo an' })
    expect(database.verno).toBe(1)
    expect(database.passengers.schema.indexes.map((index) => index.name)).toEqual(['name', 'updatedAt'])
  })

  it('impede create e update inválidos sem modificar o banco', async () => {
    await expect(createPassenger({ name: 'Teste', displayName: 'x'.repeat(17) }, repository)).rejects.toThrow(/16/)
    expect(await repository.list()).toEqual([])
    const existing = await createPassenger({ name: 'Teste', displayName: 'Teste' }, repository)
    await expect(updatePassenger({ id: existing.id, name: 'Alterado', displayName: 'Teste', documentType: 'CPF', documentNumber: '123' }, repository)).rejects.toThrow(/11/)
    expect(await repository.getById(existing.id)).toEqual(existing)
  })
  it('cria e persiste passageiro com identificador e timestamps', async () => {
    const result = await createPassenger({ displayName: 'Pessoa', name: 'João' }, repository)
    expect(result.id).toBeTruthy()
    expect(result.createdAt).toBe(result.updatedAt)
    expect(await repository.getById(result.id)).toEqual(result)
  })

  it('normaliza nome, telefone e observações', async () => {
    const result = await createPassenger({ displayName: 'Pessoa', name: '  João da Silva  ', phone: '  85999999999  ', notes: '  Bagagem extra  ' }, repository)
    expect(result).toMatchObject({ name: 'João da Silva', phone: '85999999999', notes: 'Bagagem extra' })
  })

  it('normaliza telefone e observações vazios para undefined', async () => {
    const result = await createPassenger({ displayName: 'Pessoa', name: 'João', phone: '  ', notes: '  ' }, repository)
    expect(result.phone).toBeUndefined()
    expect(result.notes).toBeUndefined()
  })

  it.each(['', '  '])('rejeita nome vazio %j sem salvar', async (name) => {
    await expect(createPassenger({ displayName: 'Pessoa', name }, repository)).rejects.toThrow(/nome é obrigatório/i)
    expect(await listPassengers(repository)).toEqual([])
  })

  it('atualiza dados mantendo id e createdAt e renova updatedAt', async () => {
    const existing = await createPassenger({ displayName: 'Pessoa', name: 'João', phone: '123', notes: 'Antiga' }, repository)
    const oldTimestamp = '2020-01-01T00:00:00.000Z'
    await repository.save({ ...existing, createdAt: oldTimestamp, updatedAt: oldTimestamp })
    const result = await updatePassenger({ displayName: 'Pessoa', id: existing.id, name: '  João Silva ', phone: ' ', notes: ' Nova ' }, repository)
    expect(result).toMatchObject({ id: existing.id, createdAt: oldTimestamp, name: 'João Silva', notes: 'Nova' })
    expect(result.phone).toBeUndefined()
    expect(Date.parse(result.updatedAt)).toBeGreaterThan(Date.parse(oldTimestamp))
    expect(await repository.getById(existing.id)).toEqual(result)
  })

  it('rejeita atualização com nome vazio sem alterar os dados', async () => {
    const existing = await createPassenger({ displayName: 'Pessoa', name: 'João' }, repository)
    await expect(updatePassenger({ displayName: 'Pessoa', id: existing.id, name: ' ' }, repository)).rejects.toThrow(/nome é obrigatório/i)
    expect(await repository.getById(existing.id)).toEqual(existing)
  })

  it('rejeita atualização de passageiro inexistente', async () => {
    await expect(updatePassenger({ displayName: 'Pessoa', id: 'missing' as PassengerId, name: 'João' }, repository)).rejects.toThrow(/não encontrado/i)
  })

  it('lista passageiros e permite nomes duplicados', async () => {
    const first = await createPassenger({ displayName: 'Pessoa', name: 'João' }, repository)
    const second = await createPassenger({ displayName: 'Pessoa', name: 'João' }, repository)
    expect(first.id).not.toBe(second.id)
    expect(await listPassengers(repository)).toEqual(expect.arrayContaining([first, second]))
    expect(await listPassengers(repository)).toHaveLength(2)
  })

  it('mantém dados depois de fechar e reabrir o IndexedDB', async () => {
    const passenger = await createPassenger({ displayName: 'Pessoa', name: 'João', phone: '85999999999' }, repository)
    database.close()
    await database.open()
    expect(await listPassengers(repository)).toEqual([passenger])
  })
})
