// =============================================================================
// TRIMARK — Edge Function: client-invite
// PRD §6.3: gera convite de primeiro acesso ao portal do cliente.
// Fluxo:
//   1. Caller (admin/manager) chama POST /functions/v1/client-invite
//      body: { client_id, email, display_name?, role? }
//   2. Função valida que o caller pertence à agência dona do cliente
//      e que o role do caller é admin ou manager.
//   3. Gera token random (32 bytes base64url) com expiração em 72h.
//   4. Upsert em client_users: se já existe linha vinculada (auth_user_id null),
//      atualiza token + expiry; senão cria nova linha.
//   5. Envia e-mail via Resend com link {PORTAL_BASE_URL}/invite/{token}.
//   6. Loga em integration_logs (resend).
//   7. Retorna { ok, invitation_token, invitation_expires_at, invitation_url }.
//
// Idempotência: dois convites consecutivos para o mesmo client_id sobrescrevem
// o token anterior. Não há e-mail duplicado.
// =============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

// ---------- Config ----------
const SUPABASE_URL              = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SUPABASE_ANON_KEY         = Deno.env.get('SUPABASE_ANON_KEY')!
const RESEND_API_KEY            = Deno.env.get('RESEND_API_KEY') ?? ''
const PORTAL_BASE_URL           = Deno.env.get('PORTAL_BASE_URL') ?? 'http://localhost:5173'
const FROM_ADDRESS              = Deno.env.get('TRIMARK_FROM_ADDRESS') ?? 'Trimark <onboarding@resend.dev>'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// ---------- Helpers ----------
function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json; charset=utf-8' },
  })
}

function generateToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  // base64url
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

async function logIntegration(payload: Record<string, unknown>): Promise<void> {
  try {
    await supabaseAdmin.from('integration_logs').insert(payload)
  } catch (err) {
    console.error('[logIntegration] falha:', err)
  }
}

async function withRetry<T>(fn: () => Promise<T>, retries = 2, delay = 500): Promise<T> {
  let lastErr: unknown
  for (let i = 0; i <= retries; i++) {
    try { return await fn() }
    catch (err) {
      lastErr = err
      if (i === retries) break
      await new Promise(r => setTimeout(r, delay * Math.pow(2, i)))
    }
  }
  throw lastErr
}

interface InvitePayload {
  client_id:     string
  email:         string
  display_name?: string
  role?:         'owner' | 'assistant'
}

function buildEmailHtml(displayName: string, inviteUrl: string, agencyName: string): string {
  const greet = displayName ? `Olá ${displayName},` : 'Olá,'
  return `<!doctype html><html><body style="font-family: Inter, system-ui, sans-serif; max-width: 540px; margin: 32px auto; color: #1f2937;">
<h1 style="color: #1F4E79; font-size: 22px;">Bem-vindo(a) ao seu portal Trimark</h1>
<p>${greet}</p>
<p>Você foi convidado(a) por <strong>${agencyName}</strong> para acessar seu portal de aprovações de conteúdo, calendário e financeiro.</p>
<p>Clique no botão abaixo para criar sua senha. Este link é válido por <strong>72 horas</strong>.</p>
<p style="margin: 28px 0;">
  <a href="${inviteUrl}" style="display:inline-block;padding:12px 22px;background:#1F4E79;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">Acessar meu portal</a>
</p>
<p style="font-size: 13px; color: #6b7280;">Se o botão não funcionar, copie e cole este endereço no navegador:<br/>${inviteUrl}</p>
<hr style="border:none;border-top:1px solid #e5e7eb; margin: 32px 0;"/>
<p style="font-size: 12px; color: #9ca3af;">Você está recebendo esse e-mail porque foi cadastrado(a) como cliente da ${agencyName} na plataforma Trimark.</p>
</body></html>`
}

// ---------- Main ----------
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST')   return json({ ok: false, error: 'method_not_allowed' }, 405)

  const startedAt = Date.now()
  let body: InvitePayload
  try {
    body = await req.json()
  } catch {
    return json({ ok: false, error: 'invalid_json' }, 400)
  }

  // Validação básica
  if (!body.client_id || !body.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email)) {
    return json({ ok: false, error: 'invalid_payload', detail: 'client_id e email são obrigatórios' }, 400)
  }

  // Identificar caller via JWT (header Authorization)
  const authHeader = req.headers.get('Authorization') ?? ''
  const callerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: { user: caller }, error: authErr } = await callerClient.auth.getUser()
  if (authErr || !caller) {
    return json({ ok: false, error: 'unauthenticated' }, 401)
  }

  // Caller deve ser admin ou manager da agência dona do cliente
  const { data: callerRow, error: callerErr } = await supabaseAdmin
    .from('users')
    .select('id, agency_id, role, full_name')
    .eq('auth_user_id', caller.id)
    .single()

  if (callerErr || !callerRow) {
    return json({ ok: false, error: 'caller_not_internal' }, 403)
  }
  if (!['admin', 'manager'].includes(callerRow.role)) {
    return json({ ok: false, error: 'caller_role_insufficient', detail: callerRow.role }, 403)
  }

  // Cliente deve existir e pertencer à mesma agência do caller
  const { data: clientRow, error: clientErr } = await supabaseAdmin
    .from('clients')
    .select('id, agency_id, full_name, email, agencies(name)')
    .eq('id', body.client_id)
    .single()

  if (clientErr || !clientRow) {
    return json({ ok: false, error: 'client_not_found' }, 404)
  }
  if (clientRow.agency_id !== callerRow.agency_id) {
    return json({ ok: false, error: 'client_belongs_to_other_agency' }, 403)
  }

  const agencyName = (clientRow as unknown as { agencies?: { name?: string } }).agencies?.name
                  ?? 'sua agência Trimark'

  // Token + expiração 72h
  const token     = generateToken()
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()

  // Upsert em client_users — chave: (client_id, auth_user_id IS NULL).
  // Se já existe linha pendente, sobrescreve token+expiry.
  const { data: existing } = await supabaseAdmin
    .from('client_users')
    .select('id')
    .eq('client_id', body.client_id)
    .is('auth_user_id', null)
    .maybeSingle()

  let invitationRowId: string
  if (existing) {
    const { data: upd, error: updErr } = await supabaseAdmin
      .from('client_users')
      .update({
        invitation_token:      token,
        invitation_expires_at: expiresAt,
        display_name:          body.display_name ?? clientRow.full_name,
        role:                  body.role ?? 'owner',
        active:                true,
      })
      .eq('id', existing.id)
      .select('id')
      .single()

    if (updErr || !upd) {
      await logIntegration({
        agency_id: callerRow.agency_id, client_id: body.client_id,
        integration: 'system', operation: 'client-invite.upsert', level: 'error',
        error_message: updErr?.message,
      })
      return json({ ok: false, error: 'upsert_failed', detail: updErr?.message }, 500)
    }
    invitationRowId = upd.id
  } else {
    const { data: ins, error: insErr } = await supabaseAdmin
      .from('client_users')
      .insert({
        client_id:             body.client_id,
        display_name:          body.display_name ?? clientRow.full_name,
        role:                  body.role ?? 'owner',
        invitation_token:      token,
        invitation_expires_at: expiresAt,
        active:                true,
      })
      .select('id')
      .single()

    if (insErr || !ins) {
      await logIntegration({
        agency_id: callerRow.agency_id, client_id: body.client_id,
        integration: 'system', operation: 'client-invite.insert', level: 'error',
        error_message: insErr?.message,
      })
      return json({ ok: false, error: 'insert_failed', detail: insErr?.message }, 500)
    }
    invitationRowId = ins.id
  }

  const inviteUrl = `${PORTAL_BASE_URL}/invite/${token}`

  // Envio do e-mail via Resend (com retry 2x)
  let emailDelivered = false
  let emailError: string | null = null
  if (RESEND_API_KEY) {
    try {
      const html = buildEmailHtml(body.display_name ?? clientRow.full_name, inviteUrl, agencyName)
      const resp = await withRetry(async () => {
        const r = await fetch('https://api.resend.com/emails', {
          method:  'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type':  'application/json',
          },
          body: JSON.stringify({
            from:    FROM_ADDRESS,
            to:      [body.email],
            subject: `${agencyName} — convite para o portal Trimark`,
            html,
          }),
        })
        if (!r.ok) {
          const txt = await r.text()
          throw new Error(`resend_http_${r.status}: ${txt.slice(0, 200)}`)
        }
        return r.json()
      })
      emailDelivered = true
      await logIntegration({
        agency_id: callerRow.agency_id, client_id: body.client_id,
        integration: 'resend', operation: 'client-invite.email', level: 'info',
        request_payload: { to: body.email },
        response_payload: resp,
        duration_ms: Date.now() - startedAt,
        reference_id: invitationRowId,
      })
    } catch (err) {
      emailError = String(err)
      await logIntegration({
        agency_id: callerRow.agency_id, client_id: body.client_id,
        integration: 'resend', operation: 'client-invite.email', level: 'error',
        error_message: emailError, duration_ms: Date.now() - startedAt,
        reference_id: invitationRowId,
      })
    }
  } else {
    // Sem Resend configurado — registramos um warn mas a invitação foi gerada.
    await logIntegration({
      agency_id: callerRow.agency_id, client_id: body.client_id,
      integration: 'system', operation: 'client-invite.email_skipped', level: 'warn',
      error_message: 'RESEND_API_KEY ausente',
      reference_id: invitationRowId,
    })
  }

  return json({
    ok:                    true,
    invitation_id:         invitationRowId,
    invitation_token:      token,
    invitation_url:        inviteUrl,
    invitation_expires_at: expiresAt,
    email_delivered:       emailDelivered,
    email_error:           emailError,
  })
})
