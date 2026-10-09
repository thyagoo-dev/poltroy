export const POLTROY_DATABASE_NAME = 'poltroy'

export const POLTROY_DATABASE_VERSION = 1

export const databaseSchemaV1 = {
  buses:
    '&id, name, status, activeLayoutId, updatedAt',

  busLayouts:
    '&id, busId, version, &[busId+version], updatedAt',

  trips:
    '&id, busId, layoutId, status, departureAt, updatedAt',

  passengers:
    '&id, name, updatedAt',

  tripSeatStates:
    '&id, tripId, seatId, status, passengerId, &[tripId+seatId], updatedAt',
} as const
