import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface Specialty {
  id: string
  name: string
  category: string
  council: string | null
  ethics_rules_summary: string | null
}

export function useSpecialties() {
  return useQuery({
    queryKey: ['specialties'],
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<Specialty[]> => {
      const { data, error } = await supabase
        .from('specialties')
        .select('id, name, category, council, ethics_rules_summary')
        .eq('active', true)
        .order('category')
        .order('name')
      if (error) throw error
      return data ?? []
    },
  })
}
