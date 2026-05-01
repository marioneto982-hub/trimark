// =============================================================================
// TRIMARK — Edge Function: send-invoice-whatsapp
// PRD §11.1: envia uma fatura ao cliente via WhatsApp (Z-API).
//
// Invocação:
//   POST /functions/v1/send-invoice-whatsapp
//   { invoice_id: string, kind?: 'new' | 'reminder' | 'overdue' }
//
// Comportamento:
//   1. Caller deve ser usuário interno da mesma agência da fatura.
//   2. Resolve telefone do cliente.
//   3. Monta mensagem com link da invoice + PIX copia-e-cola se houver.
//   4. Envia via Z-API com retry 2x.
//   5. Loga em integration_logs E em invoice_reminders.
// =============================================================================

import { handleOptions } from '../_shared/cors.ts'
import { json, jsonError } from '../_shared/response.ts'
import { supabaseAdmin } from '../_shared/supabase.ts'
import { logIntegration } from '../_shared/logging.ts'
import { withRetry } from '../_shared/retry.ts'
import { normalizePhoneBR, sendWhatsappText } from '../_shared/zapi.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const SUPABASE_URL      = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

interface Body {
  invoice_id: string
  kind?:      'new' | 'reminder' | 'overdue'
}

function brl(n: number | string): string {
  const v = typeof n === 'string' ? Number(n) : n
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDateBR(iso: string): string {
  return new Date(iso + (iso.length === 10 ? 'T00:00' : '')).toLocaleDateString('pt-BR')
}

function buildMessage(kind: Body['kind'], opts: {
  firstName: string; agencyName: string; reference: string;
  amount: string; dueDate: string; pixCopia?: string | null; invoiceUrl?: string | null;
}): string {
  const intro = (() => {
    switch (kind) {
      case 'reminder': return `Lembrete amigável: sua fatura está se aproximando do vencimento.`
      case 'overdue':  return `Sua fatura passou da data de vencimento. Vamos resolver?`
      default:         return `Sua fatura de ${opts.reference} já está disponível.`
    }
  })()
  const lines = [
    `Olá, ${opts.firstName}!`,
    '',
    `${opts.agencyName} aqui. ${intro}`,
    '',
    `*Valor:* ${opts.amount}`,
    `*Vencimento:* ${opts.dueDate}`,
  ]
  if (opts.pixCopia) {
    lines.push('', '*PIX (copia-e-cola):*', opts.pixCopia)
  }
  if (opts.invoiceUrl) {
    lines.push('', `Acessar fatura: ${opts.invoiceUrl}`)
  }
  return lines.join('\n')
}

Deno.serve(async (req) => {
  const cors = handleOptions(req); if (cors) return cors
  if (req.method !== 'POST') return jsonError('method_not_allowed', 405)

  const startedAt = Date.now()
  let body: Body
  try { body = await req.json() } catch { return jsonError('invalid_json') }
  if (!body.invoice_id) return jsonError('invoice_id_required')
  const kind = body.kind ?? 'new'

  // Caller interno
  const auth = req.headers.get('Authorization') ?? ''
  const caller = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: { user } } = await caller.auth.getUser()
  // Aceita também chamadas sem user mas com service-role (cron). Então não barra direto.
  const isServiceRole = !user && auth.endsWith(Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '__none__')

  // Carrega fatura + cliente + agência
  const { data: inv, error: invErr } = await supabaseAdmin
    .from('invoices')
    .select(`
      id, agency_id, client_id, reference_month, amount, due_date, status,
      asaas_invoice_url, asaas_pix_copy_paste,
      clients:client_id ( full_name, phone_primary ),
      agencies:agency_id ( name )
    `)
    .eq('id', body.invoice_id)
    .single()
  if (invErr || !inv) return jsonError('invoice_not_found', 404)

  if (user && !isServiceRole) {
    const { data: callerRow } = await supabaseAdmin
      .from('users').select('agency_id, role').eq('auth_user_id', user.id).single()
    if (!callerRow) return jsonError('caller_not_internal', 403)
    if (callerRow.agency_id !== inv.agency_id) return jsonError('cross_agency_forbidden', 403)
  }

  const client = (inv as unknown as { clients: { full_name: string; phone_primary: string | null } }).clients
  const agency = (inv as unknown as { agencies: { name: string } }).agencies
  const phone = normalizePhoneBR(client?.phone_primary)
  if (!phone) {
    await logIntegration({
      agency_id: inv.agency_id, client_id: inv.client_id,
      integration: 'system', operation: 'send-invoice-whatsapp.no_phone',
      level: 'warn', reference_id: inv.id,
    })
    return jsonError('client_phone_missing', 422)
  }

  const message = buildMessage(kind, {
    firstName:  client.full_name?.split(' ')[0] ?? '',
    agencyName: agency?.name ?? 'Sua agência',
    reference:  inv.reference_month,
    amount:     brl(inv.amount),
    dueDate:    formatDateBR(inv.due_date),
    pixCopia:   inv.asaas_pix_copy_paste,
    invoiceUrl: inv.asaas_invoice_url,
  })

  // Mapeia o `kind` deste endpoint para os reminder_types do schema (PRD §8.5).
  // 'new' é envio inicial (não é lembrete) → não grava em invoice_reminders.
  const REMINDER_TYPE_MAP: Record<NonNullable<Body['kind']>, string | null> = {
    new: null,
    reminder: 'pre_5d',
    overdue: 'post_1d',
  }
  const reminderType = REMINDER_TYPE_MAP[kind]

  try {
    const resp = await withRetry(() => sendWhatsappText(phone, message))
    if (reminderType) {
      await supabaseAdmin.from('invoice_reminders').insert({
        invoice_id: inv.id, reminder_type: reminderType, channel: 'whatsapp',
        sent_at: new Date().toISOString(),
      })
    }
    await logIntegration({
      agency_id: inv.agency_id, client_id: inv.client_id,
      integration: 'zapi', operation: `send-invoice-whatsapp.${kind}`,
      level: 'info', request_payload: { phone, invoice_id: inv.id },
      response_payload: resp, duration_ms: Date.now() - startedAt,
      reference_id: inv.id,
    })
    return json({ ok: true, sent_to: phone })
  } catch (err) {
    await logIntegration({
      agency_id: inv.agency_id, client_id: inv.client_id,
      integration: 'zapi', operation: `send-invoice-whatsapp.${kind}.failed`,
      level: 'error', error_message: String(err),
      duration_ms: Date.now() - startedAt, reference_id: inv.id,
    })
    return jsonError('zapi_send_failed', 502, { detail: String(err) })
  }
})
