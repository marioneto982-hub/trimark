import { supabaseAdmin } from './supabase.ts'

export type LogLevel = 'info' | 'warn' | 'error'

export interface IntegrationLogPayload {
  agency_id?: string | null
  client_id?: string | null
  integration: 'asaas' | 'zapi' | 'anthropic' | 'resend' | 'system'
  operation: string
  level: LogLevel
  request_payload?: unknown
  response_payload?: unknown
  status_code?: number | null
  error_message?: string | null
  duration_ms?: number | null
  reference_id?: string | null
}

// Registra cada chamada externa em integration_logs (PRD §20.1).
// Nunca lança — falha de log não pode quebrar a operação principal.
export async function logIntegration(payload: IntegrationLogPayload): Promise<void> {
  try {
    await supabaseAdmin.from('integration_logs').insert({
      agency_id: payload.agency_id ?? null,
      client_id: payload.client_id ?? null,
      integration: payload.integration,
      operation: payload.operation,
      level: payload.level,
      request_payload: payload.request_payload ?? null,
      response_payload: payload.response_payload ?? null,
      status_code: payload.status_code ?? null,
      error_message: payload.error_message ?? null,
      duration_ms: payload.duration_ms ?? null,
      reference_id: payload.reference_id ?? null,
    })
  } catch (err) {
    console.error('[logIntegration] falha ao gravar log:', err)
  }
}
