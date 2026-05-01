// =============================================================================
// TRIMARK — Edge Function: whatsapp-receive
// PRD §11.1: webhook do Z-API para mensagens recebidas. Apenas registra em
// integration_logs por enquanto — fluxos automatizados (auto-reply, criação
// de prospect a partir de mensagem) serão habilitados em fase posterior.
//
// IMPORTANTE: webhook SEMPRE retorna HTTP 200 (PRD §20.1).
//
// Validação: cabeçalho `X-Webhook-Token` deve ser igual a ZAPI_WEBHOOK_TOKEN.
// =============================================================================

import { handleOptions } from '../_shared/cors.ts'
import { webhookAck } from '../_shared/response.ts'
import { logIntegration } from '../_shared/logging.ts'

const ZAPI_WEBHOOK_TOKEN = Deno.env.get('ZAPI_WEBHOOK_TOKEN') ?? ''

Deno.serve(async (req) => {
  const cors = handleOptions(req); if (cors) return cors

  // Validação de token (não falha — só ignora e ack)
  const token = req.headers.get('x-webhook-token') ?? req.headers.get('X-Webhook-Token') ?? ''
  if (!ZAPI_WEBHOOK_TOKEN || token !== ZAPI_WEBHOOK_TOKEN) {
    await logIntegration({
      integration: 'zapi', operation: 'whatsapp-receive.invalid_token',
      level: 'warn',
    })
    return webhookAck({ handled: false, reason: 'invalid_token' })
  }

  let payload: unknown
  try { payload = await req.json() } catch { payload = null }

  await logIntegration({
    integration: 'zapi',
    operation:   'whatsapp-receive.in',
    level:       'info',
    request_payload: payload,
  })

  return webhookAck({ handled: true })
})
