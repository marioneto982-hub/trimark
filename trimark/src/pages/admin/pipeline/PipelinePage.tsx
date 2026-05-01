import { useMemo, useState, type FormEvent } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/lib/AuthContext'
import {
  STAGE_LABEL, STAGE_ORDER,
  type ProspectRow, type ProspectStage,
  useCreateProspect, useDeleteProspect, useProspects, useUpdateProspect,
} from '@/hooks/useProspects'
import { useSpecialties } from '@/hooks/useSpecialties'
import { formatCurrencyBRL } from '@/lib/format'

export default function PipelinePage() {
  const { profile } = useAuth()
  const { data: prospects, isLoading } = useProspects()
  const { data: specialties } = useSpecialties()
  const create = useCreateProspect()
  const update = useUpdateProspect()
  const del = useDeleteProspect()
  const [showForm, setShowForm] = useState(false)

  const grouped = useMemo(() => {
    const m: Record<ProspectStage, ProspectRow[]> = {
      lead: [], contacted: [], meeting_scheduled: [], proposal_sent: [],
      negotiating: [], closed_won: [], closed_lost: [],
    }
    for (const p of prospects ?? []) m[p.stage].push(p)
    return m
  }, [prospects])

  if (!profile || profile.kind !== 'internal') return null

  return (
    <div className="p-8 space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">PRD §9.2</p>
          <h1 className="text-2xl font-semibold mt-1">Pipeline comercial</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Prospects em todos os estágios. Drag-and-drop simplificado: mude o estágio pelo seletor.
          </p>
        </div>
        <Button onClick={() => setShowForm((s) => !s)}>
          <Plus className="size-4 mr-1" /> {showForm ? 'Cancelar' : 'Novo prospect'}
        </Button>
      </header>

      {showForm && (
        <NewProspectForm
          agencyId={profile.agency_id}
          specialties={specialties ?? []}
          isSubmitting={create.isPending}
          onSubmit={async (p) => { await create.mutateAsync(p); setShowForm(false) }}
        />
      )}

      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {STAGE_ORDER.map((stage) => (
          <div key={stage} className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
              <span>{STAGE_LABEL[stage]}</span>
              <span className="text-foreground font-medium">{grouped[stage].length}</span>
            </div>
            <div className="space-y-2">
              {grouped[stage].map((p) => (
                <Card key={p.id}>
                  <CardContent className="p-3 text-sm space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{p.name}</p>
                        {p.specialties?.name && (
                          <p className="text-xs text-muted-foreground">{p.specialties.name}</p>
                        )}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-6"
                        onClick={async () => {
                          if (confirm('Excluir este prospect?')) await del.mutateAsync(p.id)
                        }}
                        aria-label="Excluir"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                    {p.email && <p className="text-xs text-muted-foreground">{p.email}</p>}
                    {p.estimated_value && (
                      <p className="text-xs">{formatCurrencyBRL(p.estimated_value)} estimado</p>
                    )}
                    <Select
                      value={p.stage}
                      onChange={(e) => update.mutate({
                        id: p.id, patch: { stage: e.target.value as ProspectStage },
                      })}
                      className="h-8 text-xs"
                    >
                      {STAGE_ORDER.map((s) => (
                        <option key={s} value={s}>{STAGE_LABEL[s]}</option>
                      ))}
                    </Select>
                  </CardContent>
                </Card>
              ))}
              {grouped[stage].length === 0 && (
                <p className="text-xs text-muted-foreground italic">Vazio</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function NewProspectForm({ agencyId, specialties, isSubmitting, onSubmit }: {
  agencyId: string
  specialties: { id: string; name: string }[]
  isSubmitting: boolean
  onSubmit: (p: { agency_id: string; name: string; email?: string | null; phone?: string | null;
                  specialty_id?: string | null; estimated_value?: number | null; notes?: string | null }) => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [specialtyId, setSpecialtyId] = useState('')
  const [estValue, setEstValue] = useState('')
  const [notes, setNotes] = useState('')

  function handle(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({
      agency_id: agencyId,
      name: name.trim(),
      email: email || null,
      phone: phone || null,
      specialty_id: specialtyId || null,
      estimated_value: estValue ? Number(estValue) : null,
      notes: notes || null,
    })
    setName(''); setEmail(''); setPhone(''); setSpecialtyId(''); setEstValue(''); setNotes('')
  }

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handle} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="np-name">Nome *</Label>
            <Input id="np-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="np-email">E-mail</Label>
            <Input id="np-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="np-phone">Telefone</Label>
            <Input id="np-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="np-spec">Especialidade</Label>
            <Select id="np-spec" value={specialtyId} onChange={(e) => setSpecialtyId(e.target.value)}>
              <option value="">—</option>
              {specialties.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </div>
          <div>
            <Label htmlFor="np-val">Valor estimado (R$)</Label>
            <Input id="np-val" type="number" step="0.01" value={estValue} onChange={(e) => setEstValue(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="np-notes">Notas</Label>
            <Textarea id="np-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando…' : 'Adicionar prospect'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
