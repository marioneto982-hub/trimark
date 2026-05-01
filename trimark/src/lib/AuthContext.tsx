import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { UserRole } from '@/types'

interface InternalProfile {
  kind: 'internal'
  user_row_id: string
  agency_id: string
  full_name: string
  role: Exclude<UserRole, 'client'>
}

interface ClientProfile {
  kind: 'client'
  client_user_row_id: string
  client_id: string
  display_name: string | null
}

export type Profile = InternalProfile | ClientProfile

interface AuthState {
  loading: boolean
  session: Session | null
  user: User | null
  profile: Profile | null
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthState | undefined>(undefined)

async function loadProfile(user: User | null): Promise<Profile | null> {
  if (!user) return null

  // 1) tenta encontrar como usuário interno
  const { data: internal } = await supabase
    .from('users')
    .select('id, agency_id, full_name, role')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (internal) {
    return {
      kind: 'internal',
      user_row_id: internal.id,
      agency_id: internal.agency_id,
      full_name: internal.full_name,
      role: internal.role as Exclude<UserRole, 'client'>,
    }
  }

  // 2) cai pra usuário cliente do portal
  const { data: clientUser } = await supabase
    .from('client_users')
    .select('id, client_id, display_name')
    .eq('auth_user_id', user.id)
    .eq('active', true)
    .maybeSingle()

  if (clientUser) {
    return {
      kind: 'client',
      client_user_row_id: clientUser.id,
      client_id: clientUser.client_id,
      display_name: clientUser.display_name,
    }
  }

  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    let cancelled = false
    console.log('[AuthContext] mount: getSession()')
    supabase.auth.getSession()
      .then(async ({ data, error }) => {
        console.log('[AuthContext] getSession resolved', { hasSession: !!data?.session, error })
        if (cancelled) return
        setSession(data.session)
        setUser(data.session?.user ?? null)
        try {
          const p = await loadProfile(data.session?.user ?? null)
          console.log('[AuthContext] loadProfile done', p)
          if (cancelled) return
          setProfile(p)
        } catch (err) {
          console.error('[AuthContext] loadProfile threw', err)
        } finally {
          if (!cancelled) setLoading(false)
        }
      })
      .catch((err) => {
        console.error('[AuthContext] getSession failed', err)
        if (!cancelled) setLoading(false)
      })

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      console.log('[AuthContext] onAuthStateChange', _event, !!sess)
      setSession(sess)
      setUser(sess?.user ?? null)
      try {
        const p = await loadProfile(sess?.user ?? null)
        setProfile(p)
      } catch (err) {
        console.error('[AuthContext] loadProfile (auth change) threw', err)
      } finally {
        // garante que loading sai mesmo se getSession() ficou pendurado
        if (!cancelled) setLoading(false)
      }
    })

    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [])

  const value: AuthState = {
    loading,
    session,
    user,
    profile,
    async signIn(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { error: error.message }
      return {}
    },
    async signOut() {
      await supabase.auth.signOut()
    },
    async refreshProfile() {
      const p = await loadProfile(user)
      setProfile(p)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}
