// =============================================================================
// TRIMARK — Edge Function: post-pending-reminder
// PRD §6.2.1: cron diário que avisa clientes sobre posts em 'awaiting_client'
// pendentes há mais de 24h. Idempotente via integration_logs (reference_id).
//
// Invocação:
//   POST /functions/v1/post-pending-reminder  (sem body)
//   - Chamado pelo pg_cron / GitHub Actions.
//
// Comportamento:
//   1. Busca posts em 'awaiting_client' criados há mais de 24h.
//   2. Para cada um: verifica se já existe log de reminder nos últimos 24h.
//   3. Se não, envia Z-API e loga.
//   4. Retorna sumário (sent / skipped / failed).
// =============================================================================

import { handleOptions } from '../_shared/cors.ts'
import { json } from '../_shared/response.ts'
import { supabaseAdmin } from '../_shared/supabase.ts'
import { logIntegration } from '../_shared/logging.ts'
import { withRetry } from '../_shared/retry.ts'

const ZAPI_INSTANCE_ID  = Deno.env.get('ZAPI_INSTANCE_ID') ?? ''
const ZAPI_TOKEN        = Deno.env.get('ZAPI_TOKEN') ?? ''
const ZAPI_CLIENT_TOKEN = Deno.env.get('ZAPI_CLIENT_TOKEN') ?? ''
const PORTAL_BASE_URL   = Deno.env.get('PORTAL_BASE_URL') ?? 'https://trimark.net.br'

function normalizePhone(raw: string | null | undefined): string | null {
  const digits = (raw ?? '').replace(/\D/g, '')
  if (!digits) return null
  if (digits.length <= 11) return `55${digits}`
  return digits
}

async function sendZApi(phone: string, message: string): Promise<unknown> {
  if (!ZAPI_INSTANCE_ID || !ZAPI_TOKEN) throw new Error('zapi_credentials_missing')
  const url = `https://api.z-api.io/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_TOKEN}/send-text`
  const r = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(ZAPI_CLIENT_TOKEN ? { 'Client-Token': ZAPI_CLIENT_TOKEN } : {}),
    },
    body: JSON.stringify({ phone, message }),
  })
  if (!r.ok) throw new Error(`zapi_http_${r.status}: ${(await r.text()).slice(0, 200)}`)
  return r.json()
}

Deno.serve(async (req) => {
  const cors = handleOptions(req); if (cors) return cors

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  // Busca posts em awaiting_client mais velhos que 24h
  const { data: posts, error } = await supabaseAdmin
    .from('content_posts')
    .select(`
      id, agency_id, client_id, title, created_at,
      clients:client_id ( full_name, phone_primary ),
      agencies:agency_id ( name )
    `)
    .eq('status', 'awaiting_client')
    .lt('created_at', cutoff)
    .limit(200)

  if (error) {
    return json({ ok: false, error: error.message }, { status: 500 })
  }

  let sent = 0, skipped = 0, failed = 0
  const sinceWindow = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  for (const p of posts ?? []) {
    // Dedup: já enviamos reminder nas últimas 24h pra este post?
    const { data: prior } = await supabaseAdmin
      .from('integration_logs')
      .select('id')
      .eq('reference_id', p.id)
      .eq('operation', 'post-pending-reminder.sent')
      .gte('created_at', sinceWindow)
      .limit(1)
    if (prior && prior.length > 0) { skipped++; continue }

    const client = (p as unknown as { clients: { full_name: string; phone_primary: string | null } }).clients
    const agency = (p as unknown as { agencies: { name: string } }).agencies
    const phone = normalizePhone(client?.phone_primary)
    if (!phone) { skipped++; continue }

    const portalUrl = `${PORTAL_BASE_URL}/portal/approvals`
    const msg =
      `Olá, ${client.full_name?.split(' ')[0] ?? ''}!\n\n` +
      `Tem um post de ${agency?.name ?? 'sua agência'} esperando sua aprovação há mais de 24h` +
      (p.title ? ` ("${p.title}")` : '') + `.\n\n` +
      `Para liberá-lo, acesse:\n${portalUrl}`

    try {
      const resp = await withRetry(() => sendZApi(phone, msg))
      await logIntegration({
        agency_id: p.agency_id, client_id: p.client_id,
        integration: 'zapi', operation: 'post-pending-reminder.sent',
        level: 'info', reference_id: p.id,
        request_payload: { phone, post_id: p.id }, response_payload: resp,
      })
      sent++
    } catch (err) {
      failed++
      await logIntegration({
        agency_id: p.agency_id, client_id: p.client_id,
        integration: 'zapi', operation: 'post-pending-reminder.failed',
        level: 'error', error_message: String(err), reference_id: p.id,
      })
    }
  }

  return json({ ok: true, processed: posts?.length ?? 0, sent, skipped, failed })
})
