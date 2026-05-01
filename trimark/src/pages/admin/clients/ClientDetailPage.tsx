import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/AuthContext'
import { useClient, useUpdateClient } from '@/hooks/useClients'
import { ClientForm } from '@/components/clients/ClientForm'
import { formatCurrencyBRL, formatDateBR } from '@/lib/format'
import type { ClientStatus } from '@/types'

const STATUS_LABEL: Record<ClientStatus, string> = {
  prospect: 'Prospect', onboarding: 'Onboarding', active: 'Ativo',
  suspended: 'Suspenso', canceled: 'Cancelado',
}

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { profile } = useAuth()
  const navigate = useNavigate()
  const { data, isLoading, isError, error } = useClient(id)
  const update = useUpdateClient()
  const [editing, setEditing] = useState(false)

  if (profile?.kind !== 'internal') return null

  if (isLoading) {
    return <div className="p-8 text-muted-foreground">Carregando…</div>
  }
  if (isError) {
    return <div className="p-8 text-destructive">Erro: {(error as Error).message}</div>
  }
  if (!data) {
    return <div className="p-8 text-muted-foreground">Cliente não encontrado.</div>
  }

  if (editing) {
    return (
      <div className="p-8 max-w-3xl space-y-6">
        <header>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Editando</p>
          <h1 className="text-2xl font-semibold mt-1">{data.full_name}</h1>
        </header>
        <ClientForm
          agencyId={data.agency_id}
          initial={data}
          submitting={update.isPending}
          onCancel={() => setEditing(false)}
          onSubmit={async (payload) => {
            await update.mutateAsync({ id: data.id, patch: payload })
            setEditing(false)
          }}
        />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <Link
            to="/admin/clients"
            className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3 mr-1" />
            voltar à lista
          </Link>
          <div className="flex items-center gap-3 mt-2">
            <h1 className="text-2xl font-semibold">{data.full_name}</h1>
            <Badge variant={data.status}>{STATUS_LABEL[data.status]}</Badge>
          </div>
          {data.trade_name && (
            <p className="text-muted-foreground text-sm mt-0.5">{data.trade_name}</p>
          )}
        </div>
        <Button variant="outline" onClick={() => setEditing(true)}>
          <Pencil className="size-4 mr-1" />
          Editar
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Especialidade & conselho</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>{data.specialties?.name ?? '—'}</p>
            {data.specialties?.category && (
              <p className="text-xs text-muted-foreground capitalize">{data.specialties.category}</p>
            )}
            {(data.council_type || data.council_number) && (
              <p className="text-muted-foreground mt-2">
                {data.council_type} {data.council_number}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>{data.email ?? '—'}</p>
            <p className="text-muted-foreground">{data.phone_primary ?? '—'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Plano & cobrança</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>{data.plans?.name ?? 'Sem plano vinculado'}</p>
            <p className="text-muted-foreground">
              {data.contract_value ? `${formatCurrencyBRL(data.contract_value)} · ` : ''}
              {data.billing_day ? `vence dia ${data.billing_day}` : 'sem dia de vencimento'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Datas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Cadastrado:</span>{' '}
              {formatDateBR(data.created_at)}
            </p>
            <p>
              <span className="text-muted-foreground">Atualizado:</span>{' '}
              {formatDateBR(data.updated_at)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Em construção · PRD §4.3</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>• Linha do tempo de interações (e-mails, reuniões, propostas)</p>
          <p>• Equipe alocada e Account Manager</p>
          <p>• Histórico de cobranças (vinculado ao módulo Faturamento)</p>
          <p>• Histórico de posts publicados e métricas</p>
          <p>• Upload de contrato (Storage bucket client-documents)</p>
          <p>• Botão "Convidar para o portal" (chama Edge Function client-invite)</p>
        </CardContent>
      </Card>

      <Button variant="ghost" onClick={() => navigate('/admin/clients')}>
        ← Voltar
      </Button>
    </div>
  )
}
