// =============================================================================
// TRIMARK — Edge Function: monthly-report-generate
// PRD §10.5: gera o relatório mensal consolidado de UM cliente — usado pra
// envio por e-mail ou exibição no portal. Retorna JSON estruturado (front
// renderiza em HTML/PDF).
//
// Invocação:
//   POST /functions/v1/monthly-report-generate
//   { client_id: string, reference_month?: 'YYYY-MM' }
// =============================================================================

import { handleOptions } from '../_shared/cors.ts'
import { json, jsonError } from '../_shared/response.ts'
import { supabaseAdmin } from '../_shared/supabase.ts'
import { logIntegration } from '../_shared/logging.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const SUPABASE_URL      = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

interface Body {
  client_id:        string
  reference_month?: string
}

function previousMonthYYYYMM(): string {
  const d = new Date()
  d.setDate(1); d.setMonth(d.getMonth() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthBounds(yyyymm: string): { start: string; end: string; label: string } {
  const [y, m] = yyyymm.split('-').map(Number)
  const start = new Date(y, m - 1, 1).toISOString()
  const end = new Date(y, m, 1).toISOString()
  return { start, end, label: `${String(m).padStart(2, '0')}/${y}` }
}

Deno.serve(async (req) => {
  const cors = handleOptions(req); if (cors) return cors
  if (req.method !== 'POST') return jsonError('method_not_allowed', 405)

  let body: Body
  try { body = await req.json() } catch { return jsonError('invalid_json') }
  if (!body.client_id) return jsonError('client_id_required')
  const refMonth = body.reference_month ?? previousMonthYYYYMM()
  const { start, end, label } = monthBounds(refMonth)

  // Caller: interno OU client (próprio relatório)
  const auth = req.headers.get('Authorization') ?? ''
  const caller = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: { user } } = await caller.auth.getUser()
  if (!user) return jsonError('unauthenticated', 401)

  const { data: client, error: clientErr } = await supabaseAdmin
    .from('clients')
    .select(`id, agency_id, full_name, trade_name, instagram_handle,
             specialties:specialty_id ( name )`)
    .eq('id', body.client_id).single()
  if (clientErr || !client) return jsonError('client_not_found', 404)

  // Permissão
  const [{ data: internal }, { data: cu }] = await Promise.all([
    supabaseAdmin.from('users').select('agency_id').eq('auth_user_id', user.id).maybeSingle(),
    supabaseAdmin.from('client_users').select('client_id').eq('auth_user_id', user.id).eq('active', true).maybeSingle(),
  ])
  const allowed =
    (internal && internal.agency_id === client.agency_id) ||
    (cu && cu.client_id === client.id)
  if (!allowed) return jsonError('forbidden', 403)

  // Posts publicados no mês
  const { data: posts } = await supabaseAdmin
    .from('content_posts')
    .select(`id, title, platform, format, published_at, external_post_url`)
    .eq('client_id', client.id)
    .eq('status', 'published')
    .gte('published_at', start)
    .lt('published_at', end)

  const postIds = (posts ?? []).map((p) => p.id)
  const totals = { reach: 0, impressions: 0, likes: 0, comments: 0, shares: 0, saves: 0, clicks: 0 }
  if (postIds.length > 0) {
    const { data: metrics } = await supabaseAdmin
      .from('post_metrics')
      .select('reach, impressions, likes, comments, shares, saves, clicks')
      .in('post_id', postIds)
    for (const m of metrics ?? []) {
      totals.reach       += m.reach ?? 0
      totals.impressions += m.impressions ?? 0
      totals.likes       += m.likes ?? 0
      totals.comments    += m.comments ?? 0
      totals.shares      += m.shares ?? 0
      totals.saves       += m.saves ?? 0
      totals.clicks      += m.clicks ?? 0
    }
  }

  // Faturas do mês
  const { data: invoices } = await supabaseAdmin
    .from('invoices')
    .select('id, status, amount, due_date, paid_at, reference_month')
    .eq('client_id', client.id)
    .eq('reference_month', refMonth)

  const sp = (client as unknown as { specialties: { name: string } | null }).specialties

  const report = {
    generated_at:   new Date().toISOString(),
    reference_month: refMonth,
    period_label:    label,
    client: {
      id:          client.id,
      name:        client.full_name,
      trade_name:  client.trade_name,
      specialty:   sp?.name ?? null,
      instagram:   (client as unknown as { instagram_handle?: string }).instagram_handle ?? null,
    },
    posts_published: posts?.length ?? 0,
    posts:           posts ?? [],
    metrics_totals:  totals,
    invoices:        invoices ?? [],
  }

  await logIntegration({
    agency_id: client.agency_id, client_id: client.id,
    integration: 'system', operation: 'monthly-report-generate',
    level: 'info', reference_id: client.id,
    request_payload: { reference_month: refMonth },
    response_payload: { posts_published: report.posts_published },
  })

  return json({ ok: true, report })
})
