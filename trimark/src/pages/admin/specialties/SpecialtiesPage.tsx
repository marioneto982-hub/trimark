import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useSpecialties } from '@/hooks/useSpecialties'

export default function SpecialtiesPage() {
  const { data, isLoading } = useSpecialties()
  const [q, setQ] = useState('')

  const grouped = useMemo(() => {
    const m = new Map<string, typeof data>()
    for (const s of data ?? []) {
      if (q.trim() && !s.name.toLowerCase().includes(q.toLowerCase())
          && !s.category.toLowerCase().includes(q.toLowerCase())) continue
      const arr = m.get(s.category) ?? []
      arr.push(s)
      m.set(s.category, arr)
    }
    return Array.from(m.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [data, q])

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">PRD §4.2</p>
        <h1 className="text-2xl font-semibold mt-1">Especialidades</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Catálogo global de especialidades atendidas pela Trimark, com conselho regulador
          e resumo das regras éticas que devem orientar conteúdos publicados.
        </p>
      </header>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Buscar especialidade ou categoria…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}

      <div className="space-y-6">
        {grouped.map(([cat, items]) => (
          <div key={cat}>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {cat} <span className="text-foreground">({items?.length ?? 0})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(items ?? []).map((s) => (
                <Card key={s.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{s.name}</CardTitle>
                    {s.council && (
                      <p className="text-xs text-muted-foreground">Conselho: {s.council}</p>
                    )}
                  </CardHeader>
                  {s.ethics_rules_summary && (
                    <CardContent className="pt-0 text-xs text-muted-foreground">
                      {s.ethics_rules_summary}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
