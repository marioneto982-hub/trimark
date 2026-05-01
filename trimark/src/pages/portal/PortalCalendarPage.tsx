import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/AuthContext'
import { usePortalCalendar } from '@/hooks/usePortal'
import { POST_STATUS_COLOR, POST_STATUS_LABEL } from '@/hooks/usePosts'
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
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function PortalCalendarPage() {
  const { profile } = useAuth()
  const clientId = profile?.kind === 'client' ? profile.client_id : undefined

  const today = new Date()
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const year = cursor.getFullYear()
  const month = cursor.getMonth()

  const grid = useMemo(() => buildMonthGrid(year, month), [year, month])
  const rangeStart = new Date(year, month, 1).toISOString()
  const rangeEnd = new Date(year, month + 1, 1).toISOString()
  const { data: posts, isLoading } = usePortalCalendar(clientId, rangeStart, rangeEnd)

  const byDate = useMemo(() => {
    const m = new Map<string, typeof posts>()
    for (const p of posts ?? []) {
      if (!p.scheduled_at) continue
      const key = ymd(new Date(p.scheduled_at))
      const arr = m.get(key) ?? []
      arr.push(p)
      m.set(key, arr)
    }
    return m
  }, [posts])

  if (profile?.kind !== 'client') return null

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Calendário</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Visão dos seus posts dos próximos dias (PRD §6.2.3).
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setCursor(new Date(year, month - 1, 1))}>
          <ChevronLeft className="size-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => setCursor(new Date(year, month + 1, 1))}>
          <ChevronRight className="size-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}>
          Hoje
        </Button>
        <h2 className="text-lg font-medium ml-2">{MONTHS[month]} {year}</h2>
      </div>

      <div className="rounded-md border bg-background overflow-hidden">
        <div className="grid grid-cols-7 bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
          {WEEKDAYS.map((d) => (
            <div key={d} className="p-2 text-center font-medium">{d}</div>
          ))}
        </div>
        {isLoading && <p className="p-6 text-sm text-muted-foreground">Carregando…</p>}
        <div className="grid grid-cols-7">
          {grid.map((day) => {
            const inMonth = day.getMonth() === month
            const isToday = ymd(day) === ymd(today)
            const dayPosts = byDate.get(ymd(day)) ?? []
            return (
              <div
                key={ymd(day) + (inMonth ? '' : '-out')}
                className={cn(
                  'min-h-[90px] border-t border-l p-1.5 flex flex-col gap-1 text-xs',
                  !inMonth && 'bg-muted/20 text-muted-foreground',
                )}
              >
                <span
                  className={cn(
                    'inline-flex items-center justify-center size-6 rounded-full text-[11px] font-medium',
                    isToday && 'bg-primary text-primary-foreground',
                  )}
                >
                  {day.getDate()}
                </span>
                <div className="flex flex-col gap-1 overflow-hidden">
                  {dayPosts.slice(0, 3).map((p) => (
                    <span
                      key={p.id}
                      className={cn('truncate rounded px-1.5 py-0.5 text-[11px] font-medium', POST_STATUS_COLOR[p.status])}
                      title={p.title ?? ''}
                    >
                      {p.title || '(post)'}
                    </span>
                  ))}
                  {dayPosts.length > 3 && (
                    <span className="text-[10px] text-muted-foreground">+{dayPosts.length - 3}</span>
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
