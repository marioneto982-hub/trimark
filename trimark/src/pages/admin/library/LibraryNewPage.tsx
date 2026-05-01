import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'
import { useCreateLibraryItem } from '@/hooks/useLibrary'
import { LibraryForm } from '@/components/library/LibraryForm'

export default function LibraryNewPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const create = useCreateLibraryItem()
  if (!profile || profile.kind !== 'internal') return null

  return (
    <div className="p-8 space-y-6 max-w-3xl">
      <div>
        <Link to="/admin/library" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4 mr-1" /> Voltar
        </Link>
        <h1 className="text-2xl font-semibold mt-2">Novo item da biblioteca</h1>
      </div>

      <LibraryForm
        agencyId={profile.agency_id}
        userRowId={profile.user_row_id}
        submitLabel="Criar item"
        isSubmitting={create.isPending}
        onSubmit={async (payload) => {
          const r = await create.mutateAsync(payload)
          navigate(`/admin/library/${r.id}`)
        }}
        onCancel={() => navigate('/admin/library')}
      />
    </div>
  )
}
