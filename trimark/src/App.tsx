import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from '@/lib/AuthContext'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { PlaceholderPage } from '@/components/shared/PlaceholderPage'
import LoginPage from '@/pages/login/LoginPage'
import AdminLayout from '@/pages/admin/AdminLayout'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import ClientsListPage from '@/pages/admin/clients/ClientsListPage'
import ClientNewPage from '@/pages/admin/clients/ClientNewPage'
import ClientDetailPage from '@/pages/admin/clients/ClientDetailPage'
import PortalLayout from '@/pages/portal/PortalLayout'
import PortalDashboard from '@/pages/portal/PortalDashboard'
import './App.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
  },
})

function RootRedirect() {
  const { loading, profile } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Carregando…
      </div>
    )
  }
  if (!profile) return <Navigate to="/login" replace />
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
              <Route
                path="calendar"
                element={
                  <PlaceholderPage
                    title="Calendário editorial"
                    prdRef="PRD §5 — Módulo 2"
                    bullets={[
                      'Visualização mês / semana / dia',
                      'Cards de post arrastáveis',
                      'Status: rascunho → em criação → aguardando aprovação → publicado',
                      'Cota mensal por cliente vs plano contratado',
                    ]}
                  />
                }
              />
              <Route
                path="library"
                element={
                  <PlaceholderPage
                    title="Biblioteca"
                    prdRef="PRD §7 — Módulo 4 (Conteúdos por especialidade)"
                    bullets={[
                      'CRUD admin de itens da biblioteca',
                      'Tipos: ideia de post, artigo, datas comemorativas, templates, casos éticos',
                      'Filtragem automática por specialty no portal cliente',
                    ]}
                  />
                }
              />
              <Route
                path="finance"
                element={
                  <PlaceholderPage
                    title="Financeiro interno"
                    prdRef="PRD §9 — Módulo 6"
                    bullets={[
                      'Dashboard financeiro: receita prevista, realizada, inadimplência',
                      'DRE simplificado',
                      'Gestão de comissões',
                    ]}
                  />
                }
              />
              <Route
                path="pipeline"
                element={
                  <PlaceholderPage
                    title="Pipeline comercial"
                    prdRef="PRD §9.2 — Prospects"
                    bullets={[
                      'Kanban com estágios: lead, contacted, meeting_scheduled, proposal_sent, negotiating, closed_won, closed_lost',
                      'Conversão para cliente ao fechar',
                    ]}
                  />
                }
              />
              <Route
                path="specialties"
                element={
                  <PlaceholderPage
                    title="Especialidades"
                    prdRef="PRD §4.2 — catálogo global"
                    bullets={[
                      '41 specialties já populadas no banco',
                      'CRUD apenas para admin',
                      'Cada uma tem council (CFM/CFO/CFP/...) e ethics_rules_summary',
                    ]}
                  />
                }
              />
              <Route
                path="settings"
                element={
                  <PlaceholderPage
                    title="Configurações"
                    prdRef="PRD §3 — Identidade visual e integrações"
                    bullets={[
                      'Branding da agência (logo, cores)',
                      'Gestão de usuários internos e papéis',
                      'Tokens de integrações (Asaas, Z-API, Resend)',
                    ]}
                  />
                }
              />
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
              <Route
                path="approvals"
                element={
                  <PlaceholderPage
                    title="Aprovações pendentes"
                    prdRef="PRD §6.2.2"
                    bullets={[
                      'Lista de posts em status awaiting_client',
                      'Aprovar / Solicitar revisão / Rejeitar',
                      'Comentários por post',
                    ]}
                  />
                }
              />
              <Route
                path="calendar"
                element={
                  <PlaceholderPage
                    title="Calendário público"
                    prdRef="PRD §6.2.3"
                    bullets={[
                      'Modo somente leitura',
                      'Cores por status: cinza, amarelo, verde, azul',
                      'Visão dos próximos 30 dias',
                    ]}
                  />
                }
              />
              <Route
                path="library"
                element={
                  <PlaceholderPage
                    title="Biblioteca de conteúdos"
                    prdRef="PRD §7.5"
                    bullets={[
                      'Filtragem automática pela sua especialidade',
                      'Ações: marcar como usado, solicitar para minha agenda',
                    ]}
                  />
                }
              />
              <Route
                path="finance"
                element={
                  <PlaceholderPage
                    title="Financeiro"
                    prdRef="PRD §6.2.5"
                    bullets={[
                      'Histórico de faturas (paga, em aberto, vencida)',
                      'Botões "Copiar PIX" e "Baixar boleto"',
                    ]}
                  />
                }
              />
            </Route>

            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
