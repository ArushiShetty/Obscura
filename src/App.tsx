import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AppProvider } from './context/AppContext'
import { DiscoverPage } from './pages/DiscoverPage'
import { HomePage } from './pages/HomePage'
import { ItineraryPage } from './pages/ItineraryPage'
import { MyTripsPage } from './pages/MyTripsPage'
import { PlannerPage } from './pages/PlannerPage'
import { SavedPlacesPage } from './pages/SavedPlacesPage'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/plan" element={<PlannerPage />} />
            <Route path="/itinerary" element={<ItineraryPage />} />
            <Route path="/saved" element={<SavedPlacesPage />} />
            <Route path="/trips" element={<MyTripsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
