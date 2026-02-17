// ============================================
// Member 6: App root & routing
// ============================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { HomePage } from '@/pages/HomePage'
import { EventsPage } from '@/pages/EventsPage'
import { EventDetailPage } from '@/pages/EventDetailPage'
import { VenuesPage } from '@/pages/VenuesPage'
import { VenueDetailPage } from '@/pages/VenueDetailPage'
import { UsersPage } from '@/pages/UsersPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { AdminDashboard } from '@/pages/AdminDashboard'
import { OrganizerDashboard } from '@/pages/OrganizerDashboard'
import { AttendeeDashboard } from '@/pages/AttendeeDashboard'
import { MyBookingsPage } from '@/pages/MyBookingsPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/dashboard"
              element={
                <ProtectedRoute>
                  <OrganizerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendee/dashboard"
              element={
                <ProtectedRoute>
                  <AttendeeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings"
              element={
                <ProtectedRoute>
                  <MyBookingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events"
              element={
                <ProtectedRoute>
                  <EventsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events/:id"
              element={
                <ProtectedRoute>
                  <EventDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/venues"
              element={
                <ProtectedRoute>
                  <VenuesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/venues/:id"
              element={
                <ProtectedRoute>
                  <VenueDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
