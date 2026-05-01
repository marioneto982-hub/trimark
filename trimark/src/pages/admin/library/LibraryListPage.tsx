import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  CONTENT_TYPE_LABEL,
  type LibraryContentType,
  useLibrary,
} from '@/hooks/useLibrary'
import { formatDateBR } from '@/lib/format'

export default function LibraryListPage() {
  const [search, setSearch] = useState('')
  const [contentType, setContentType] = useState<LibraryContentType | 'all'>('all')
  const { data, isLoading, isError, error } = useLibrary({ search, contentType })

  return (
    <div className="p-8 space-y-6 max-w-6xl">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Módulo 4 · PRD §7</p>
          <h1 className="text-2xl font-semibold mt-1">Biblioteca</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Conteúdos por especialidade — ideias, artigos, datas, templates, casos éticos.
          </p>
        </div>
        <Link to="/admin/library/new">
          <Button>
            <Plus className="size-4 mr-1" /> Novo item
          </Button>
        </Link>
      </header>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar título ou copy…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={contentType}
          onChange={(e) => setContentType(e.target.value as LibraryContentType | 'all')}
          className="sm:w-56"
        >
          <option value="all">Todos os tipos</option>
          {(Object.keys(CONTENT_TYPE_LABEL) as LibraryContentType[]).map((t) => (
            <option key={t} value={t}>{CONTENT_TYPE_LABEL[t]}</option>
          ))}
        </Select>
      </div>

      <div className="rounded-md border bg-background">
        {isLoading && <p className="p-6 text-sm text-muted-foreground">Carregando…</p>}
        {isError && <p className="p-6 text-sm text-destructive">Erro: {(error as Error).message}</p>}
        {!isLoading && data && data.length === 0 && (
          <div className="p-10 text-center space-y-3">
            <p className="text-muted-foreground">Nenhum item ainda.</p>
            <Link to="/admin/library/new">
              <Button variant="outline">
                <Plus className="size-4 mr-1" /> Criar primeiro item
              </Button>
            </Link>
          </div>
        )}
        {!isLoading && data && data.length > 0 && (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3 font-medium">Título</th>
                <th className="p-3 font-medium">Tipo</th>
                <th className="p-3 font-medium">Categoria</th>
                <th className="p-3 font-medium">Data relevante</th>
                <th className="p-3 font-medium">Views</th>
                <th className="p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((i) => (
                <tr key={i.id} className="border-t hover:bg-muted/30">
                  <td className="p-3">
                    <Link to={`/admin/library/${i.id}`} className="font-medium hover:underline">
                      {i.title}
                    </Link>
                  </td>
                  <td className="p-3 text-muted-foreground">{CONTENT_TYPE_LABEL[i.content_type]}</td>
                  <td className="p-3 text-muted-foreground">{i.category ?? '—'}</td>
                  <td className="p-3 text-muted-foreground">{formatDateBR(i.relevant_date)}</td>
                  <td className="p-3 text-muted-foreground">{i.view_count}</td>
                  <td className="p-3">
                    <Badge variant={i.published ? 'active' : 'default'}>
                      {i.published ? 'Publicado' : 'Rascunho'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
