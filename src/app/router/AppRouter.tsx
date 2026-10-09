import {
  BrowserRouter,
  Route,
  Routes,
} from 'react-router'

import { AppShell } from '@/app/layouts/AppShell'
import { MapPage } from '@/pages/map/MapPage'
import { MorePage } from '@/pages/more/MorePage'
import { NotFoundPage } from '@/pages/not-found/NotFoundPage'
import { PassengersPage } from '@/pages/passengers/PassengersPage'
import { TripsPage } from '@/pages/trips/TripsPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route
            index
            element={<MapPage />}
          />

          <Route
            path="trips"
            element={<TripsPage />}
          />

          <Route
            path="passengers"
            element={<PassengersPage />}
          />

          <Route
            path="more"
            element={<MorePage />}
          />

          <Route
            path="*"
            element={<NotFoundPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
