import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export type LibraryContentType =
  | 'post_idea'
  | 'reference_article'
  | 'date_calendar'
  | 'visual_template'
  | 'educational_video'
  | 'ethics_case'

export type Difficulty = 'basic' | 'intermediate' | 'advanced'

export const CONTENT_TYPE_LABEL: Record<LibraryContentType, string> = {
  post_idea: 'Ideia de post',
  reference_article: 'Artigo de referência',
  date_calendar: 'Data comemorativa',
  visual_template: 'Template visual',
  educational_video: 'Vídeo educativo',
  ethics_case: 'Caso ético',
}

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  basic: 'Básico',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
}

export interface LibraryRow {
  id: string
  agency_id: string
  title: string
  content_type: LibraryContentType
  specialty_ids: string[]
  category: string | null
  body_markdown: string | null
  suggested_copy: string | null
  suggested_hashtags: string[] | null
  suggested_format: string | null
  media_urls: string[] | null
  external_link: string | null
  relevant_date: string | null
  difficulty: Difficulty | null
  ethics_compliant: boolean
  ethics_notes: string | null
  published: boolean
  view_count: number
  created_at: string
}

export interface LibraryFilter {
  contentType?: LibraryContentType | 'all'
  publishedOnly?: boolean
  search?: string
  specialtyId?: string
}

export function useLibrary(filter: LibraryFilter = {}) {
  return useQuery({
    queryKey: ['library', filter],
    queryFn: async (): Promise<LibraryRow[]> => {
      let q = supabase.from('content_library').select('*').order('created_at', { ascending: false })
      if (filter.contentType && filter.contentType !== 'all') q = q.eq('content_type', filter.contentType)
      if (filter.publishedOnly) q = q.eq('published', true)
      if (filter.specialtyId) q = q.contains('specialty_ids', [filter.specialtyId])
      if (filter.search?.trim()) {
        const s = filter.search.trim()
        q = q.or(`title.ilike.%${s}%,suggested_copy.ilike.%${s}%`)
      }
      const { data, error } = await q
      if (error) throw error
      return (data ?? []) as unknown as LibraryRow[]
    },
  })
}

export function useLibraryItem(id: string | undefined) {
  return useQuery({
    enabled: !!id,
    queryKey: ['library-item', id],
    queryFn: async (): Promise<LibraryRow | null> => {
      if (!id) return null
      const { data, error } = await supabase.from('content_library').select('*').eq('id', id).single()
      if (error) throw error
      return data as unknown as LibraryRow
    },
  })
}

export interface LibraryWritePayload {
  agency_id: string
  title: string
  content_type: LibraryContentType
  specialty_ids: string[]
  category?: string | null
  body_markdown?: string | null
  suggested_copy?: string | null
  suggested_hashtags?: string[] | null
  suggested_format?: string | null
  media_urls?: string[] | null
  external_link?: string | null
  relevant_date?: string | null
  difficulty?: Difficulty | null
  ethics_compliant?: boolean
  ethics_notes?: string | null
  published?: boolean
  created_by?: string | null
}

export function useCreateLibraryItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: LibraryWritePayload) => {
      const { data, error } = await supabase.from('content_library').insert(payload).select('id').single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['library'] })
    },
  })
}

export function useUpdateLibraryItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<LibraryWritePayload> }) => {
      const { error } = await supabase.from('content_library').update(patch).eq('id', id)
      if (error) throw error
    },
    onSuccess: (_d, vars) => {
      void qc.invalidateQueries({ queryKey: ['library'] })
      void qc.invalidateQueries({ queryKey: ['library-item', vars.id] })
    },
  })
}

export function useDeleteLibraryItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('content_library').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['library'] })
    },
  })
}
