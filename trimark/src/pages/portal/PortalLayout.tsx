import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'
import { cn } from '@/lib/utils'
import { CheckCircle2, CalendarDays, BookOpen, Wallet, LayoutDashboard, LogOut } from 'lucide-react'

const TABS = [
  { to: '/portal',           label: 'Visão geral', icon: LayoutDashboard },
  { to: '/portal/approvals', label: 'Aprovações',  icon: CheckCircle2 },
  { to: '/portal/calendar',  label: 'Calendário',  icon: CalendarDays },
  { to: '/portal/library',   label: 'Biblioteca',  icon: BookOpen },
  { to: '/portal/finance',   label: 'Financeiro',  icon: Wallet },
]

export default function PortalLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  if (profile?.kind !== 'client') return null

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b bg-background">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo-trimark.png" alt="Trimark" className="h-7 w-auto" />
            <span className="text-xs text-muted-foreground border-l pl-3 border-border">
              {profile.display_name ?? 'Portal do cliente'}
            </span>
          </div>
          <button
            type="button"
            onClick={async () => {
              await signOut()
              navigate('/login', { replace: true })
            }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <LogOut className="size-4" />
            Sair
          </button>
        </div>
        <nav className="mx-auto max-w-5xl px-4 sm:px-6 flex gap-1 -mb-px overflow-x-auto">
          {TABS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/portal'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
        <Outlet />
      </main>
    </div>
  )
}
