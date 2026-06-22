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

// Lock de auth resiliente.
// - Serializa o acesso ao token via navigator.locks → evita a corrida entre o
//   autoRefreshToken e as escritas que travava o getSession (bug "Salvando…").
// - Mas com TIMEOUT: se o lock ficar preso (motivo do "Carregando…" infinito que
//   levou ao antigo `lock: () => fn()` no-op), prossegue em vez de travar o app.
// Cobre os dois modos de falha sem o efeito colateral de nenhum dos extremos.
const LOCK_ACQUIRE_TIMEOUT_MS = 5_000

async function resilientLock<R>(
  name: string,
  acquireTimeout: number,
  fn: () => Promise<R>,
): Promise<R> {
  if (typeof navigator === 'undefined' || !navigator.locks?.request) {
    return fn()
  }
  const timeoutMs = acquireTimeout && acquireTimeout > 0 ? acquireTimeout : LOCK_ACQUIRE_TIMEOUT_MS
  try {
    return await navigator.locks.request(
      `lock:${name}`,
      { mode: 'exclusive', signal: AbortSignal.timeout(timeoutMs) },
      async () => fn(),
    )
  } catch {
    // Não conseguiu o lock no tempo (preso/abortado) → roda mesmo assim.
    return fn()
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Lock com timeout (ver resilientLock acima): serializa o token sem o
    // deadlock do navigator.locks puro nem a corrida do no-op antigo.
    lock: resilientLock,
  },
  global: {
    fetch: fetchWithTimeout,
  },
})
