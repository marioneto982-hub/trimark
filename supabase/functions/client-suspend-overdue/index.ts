// =============================================================================
// TRIMARK — Edge Function: client-suspend-overdue
// PRD §8.5: cron diário que suspende clientes com faturas em atraso prolongado.
//
// Regra padrão: cliente com qualquer fatura vencida há > 15 dias passa para
// status='suspended'. Logado em integration_logs e dispara WhatsApp de aviso.
//
// Invocação: POST /functions/v1/client-suspend-overdue (chamado por pg_cron).
// =============================================================================

import { handleOptions } from '../_shared/cors.ts'
import { json } from '../_shared/response.ts'
import { supabaseAdmin } from '../_shared/supabase.ts'
import { logIntegration } from '../_shared/logging.ts'
import { withRetry } from '../_shared/retry.ts'
import { normalizePhoneBR, sendWhatsappText } from '../_shared/zapi.ts'

const SUSPEND_AFTER_DAYS = Number(Deno.env.get('SUSPEND_AFTER_DAYS') ?? '15')

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

Deno.serve(async (req) => {
  const cors = handleOptions(req); if (cors) return cors

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - SUSPEND_AFTER_DAYS)
  const cutoffStr = isoDate(cutoff)

  // Faturas vencidas com due_date < cutoff
  const { data: overdueInvoices } = await supabaseAdmin
    .from('invoices')
    .select(`client_id, agency_id, due_date,
             clients:client_id ( status, full_name, phone_primary ),
             agencies:agency_id ( name )`)
    .eq('status', 'overdue')
    .lt('due_date', cutoffStr)
    .limit(500)

  // Dedup por client_id (1 cliente pode ter várias overdue)
  const byClient = new Map<string, typeof overdueInvoices[number]>()
  for (const inv of overdueInvoices ?? []) {
    if (!byClient.has(inv.client_id)) byClient.set(inv.client_id, inv)
  }

  let suspended = 0, skipped = 0, notified = 0

  for (const [clientId, inv] of byClient) {
    const client = (inv as unknown as { clients: { status: string; full_name: string; phone_primary: string | null } }).clients
    const agency = (inv as unknown as { agencies: { name: string } }).agencies
    if (client.status === 'suspended' || client.status === 'canceled') { skipped++; continue }

    const { error: updErr } = await supabaseAdmin
      .from('clients').update({ status: 'suspended' }).eq('id', clientId)
    if (updErr) {
      await logIntegration({
        agency_id: inv.agency_id, client_id: clientId,
        integration: 'system', operation: 'client-suspend-overdue.update_failed',
        level: 'error', error_message: updErr.message,
      })
      continue
    }
    suspended++

    await logIntegration({
      agency_id: inv.agency_id, client_id: clientId,
      integration: 'system', operation: 'client-suspend-overdue.suspended',
      level: 'warn', reference_id: clientId,
      request_payload: { trigger_due_date: inv.due_date, threshold_days: SUSPEND_AFTER_DAYS },
    })

    // Tenta avisar via WhatsApp (best-effort)
    const phone = normalizePhoneBR(client.phone_primary)
    if (phone) {
      const message =
        `Olá, ${client.full_name?.split(' ')[0] ?? ''}!\n\n` +
        `Sua conta com ${agency?.name ?? 'a agência'} está suspensa por inadimplência.\n` +
        `Por favor entre em contato para regularizar e reativar o serviço.`
      try {
        await withRetry(() => sendWhatsappText(phone, message))
        notified++
      } catch (err) {
        await logIntegration({
          agency_id: inv.agency_id, client_id: clientId,
          integration: 'zapi', operation: 'client-suspend-overdue.notify_failed',
          level: 'error', error_message: String(err),
        })
      }
    }
  }

  return json({
    ok: true,
    threshold_days: SUSPEND_AFTER_DAYS,
    candidates: byClient.size,
    suspended, skipped, notified,
  })
})
