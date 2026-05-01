import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ClientStatus } from '@/types'

export interface ClientRow {
  id: string
  agency_id: string
  full_name: string
  trade_name: string | null
  email: string | null
  phone_primary: string | null
  doc_type: 'cpf' | 'cnpj' | null
  council_type: string | null
  council_number: string | null
  status: ClientStatus
  billing_day: number | null
  contract_value: string | null
  specialty_id: string
  plan_id: string | null
  account_manager_id: string | null
  created_at: string
  updated_at: string
  specialties?: { id: string; name: string; category: string | null } | null
  plans?: { id: string; name: string; monthly_price: string } | null
}

export interface ClientsFilter {
  status?: ClientStatus | 'all'
  search?: string
  specialtyId?: string
}

const SELECT = `
  id, agency_id, full_name, trade_name, email, phone_primary,
  doc_type, council_type, council_number, status, billing_day,
  contract_value, specialty_id, plan_id, account_manager_id,
  created_at, updated_at,
  specialties:specialty_id ( id, name, category ),
  plans:plan_id ( id, name, monthly_price )
`

export function useClients(filter: ClientsFilter = {}) {
  return useQuery({
    queryKey: ['clients', filter],
    queryFn: async (): Promise<ClientRow[]> => {
      let q = supabase.from('clients').select(SELECT).order('created_at', { ascending: false })
      if (filter.status && filter.status !== 'all') q = q.eq('status', filter.status)
      if (filter.specialtyId) q = q.eq('specialty_id', filter.specialtyId)
      if (filter.search?.trim()) {
        const s = filter.search.trim()
        q = q.or(`full_name.ilike.%${s}%,trade_name.ilike.%${s}%,email.ilike.%${s}%`)
      }
      const { data, error } = await q
      if (error) throw error
      return (data ?? []) as unknown as ClientRow[]
    },
  })
}

export function useClient(id: string | undefined) {
  return useQuery({
    enabled: !!id,
    queryKey: ['client', id],
    queryFn: async (): Promise<ClientRow | null> => {
      if (!id) return null
      const { data, error } = await supabase.from('clients').select(SELECT).eq('id', id).single()
      if (error) throw error
      return data as unknown as ClientRow
    },
  })
}

export interface ClientWritePayload {
  agency_id: string
  full_name: string
  trade_name?: string | null
  email?: string | null
  phone_primary?: string | null
  doc_type?: 'cpf' | 'cnpj' | null
  doc_number_hash?: string | null
  specialty_id: string
  council_type?: string | null
  council_number?: string | null
  council_state?: string | null
  instagram_handle?: string | null
  facebook_url?: string | null
  tiktok_handle?: string | null
  website_url?: string | null
  plan_id?: string | null
  billing_day?: number | null
  contract_value?: string | number | null
  contract_start_date?: string | null
  contract_end_date?: string | null
  status?: ClientStatus
  notes?: string | null
}

export function useCreateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: ClientWritePayload) => {
      const { data, error } = await supabase.from('clients').insert(payload).select('id').single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}

export function useUpdateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<ClientWritePayload> }) => {
      const { data, error } = await supabase.from('clients').update(patch).eq('id', id).select('id').single()
      if (error) throw error
      return data
    },
    onSuccess: (_d, vars) => {
      void qc.invalidateQueries({ queryKey: ['clients'] })
      void qc.invalidateQueries({ queryKey: ['client', vars.id] })
    },
  })
}
