// =============================================================================
// TRIMARK — Edge Function: ai-content-helper
// PRD §11.3 + §7.2: gera sugestões de copy/hashtags pra um post via Claude.
//
// Invocação:
//   POST /functions/v1/ai-content-helper
//   { client_id: string, brief: string, platform?: string,
//     format?: string, tone?: string }
//
// Retorna { copy_text, hashtags[], rationale }.
// =============================================================================

import { handleOptions } from '../_shared/cors.ts'
import { json, jsonError } from '../_shared/response.ts'
import { supabaseAdmin } from '../_shared/supabase.ts'
import { logIntegration } from '../_shared/logging.ts'
import { withRetry } from '../_shared/retry.ts'
import { anthropicComplete, extractText } from '../_shared/anthropic.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const SUPABASE_URL      = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

interface Body {
  client_id: string
  brief:     string
  platform?: string
  format?:   string
  tone?:     string
}

Deno.serve(async (req) => {
  const cors = handleOptions(req); if (cors) return cors
  if (req.method !== 'POST') return jsonError('method_not_allowed', 405)

  const startedAt = Date.now()
  let body: Body
  try { body = await req.json() } catch { return jsonError('invalid_json') }
  if (!body.client_id || !body.brief?.trim()) return jsonError('client_id_and_brief_required')

  // Caller interno
  const auth = req.headers.get('Authorization') ?? ''
  const caller = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: { user } } = await caller.auth.getUser()
  if (!user) return jsonError('unauthenticated', 401)

  const { data: callerRow } = await supabaseAdmin
    .from('users').select('agency_id, role').eq('auth_user_id', user.id).single()
  if (!callerRow) return jsonError('caller_not_internal', 403)

  // Resolve cliente + especialidade
  const { data: client, error: clientErr } = await supabaseAdmin
    .from('clients')
    .select(`agency_id, full_name, instagram_handle,
             specialties:specialty_id ( name, council, ethics_rules_summary )`)
    .eq('id', body.client_id).single()
  if (clientErr || !client) return jsonError('client_not_found', 404)
  if (client.agency_id !== callerRow.agency_id) return jsonError('cross_agency_forbidden', 403)

  const sp = (client as unknown as { specialties: { name: string; council: string | null; ethics_rules_summary: string | null } }).specialties

  const system = [
    'Você é um redator publicitário sênior especializado em marketing para profissionais da saúde no Brasil.',
    'Escreva sempre em português brasileiro, em tom profissional e acolhedor.',
    `O cliente é da especialidade "${sp?.name ?? 'saúde'}"${sp?.council ? `, regulado pelo ${sp.council}` : ''}.`,
    sp?.ethics_rules_summary ? `Regras éticas relevantes: ${sp.ethics_rules_summary}` : '',
    'NUNCA prometa cura. NUNCA exiba antes/depois sem alerta. NUNCA banalize tratamentos.',
    'Devolva APENAS um JSON com as chaves: copy_text (string), hashtags (array de strings, sem #),',
    'rationale (string curta explicando por que o post funciona).',
  ].filter(Boolean).join('\n')

  const userPrompt = [
    `Brief: ${body.brief}`,
    body.platform ? `Plataforma: ${body.platform}` : '',
    body.format ? `Formato: ${body.format}` : '',
    body.tone ? `Tom: ${body.tone}` : '',
    'Devolva o JSON pedido sem markdown nem comentários.',
  ].filter(Boolean).join('\n')

  try {
    const resp = await withRetry(() => anthropicComplete({
      system,
      max_tokens: 700,
      temperature: 0.7,
      messages: [{ role: 'user', content: userPrompt }],
    }))
    const text = extractText(resp)
    let parsed: { copy_text?: string; hashtags?: string[]; rationale?: string }
    try { parsed = JSON.parse(text) } catch {
      // tenta extrair primeiro bloco JSON
      const m = text.match(/\{[\s\S]*\}/)
      parsed = m ? JSON.parse(m[0]) : { copy_text: text }
    }

    await logIntegration({
      agency_id: client.agency_id, client_id: body.client_id,
      integration: 'anthropic', operation: 'ai-content-helper',
      level: 'info', request_payload: { brief: body.brief.slice(0, 500), platform: body.platform, format: body.format },
      response_payload: { tokens_in: resp.usage?.input_tokens, tokens_out: resp.usage?.output_tokens },
      duration_ms: Date.now() - startedAt,
    })

    return json({ ok: true, ...parsed })
  } catch (err) {
    await logIntegration({
      agency_id: client.agency_id, client_id: body.client_id,
      integration: 'anthropic', operation: 'ai-content-helper.failed',
      level: 'error', error_message: String(err), duration_ms: Date.now() - startedAt,
    })
    return jsonError('anthropic_failed', 502, { detail: String(err) })
  }
})
