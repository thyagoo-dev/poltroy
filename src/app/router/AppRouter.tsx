import {
  BrowserRouter,
  Route,
  Routes,
} from 'react-router'

import { AppShell } from '@/app/layouts/AppShell'
import { BusesPage } from '@/pages/buses/BusesPage'
import { MapPage } from '@/pages/map/MapPage'
import { MorePage } from '@/pages/more/MorePage'
import { MoreAppPage } from '@/pages/more/MoreAppPage'
import { MoreBackupPage } from '@/pages/more/MoreBackupPage'
import { MoreSettingsPage } from '@/pages/more/MoreSettingsPage'
import { MoreAboutPage } from '@/pages/more/MoreAboutPage'
import { NotFoundPage } from '@/pages/not-found/NotFoundPage'
import { PassengersPage } from '@/pages/passengers/PassengersPage'
import { PassengerCreatePage } from '@/pages/passengers/PassengerCreatePage'
import { PassengerDetailsPage } from '@/pages/passengers/PassengerDetailsPage'
import { PassengerEditPage } from '@/pages/passengers/PassengerEditPage'
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
            path="buses"
            element={<BusesPage />}
          />

          <Route
            path="trips"
            element={<TripsPage />}
          />

          <Route
            path="passengers"
            element={<PassengersPage />}
          />

          <Route path="passengers/new" element={<PassengerCreatePage />} />
          <Route path="passengers/:passengerId" element={<PassengerDetailsPage />} />
          <Route path="passengers/:passengerId/edit" element={<PassengerEditPage />} />

          <Route
            path="more"
            element={<MorePage />}
          />

          <Route path="more/app" element={<MoreAppPage />} />
          <Route path="more/backup" element={<MoreBackupPage />} />
          <Route path="more/settings" element={<MoreSettingsPage />} />
          <Route path="more/about" element={<MoreAboutPage />} />

          <Route
            path="*"
            element={<NotFoundPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
