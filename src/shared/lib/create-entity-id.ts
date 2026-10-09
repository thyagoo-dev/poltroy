export function createEntityId<Id extends string>(): Id {
  if (
    typeof globalThis.crypto === 'undefined' ||
    typeof globalThis.crypto.randomUUID !== 'function'
  ) {
    throw new Error(
      'Não foi possível gerar um identificador seguro neste ambiente.',
    )
  }

  return globalThis.crypto.randomUUID() as Id
}
