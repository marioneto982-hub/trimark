import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { useClients } from '@/hooks/useClients'
import { POST_STATUS_COLOR, POST_STATUS_LABEL, usePosts, type PostRow } from '@/hooks/usePosts'
import type { PostStatus } from '@/types'
import { cn } from '@/lib/utils'

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function buildMonthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1)
  const start = new Date(first)
  start.setDate(1 - first.getDay())
  const days: Date[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    days.push(d)
  }
  return days
}

function ymd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function CalendarPage() {
  const today = new Date()
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [clientId, setClientId] = useState<string>('')
  const [status, setStatus] = useState<PostStatus | 'all'>('all')

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const grid = useMemo(() => buildMonthGrid(year, month), [year, month])

  const rangeStart = new Date(year, month, 1).toISOString()
  const rangeEnd = new Date(year, month + 1, 1).toISOString()
  const { data: posts, isLoading } = usePosts({
    rangeStart,
    rangeEnd,
    clientId: clientId || undefined,
    status,
  })
  const { data: clients } = useClients({ status: 'active' })

  const postsByDate = useMemo(() => {
    const m = new Map<string, PostRow[]>()
    for (const p of posts ?? []) {
      if (!p.scheduled_at) continue
      const key = ymd(new Date(p.scheduled_at))
      const arr = m.get(key) ?? []
      arr.push(p)
      m.set(key, arr)
    }
    return m
  }, [posts])

  function shift(delta: number) {
    setCursor(new Date(year, month + delta, 1))
  }

  function goToToday() {
    setCursor(new Date(today.getFullYear(), today.getMonth(), 1))
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Módulo 2 · PRD §5</p>
          <h1 className="text-2xl font-semibold mt-1">Calendário editorial</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Posts agendados, status do fluxo de aprovação e cota mensal.
          </p>
        </div>
        <Link to="/admin/calendar/posts/new">
          <Button>
            <Plus className="size-4 mr-1" />
            Novo post
          </Button>
        </Link>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => shift(-1)} aria-label="Mês anterior">
          <ChevronLeft className="size-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => shift(1)} aria-label="Próximo mês">
          <ChevronRight className="size-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={goToToday}>Hoje</Button>
        <h2 className="text-lg font-medium ml-2">{MONTHS[month]} {year}</h2>

        <div className="ml-auto flex gap-2">
          <Select value={clientId} onChange={(e) => setClientId(e.target.value)} className="w-56">
            <option value="">Todos os clientes</option>
            {(clients ?? []).map((c) => (
              <option key={c.id} value={c.id}>{c.trade_name ?? c.full_name}</option>
            ))}
          </Select>
          <Select value={status} onChange={(e) => setStatus(e.target.value as PostStatus | 'all')} className="w-48">
            <option value="all">Todos os status</option>
            {(Object.keys(POST_STATUS_LABEL) as PostStatus[]).map((s) => (
              <option key={s} value={s}>{POST_STATUS_LABEL[s]}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="rounded-md border bg-background overflow-hidden">
        <div className="grid grid-cols-7 bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
          {WEEKDAYS.map((d) => (
            <div key={d} className="p-2 text-center font-medium">{d}</div>
          ))}
        </div>
        {isLoading && <p className="p-6 text-sm text-muted-foreground">Carregando posts…</p>}
        <div className="grid grid-cols-7 grid-rows-6">
          {grid.map((day) => {
            const inMonth = day.getMonth() === month
            const isToday = ymd(day) === ymd(today)
            const dayKey = ymd(day)
            const dayPosts = postsByDate.get(dayKey) ?? []
            return (
              <div
                key={dayKey + (inMonth ? '' : '-out')}
                className={cn(
                  'min-h-[110px] border-t border-l p-1.5 flex flex-col gap-1 text-xs',
                  !inMonth && 'bg-muted/20 text-muted-foreground',
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'inline-flex items-center justify-center size-6 rounded-full text-[11px] font-medium',
                      isToday && 'bg-primary text-primary-foreground',
                    )}
                  >
                    {day.getDate()}
                  </span>
                  {inMonth && (
                    <Link
                      to={`/admin/calendar/posts/new?date=${dayKey}`}
                      className="opacity-0 hover:opacity-100 focus:opacity-100 text-muted-foreground hover:text-foreground"
                      aria-label={`Adicionar post em ${dayKey}`}
                    >
                      <Plus className="size-3.5" />
                    </Link>
                  )}
                </div>
                <div className="flex flex-col gap-1 overflow-hidden">
                  {dayPosts.slice(0, 4).map((p) => (
                    <Link
                      key={p.id}
                      to={`/admin/calendar/posts/${p.id}`}
                      className={cn(
                        'truncate rounded px-1.5 py-0.5 text-[11px] font-medium',
                        POST_STATUS_COLOR[p.status],
                      )}
                      title={p.title ?? p.copy_text ?? ''}
                    >
                      {p.title || p.clients?.trade_name || p.clients?.full_name || '(sem título)'}
                    </Link>
                  ))}
                  {dayPosts.length > 4 && (
                    <span className="text-[10px] text-muted-foreground">+{dayPosts.length - 4} mais</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        {(Object.keys(POST_STATUS_LABEL) as PostStatus[]).map((s) => (
          <span key={s} className={cn('rounded px-2 py-0.5 font-medium', POST_STATUS_COLOR[s])}>
            {POST_STATUS_LABEL[s]}
          </span>
        ))}
      </div>
    </div>
  )
}
