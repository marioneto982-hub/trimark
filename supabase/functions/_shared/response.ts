import { corsHeaders } from './cors.ts'

// PRD §20.1: webhooks SEMPRE retornam HTTP 200 mesmo em erro interno.
// Para Edge Functions internas pode-se usar `jsonError` que devolve status real.

export function json(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    status: init.status ?? 200,
    headers: {
      ...corsHeaders,
      'content-type': 'application/json; charset=utf-8',
      ...(init.headers ?? {}),
    },
  })
}

// Para webhooks externos: sempre 200 para evitar reentrega indesejada.
export function webhookAck(extra: Record<string, unknown> = {}): Response {
  return json({ ok: true, ...extra }, { status: 200 })
}

export function jsonError(message: string, status = 400, extra: Record<string, unknown> = {}): Response {
  return json({ ok: false, error: message, ...extra }, { status })
}
