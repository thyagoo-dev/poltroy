import { describe, expect, it } from 'vitest'

import { getShellBusContext } from '@/app/layouts/shell-route-context'

describe('shell bus context by route', () => {
  it.each([
    ['/', 'link'],
    ['/trips', 'link'],
    ['/trips/', 'link'],
    ['/buses', 'indicator'],
    ['/buses/', 'indicator'],
    ['/passengers', null],
    ['/passengers/new', null],
    ['/passengers/abc', null],
    ['/passengers/abc/edit', null],
    ['/passengers/example/edit', null],
    ['/more', null],
    ['/more/app', null],
    ['/more/backup', null],
    ['/more/settings', null],
    ['/more/about', null],
    ['/qualquer-coisa', null],
    ['/trips/history', null],
    ['/buses/unknown', null],
    ['/trips-extra', null],
    ['/buses-extra', null],
  ] as const)('%s resolves to %s', (pathname, expected) => {
    expect(getShellBusContext(pathname)).toBe(expected)
  })
})
