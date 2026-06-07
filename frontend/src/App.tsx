import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { Toaster } from 'sonner'

// Pages
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import IncidentsPage from '@/pages/IncidentsPage'
import AlertsPage from '@/pages/AlertsPage'
import SettingsPage from '@/pages/SettingsPage'
import AiChatPage from '@/pages/AiChatPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import AiInsightsPage from '@/pages/AiInsightsPage'
import IntegrationsPage from '@/pages/IntegrationsPage'
import SetupWizard from '@/pages/SetupWizard'

// Layouts
import AuthLayout from '@/layouts/AuthLayout'
import AppLayout from '@/layouts/AppLayout'

// Hooks
import { useRequireAuth } from '@/hooks'

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useRequireAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

// Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
})

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/onboarding" element={<SetupWizard />} />
          </Route>

          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/incidents" element={<IncidentsPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/ai-chat" element={<AiChatPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/ai-insights" element={<AiInsightsPage />} />
            <Route path="/infrastructure" element={<IntegrationsPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* Catch All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>

      {/* Toast Notifications */}
      <Toaster position="bottom-right" />
    </QueryClientProvider>
  )
}

export default App
