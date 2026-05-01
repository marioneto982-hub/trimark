// =============================================================================
// TRIMARK — Edge Function: library-track-view
// PRD §7.6: registra que um client_user visualizou um item da biblioteca.
//
// Invocação:
//   POST /functions/v1/library-track-view
//   { library_item_id: string }
//
// Comportamento:
//   1. Caller deve ser client_user (resolvido via JWT).
//   2. Insere em content_library_views.
//   3. Incrementa content_library.view_count (best-effort).
// =============================================================================

import { handleOptions } from '../_shared/cors.ts'
import { json, jsonError } from '../_shared/response.ts'
import { supabaseAdmin } from '../_shared/supabase.ts'
import { logIntegration } from '../_shared/logging.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const SUPABASE_URL      = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

interface Body { library_item_id: string }

Deno.serve(async (req) => {
  const cors = handleOptions(req); if (cors) return cors
  if (req.method !== 'POST') return jsonError('method_not_allowed', 405)

  let body: Body
  try { body = await req.json() } catch { return jsonError('invalid_json') }
  if (!body.library_item_id) return jsonError('library_item_id_required')

  const auth = req.headers.get('Authorization') ?? ''
  const caller = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: { user } } = await caller.auth.getUser()
  if (!user) return jsonError('unauthenticated', 401)

  const { data: cu } = await supabaseAdmin
    .from('client_users')
    .select('id, client_id, active')
    .eq('auth_user_id', user.id)
    .eq('active', true)
    .maybeSingle()
  if (!cu) return jsonError('caller_not_client', 403)

  // Carrega item pra validar agency match (defesa em profundidade)
  const { data: item, error: itemErr } = await supabaseAdmin
    .from('content_library')
    .select('id, agency_id, view_count, published')
    .eq('id', body.library_item_id)
    .single()
  if (itemErr || !item) return jsonError('library_item_not_found', 404)
  if (!item.published) return jsonError('library_item_not_published', 403)

  // Cliente do client_user precisa ser da mesma agência do item
  const { data: clientRow } = await supabaseAdmin
    .from('clients').select('agency_id').eq('id', cu.client_id).single()
  if (clientRow?.agency_id !== item.agency_id) return jsonError('cross_agency_forbidden', 403)

  // Insere view (não bloqueia em duplicatas — é um event log)
  const { error: insErr } = await supabaseAdmin.from('content_library_views').insert({
    library_item_id: body.library_item_id,
    client_id: cu.client_id,
    client_user_id: cu.id,
  })
  if (insErr) {
    await logIntegration({
      client_id: cu.client_id, agency_id: item.agency_id,
      integration: 'system', operation: 'library-track-view.insert_failed',
      level: 'error', error_message: insErr.message, reference_id: body.library_item_id,
    })
  }

  // Incrementa view_count (best-effort)
  await supabaseAdmin
    .from('content_library')
    .update({ view_count: (item.view_count ?? 0) + 1 })
    .eq('id', body.library_item_id)

  return json({ ok: true })
})
