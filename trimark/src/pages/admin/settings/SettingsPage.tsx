import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabase'

interface AgencyRow {
  id: string
  name: string
  primary_color: string | null
  logo_url: string | null
  contact_email: string | null
}

interface UserRow {
  id: string
  full_name: string
  role: string
  email: string | null
  active: boolean
}

const TABS = ['Identidade', 'Equipe', 'Integrações'] as const
type Tab = typeof TABS[number]

export default function SettingsPage() {
  const { profile } = useAuth()
  const [tab, setTab] = useState<Tab>('Identidade')
  const [agency, setAgency] = useState<AgencyRow | null>(null)
  const [users, setUsers] = useState<UserRow[]>([])
  const [feedback, setFeedback] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profile?.kind !== 'internal') return
    void supabase
      .from('agencies')
      .select('id, name, primary_color, logo_url, contact_email')
      .eq('id', profile.agency_id)
      .single()
      .then(({ data }) => { if (data) setAgency(data as AgencyRow) })
    void supabase
      .from('users')
      .select('id, full_name, role, email, active')
      .eq('agency_id', profile.agency_id)
      .order('full_name')
      .then(({ data }) => { if (data) setUsers(data as UserRow[]) })
  }, [profile])

  if (profile?.kind !== 'internal') return null

  async function saveAgency() {
    if (!agency) return
    setSaving(true); setFeedback(null)
    const { error } = await supabase
      .from('agencies').update({
        name: agency.name,
        primary_color: agency.primary_color,
        logo_url: agency.logo_url,
        contact_email: agency.contact_email,
      })
      .eq('id', agency.id)
    setSaving(false)
    setFeedback(error ? `Falhou: ${error.message}` : 'Salvo!')
  }

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">PRD §3</p>
        <h1 className="text-2xl font-semibold mt-1">Configurações</h1>
      </header>

      <div className="border-b">
        <nav className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-2 text-sm border-b-2 -mb-px ${
                tab === t ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </nav>
      </div>

      {tab === 'Identidade' && agency && (
        <Card>
          <CardHeader>
            <CardTitle>Identidade da agência</CardTitle>
            <CardDescription>Marca exibida nos e-mails e no portal.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="ag-name">Nome</Label>
              <Input id="ag-name" value={agency.name ?? ''} onChange={(e) => setAgency({ ...agency, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="ag-color">Cor primária (hex)</Label>
                <Input id="ag-color" value={agency.primary_color ?? ''} placeholder="#1F4E79" onChange={(e) => setAgency({ ...agency, primary_color: e.target.value || null })} />
              </div>
              <div>
                <Label htmlFor="ag-email">E-mail de contato</Label>
                <Input id="ag-email" type="email" value={agency.contact_email ?? ''} onChange={(e) => setAgency({ ...agency, contact_email: e.target.value || null })} />
              </div>
            </div>
            <div>
              <Label htmlFor="ag-logo">URL do logo</Label>
              <Input id="ag-logo" type="url" value={agency.logo_url ?? ''} onChange={(e) => setAgency({ ...agency, logo_url: e.target.value || null })} />
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={saveAgency} disabled={saving}>{saving ? 'Salvando…' : 'Salvar'}</Button>
              {feedback && <p className="text-sm text-muted-foreground">{feedback}</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'Equipe' && (
        <Card>
          <CardHeader>
            <CardTitle>Usuários internos</CardTitle>
            <CardDescription>Membros da equipe e papéis (PRD §13).</CardDescription>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-2">Nome</th>
                  <th className="py-2">E-mail</th>
                  <th className="py-2">Papel</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="py-2">{u.full_name}</td>
                    <td className="py-2 text-muted-foreground">{u.email ?? '—'}</td>
                    <td className="py-2">{u.role}</td>
                    <td className="py-2">{u.active ? 'Ativo' : 'Inativo'}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={4} className="py-6 text-center text-muted-foreground">Sem membros ainda.</td></tr>
                )}
              </tbody>
            </table>
            <p className="text-xs text-muted-foreground mt-3">
              Convites e edição de papéis serão habilitados na próxima fase.
            </p>
          </CardContent>
        </Card>
      )}

      {tab === 'Integrações' && (
        <Card>
          <CardHeader>
            <CardTitle>Integrações</CardTitle>
            <CardDescription>
              Tokens de Asaas, Z-API, Resend e Anthropic ficam em variáveis de ambiente das Edge Functions
              (PRD §15). Para alterá-los, atualize os secrets no painel do Supabase.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-2 text-muted-foreground">
            <p>• <strong>Asaas</strong>: <code>ASAAS_API_KEY</code> + <code>ASAAS_WEBHOOK_TOKEN</code></p>
            <p>• <strong>Z-API</strong>: <code>ZAPI_INSTANCE_ID</code> + <code>ZAPI_TOKEN</code> + <code>ZAPI_CLIENT_TOKEN</code></p>
            <p>• <strong>Resend</strong>: <code>RESEND_API_KEY</code></p>
            <p>• <strong>Anthropic</strong>: <code>ANTHROPIC_API_KEY</code></p>
            <p className="pt-2">Saúde e auditoria das integrações ficam em <code>integration_logs</code>.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
