// Helpers Z-API compartilhados (PRD §11.1).
// Importar via: import { sendWhatsappText, normalizePhoneBR } from '../_shared/zapi.ts'

const ZAPI_INSTANCE_ID  = Deno.env.get('ZAPI_INSTANCE_ID') ?? ''
const ZAPI_TOKEN        = Deno.env.get('ZAPI_TOKEN') ?? ''
const ZAPI_CLIENT_TOKEN = Deno.env.get('ZAPI_CLIENT_TOKEN') ?? ''

export function normalizePhoneBR(raw: string | null | undefined): string | null {
  const digits = (raw ?? '').replace(/\D/g, '')
  if (!digits) return null
  // BR sem prefixo 55 → adiciona
  if (digits.length <= 11) return `55${digits}`
  return digits
}

export async function sendWhatsappText(phone: string, message: string): Promise<unknown> {
  if (!ZAPI_INSTANCE_ID || !ZAPI_TOKEN) {
    throw new Error('zapi_credentials_missing')
  }
  const url = `https://api.z-api.io/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_TOKEN}/send-text`
  const r = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(ZAPI_CLIENT_TOKEN ? { 'Client-Token': ZAPI_CLIENT_TOKEN } : {}),
    },
    body: JSON.stringify({ phone, message }),
  })
  if (!r.ok) {
    const txt = await r.text()
    throw new Error(`zapi_http_${r.status}: ${txt.slice(0, 200)}`)
  }
  return r.json()
}
