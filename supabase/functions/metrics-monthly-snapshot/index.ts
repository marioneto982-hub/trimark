// =============================================================================
// TRIMARK — Edge Function: metrics-monthly-snapshot
// PRD §10.4: cron mensal que tira snapshot consolidado das métricas dos posts
// publicados no mês anterior. Persiste em integration_logs como linha de
// referência (operation='metrics-snapshot') por agência+cliente.
//
// Invocação: POST /functions/v1/metrics-monthly-snapshot (chamado por pg_cron).
// Body opcional: { reference_month?: 'YYYY-MM' }
// =============================================================================

import { handleOptions } from '../_shared/cors.ts'
import { json } from '../_shared/response.ts'
import { supabaseAdmin } from '../_shared/supabase.ts'
import { logIntegration } from '../_shared/logging.ts'

interface Body { reference_month?: string }

function previousMonthYYYYMM(): string {
  const d = new Date()
  d.setDate(1); d.setMonth(d.getMonth() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthBounds(yyyymm: string): { start: string; end: string } {
  const [y, m] = yyyymm.split('-').map(Number)
  const start = new Date(y, m - 1, 1).toISOString()
  const end = new Date(y, m, 1).toISOString()
  return { start, end }
}

Deno.serve(async (req) => {
  const cors = handleOptions(req); if (cors) return cors

  let body: Body = {}
  try { body = await req.json() } catch { /* corpo opcional */ }
  const refMonth = body.reference_month ?? previousMonthYYYYMM()
  const { start, end } = monthBounds(refMonth)

  // Posts publicados no mês
  const { data: posts, error: postsErr } = await supabaseAdmin
    .from('content_posts')
    .select(`id, agency_id, client_id, platform, format, published_at`)
    .eq('status', 'published')
    .gte('published_at', start)
    .lt('published_at', end)

  if (postsErr) return json({ ok: false, error: postsErr.message }, { status: 500 })

  // Agrupa por (agency_id, client_id)
  const byClient = new Map<string, { agency_id: string; client_id: string; post_ids: string[] }>()
  for (const p of posts ?? []) {
    const key = `${p.agency_id}:${p.client_id}`
    const acc = byClient.get(key) ?? { agency_id: p.agency_id, client_id: p.client_id, post_ids: [] }
    acc.post_ids.push(p.id)
    byClient.set(key, acc)
  }

  let snapshots = 0
  for (const { agency_id, client_id, post_ids } of byClient.values()) {
    if (post_ids.length === 0) continue

    const { data: metrics } = await supabaseAdmin
      .from('post_metrics')
      .select('reach, impressions, likes, comments, shares, saves, clicks, post_id')
      .in('post_id', post_ids)

    const totals = { reach: 0, impressions: 0, likes: 0, comments: 0, shares: 0, saves: 0, clicks: 0 }
    for (const m of metrics ?? []) {
      totals.reach       += m.reach ?? 0
      totals.impressions += m.impressions ?? 0
      totals.likes       += m.likes ?? 0
      totals.comments    += m.comments ?? 0
      totals.shares      += m.shares ?? 0
      totals.saves       += m.saves ?? 0
      totals.clicks      += m.clicks ?? 0
    }

    await logIntegration({
      agency_id, client_id,
      integration: 'system', operation: 'metrics-monthly-snapshot',
      level: 'info',
      request_payload: { reference_month: refMonth, posts_count: post_ids.length },
      response_payload: totals,
      reference_id: client_id,
    })
    snapshots++
  }

  return json({ ok: true, reference_month: refMonth, posts: posts?.length ?? 0, snapshots })
})
