import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { PostFormat, PostStatus, Platform } from '@/types'

export interface PostRow {
  id: string
  agency_id: string
  client_id: string
  title: string | null
  copy_text: string | null
  hashtags: string[] | null
  platform: Platform | null
  format: PostFormat | null
  scheduled_at: string | null
  published_at: string | null
  status: PostStatus
  created_by: string | null
  assigned_to: string | null
  approved_by_client_at: string | null
  rejection_reason: string | null
  revision_count: number
  external_post_url: string | null
  created_at: string
  updated_at: string
  clients?: { id: string; full_name: string; trade_name: string | null } | null
}

export interface PostsFilter {
  clientId?: string
  status?: PostStatus | 'all'
  /** ISO start (inclusive). Filtra por scheduled_at. */
  rangeStart?: string
  /** ISO end (exclusive). */
  rangeEnd?: string
}

const SELECT = `
  id, agency_id, client_id, title, copy_text, hashtags, platform, format,
  scheduled_at, published_at, status, created_by, assigned_to,
  approved_by_client_at, rejection_reason, revision_count, external_post_url,
  created_at, updated_at,
  clients:client_id ( id, full_name, trade_name )
`

export function usePosts(filter: PostsFilter = {}) {
  return useQuery({
    queryKey: ['posts', filter],
    queryFn: async (): Promise<PostRow[]> => {
      let q = supabase.from('content_posts').select(SELECT).order('scheduled_at', { ascending: true, nullsFirst: false })
      if (filter.clientId) q = q.eq('client_id', filter.clientId)
      if (filter.status && filter.status !== 'all') q = q.eq('status', filter.status)
      if (filter.rangeStart) q = q.gte('scheduled_at', filter.rangeStart)
      if (filter.rangeEnd) q = q.lt('scheduled_at', filter.rangeEnd)
      const { data, error } = await q
      if (error) throw error
      return (data ?? []) as unknown as PostRow[]
    },
  })
}

export function usePost(id: string | undefined) {
  return useQuery({
    enabled: !!id,
    queryKey: ['post', id],
    queryFn: async (): Promise<PostRow | null> => {
      if (!id) return null
      const { data, error } = await supabase.from('content_posts').select(SELECT).eq('id', id).single()
      if (error) throw error
      return data as unknown as PostRow
    },
  })
}

export interface PostWritePayload {
  agency_id: string
  client_id: string
  title?: string | null
  copy_text?: string | null
  hashtags?: string[] | null
  platform?: Platform | null
  format?: PostFormat | null
  scheduled_at?: string | null
  status?: PostStatus
  created_by?: string | null
  assigned_to?: string | null
}

export function useCreatePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: PostWritePayload) => {
      const { data, error } = await supabase.from('content_posts').insert(payload).select('id').single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

export function useUpdatePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<PostWritePayload> }) => {
      const { data, error } = await supabase.from('content_posts').update(patch).eq('id', id).select('id').single()
      if (error) throw error
      return data
    },
    onSuccess: (_d, vars) => {
      void qc.invalidateQueries({ queryKey: ['posts'] })
      void qc.invalidateQueries({ queryKey: ['post', vars.id] })
    },
  })
}

export function useDeletePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('content_posts').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

// Constantes de exibição compartilhadas.
export const POST_STATUS_LABEL: Record<PostStatus, string> = {
  draft: 'Rascunho',
  in_creation: 'Em criação',
  awaiting_internal: 'Aguardando interno',
  awaiting_client: 'Aguardando cliente',
  approved: 'Aprovado',
  scheduled: 'Agendado',
  published: 'Publicado',
  archived: 'Arquivado',
  rejected: 'Rejeitado',
}

export const POST_STATUS_COLOR: Record<PostStatus, string> = {
  draft: 'bg-zinc-200 text-zinc-700',
  in_creation: 'bg-amber-200 text-amber-900',
  awaiting_internal: 'bg-orange-200 text-orange-900',
  awaiting_client: 'bg-yellow-200 text-yellow-900',
  approved: 'bg-emerald-200 text-emerald-900',
  scheduled: 'bg-sky-200 text-sky-900',
  published: 'bg-blue-300 text-blue-950',
  archived: 'bg-zinc-300 text-zinc-700',
  rejected: 'bg-red-200 text-red-900',
}

export const PLATFORM_LABEL: Record<Platform, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  blog: 'Blog',
}

export const FORMAT_LABEL: Record<PostFormat, string> = {
  feed: 'Feed',
  stories: 'Stories',
  reels: 'Reels',
  carousel: 'Carrossel',
  video: 'Vídeo',
  article: 'Artigo',
}
