import { describe, expect, it } from 'vitest'
import { getPassengerTitleId, getRoutePresentation } from '@/app/layouts/route-presentation'

describe('route presentation', () => {
  it.each([
    ['/', 'Mapa'], ['/trips', 'Viagens'], ['/buses', 'Ônibus'], ['/passengers', 'Passageiros'],
    ['/passengers/new', 'Novo passageiro'], ['/passengers/id', 'Cadastro do passageiro'],
    ['/passengers/id/edit', 'Editar passageiro'], ['/more', 'Mais'], ['/more/app', 'Aplicativo'],
    ['/more/backup', 'Backup e restauração'], ['/more/settings', 'Configurações'], ['/more/about', 'Sobre'],
    ['/missing', 'Página não encontrada'], ['/more/missing', 'Página não encontrada'],
    ['/passengers/id/missing', 'Página não encontrada'],
    ['/more/backup/', 'Backup e restauração'], ['/passengers/id/edit/', 'Editar passageiro'],
  ])('provides a specific title for %s', (path, title) => {
    expect(getRoutePresentation(path).documentTitle).toBe(`${title} — Poltroy`)
  })
  it('uses only the supplied passenger name in a details title', () => {
    expect(getRoutePresentation('/passengers/id', 'Cicero Thyago').documentTitle).toBe('Cicero Thyago — Poltroy')
    expect(getRoutePresentation('/passengers/id/edit', 'Cicero Thyago').documentTitle).toBe('Editar passageiro — Poltroy')
  })
  it('preserves shell section names for valid subroutes', () => {
    expect(getRoutePresentation('/more/backup').sectionTitle).toBe('Mais')
    expect(getRoutePresentation('/passengers/new').sectionTitle).toBe('Passageiros')
  })
  it('decodes a details id without fetching new/edit/invalid routes', () => {
    expect(getPassengerTitleId('/passengers/a%20b')).toBe('a b')
    for (const path of ['/passengers/new', '/passengers/a/edit', '/passengers/%ZZ', '/passengers/a/extra']) {
      expect(getPassengerTitleId(path)).toBeUndefined()
    }
  })
})
