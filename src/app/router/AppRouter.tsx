import { lazy } from 'react'
import {
  BrowserRouter,
  Route,
  Routes,
} from 'react-router'

import { AppShell } from '@/app/layouts/AppShell'
import { MapPage } from '@/pages/map/MapPage'

const BusesPage = lazy(() => import('@/pages/buses/BusesPage').then((module) => ({ default: module.BusesPage })))
const TripsPage = lazy(() => import('@/pages/trips/TripsPage').then((module) => ({ default: module.TripsPage })))
const PassengersPage = lazy(() => import('@/pages/passengers/passenger-pages').then((module) => ({ default: module.PassengersPage })))
const PassengerCreatePage = lazy(() => import('@/pages/passengers/passenger-pages').then((module) => ({ default: module.PassengerCreatePage })))
const PassengerDetailsPage = lazy(() => import('@/pages/passengers/passenger-pages').then((module) => ({ default: module.PassengerDetailsPage })))
const PassengerEditPage = lazy(() => import('@/pages/passengers/passenger-pages').then((module) => ({ default: module.PassengerEditPage })))
const MorePage = lazy(() => import('@/pages/more/more-pages').then((module) => ({ default: module.MorePage })))
const MoreAppPage = lazy(() => import('@/pages/more/more-pages').then((module) => ({ default: module.MoreAppPage })))
const MoreBackupPage = lazy(() => import('@/pages/more/MoreBackupPage').then((module) => ({ default: module.MoreBackupPage })))
const MoreSettingsPage = lazy(() => import('@/pages/more/more-pages').then((module) => ({ default: module.MoreSettingsPage })))
const MoreAboutPage = lazy(() => import('@/pages/more/more-pages').then((module) => ({ default: module.MoreAboutPage })))
const NotFoundPage = lazy(() => import('@/pages/not-found/NotFoundPage').then((module) => ({ default: module.NotFoundPage })))

export function AppRouter() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
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
