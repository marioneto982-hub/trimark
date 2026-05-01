import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useClients } from '@/hooks/useClients'
import { formatCurrencyBRL, formatDateBR } from '@/lib/format'
import type { ClientStatus } from '@/types'

const STATUS_LABEL: Record<ClientStatus, string> = {
  prospect:   'Prospect',
  onboarding: 'Onboarding',
  active:     'Ativo',
  suspended:  'Suspenso',
  canceled:   'Cancelado',
}

export default function ClientsListPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ClientStatus | 'all'>('all')
  const { data, isLoading, isError, error } = useClients({ search, status })

  return (
    <div className="p-8 space-y-6 max-w-6xl">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Módulo 1 · CRM</p>
          <h1 className="text-2xl font-semibold mt-1">Clientes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gestão completa dos clientes da agência (PRD §4).
          </p>
        </div>
        <Link to="/admin/clients/new">
          <Button>
            <Plus className="size-4 mr-1" />
            Novo cliente
          </Button>
        </Link>
      </header>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, fantasia ou e-mail…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as ClientStatus | 'all')}
          className="sm:w-48"
        >
          <option value="all">Todos os status</option>
          {(Object.keys(STATUS_LABEL) as ClientStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </Select>
      </div>

      <div className="rounded-md border bg-background">
        {isLoading && <p className="p-6 text-sm text-muted-foreground">Carregando…</p>}
        {isError && (
          <p className="p-6 text-sm text-destructive">
            Erro ao carregar: {(error as Error).message}
          </p>
        )}
        {!isLoading && !isError && data && data.length === 0 && (
          <div className="p-10 text-center space-y-3">
            <p className="text-muted-foreground">Nenhum cliente cadastrado ainda.</p>
            <Link to="/admin/clients/new">
              <Button variant="outline">
                <Plus className="size-4 mr-1" />
                Cadastrar primeiro cliente
              </Button>
            </Link>
          </div>
        )}
        {!isLoading && !isError && data && data.length > 0 && (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3 font-medium">Nome</th>
                <th className="p-3 font-medium">Especialidade</th>
                <th className="p-3 font-medium">Plano</th>
                <th className="p-3 font-medium">Vencimento</th>
                <th className="p-3 font-medium">Valor</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Cadastrado</th>
              </tr>
            </thead>
            <tbody>
              {data.map((c) => (
                <tr key={c.id} className="border-t hover:bg-muted/30">
                  <td className="p-3">
                    <Link
                      to={`/admin/clients/${c.id}`}
                      className="font-medium text-foreground hover:underline"
                    >
                      {c.full_name}
                    </Link>
                    {c.trade_name && (
                      <p className="text-xs text-muted-foreground">{c.trade_name}</p>
                    )}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {c.specialties?.name ?? '—'}
                  </td>
                  <td className="p-3 text-muted-foreground">{c.plans?.name ?? '—'}</td>
                  <td className="p-3 text-muted-foreground">
                    {c.billing_day ? `dia ${c.billing_day}` : '—'}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {formatCurrencyBRL(c.contract_value)}
                  </td>
                  <td className="p-3">
                    <Badge variant={c.status}>{STATUS_LABEL[c.status]}</Badge>
                  </td>
                  <td className="p-3 text-muted-foreground">{formatDateBR(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
