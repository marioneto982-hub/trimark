import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface Plan {
  id: string
  name: string
  monthly_price: string
  posts_feed_quota: number
  reels_quota: number
  active: boolean
}

export function usePlans() {
  return useQuery({
    queryKey: ['plans'],
    staleTime: 60_000,
    queryFn: async (): Promise<Plan[]> => {
      const { data, error } = await supabase
        .from('plans')
        .select('id, name, monthly_price, posts_feed_quota, reels_quota, active')
        .eq('active', true)
        .order('monthly_price')
      if (error) throw error
      return data ?? []
    },
  })
}
