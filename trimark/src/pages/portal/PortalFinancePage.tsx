import { useState } from 'react'
import { Copy, Download } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/AuthContext'
import { usePortalInvoices, type PortalInvoiceRow } from '@/hooks/usePortal'
import { formatCurrencyBRL, formatDateBR } from '@/lib/format'
import type { InvoiceStatus } from '@/types'

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  pending: 'Em aberto',
  paid: 'Paga',
  overdue: 'Vencida',
  canceled: 'Cancelada',
  refunded: 'Reembolsada',
}

const STATUS_VARIANT: Record<InvoiceStatus, 'active' | 'onboarding' | 'canceled' | 'suspended' | 'default'> = {
  paid: 'active',
  pending: 'onboarding',
  canceled: 'canceled',
  refunded: 'default',
  overdue: 'suspended',
}

export default function PortalFinancePage() {
  const { profile } = useAuth()
  const clientId = profile?.kind === 'client' ? profile.client_id : undefined
  const { data: invoices, isLoading, isError, error } = usePortalInvoices(clientId)
  const [copiedFor, setCopiedFor] = useState<string | null>(null)

  if (profile?.kind !== 'client') return null

  async function copyPix(invoice: PortalInvoiceRow) {
    if (!invoice.asaas_pix_copy_paste) return
    try {
      await navigator.clipboard.writeText(invoice.asaas_pix_copy_paste)
      setCopiedFor(invoice.id)
      setTimeout(() => setCopiedFor((c) => (c === invoice.id ? null : c)), 2500)
    } catch {
      alert('Não consegui copiar — copie manualmente: ' + invoice.asaas_pix_copy_paste)
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Financeiro</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Suas faturas: paga, em aberto, vencida (PRD §6.2.5).
        </p>
      </header>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      {isError && <p className="text-sm text-destructive">Erro: {(error as Error).message}</p>}

      {invoices && invoices.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Nenhuma fatura ainda.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3">
        {(invoices ?? []).map((inv) => (
          <Card key={inv.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base">
                    {inv.description ?? `Fatura ${inv.reference_month}`}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Vencimento {formatDateBR(inv.due_date)} ·{' '}
                    {inv.paid_at ? `paga em ${formatDateBR(inv.paid_at)}` : 'aguardando pagamento'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold">{formatCurrencyBRL(inv.amount)}</p>
                  <Badge variant={STATUS_VARIANT[inv.status]} className="mt-1">
                    {STATUS_LABEL[inv.status]}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            {(inv.status === 'pending' || inv.status === 'overdue') && (
              <CardContent className="flex flex-wrap gap-2 pt-0">
                {inv.asaas_pix_copy_paste && (
                  <Button onClick={() => copyPix(inv)} variant="default">
                    <Copy className="size-4 mr-1" />
                    {copiedFor === inv.id ? 'Copiado!' : 'Copiar PIX'}
                  </Button>
                )}
                {inv.asaas_boleto_url && (
                  <a href={inv.asaas_boleto_url} target="_blank" rel="noreferrer">
                    <Button variant="outline">
                      <Download className="size-4 mr-1" /> Baixar boleto
                    </Button>
                  </a>
                )}
                {inv.asaas_invoice_url && (
                  <a href={inv.asaas_invoice_url} target="_blank" rel="noreferrer">
                    <Button variant="ghost">Abrir fatura</Button>
                  </a>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
