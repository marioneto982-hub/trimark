// =============================================================================
// TRIMARK — Edge Function: invoice-cron-daily
// PRD §8.4 + §14: cron diário que executa três tarefas:
//   1. Para cada cliente active com billing_day == hoje, gera fatura do mês corrente.
//   2. Marca como overdue faturas pending com due_date < hoje.
//   3. Envia lembretes Z-API:
//        - 3 dias antes do vencimento (kind=reminder)
//        - 1 dia após vencimento (kind=overdue)
//      Idempotência via invoice_reminders (kind+invoice_id+date).
//
// Invocação:
//   POST /functions/v1/invoice-cron-daily   (sem body, chamada por pg_cron)
// =============================================================================

import { handleOptions } from '../_shared/cors.ts'
import { json } from '../_shared/response.ts'
import { supabaseAdmin } from '../_shared/supabase.ts'
import { logIntegration } from '../_shared/logging.ts'
import { withRetry } from '../_shared/retry.ts'
import { normalizePhoneBR, sendWhatsappText } from '../_shared/zapi.ts'

const SUPABASE_URL              = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

function todayYYYYMM(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function todayDay(): number {
  return new Date().getDate()
}

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function callGenerateInvoice(clientId: string): Promise<unknown> {
  const r = await fetch(`${SUPABASE_URL}/functions/v1/generate-invoice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ client_id: clientId }),
  })
  if (!r.ok) throw new Error(`generate-invoice_http_${r.status}: ${(await r.text()).slice(0, 200)}`)
  return r.json()
}

Deno.serve(async (req) => {
  const cors = handleOptions(req); if (cors) return cors

  const today = new Date()
  const todayStr = isoDate(today)
  const summary = { generated: 0, generation_skipped: 0, generation_failed: 0,
                    marked_overdue: 0, reminders_sent: 0, reminders_failed: 0 }

  // ----- 1) Geração de faturas por billing_day -----
  const { data: clientsToBill } = await supabaseAdmin
    .from('clients')
    .select('id, agency_id, full_name')
    .eq('status', 'active')
    .eq('billing_day', todayDay())
    .limit(500)

  const refMonth = todayYYYYMM()
  for (const c of clientsToBill ?? []) {
    // skip se já existe
    const { data: ex } = await supabaseAdmin
      .from('invoices')
      .select('id').eq('client_id', c.id).eq('reference_month', refMonth)
      .maybeSingle()
    if (ex) { summary.generation_skipped++; continue }
    try {
      await callGenerateInvoice(c.id)
      summary.generated++
    } catch (err) {
      summary.generation_failed++
      await logIntegration({
        agency_id: c.agency_id, client_id: c.id,
        integration: 'system', operation: 'invoice-cron-daily.generate_failed',
        level: 'error', error_message: String(err),
      })
    }
  }

  // ----- 2) Marcar overdue -----
  const { data: nowOverdue } = await supabaseAdmin
    .from('invoices')
    .select('id')
    .eq('status', 'pending')
    .lt('due_date', todayStr)
    .limit(500)

  if (nowOverdue && nowOverdue.length > 0) {
    const ids = nowOverdue.map((r) => r.id)
    const { error } = await supabaseAdmin
      .from('invoices').update({ status: 'overdue' }).in('id', ids)
    if (!error) summary.marked_overdue = ids.length
  }

  // ----- 3) Enviar lembretes (alinhado a invoice_reminders.reminder_type) -----
  // 3a) pre_5d: due_date == hoje + 5
  const remDate = new Date(today); remDate.setDate(today.getDate() + 5)
  const remDateStr = isoDate(remDate)
  const { data: dueSoon } = await supabaseAdmin
    .from('invoices')
    .select(`id, agency_id, client_id, asaas_pix_copy_paste, asaas_invoice_url, reference_month, amount, due_date,
             clients:client_id ( full_name, phone_primary ),
             agencies:agency_id ( name )`)
    .eq('status', 'pending').eq('due_date', remDateStr).limit(200)

  // 3b) post_1d: due_date == hoje - 1
  const overdueDate = new Date(today); overdueDate.setDate(today.getDate() - 1)
  const overdueDateStr = isoDate(overdueDate)
  const { data: justOverdue } = await supabaseAdmin
    .from('invoices')
    .select(`id, agency_id, client_id, asaas_pix_copy_paste, asaas_invoice_url, reference_month, amount, due_date,
             clients:client_id ( full_name, phone_primary ),
             agencies:agency_id ( name )`)
    .eq('status', 'overdue').eq('due_date', overdueDateStr).limit(200)

  type ReminderType = 'pre_5d' | 'post_1d'
  const tasks: { invoice: unknown; reminderType: ReminderType }[] = []
  for (const inv of dueSoon ?? []) tasks.push({ invoice: inv, reminderType: 'pre_5d' })
  for (const inv of justOverdue ?? []) tasks.push({ invoice: inv, reminderType: 'post_1d' })

  for (const { invoice, reminderType } of tasks) {
    const inv = invoice as {
      id: string; agency_id: string; client_id: string;
      reference_month: string; amount: string; due_date: string;
      asaas_pix_copy_paste: string | null; asaas_invoice_url: string | null;
      clients: { full_name: string; phone_primary: string | null };
      agencies: { name: string };
    }

    // Dedup: já mandamos esse reminder_type pra essa invoice (qualquer dia)?
    // Cada reminder_type só pode ser enviado UMA vez por fatura — não há "manda de novo".
    const { data: prior } = await supabaseAdmin
      .from('invoice_reminders').select('id')
      .eq('invoice_id', inv.id).eq('reminder_type', reminderType)
      .limit(1)
    if (prior && prior.length > 0) continue

    const phone = normalizePhoneBR(inv.clients?.phone_primary)
    if (!phone) continue

    const firstName = inv.clients.full_name?.split(' ')[0] ?? ''
    const amountBRL = Number(inv.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    const dueBR = new Date(inv.due_date + 'T00:00').toLocaleDateString('pt-BR')
    const intro = reminderType === 'pre_5d'
      ? `Lembrete: sua fatura vence em 5 dias.`
      : `Sua fatura passou do vencimento.`

    const lines = [
      `Olá, ${firstName}!`, '',
      `${inv.agencies?.name ?? 'Sua agência'} aqui. ${intro}`, '',
      `*Valor:* ${amountBRL}`, `*Vencimento:* ${dueBR}`,
    ]
    if (inv.asaas_pix_copy_paste) lines.push('', '*PIX (copia-e-cola):*', inv.asaas_pix_copy_paste)
    if (inv.asaas_invoice_url) lines.push('', `Fatura: ${inv.asaas_invoice_url}`)
    const message = lines.join('\n')

    try {
      const resp = await withRetry(() => sendWhatsappText(phone, message))
      await supabaseAdmin.from('invoice_reminders').insert({
        invoice_id: inv.id, reminder_type: reminderType, channel: 'whatsapp',
        sent_at: new Date().toISOString(),
      })
      await logIntegration({
        agency_id: inv.agency_id, client_id: inv.client_id,
        integration: 'zapi', operation: `invoice-cron-daily.${reminderType}`,
        level: 'info', reference_id: inv.id,
        request_payload: { phone }, response_payload: resp,
      })
      summary.reminders_sent++
    } catch (err) {
      summary.reminders_failed++
      await logIntegration({
        agency_id: inv.agency_id, client_id: inv.client_id,
        integration: 'zapi', operation: `invoice-cron-daily.${reminderType}.failed`,
        level: 'error', error_message: String(err), reference_id: inv.id,
      })
    }
  }

  return json({ ok: true, summary })
})
