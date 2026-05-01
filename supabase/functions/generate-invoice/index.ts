// =============================================================================
// TRIMARK — Edge Function: generate-invoice
// PRD §8.4: gera fatura mensal de um cliente, integrada com Asaas.
//
// Invocação:
//   POST /functions/v1/generate-invoice
//   { client_id, reference_month?, amount?, due_date?, description? }
//
// Idempotência: UNIQUE (client_id, reference_month) — chamadas duplicadas
// retornam a fatura existente sem criar payment novo.
// =============================================================================

import { handleOptions } from '../_shared/cors.ts'
import { json, jsonError } from '../_shared/response.ts'
import { supabaseAdmin } from '../_shared/supabase.ts'
import { logIntegration } from '../_shared/logging.ts'
import { withRetry } from '../_shared/retry.ts'
import {
  createPayment, ensureAsaasCustomer, getPixQrCode,
  type AsaasPaymentResponse, type AsaasPixQrCode,
} from '../_shared/asaas.ts'

interface Body {
  client_id:        string
  reference_month?: string  // YYYY-MM
  amount?:          number
  due_date?:        string  // YYYY-MM-DD
  description?:     string
  billing_type?:    'BOLETO' | 'PIX' | 'UNDEFINED'
}

function currentMonthYYYYMM(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function defaultDueDate(billingDay: number | null): string {
  const today = new Date()
  const day = billingDay && billingDay >= 1 && billingDay <= 28 ? billingDay : 10
  // se o dia já passou neste mês, usa o mês que vem
  const target = new Date(today.getFullYear(), today.getMonth(), day)
  if (target <= today) target.setMonth(target.getMonth() + 1)
  return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`
}

Deno.serve(async (req) => {
  const cors = handleOptions(req); if (cors) return cors
  if (req.method !== 'POST') return jsonError('method_not_allowed', 405)

  const startedAt = Date.now()
  let body: Body
  try { body = await req.json() } catch { return jsonError('invalid_json') }
  if (!body.client_id) return jsonError('client_id_required')

  const referenceMonth = body.reference_month ?? currentMonthYYYYMM()

  // Carrega cliente
  const { data: client, error: clientErr } = await supabaseAdmin
    .from('clients')
    .select('id, agency_id, full_name, email, phone_primary, billing_day, contract_value')
    .eq('id', body.client_id)
    .single()
  if (clientErr || !client) return jsonError('client_not_found', 404)

  const amount = body.amount ?? Number(client.contract_value ?? 0)
  if (!amount || amount <= 0) {
    return jsonError('amount_required', 422, { detail: 'amount não informado e contract_value vazio' })
  }
  const dueDate = body.due_date ?? defaultDueDate(client.billing_day)

  // Idempotência: existe fatura desse cliente neste mês?
  const { data: existing } = await supabaseAdmin
    .from('invoices')
    .select('id, status, asaas_payment_id, asaas_invoice_url')
    .eq('client_id', client.id)
    .eq('reference_month', referenceMonth)
    .maybeSingle()

  if (existing) {
    return json({ ok: true, invoice_id: existing.id, idempotent: true, ...existing })
  }

  // Cria registro local PRIMEIRO (PRD §20.1 — persistir antes de chamar serviço externo)
  const { data: invoice, error: invErr } = await supabaseAdmin
    .from('invoices')
    .insert({
      agency_id:       client.agency_id,
      client_id:       client.id,
      reference_month: referenceMonth,
      amount,
      issue_date:      new Date().toISOString().slice(0, 10),
      due_date:        dueDate,
      status:          'pending',
      description:     body.description ?? `Honorários ${referenceMonth}`,
    })
    .select('*')
    .single()
  if (invErr || !invoice) {
    return jsonError('invoice_insert_failed', 500, { detail: invErr?.message })
  }

  // Asaas: customer + payment + pixQR
  let payment: AsaasPaymentResponse | null = null
  let pix: AsaasPixQrCode | null = null
  try {
    const customerId = await withRetry(() => ensureAsaasCustomer({
      trimarkClientId: client.id,
      name: client.full_name,
      email: client.email,
      phone: client.phone_primary,
    }))

    payment = await withRetry(() => createPayment({
      customer:          customerId,
      billingType:       body.billing_type ?? 'UNDEFINED',
      value:             amount,
      dueDate,
      description:       body.description ?? `Honorários ${referenceMonth}`,
      externalReference: `trimark-invoice:${invoice.id}`,
    }))

    if (payment.id) {
      try {
        pix = await withRetry(() => getPixQrCode(payment!.id))
      } catch (pixErr) {
        // PIX não obrigatório — boleto pode estar OK
        console.warn('[generate-invoice] pix_qr_falhou', pixErr)
      }
    }

    const patch: Record<string, unknown> = {
      asaas_payment_id:     payment.id,
      asaas_invoice_url:    payment.invoiceUrl ?? null,
      asaas_boleto_url:     payment.bankSlipUrl ?? null,
      asaas_boleto_barcode: payment.identificationField ?? null,
      asaas_pix_qr_code:    pix?.encodedImage ?? null,
      asaas_pix_copy_paste: pix?.payload ?? null,
    }
    await supabaseAdmin.from('invoices').update(patch).eq('id', invoice.id)

    await logIntegration({
      agency_id: client.agency_id, client_id: client.id,
      integration: 'asaas', operation: 'generate-invoice.payment_created',
      level: 'info', request_payload: { value: amount, dueDate, reference: referenceMonth },
      response_payload: payment, duration_ms: Date.now() - startedAt,
      reference_id: invoice.id,
    })

    return json({
      ok: true, invoice_id: invoice.id,
      asaas_payment_id: payment.id, asaas_invoice_url: payment.invoiceUrl,
      asaas_pix_copy_paste: pix?.payload ?? null,
    })
  } catch (err) {
    await logIntegration({
      agency_id: client.agency_id, client_id: client.id,
      integration: 'asaas', operation: 'generate-invoice.failed',
      level: 'error', error_message: String(err),
      duration_ms: Date.now() - startedAt, reference_id: invoice.id,
    })
    return jsonError('asaas_payment_failed', 502, {
      detail: String(err), invoice_id: invoice.id,
    })
  }
})
