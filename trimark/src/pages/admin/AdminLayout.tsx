import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'
import { cn } from '@/lib/utils'
import {
  CalendarDays,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  PiggyBank,
  Settings,
  Tags,
  Users,
  Workflow,
} from 'lucide-react'

const NAV = [
  { to: '/admin',           label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/admin/clients',   label: 'Clientes',   icon: Users },
  { to: '/admin/calendar',  label: 'Calendário', icon: CalendarDays },
  { to: '/admin/library',   label: 'Biblioteca', icon: ImageIcon },
  { to: '/admin/finance',   label: 'Financeiro', icon: PiggyBank },
  { to: '/admin/pipeline',  label: 'Pipeline',   icon: Workflow },
  { to: '/admin/specialties', label: 'Especialidades', icon: Tags },
  { to: '/admin/settings',  label: 'Configurações', icon: Settings },
]

export default function AdminLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  if (profile?.kind !== 'internal') return null  // ProtectedRoute já cuidou disso

  return (
    <div className="min-h-screen flex bg-muted/20">
      <aside className="w-64 shrink-0 border-r bg-background flex flex-col">
        <div className="px-5 py-5 border-b">
          <img src="/logo-trimark.png" alt="Trimark" className="h-6 w-auto" />
          <p className="text-xs text-muted-foreground mt-1">Painel da equipe</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t space-y-2">
          <div className="px-2">
            <p className="text-sm font-medium truncate">{profile.full_name}</p>
            <p className="text-xs text-muted-foreground truncate capitalize">
              {profile.role}
            </p>
          </div>
          <button
            type="button"
            onClick={async () => {
              await signOut()
              navigate('/login', { replace: true })
            }}
            className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="size-4" />
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  )
}
