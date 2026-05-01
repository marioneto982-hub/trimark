import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/AuthContext'

export default function AdminDashboard() {
  const { profile } = useAuth()
  if (profile?.kind !== 'internal') return null

  return (
    <div className="p-8 space-y-6 max-w-6xl">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Phase 1 · Núcleo em construção
        </p>
        <h1 className="text-3xl font-semibold mt-1">Olá, {profile.full_name.split(' ')[0]}.</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral da operação Trimark.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Clientes ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">—</p>
            <p className="text-xs text-muted-foreground mt-1">a popular após módulo Clientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Posts aguardando aprovação</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">—</p>
            <p className="text-xs text-muted-foreground mt-1">a popular após módulo Calendário</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Faturas em atraso</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">—</p>
            <p className="text-xs text-muted-foreground mt-1">a popular após módulo Faturamento</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Próximos passos do MVP</CardTitle>
          <CardDescription>
            Phase 0 fechada. Phase 1 em andamento — módulos Clientes e Calendário.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>• Cadastro de clientes (PRD §4)</p>
          <p>• Calendário editorial com drag & drop (PRD §5)</p>
          <p>• Portal do cliente + fluxo de aprovação (PRD §6)</p>
          <p>• Cobrança Asaas + WhatsApp Z-API (PRD §8)</p>
        </CardContent>
      </Card>
    </div>
  )
}
