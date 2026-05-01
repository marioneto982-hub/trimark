import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/AuthContext'
import {
  POST_STATUS_LABEL,
  useDeletePost,
  usePost,
  useUpdatePost,
} from '@/hooks/usePosts'
import { PostForm } from '@/components/posts/PostForm'
import { formatDateBR } from '@/lib/format'

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { data: post, isLoading, isError, error } = usePost(id)
  const update = useUpdatePost()
  const del = useDeletePost()

  if (!profile || profile.kind !== 'internal') return null
  if (isLoading) return <div className="p-8 text-sm text-muted-foreground">Carregando…</div>
  if (isError) return <div className="p-8 text-sm text-destructive">Erro: {(error as Error).message}</div>
  if (!post) return <div className="p-8 text-sm text-muted-foreground">Post não encontrado.</div>

  return (
    <div className="p-8 space-y-6 max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link to="/admin/calendar" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4 mr-1" /> Voltar ao calendário
          </Link>
          <h1 className="text-2xl font-semibold mt-2">
            {post.title || `Post ${post.id.slice(0, 8)}`}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {post.clients?.trade_name ?? post.clients?.full_name ?? '—'} · Criado em {formatDateBR(post.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge>{POST_STATUS_LABEL[post.status]}</Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              if (!confirm('Excluir este post? Esta ação não pode ser desfeita.')) return
              await del.mutateAsync(post.id)
              navigate('/admin/calendar')
            }}
          >
            <Trash2 className="size-4 mr-1" /> Excluir
          </Button>
        </div>
      </div>

      <PostForm
        initial={post}
        agencyId={profile.agency_id}
        userRowId={profile.user_row_id}
        submitLabel="Salvar alterações"
        isSubmitting={update.isPending}
        onSubmit={async (payload) => {
          await update.mutateAsync({ id: post.id, patch: payload })
        }}
      />
    </div>
  )
}
