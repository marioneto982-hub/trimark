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

// Lock de auth à prova de deadlock.
//
// Histórico do bug: o lock padrão do navigator.locks (e também o resilientLock
// anterior, baseado em AbortSignal) podia FICAR RETIDO e nunca liberar — uma aba
// travada ou a reentrância interna do supabase-js segurava o lock, getSession()
// nunca resolvia e o app ficava preso em "Carregando…" infinito (1 lock HELD,
// 0 pending, ZERO requisições de rede). O outro extremo (lock no-op `() => fn()`)
// desativava a serialização e gerava corrida no refresh do token ("Salvando…").
//
// Solução: navigator.locks.request com { ifAvailable: true }. Nunca ESPERA pelo
// lock. Se estiver livre, adquire e serializa o token normalmente (evita a
// corrida). Se estiver ocupado/preso, o callback recebe `lock === null` e a
// operação roda SEM o lock em vez de travar — getSession() jamais bloqueia.
async function resilientLock<R>(
  name: string,
  _acquireTimeout: number,
  fn: () => Promise<R>,
): Promise<R> {
  if (typeof navigator === 'undefined' || !navigator.locks?.request) {
    return fn()
  }
  try {
    return await navigator.locks.request(
      `lock:${name}`,
      { mode: 'exclusive', ifAvailable: true },
      // `lock` é null quando não estava disponível → roda fn() sem o lock.
      async (_lock) => fn(),
    )
  } catch {
    // Qualquer falha do navigator.locks → roda mesmo assim. Nunca trava o app.
    return fn()
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Lock com ifAvailable (ver resilientLock acima): serializa o token quando
    // possível, mas nunca bloqueia a inicialização. Deadlock-proof.
    lock: resilientLock,
  },
  global: {
    fetch: fetchWithTimeout,
  },
})
