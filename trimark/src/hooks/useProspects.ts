import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export type ProspectStage =
  | 'lead' | 'contacted' | 'meeting_scheduled'
  | 'proposal_sent' | 'negotiating'
  | 'closed_won' | 'closed_lost'

export const STAGE_LABEL: Record<ProspectStage, string> = {
  lead: 'Lead',
  contacted: 'Contatado',
  meeting_scheduled: 'Reunião marcada',
  proposal_sent: 'Proposta enviada',
  negotiating: 'Negociando',
  closed_won: 'Fechado (ganho)',
  closed_lost: 'Perdido',
}

export const STAGE_ORDER: ProspectStage[] = [
  'lead', 'contacted', 'meeting_scheduled', 'proposal_sent',
  'negotiating', 'closed_won', 'closed_lost',
]

export interface ProspectRow {
  id: string
  agency_id: string
  name: string
  phone: string | null
  email: string | null
  specialty_id: string | null
  source: string | null
  estimated_plan_id: string | null
  estimated_value: string | null
  stage: ProspectStage
  loss_reason: string | null
  assigned_to: string | null
  notes: string | null
  converted_to_client_id: string | null
  created_at: string
  specialties?: { name: string } | null
}

export function useProspects() {
  return useQuery({
    queryKey: ['prospects'],
    queryFn: async (): Promise<ProspectRow[]> => {
      const { data, error } = await supabase
        .from('prospects')
        .select(`*, specialties:specialty_id ( name )`)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as unknown as ProspectRow[]
    },
  })
}

export interface ProspectWritePayload {
  agency_id: string
  name: string
  phone?: string | null
  email?: string | null
  specialty_id?: string | null
  source?: string | null
  estimated_value?: number | null
  stage?: ProspectStage
  notes?: string | null
}

export function useCreateProspect() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (p: ProspectWritePayload) => {
      const { data, error } = await supabase.from('prospects').insert(p).select('id').single()
      if (error) throw error
      return data
    },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['prospects'] }) },
  })
}

export function useUpdateProspect() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<ProspectRow> }) => {
      const { error } = await supabase.from('prospects').update(patch).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['prospects'] }) },
  })
}

export function useDeleteProspect() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('prospects').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['prospects'] }) },
  })
}
