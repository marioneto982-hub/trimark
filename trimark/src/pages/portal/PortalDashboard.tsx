import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/AuthContext'
import { usePortalAwaitingApproval, usePortalCalendar, usePortalInvoices } from '@/hooks/usePortal'
import { formatCurrencyBRL, formatDateBR } from '@/lib/format'

export default function PortalDashboard() {
  const { profile } = useAuth()
  const clientId = profile?.kind === 'client' ? profile.client_id : undefined

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()

  const { data: awaiting } = usePortalAwaitingApproval(clientId)
  const { data: calendar } = usePortalCalendar(clientId, monthStart, monthEnd)
  const { data: invoices } = usePortalInvoices(clientId)

  if (profile?.kind !== 'client') return null

  const publishedThisMonth = (calendar ?? []).filter((p) => p.status === 'published').length
  const nextOpenInvoice = (invoices ?? []).find((i) => i.status === 'pending' || i.status === 'overdue')

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">
          {profile.display_name ? `Olá, ${profile.display_name}` : 'Bem-vindo(a) ao seu portal'}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Acompanhe aprovações, calendário, biblioteca e faturas.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/portal/approvals">
          <Card className="hover:bg-muted/30 transition-colors h-full">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Aprovações pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{awaiting?.length ?? '—'}</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/portal/calendar">
          <Card className="hover:bg-muted/30 transition-colors h-full">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Posts publicados no mês</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{calendar ? publishedThisMonth : '—'}</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/portal/finance">
          <Card className="hover:bg-muted/30 transition-colors h-full">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Próxima fatura</CardTitle>
            </CardHeader>
            <CardContent>
              {nextOpenInvoice ? (
                <>
                  <p className="text-2xl font-semibold">{formatCurrencyBRL(nextOpenInvoice.amount)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Vence {formatDateBR(nextOpenInvoice.due_date)}
                  </p>
                </>
              ) : (
                <p className="text-3xl font-semibold">—</p>
              )}
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
