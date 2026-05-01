import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'
import { useCreatePost } from '@/hooks/usePosts'
import { PostForm } from '@/components/posts/PostForm'

export default function PostNewPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const create = useCreatePost()

  if (!profile || profile.kind !== 'internal') return null

  return (
    <div className="p-8 space-y-6 max-w-3xl">
      <div>
        <Link to="/admin/calendar" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4 mr-1" /> Voltar ao calendário
        </Link>
        <h1 className="text-2xl font-semibold mt-2">Novo post</h1>
      </div>

      <PostForm
        agencyId={profile.agency_id}
        userRowId={profile.user_row_id}
        defaultDate={params.get('date') ?? undefined}
        submitLabel="Criar post"
        isSubmitting={create.isPending}
        onSubmit={async (payload) => {
          const res = await create.mutateAsync(payload)
          navigate(`/admin/calendar/posts/${res.id}`)
        }}
        onCancel={() => navigate('/admin/calendar')}
      />
    </div>
  )
}
