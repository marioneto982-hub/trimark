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

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Bypass do navigator.locks — quebra em React StrictMode (dev) e o
    // app é single-tab; não precisamos da coordenação cross-tab.
    lock: async (_name, _acquireTimeout, fn) => fn(),
  },
})
