import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/AuthContext'
import { usePortalLibrary } from '@/hooks/usePortal'
import { supabase } from '@/lib/supabase'
import { formatDateBR } from '@/lib/format'

const TYPE_LABEL: Record<string, string> = {
  post_idea: 'Ideia de post',
  reference_article: 'Artigo de referência',
  date_calendar: 'Data comemorativa',
  visual_template: 'Template visual',
  educational_video: 'Vídeo educativo',
  ethics_case: 'Caso ético',
}

export default function PortalLibraryPage() {
  const { profile } = useAuth()
  const [specialtyId, setSpecialtyId] = useState<string | undefined>()
  const [q, setQ] = useState('')

  // Resolve a specialty do cliente a partir de clients.specialty_id
  useEffect(() => {
    if (profile?.kind !== 'client') return
    let cancelled = false
    supabase.from('clients').select('specialty_id').eq('id', profile.client_id).single()
      .then(({ data }) => {
        if (cancelled) return
        if (data?.specialty_id) setSpecialtyId(data.specialty_id)
      })
    return () => { cancelled = true }
  }, [profile])

  const { data: items, isLoading, isError, error } = usePortalLibrary(specialtyId)
  const filtered = (items ?? []).filter((i) =>
    !q.trim()
      ? true
      : i.title.toLowerCase().includes(q.toLowerCase())
        || (i.suggested_copy ?? '').toLowerCase().includes(q.toLowerCase()),
  )

  if (profile?.kind !== 'client') return null

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Biblioteca</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Conteúdos, ideias e templates filtrados pela sua especialidade (PRD §7.5).
        </p>
      </header>

      <Input placeholder="Buscar título ou copy…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-md" />

      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      {isError && <p className="text-sm text-destructive">Erro: {(error as Error).message}</p>}

      {filtered.length === 0 && !isLoading && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Nada por aqui ainda. Sua agência publica novos conteúdos com frequência.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((i) => (
          <Card key={i.id}>
            <CardHeader>
              <CardTitle className="text-base">{i.title}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {TYPE_LABEL[i.content_type] ?? i.content_type}
                {i.relevant_date && ` · ${formatDateBR(i.relevant_date)}`}
              </p>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              {i.suggested_copy && <p className="line-clamp-3">{i.suggested_copy}</p>}
              {i.suggested_hashtags && i.suggested_hashtags.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {i.suggested_hashtags.slice(0, 5).map((h) => `#${h}`).join(' ')}
                </p>
              )}
              {i.external_link && (
                <a
                  href={i.external_link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs underline hover:text-foreground"
                >
                  Abrir referência →
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
