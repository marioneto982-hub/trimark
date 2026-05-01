// Tipos compartilhados do domínio Trimark.
// Tipos do banco serão gerados via `supabase gen types typescript` em fase posterior.

export type UserRole =
  | 'admin'
  | 'manager'
  | 'designer'
  | 'traffic'
  | 'salesperson'
  | 'viewer'
  | 'client'

export type ClientStatus = 'prospect' | 'onboarding' | 'active' | 'suspended' | 'canceled'

export type PostStatus =
  | 'draft'
  | 'in_creation'
  | 'awaiting_internal'
  | 'awaiting_client'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'archived'
  | 'rejected'

export type Platform = 'instagram' | 'facebook' | 'tiktok' | 'linkedin' | 'youtube' | 'blog'

export type PostFormat = 'feed' | 'stories' | 'reels' | 'carousel' | 'video' | 'article'

export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'canceled' | 'refunded'
