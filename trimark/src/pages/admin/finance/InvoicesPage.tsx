import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { INVOICE_STATUS_LABEL, useInvoices } from '@/hooks/useInvoices'
import { formatCurrencyBRL, formatDateBR } from '@/lib/format'
import type { InvoiceStatus } from '@/types'

const STATUS_VARIANT: Record<InvoiceStatus, 'active' | 'onboarding' | 'canceled' | 'suspended' | 'default'> = {
  paid: 'active',
  pending: 'onboarding',
  overdue: 'suspended',
  canceled: 'canceled',
  refunded: 'default',
}

export default function InvoicesPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<InvoiceStatus | 'all'>('all')
  const { data, isLoading, isError, error } = useInvoices({ search, status })

  const totals = (data ?? []).reduce(
    (acc, i) => {
      const v = Number(i.amount)
      if (i.status === 'paid') acc.paid += v
      else if (i.status === 'pending') acc.pending += v
      else if (i.status === 'overdue') acc.overdue += v
      return acc
    },
    { paid: 0, pending: 0, overdue: 0 },
  )

  return (
    <div className="p-8 space-y-6 max-w-6xl">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Módulo 6 · PRD §9</p>
        <h1 className="text-2xl font-semibold mt-1">Financeiro</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Faturas de todos os clientes, status, totais do período.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-md border bg-background p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Recebido</p>
          <p className="text-2xl font-semibold mt-1 text-emerald-700">
            {formatCurrencyBRL(totals.paid)}
          </p>
        </div>
        <div className="rounded-md border bg-background p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Em aberto</p>
          <p className="text-2xl font-semibold mt-1 text-amber-700">
            {formatCurrencyBRL(totals.pending)}
          </p>
        </div>
        <div className="rounded-md border bg-background p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Vencido</p>
          <p className="text-2xl font-semibold mt-1 text-rose-700">
            {formatCurrencyBRL(totals.overdue)}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente ou mês de referência…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as InvoiceStatus | 'all')}
          className="sm:w-48"
        >
          <option value="all">Todos os status</option>
          {(Object.keys(INVOICE_STATUS_LABEL) as InvoiceStatus[]).map((s) => (
            <option key={s} value={s}>{INVOICE_STATUS_LABEL[s]}</option>
          ))}
        </Select>
      </div>

      <div className="rounded-md border bg-background">
        {isLoading && <p className="p-6 text-sm text-muted-foreground">Carregando…</p>}
        {isError && <p className="p-6 text-sm text-destructive">Erro: {(error as Error).message}</p>}
        {!isLoading && data && data.length === 0 && (
          <p className="p-10 text-center text-muted-foreground">Nenhuma fatura encontrada.</p>
        )}
        {!isLoading && data && data.length > 0 && (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3 font-medium">Cliente</th>
                <th className="p-3 font-medium">Mês</th>
                <th className="p-3 font-medium">Vencimento</th>
                <th className="p-3 font-medium">Valor</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Pago em</th>
              </tr>
            </thead>
            <tbody>
              {data.map((inv) => (
                <tr key={inv.id} className="border-t hover:bg-muted/30">
                  <td className="p-3">
                    <Link
                      to={`/admin/finance/${inv.id}`}
                      className="font-medium text-foreground hover:underline"
                    >
                      {inv.clients?.trade_name ?? inv.clients?.full_name ?? '—'}
                    </Link>
                  </td>
                  <td className="p-3 text-muted-foreground">{inv.reference_month}</td>
                  <td className="p-3 text-muted-foreground">{formatDateBR(inv.due_date)}</td>
                  <td className="p-3 font-medium">{formatCurrencyBRL(inv.amount)}</td>
                  <td className="p-3">
                    <Badge variant={STATUS_VARIANT[inv.status]}>
                      {INVOICE_STATUS_LABEL[inv.status]}
                    </Badge>
                  </td>
                  <td className="p-3 text-muted-foreground">{formatDateBR(inv.paid_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
