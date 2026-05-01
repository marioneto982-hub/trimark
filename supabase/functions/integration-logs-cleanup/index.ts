// =============================================================================
// TRIMARK — Edge Function: integration-logs-cleanup
// PRD §20.1 + §14: cron mensal que apaga logs de integração antigos
// (default: mais de 90 dias). Mantém os de level='error' por mais tempo
// (default: 180 dias) por terem valor diagnóstico.
// =============================================================================

import { handleOptions } from '../_shared/cors.ts'
import { json } from '../_shared/response.ts'
import { supabaseAdmin } from '../_shared/supabase.ts'

const KEEP_INFO_DAYS  = Number(Deno.env.get('LOG_CLEANUP_KEEP_INFO_DAYS')  ?? '90')
const KEEP_ERROR_DAYS = Number(Deno.env.get('LOG_CLEANUP_KEEP_ERROR_DAYS') ?? '180')

function nDaysAgoIso(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

Deno.serve(async (req) => {
  const cors = handleOptions(req); if (cors) return cors

  const cutoffInfo  = nDaysAgoIso(KEEP_INFO_DAYS)
  const cutoffError = nDaysAgoIso(KEEP_ERROR_DAYS)

  // Apaga logs info/warn velhos
  const { count: deletedInfo } = await supabaseAdmin
    .from('integration_logs')
    .delete({ count: 'exact' })
    .in('level', ['info', 'warn'])
    .lt('created_at', cutoffInfo)

  // Apaga logs error mais antigos ainda
  const { count: deletedError } = await supabaseAdmin
    .from('integration_logs')
    .delete({ count: 'exact' })
    .eq('level', 'error')
    .lt('created_at', cutoffError)

  return json({
    ok: true,
    keep_info_days:  KEEP_INFO_DAYS,
    keep_error_days: KEEP_ERROR_DAYS,
    deleted_info:    deletedInfo ?? 0,
    deleted_error:   deletedError ?? 0,
  })
})
