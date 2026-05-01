import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from '@/lib/AuthContext'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import LoginPage from '@/pages/login/LoginPage'
import LandingPage from '@/pages/landing/LandingPage'
import AdminLayout from '@/pages/admin/AdminLayout'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import ClientsListPage from '@/pages/admin/clients/ClientsListPage'
import ClientNewPage from '@/pages/admin/clients/ClientNewPage'
import ClientDetailPage from '@/pages/admin/clients/ClientDetailPage'
import CalendarPage from '@/pages/admin/calendar/CalendarPage'
import PostNewPage from '@/pages/admin/calendar/PostNewPage'
import PostDetailPage from '@/pages/admin/calendar/PostDetailPage'
import InvoicesPage from '@/pages/admin/finance/InvoicesPage'
import InvoiceDetailPage from '@/pages/admin/finance/InvoiceDetailPage'
import LibraryListPage from '@/pages/admin/library/LibraryListPage'
import LibraryNewPage from '@/pages/admin/library/LibraryNewPage'
import LibraryDetailPage from '@/pages/admin/library/LibraryDetailPage'
import PipelinePage from '@/pages/admin/pipeline/PipelinePage'
import SpecialtiesPage from '@/pages/admin/specialties/SpecialtiesPage'
import SettingsPage from '@/pages/admin/settings/SettingsPage'
import PortalLayout from '@/pages/portal/PortalLayout'
import PortalDashboard from '@/pages/portal/PortalDashboard'
import ApprovalsPage from '@/pages/portal/ApprovalsPage'
import PortalCalendarPage from '@/pages/portal/PortalCalendarPage'
import PortalLibraryPage from '@/pages/portal/PortalLibraryPage'
import PortalFinancePage from '@/pages/portal/PortalFinancePage'
import './App.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
  },
})

function RootRoute() {
  const { loading, profile } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Carregando…
      </div>
    )
  }
  // Não logado → landing pública. Logado → redireciona pelo papel.
  if (!profile) return <LandingPage />
  return <Navigate to={profile.kind === 'internal' ? '/admin' : '/portal'} replace />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/admin"
              element={
                <ProtectedRoute require="internal">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="clients" element={<ClientsListPage />} />
              <Route path="clients/new" element={<ClientNewPage />} />
              <Route path="clients/:id" element={<ClientDetailPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="calendar/posts/new" element={<PostNewPage />} />
              <Route path="calendar/posts/:id" element={<PostDetailPage />} />
              <Route path="library" element={<LibraryListPage />} />
              <Route path="library/new" element={<LibraryNewPage />} />
              <Route path="library/:id" element={<LibraryDetailPage />} />
              <Route path="finance" element={<InvoicesPage />} />
              <Route path="finance/:id" element={<InvoiceDetailPage />} />
              <Route path="pipeline" element={<PipelinePage />} />
              <Route path="specialties" element={<SpecialtiesPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            <Route
              path="/portal"
              element={
                <ProtectedRoute require="client">
                  <PortalLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<PortalDashboard />} />
              <Route path="approvals" element={<ApprovalsPage />} />
              <Route path="calendar" element={<PortalCalendarPage />} />
              <Route path="library" element={<PortalLibraryPage />} />
              <Route path="finance" element={<PortalFinancePage />} />
            </Route>

            <Route path="/" element={<RootRoute />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
