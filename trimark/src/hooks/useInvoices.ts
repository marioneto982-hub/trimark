import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { InvoiceStatus } from '@/types'

export interface InvoiceRow {
  id: string
  agency_id: string
  client_id: string
  reference_month: string
  amount: string
  issue_date: string
  due_date: string
  paid_at: string | null
  payment_method: 'pix' | 'boleto' | 'credit_card' | null
  status: InvoiceStatus
  asaas_payment_id: string | null
  asaas_invoice_url: string | null
  asaas_pix_qr_code: string | null
  asaas_pix_copy_paste: string | null
  asaas_boleto_url: string | null
  asaas_boleto_barcode: string | null
  description: string | null
  created_at: string
  updated_at: string
  clients?: { id: string; full_name: string; trade_name: string | null } | null
}

export interface InvoicesFilter {
  status?: InvoiceStatus | 'all'
  clientId?: string
  search?: string
}

const SELECT = `
  id, agency_id, client_id, reference_month, amount, issue_date, due_date, paid_at,
  payment_method, status, asaas_payment_id, asaas_invoice_url,
  asaas_pix_qr_code, asaas_pix_copy_paste, asaas_boleto_url, asaas_boleto_barcode,
  description, created_at, updated_at,
  clients:client_id ( id, full_name, trade_name )
`

export function useInvoices(filter: InvoicesFilter = {}) {
  return useQuery({
    queryKey: ['invoices', filter],
    queryFn: async (): Promise<InvoiceRow[]> => {
      let q = supabase.from('invoices').select(SELECT).order('due_date', { ascending: false })
      if (filter.status && filter.status !== 'all') q = q.eq('status', filter.status)
      if (filter.clientId) q = q.eq('client_id', filter.clientId)
      const { data, error } = await q
      if (error) throw error
      let rows = (data ?? []) as unknown as InvoiceRow[]
      if (filter.search?.trim()) {
        const s = filter.search.toLowerCase()
        rows = rows.filter((r) =>
          (r.clients?.full_name ?? '').toLowerCase().includes(s) ||
          (r.clients?.trade_name ?? '').toLowerCase().includes(s) ||
          r.reference_month.includes(s),
        )
      }
      return rows
    },
  })
}

export function useInvoice(id: string | undefined) {
  return useQuery({
    enabled: !!id,
    queryKey: ['invoice', id],
    queryFn: async (): Promise<InvoiceRow | null> => {
      if (!id) return null
      const { data, error } = await supabase.from('invoices').select(SELECT).eq('id', id).single()
      if (error) throw error
      return data as unknown as InvoiceRow
    },
  })
}

export function useUpdateInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<InvoiceRow> }) => {
      const { error } = await supabase.from('invoices').update(patch).eq('id', id)
      if (error) throw error
    },
    onSuccess: (_d, vars) => {
      void qc.invalidateQueries({ queryKey: ['invoices'] })
      void qc.invalidateQueries({ queryKey: ['invoice', vars.id] })
    },
  })
}

// Disparam Edge Functions (não banco direto):
export interface GenerateInvoicePayload {
  client_id: string
  reference_month?: string  // 'YYYY-MM' — default: mês corrente
  amount?: number           // se omitido, usa contract_value do cliente
  due_date?: string         // ISO date — default: dia de vencimento do cliente
  description?: string
}

export function useGenerateInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: GenerateInvoicePayload) => {
      const { data, error } = await supabase.functions.invoke('generate-invoice', { body: payload })
      if (error) throw error
      if (data && typeof data === 'object' && 'ok' in data && data.ok === false) {
        throw new Error((data as { error?: string }).error ?? 'generate-invoice falhou')
      }
      return data
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
}

export function useSendInvoiceWhatsapp() {
  return useMutation({
    mutationFn: async (invoiceId: string) => {
      const { data, error } = await supabase.functions.invoke('send-invoice-whatsapp', {
        body: { invoice_id: invoiceId },
      })
      if (error) throw error
      return data
    },
  })
}

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  pending: 'Em aberto',
  paid: 'Paga',
  overdue: 'Vencida',
  canceled: 'Cancelada',
  refunded: 'Reembolsada',
}
