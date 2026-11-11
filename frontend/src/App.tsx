import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { ClubsListPage } from './pages/clubs/ClubsListPage';
import { ClubDetailPage } from './pages/clubs/ClubDetailPage';
import { EventsListPage } from './pages/events/EventsListPage';
import { EventDetailPage } from './pages/events/EventDetailPage';
import { StudentDashboardPage } from './pages/dashboard/StudentDashboardPage';
import { OrganizerDashboardPage } from './pages/organizer/OrganizerDashboardPage';
import { EventCreatePage } from './pages/organizer/EventCreatePage';
import { QRScannerPage } from './pages/organizer/QRScannerPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { VerifyCertificatePage } from './pages/certificates/VerifyCertificatePage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';

// Common
import { ProtectedRoute } from './components/common/ProtectedRoute';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/clubs" element={<ClubsListPage />} />
            <Route path="/clubs/:slug" element={<ClubDetailPage />} />
            <Route path="/events" element={<EventsListPage />} />
            <Route path="/events/:slug" element={<EventDetailPage />} />
            <Route path="/verify" element={<VerifyCertificatePage />} />
            <Route path="/verify/:code" element={<VerifyCertificatePage />} />

            {/* Authenticated Student Pages */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <StudentDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />

            {/* Organizer Pages (Admin or Organizer) */}
            <Route
              path="/organizer"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'ORGANIZER']}>
                  <OrganizerDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/events/create"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'ORGANIZER']}>
                  <EventCreatePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/scanner/:eventId"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'ORGANIZER']}>
                  <QRScannerPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Command Center */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default App;
