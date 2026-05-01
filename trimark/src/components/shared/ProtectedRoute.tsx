import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '@/lib/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
  require: 'internal' | 'client'
}

export function ProtectedRoute({ children, require }: ProtectedRouteProps) {
  const { loading, session, profile } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Carregando…
      </div>
    )
  }

  if (!session || !profile) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (profile.kind !== require) {
    const target = profile.kind === 'internal' ? '/admin' : '/portal'
    return <Navigate to={target} replace />
  }

  return <>{children}</>
}
