// =============================================================================
// TRIMARK — Edge Function: commission-calculate
// PRD §9.3: calcula comissões sobre faturas PAGAS de um período (mês de
// referência), atribuídas ao account_manager (salesperson) de cada cliente.
//
// Invocação:
//   POST /functions/v1/commission-calculate
//   { agency_id?: string, reference_month?: 'YYYY-MM',
//     commission_percent?: number /* default 10 */ }
//
// Idempotência: checa por (agency_id, salesperson_id, invoice_id) antes de
// inserir — não cria duplicatas.
//
// Permissão: caller deve ser admin ou manager. Se agency_id não vier no body,
// usa a do caller.
// =============================================================================

import { handleOptions } from '../_shared/cors.ts'
import { json, jsonError } from '../_shared/response.ts'
import { supabaseAdmin } from '../_shared/supabase.ts'
import { logIntegration } from '../_shared/logging.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const SUPABASE_URL      = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

interface Body {
  agency_id?:          string
  reference_month?:    string
  commission_percent?: number
}

function currentMonthYYYYMM(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

Deno.serve(async (req) => {
  const cors = handleOptions(req); if (cors) return cors
  if (req.method !== 'POST') return jsonError('method_not_allowed', 405)

  let body: Body
  try { body = await req.json() } catch { body = {} as Body }
  const refMonth = body.reference_month ?? currentMonthYYYYMM()
  const pct = body.commission_percent ?? 10

  // Caller: precisa ser admin/manager
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
  if (!['admin', 'manager'].includes(callerRow.role)) {
    return jsonError('caller_role_insufficient', 403, { detail: callerRow.role })
  }

  const targetAgency = body.agency_id ?? callerRow.agency_id
  if (targetAgency !== callerRow.agency_id) {
    return jsonError('cross_agency_forbidden', 403)
  }

  // Faturas pagas do período — só clientes com account_manager
  const { data: invoices, error: invErr } = await supabaseAdmin
    .from('invoices')
    .select(`id, agency_id, client_id, amount, paid_at, reference_month,
             clients:client_id ( account_manager_id )`)
    .eq('agency_id', targetAgency)
    .eq('reference_month', refMonth)
    .eq('status', 'paid')

  if (invErr) return jsonError('invoices_query_failed', 500, { detail: invErr.message })

  let created = 0, skipped = 0, no_manager = 0
  const totals = new Map<string, number>()  // salesperson_id → total commissions

  for (const inv of invoices ?? []) {
    const client = (inv as unknown as { clients: { account_manager_id: string | null } }).clients
    const sp = client?.account_manager_id
    if (!sp) { no_manager++; continue }

    // Idempotência por invoice_id
    const { data: existing } = await supabaseAdmin
      .from('commissions')
      .select('id')
      .eq('invoice_id', inv.id)
      .eq('salesperson_id', sp)
      .maybeSingle()
    if (existing) { skipped++; continue }

    const value = Math.round(Number(inv.amount) * (pct / 100) * 100) / 100
    const { error: insErr } = await supabaseAdmin.from('commissions').insert({
      agency_id:          targetAgency,
      salesperson_id:     sp,
      client_id:          inv.client_id,
      invoice_id:         inv.id,
      commission_percent: pct,
      commission_value:   value,
      reference_month:    refMonth,
      status:             'pending',
    })
    if (insErr) {
      await logIntegration({
        agency_id: targetAgency, client_id: inv.client_id,
        integration: 'system', operation: 'commission-calculate.insert_failed',
        level: 'error', error_message: insErr.message, reference_id: inv.id,
      })
      continue
    }
    created++
    totals.set(sp, (totals.get(sp) ?? 0) + value)
  }

  await logIntegration({
    agency_id: targetAgency,
    integration: 'system', operation: 'commission-calculate.run',
    level: 'info',
    request_payload: { refMonth, pct, processed: invoices?.length ?? 0 },
    response_payload: { created, skipped, no_manager },
  })

  return json({
    ok: true,
    reference_month: refMonth,
    commission_percent: pct,
    processed: invoices?.length ?? 0,
    created, skipped, no_manager,
    by_salesperson: Object.fromEntries(totals),
  })
})
