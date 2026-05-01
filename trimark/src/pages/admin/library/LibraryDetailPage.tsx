import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/AuthContext'
import {
  useDeleteLibraryItem,
  useLibraryItem,
  useUpdateLibraryItem,
} from '@/hooks/useLibrary'
import { LibraryForm } from '@/components/library/LibraryForm'
import { formatDateBR } from '@/lib/format'

export default function LibraryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { data: item, isLoading, isError, error } = useLibraryItem(id)
  const update = useUpdateLibraryItem()
  const del = useDeleteLibraryItem()

  if (!profile || profile.kind !== 'internal') return null
  if (isLoading) return <div className="p-8 text-sm text-muted-foreground">Carregando…</div>
  if (isError) return <div className="p-8 text-sm text-destructive">Erro: {(error as Error).message}</div>
  if (!item) return <div className="p-8 text-sm text-muted-foreground">Item não encontrado.</div>

  return (
    <div className="p-8 space-y-6 max-w-3xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link to="/admin/library" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4 mr-1" /> Voltar
          </Link>
          <h1 className="text-2xl font-semibold mt-2">{item.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Criado em {formatDateBR(item.created_at)} · {item.view_count} visualizações
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            if (!confirm('Excluir este item?')) return
            await del.mutateAsync(item.id)
            navigate('/admin/library')
          }}
        >
          <Trash2 className="size-4 mr-1" /> Excluir
        </Button>
      </div>

      <LibraryForm
        initial={item}
        agencyId={profile.agency_id}
        userRowId={profile.user_row_id}
        submitLabel="Salvar alterações"
        isSubmitting={update.isPending}
        onSubmit={async (payload) => {
          await update.mutateAsync({ id: item.id, patch: payload })
        }}
      />
    </div>
  )
}
