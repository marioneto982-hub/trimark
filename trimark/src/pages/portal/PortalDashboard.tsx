import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/AuthContext'

export default function PortalDashboard() {
  const { profile } = useAuth()
  if (profile?.kind !== 'client') return null

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Bem-vindo(a) ao seu portal</h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe aprovações, calendário, biblioteca e faturas.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Aprovações pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">—</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Posts publicados no mês</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">—</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Próxima fatura</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">—</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Em construção</CardTitle>
          <CardDescription>
            O portal está sendo finalizado. Em breve você verá aqui:
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>• Posts aguardando sua aprovação (PRD §6.2.2)</p>
          <p>• Calendário público dos próximos 30 dias (§6.2.3)</p>
          <p>• Biblioteca filtrada pela sua especialidade (§7.5)</p>
          <p>• Faturas com PIX e boleto (§6.2.5)</p>
        </CardContent>
      </Card>
    </div>
  )
}
