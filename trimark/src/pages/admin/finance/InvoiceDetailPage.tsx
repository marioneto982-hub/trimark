import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  INVOICE_STATUS_LABEL,
  useInvoice,
  useSendInvoiceWhatsapp,
} from '@/hooks/useInvoices'
import { formatCurrencyBRL, formatDateBR } from '@/lib/format'

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: inv, isLoading, isError, error } = useInvoice(id)
  const sendWA = useSendInvoiceWhatsapp()
  const [feedback, setFeedback] = useState<string | null>(null)

  if (isLoading) return <div className="p-8 text-sm text-muted-foreground">Carregando…</div>
  if (isError) return <div className="p-8 text-sm text-destructive">Erro: {(error as Error).message}</div>
  if (!inv) return <div className="p-8 text-sm text-muted-foreground">Fatura não encontrada.</div>

  return (
    <div className="p-8 space-y-6 max-w-3xl">
      <div>
        <Link to="/admin/finance" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4 mr-1" /> Voltar ao financeiro
        </Link>
        <div className="flex items-start justify-between gap-4 mt-2">
          <div>
            <h1 className="text-2xl font-semibold">
              {inv.clients?.trade_name ?? inv.clients?.full_name ?? 'Fatura'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Referente a {inv.reference_month} · Vence {formatDateBR(inv.due_date)}
            </p>
          </div>
          <Badge>{INVOICE_STATUS_LABEL[inv.status]}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-md border bg-background p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Valor</p>
          <p className="text-2xl font-semibold mt-1">{formatCurrencyBRL(inv.amount)}</p>
        </div>
        <div className="rounded-md border bg-background p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Emitida</p>
          <p className="text-base font-medium mt-1">{formatDateBR(inv.issue_date)}</p>
        </div>
        <div className="rounded-md border bg-background p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Paga em</p>
          <p className="text-base font-medium mt-1">{formatDateBR(inv.paid_at)}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Asaas</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>
            <span className="text-muted-foreground">payment_id: </span>
            {inv.asaas_payment_id ?? '—'}
          </p>
          {inv.asaas_invoice_url && (
            <a href={inv.asaas_invoice_url} target="_blank" rel="noreferrer" className="underline text-primary">
              Abrir fatura no Asaas →
            </a>
          )}
          {inv.asaas_boleto_url && (
            <p>
              <a href={inv.asaas_boleto_url} target="_blank" rel="noreferrer" className="underline">
                Boleto (PDF)
              </a>
              {inv.asaas_boleto_barcode && (
                <span className="text-muted-foreground"> · {inv.asaas_boleto_barcode}</span>
              )}
            </p>
          )}
          {inv.asaas_pix_copy_paste && (
            <p className="break-all text-muted-foreground">
              <span className="text-foreground">PIX copia-e-cola: </span>
              {inv.asaas_pix_copy_paste}
            </p>
          )}
        </CardContent>
      </Card>

      {(inv.status === 'pending' || inv.status === 'overdue') && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ações</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button
              onClick={async () => {
                setFeedback(null)
                try {
                  await sendWA.mutateAsync(inv.id)
                  setFeedback('Mensagem enviada ao cliente via WhatsApp.')
                } catch (err) {
                  setFeedback('Falhou: ' + (err as Error).message)
                }
              }}
              disabled={sendWA.isPending}
            >
              <MessageSquare className="size-4 mr-1" />
              {sendWA.isPending ? 'Enviando…' : 'Enviar lembrete por WhatsApp'}
            </Button>
            {feedback && <p className="text-sm text-muted-foreground self-center">{feedback}</p>}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
