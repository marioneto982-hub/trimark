// =============================================================================
// TRIMARK — Edge Function: ai-ethics-check
// PRD §11.3 + §7.4: avalia se o copy proposto está em conformidade com o
// código de ética da especialidade do cliente.
//
// Invocação:
//   POST /functions/v1/ai-ethics-check
//   { specialty_id: string, copy_text: string, hashtags?: string[] }
//
// Retorna { compliant: boolean, severity: 'ok'|'warning'|'critical',
//           issues: string[], suggestions: string[] }
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
  specialty_id: string
  copy_text:    string
  hashtags?:    string[]
}

Deno.serve(async (req) => {
  const cors = handleOptions(req); if (cors) return cors
  if (req.method !== 'POST') return jsonError('method_not_allowed', 405)

  const startedAt = Date.now()
  let body: Body
  try { body = await req.json() } catch { return jsonError('invalid_json') }
  if (!body.specialty_id || !body.copy_text?.trim()) {
    return jsonError('specialty_id_and_copy_required')
  }

  // Caller interno
  const auth = req.headers.get('Authorization') ?? ''
  const caller = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: { user } } = await caller.auth.getUser()
  if (!user) return jsonError('unauthenticated', 401)
  const { data: callerRow } = await supabaseAdmin
    .from('users').select('agency_id').eq('auth_user_id', user.id).single()
  if (!callerRow) return jsonError('caller_not_internal', 403)

  const { data: sp, error: spErr } = await supabaseAdmin
    .from('specialties')
    .select('name, council, ethics_rules_summary')
    .eq('id', body.specialty_id).single()
  if (spErr || !sp) return jsonError('specialty_not_found', 404)

  const system = [
    'Você é um auditor de compliance especializado no marketing para profissionais da saúde no Brasil.',
    `Especialidade: ${sp.name}${sp.council ? ` (${sp.council})` : ''}.`,
    sp.ethics_rules_summary ? `Resumo das regras: ${sp.ethics_rules_summary}` : '',
    'Avalie o conteúdo enviado quanto a:',
    '- promessa de resultados/cura',
    '- antes/depois sem alerta',
    '- banalização de tratamentos',
    '- divulgação de preços de procedimentos quando vedada',
    '- linguagem sensacionalista',
    'Responda APENAS JSON com chaves: compliant (bool), severity ("ok"|"warning"|"critical"),',
    'issues (array de strings curtas), suggestions (array de strings curtas).',
  ].filter(Boolean).join('\n')

  const userMessage = [
    `Copy:\n${body.copy_text}`,
    body.hashtags?.length ? `Hashtags: ${body.hashtags.join(' ')}` : '',
    'Avalie e devolva o JSON solicitado, sem markdown.',
  ].filter(Boolean).join('\n\n')

  try {
    const resp = await withRetry(() => anthropicComplete({
      system,
      max_tokens: 600,
      temperature: 0.2,
      messages: [{ role: 'user', content: userMessage }],
    }))
    const text = extractText(resp)
    let parsed: { compliant?: boolean; severity?: string; issues?: string[]; suggestions?: string[] }
    try { parsed = JSON.parse(text) } catch {
      const m = text.match(/\{[\s\S]*\}/)
      parsed = m ? JSON.parse(m[0]) : { compliant: false, severity: 'warning', issues: ['unparseable_response'], suggestions: [] }
    }

    await logIntegration({
      agency_id: callerRow.agency_id,
      integration: 'anthropic', operation: 'ai-ethics-check',
      level: 'info',
      request_payload: { specialty: sp.name, copy_preview: body.copy_text.slice(0, 200) },
      response_payload: { tokens_in: resp.usage?.input_tokens, tokens_out: resp.usage?.output_tokens, severity: parsed.severity },
      duration_ms: Date.now() - startedAt,
    })

    return json({ ok: true, ...parsed })
  } catch (err) {
    await logIntegration({
      agency_id: callerRow.agency_id,
      integration: 'anthropic', operation: 'ai-ethics-check.failed',
      level: 'error', error_message: String(err), duration_ms: Date.now() - startedAt,
    })
    return jsonError('anthropic_failed', 502, { detail: String(err) })
  }
})
