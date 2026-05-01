// =============================================================================
// TRIMARK — Edge Function: asaas-webhook
// PRD §11.2: recebe eventos do Asaas e atualiza status da fatura local.
//
// IMPORTANTE: webhook SEMPRE retorna HTTP 200 (PRD §20.1) para evitar
// reentrega no Asaas, mesmo em erro interno — falhas vão para integration_logs.
//
// Header obrigatório: `asaas-access-token: <ASAAS_WEBHOOK_TOKEN>`
//
// Eventos tratados:
//   PAYMENT_CONFIRMED, PAYMENT_RECEIVED  → status='paid' + paid_at
//   PAYMENT_OVERDUE                       → status='overdue'
//   PAYMENT_REFUNDED                      → status='refunded'
//   PAYMENT_DELETED, PAYMENT_REFUSED      → status='canceled'
// =============================================================================

import { handleOptions } from '../_shared/cors.ts'
import { json, webhookAck } from '../_shared/response.ts'
import { supabaseAdmin } from '../_shared/supabase.ts'
import { logIntegration } from '../_shared/logging.ts'
type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'canceled' | 'refunded'

const ASAAS_WEBHOOK_TOKEN = Deno.env.get('ASAAS_WEBHOOK_TOKEN') ?? ''

interface AsaasWebhookEvent {
  event: string
  payment?: {
    id:           string
    status?:      string
    value?:       number
    netValue?:    number
    paymentDate?: string
    billingType?: string
    invoiceUrl?:  string
    externalReference?: string
  }
}

const EVENT_TO_STATUS: Record<string, InvoiceStatus | undefined> = {
  PAYMENT_CONFIRMED: 'paid',
  PAYMENT_RECEIVED:  'paid',
  PAYMENT_OVERDUE:   'overdue',
  PAYMENT_REFUNDED:  'refunded',
  PAYMENT_DELETED:   'canceled',
  PAYMENT_REFUSED:   'canceled',
}

function asaasBillingTypeToMethod(t?: string): 'pix' | 'boleto' | 'credit_card' | null {
  if (!t) return null
  const u = t.toUpperCase()
  if (u.includes('PIX')) return 'pix'
  if (u.includes('BOLETO')) return 'boleto'
  if (u.includes('CREDIT')) return 'credit_card'
  return null
}

Deno.serve(async (req) => {
  const cors = handleOptions(req); if (cors) return cors

  // Validação de token (não falha — só loga e ack)
  const token = req.headers.get('asaas-access-token') ?? ''
  if (!ASAAS_WEBHOOK_TOKEN || token !== ASAAS_WEBHOOK_TOKEN) {
    await logIntegration({
      integration: 'asaas', operation: 'asaas-webhook.invalid_token',
      level: 'warn', error_message: 'token mismatch',
    })
    return webhookAck({ handled: false, reason: 'invalid_token' })
  }

  let event: AsaasWebhookEvent
  try {
    event = await req.json()
  } catch {
    await logIntegration({
      integration: 'asaas', operation: 'asaas-webhook.invalid_json',
      level: 'error',
    })
    return webhookAck({ handled: false, reason: 'invalid_json' })
  }

  const startedAt = Date.now()
  const newStatus = EVENT_TO_STATUS[event.event]
  const paymentId = event.payment?.id

  if (!paymentId) {
    await logIntegration({
      integration: 'asaas', operation: 'asaas-webhook.no_payment_id',
      level: 'warn', request_payload: event,
    })
    return webhookAck({ handled: false, reason: 'no_payment_id' })
  }

  // Localiza fatura local
  const { data: inv, error: invErr } = await supabaseAdmin
    .from('invoices')
    .select('id, agency_id, client_id, status, reference_month')
    .eq('asaas_payment_id', paymentId)
    .maybeSingle()

  if (invErr || !inv) {
    await logIntegration({
      integration: 'asaas', operation: 'asaas-webhook.invoice_not_found',
      level: 'warn', request_payload: event,
      error_message: invErr?.message ?? 'no row',
    })
    return webhookAck({ handled: false, reason: 'invoice_not_found', payment_id: paymentId })
  }

  if (!newStatus) {
    await logIntegration({
      agency_id: inv.agency_id, client_id: inv.client_id,
      integration: 'asaas', operation: `asaas-webhook.${event.event.toLowerCase()}`,
      level: 'info', request_payload: event, reference_id: inv.id,
    })
    return webhookAck({ handled: true, ignored_event: event.event })
  }

  const patch: Record<string, unknown> = { status: newStatus }
  if (newStatus === 'paid') {
    patch.paid_at = event.payment?.paymentDate
      ? new Date(event.payment.paymentDate).toISOString()
      : new Date().toISOString()
    const m = asaasBillingTypeToMethod(event.payment?.billingType)
    if (m) patch.payment_method = m
  }

  const { error: updErr } = await supabaseAdmin.from('invoices').update(patch).eq('id', inv.id)
  if (updErr) {
    await logIntegration({
      agency_id: inv.agency_id, client_id: inv.client_id,
      integration: 'asaas', operation: 'asaas-webhook.update_failed',
      level: 'error', error_message: updErr.message, reference_id: inv.id,
      duration_ms: Date.now() - startedAt,
    })
    return webhookAck({ handled: false, reason: 'update_failed' })
  }

  await logIntegration({
    agency_id: inv.agency_id, client_id: inv.client_id,
    integration: 'asaas', operation: `asaas-webhook.${event.event.toLowerCase()}`,
    level: 'info', request_payload: event,
    response_payload: { applied_status: newStatus },
    reference_id: inv.id, duration_ms: Date.now() - startedAt,
  })

  return json({ ok: true, applied_status: newStatus })
})
