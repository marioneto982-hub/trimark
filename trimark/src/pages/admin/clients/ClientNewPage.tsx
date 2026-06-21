import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'
import { ClientForm } from '@/components/clients/ClientForm'
import { useCreateClient } from '@/hooks/useClients'

export default function ClientNewPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const create = useCreateClient()

  if (profile?.kind !== 'internal') return null

  return (
    <div className="p-8 max-w-3xl space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">CRM</p>
        <h1 className="text-2xl font-semibold mt-1">Novo cliente</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Cadastro rápido do cliente.
        </p>
      </header>

      <ClientForm
        agencyId={profile.agency_id}
        submitting={create.isPending}
        onCancel={() => navigate('/admin/clients')}
        onSubmit={async (payload) => {
          const row = await create.mutateAsync(payload)
          navigate(`/admin/clients/${row.id}`, { replace: true })
        }}
      />
    </div>
  )
}
