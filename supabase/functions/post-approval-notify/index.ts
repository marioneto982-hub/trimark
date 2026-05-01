// =============================================================================
// TRIMARK — Edge Function: post-approval-notify
// PRD §6.2.1: avisa o cliente via WhatsApp (Z-API) quando um post entra em
// status 'awaiting_client', enviando link direto para a tela de aprovações.
//
// Invocação:
//   POST /functions/v1/post-approval-notify
//   { post_id: string }
//
// Comportamento:
//   1. Valida payload + JWT do caller (deve ser usuário interno da mesma
//      agência que o post).
//   2. Carrega post + client (phone, full_name) + agência.
//   3. Garante que o post está em 'awaiting_client'.
//   4. Envia mensagem Z-API com retry 2x.
//   5. Loga em integration_logs (dedup via reference_id=post.id).
// =============================================================================

import { handleOptions } from '../_shared/cors.ts'
import { json, jsonError } from '../_shared/response.ts'
import { supabaseAdmin } from '../_shared/supabase.ts'
import { logIntegration } from '../_shared/logging.ts'
import { withRetry } from '../_shared/retry.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const SUPABASE_URL      = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const ZAPI_INSTANCE_ID  = Deno.env.get('ZAPI_INSTANCE_ID') ?? ''
const ZAPI_TOKEN        = Deno.env.get('ZAPI_TOKEN') ?? ''
const ZAPI_CLIENT_TOKEN = Deno.env.get('ZAPI_CLIENT_TOKEN') ?? ''
const PORTAL_BASE_URL   = Deno.env.get('PORTAL_BASE_URL') ?? 'https://trimark.net.br'

interface Body { post_id: string }

function normalizePhone(raw: string | null | undefined): string | null {
  const digits = (raw ?? '').replace(/\D/g, '')
  if (!digits) return null
  // BR sem prefixo → adiciona 55
  if (digits.length <= 11) return `55${digits}`
  return digits
}

async function sendZApi(phone: string, message: string): Promise<unknown> {
  if (!ZAPI_INSTANCE_ID || !ZAPI_TOKEN) {
    throw new Error('zapi_credentials_missing')
  }
  const url = `https://api.z-api.io/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_TOKEN}/send-text`
  const r = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(ZAPI_CLIENT_TOKEN ? { 'Client-Token': ZAPI_CLIENT_TOKEN } : {}),
    },
    body: JSON.stringify({ phone, message }),
  })
  if (!r.ok) {
    const txt = await r.text()
    throw new Error(`zapi_http_${r.status}: ${txt.slice(0, 200)}`)
  }
  return r.json()
}

Deno.serve(async (req) => {
  const cors = handleOptions(req); if (cors) return cors
  if (req.method !== 'POST') return jsonError('method_not_allowed', 405)

  const startedAt = Date.now()
  let body: Body
  try { body = await req.json() } catch { return jsonError('invalid_json') }
  if (!body.post_id) return jsonError('post_id_required')

  // Caller deve ser usuário interno
  const auth = req.headers.get('Authorization') ?? ''
  const caller = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: { user } } = await caller.auth.getUser()
  if (!user) return jsonError('unauthenticated', 401)

  const { data: callerRow } = await supabaseAdmin
    .from('users').select('id, agency_id, role').eq('auth_user_id', user.id).single()
  if (!callerRow) return jsonError('caller_not_internal', 403)

  // Carrega post + client + agency
  const { data: post, error: postErr } = await supabaseAdmin
    .from('content_posts')
    .select(`
      id, agency_id, client_id, title, status, scheduled_at,
      clients:client_id ( full_name, phone_primary ),
      agencies:agency_id ( name )
    `)
    .eq('id', body.post_id)
    .single()
  if (postErr || !post) return jsonError('post_not_found', 404)

  if (post.agency_id !== callerRow.agency_id) {
    return jsonError('cross_agency_forbidden', 403)
  }
  if (post.status !== 'awaiting_client') {
    return jsonError('post_not_awaiting_client', 409, { current_status: post.status })
  }

  const client = (post as unknown as { clients: { full_name: string; phone_primary: string | null } }).clients
  const agency = (post as unknown as { agencies: { name: string } }).agencies
  const phone = normalizePhone(client?.phone_primary)
  if (!phone) {
    await logIntegration({
      agency_id: post.agency_id, client_id: post.client_id,
      integration: 'system', operation: 'post-approval-notify.no_phone',
      level: 'warn', reference_id: post.id,
    })
    return jsonError('client_phone_missing', 422)
  }

  const portalUrl = `${PORTAL_BASE_URL}/portal/approvals`
  const message =
    `Olá, ${client.full_name?.split(' ')[0] ?? ''}!\n\n` +
    `${agency?.name ?? 'Sua agência'} preparou um post novo pra sua aprovação` +
    (post.title ? ` ("${post.title}")` : '') + `.\n\n` +
    `Acesse para revisar e aprovar:\n${portalUrl}`

  try {
    const resp = await withRetry(() => sendZApi(phone, message))
    await logIntegration({
      agency_id: post.agency_id, client_id: post.client_id,
      integration: 'zapi', operation: 'post-approval-notify.sent',
      level: 'info', request_payload: { phone, post_id: post.id },
      response_payload: resp, duration_ms: Date.now() - startedAt,
      reference_id: post.id,
    })
    return json({ ok: true, sent_to: phone })
  } catch (err) {
    await logIntegration({
      agency_id: post.agency_id, client_id: post.client_id,
      integration: 'zapi', operation: 'post-approval-notify.failed',
      level: 'error', error_message: String(err),
      duration_ms: Date.now() - startedAt, reference_id: post.id,
    })
    return jsonError('zapi_send_failed', 502, { detail: String(err) })
  }
})
