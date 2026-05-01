// Helper Anthropic compartilhado (PRD §11.3).

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? ''
const DEFAULT_MODEL     = Deno.env.get('ANTHROPIC_MODEL') ?? 'claude-sonnet-4-20250514'

export interface AnthropicMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AnthropicCompleteOpts {
  system?: string
  messages: AnthropicMessage[]
  model?: string
  max_tokens?: number
  temperature?: number
}

export interface AnthropicResponse {
  id: string
  type: string
  role: 'assistant'
  content: { type: 'text'; text: string }[]
  model: string
  stop_reason: string | null
  usage?: { input_tokens?: number; output_tokens?: number }
}

export async function anthropicComplete(opts: AnthropicCompleteOpts): Promise<AnthropicResponse> {
  if (!ANTHROPIC_API_KEY) throw new Error('anthropic_api_key_missing')
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type':       'application/json',
      'x-api-key':          ANTHROPIC_API_KEY,
      'anthropic-version':  '2023-06-01',
    },
    body: JSON.stringify({
      model:        opts.model ?? DEFAULT_MODEL,
      max_tokens:   opts.max_tokens ?? 1024,
      temperature:  opts.temperature ?? 0.7,
      system:       opts.system,
      messages:     opts.messages,
    }),
  })
  if (!r.ok) {
    const txt = await r.text()
    throw new Error(`anthropic_http_${r.status}: ${txt.slice(0, 300)}`)
  }
  return r.json() as Promise<AnthropicResponse>
}

export function extractText(resp: AnthropicResponse): string {
  return resp.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim()
}
