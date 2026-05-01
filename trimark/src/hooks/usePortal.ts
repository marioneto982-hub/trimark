// Hooks específicos do portal cliente (PRD §6).
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { InvoiceStatus, PostStatus } from '@/types'
import type { PostRow } from './usePosts'

// =============================================================================
// Posts aguardando aprovação do cliente
// =============================================================================

const POST_SELECT = `
  id, agency_id, client_id, title, copy_text, hashtags, platform, format,
  scheduled_at, published_at, status, created_by, assigned_to,
  approved_by_client_at, rejection_reason, revision_count, external_post_url,
  created_at, updated_at,
  clients:client_id ( id, full_name, trade_name )
`

export function usePortalAwaitingApproval(clientId: string | undefined) {
  return useQuery({
    enabled: !!clientId,
    queryKey: ['portal', 'awaiting', clientId],
    queryFn: async (): Promise<PostRow[]> => {
      if (!clientId) return []
      const { data, error } = await supabase
        .from('content_posts')
        .select(POST_SELECT)
        .eq('client_id', clientId)
        .eq('status', 'awaiting_client')
        .order('scheduled_at', { ascending: true, nullsFirst: false })
      if (error) throw error
      return (data ?? []) as unknown as PostRow[]
    },
  })
}

export function usePortalCalendar(
  clientId: string | undefined,
  rangeStart: string,
  rangeEnd: string,
) {
  return useQuery({
    enabled: !!clientId,
    queryKey: ['portal', 'calendar', clientId, rangeStart, rangeEnd],
    queryFn: async (): Promise<PostRow[]> => {
      if (!clientId) return []
      const { data, error } = await supabase
        .from('content_posts')
        .select(POST_SELECT)
        .eq('client_id', clientId)
        .gte('scheduled_at', rangeStart)
        .lt('scheduled_at', rangeEnd)
        .order('scheduled_at', { ascending: true })
      if (error) throw error
      return (data ?? []) as unknown as PostRow[]
    },
  })
}

export interface ApprovalDecision {
  postId: string
  decision: 'approved' | 'rejected' | 'revision_requested'
  comment?: string | null
  approverClientUserId: string
}

export function usePortalApprovePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ postId, decision, comment, approverClientUserId }: ApprovalDecision) => {
      // 1) registra decisão
      const { error: insErr } = await supabase.from('content_post_approvals').insert({
        post_id: postId,
        approved_by: approverClientUserId,
        approver_role: 'client',
        decision,
        comment: comment ?? null,
      })
      if (insErr) throw insErr

      // 2) atualiza status do post
      const newStatus: PostStatus =
        decision === 'approved' ? 'approved' :
        decision === 'rejected' ? 'rejected' :
        'in_creation'

      const patch: Record<string, unknown> = { status: newStatus }
      if (decision === 'approved') {
        patch.approved_by_client_at = new Date().toISOString()
      }
      if (decision === 'rejected') {
        patch.rejection_reason = comment ?? null
      }
      const { error: updErr } = await supabase
        .from('content_posts')
        .update(patch)
        .eq('id', postId)
      if (updErr) throw updErr
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['portal'] })
      void qc.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

// =============================================================================
// Faturas (portal)
// =============================================================================

export interface PortalInvoiceRow {
  id: string
  reference_month: string
  amount: string
  issue_date: string
  due_date: string
  paid_at: string | null
  payment_method: 'pix' | 'boleto' | 'credit_card' | null
  status: InvoiceStatus
  asaas_invoice_url: string | null
  asaas_pix_qr_code: string | null
  asaas_pix_copy_paste: string | null
  asaas_boleto_url: string | null
  asaas_boleto_barcode: string | null
  description: string | null
}

export function usePortalInvoices(clientId: string | undefined) {
  return useQuery({
    enabled: !!clientId,
    queryKey: ['portal', 'invoices', clientId],
    queryFn: async (): Promise<PortalInvoiceRow[]> => {
      if (!clientId) return []
      const { data, error } = await supabase
        .from('invoices')
        .select(`id, reference_month, amount, issue_date, due_date, paid_at,
                 payment_method, status, asaas_invoice_url, asaas_pix_qr_code,
                 asaas_pix_copy_paste, asaas_boleto_url, asaas_boleto_barcode, description`)
        .eq('client_id', clientId)
        .order('due_date', { ascending: false })
      if (error) throw error
      return (data ?? []) as unknown as PortalInvoiceRow[]
    },
  })
}

// =============================================================================
// Biblioteca (portal — filtrada pela specialty do cliente)
// =============================================================================

export interface LibraryItemRow {
  id: string
  title: string
  content_type: string
  category: string | null
  body_markdown: string | null
  suggested_copy: string | null
  suggested_hashtags: string[] | null
  suggested_format: string | null
  media_urls: string[] | null
  external_link: string | null
  relevant_date: string | null
  difficulty: 'basic' | 'intermediate' | 'advanced' | null
  ethics_compliant: boolean
  ethics_notes: string | null
  view_count: number
  created_at: string
}

export function usePortalLibrary(clientSpecialtyId: string | undefined) {
  return useQuery({
    enabled: !!clientSpecialtyId,
    queryKey: ['portal', 'library', clientSpecialtyId],
    queryFn: async (): Promise<LibraryItemRow[]> => {
      if (!clientSpecialtyId) return []
      const { data, error } = await supabase
        .from('content_library')
        .select(`id, title, content_type, category, body_markdown, suggested_copy,
                 suggested_hashtags, suggested_format, media_urls, external_link,
                 relevant_date, difficulty, ethics_compliant, ethics_notes,
                 view_count, created_at`)
        .eq('published', true)
        .contains('specialty_ids', [clientSpecialtyId])
        .order('relevant_date', { ascending: true, nullsFirst: false })
      if (error) throw error
      return (data ?? []) as unknown as LibraryItemRow[]
    },
  })
}
