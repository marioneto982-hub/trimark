import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

console.log('[supabase] init', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  keyPrefix: supabaseAnonKey ? supabaseAnonKey.slice(0, 20) : 'MISSING',
})

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltam variáveis de ambiente VITE_SUPABASE_URL e/ou VITE_SUPABASE_ANON_KEY (ver .env.example).',
  )
}

// Timeout global de rede. Toda requisição (leitura e escrita) que passa pelo
// client Supabase ganha um teto de tempo: se a conexão ficar presa (keep-alive
// quebrado, rede instável, extensão do navegador segurando o POST), a request é
// abortada e vira um erro tratável em vez de "Salvando…"/"Carregando…" infinito.
// Como o statement_timeout do banco é 8s, uma escrita que realmente chega ao
// servidor SEMPRE responde antes disso; passar de 15s = a request não chegou.
const NETWORK_TIMEOUT_MS = 15_000

function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  // Se o chamador já passou um AbortSignal próprio (ex.: .abortSignal(...)),
  // respeitamos o dele e não sobrepomos.
  if (init?.signal) return fetch(input, init)
  return fetch(input, { ...init, signal: AbortSignal.timeout(NETWORK_TIMEOUT_MS) })
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // NÃO sobrescrever `lock`. O supabase-js usa o navigator.locks por padrão
    // para serializar o acesso ao token de auth. O override no-op anterior
    // (`lock: () => fn()`) quebrava essa serialização: quando o autoRefreshToken
    // rodava junto com uma escrita, o getSession() do client travava e o fetch
    // da gravação NUNCA era disparado — botão "Salvando…" infinito, sem nenhuma
    // requisição na aba Rede. Diagnóstico em [[sessao-cadastro-planos-e-bug-salvar-2026-06-20]].
  },
  global: {
    fetch: fetchWithTimeout,
  },
})
