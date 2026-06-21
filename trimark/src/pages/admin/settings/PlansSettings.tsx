import { useState, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { formatCurrencyBRL } from '@/lib/format'

interface PlanRow {
  id: string
  name: string
  monthly_price: string
  posts_feed_quota: number
  posts_stories_quota: number
  reels_quota: number
  paid_campaigns_quota: number
  creative_pieces_quota: number
  includes_blog_posts: boolean
  includes_seo: boolean
  includes_paid_traffic: boolean
  active: boolean
}

const PLAN_COLUMNS =
  'id, name, monthly_price, posts_feed_quota, posts_stories_quota, reels_quota, ' +
  'paid_campaigns_quota, creative_pieces_quota, includes_blog_posts, includes_seo, ' +
  'includes_paid_traffic, active'

interface FormState {
  name: string
  monthly_price: string
  posts_feed_quota: string
  posts_stories_quota: string
  reels_quota: string
  paid_campaigns_quota: string
  creative_pieces_quota: string
  includes_blog_posts: boolean
  includes_seo: boolean
  includes_paid_traffic: boolean
  active: boolean
}

const EMPTY: FormState = {
  name: '',
  monthly_price: '',
  posts_feed_quota: '',
  posts_stories_quota: '',
  reels_quota: '',
  paid_campaigns_quota: '',
  creative_pieces_quota: '',
  includes_blog_posts: false,
  includes_seo: false,
  includes_paid_traffic: false,
  active: true,
}

const REQUEST_TIMEOUT_MS = 15_000

function describeError(error: { message?: string } | null): string {
  const msg = error?.message ?? 'Erro desconhecido.'
  if (/abort|timeout|signal/i.test(msg)) {
    return 'A requisição demorou demais e foi cancelada. Feche outras abas do sistema, ' +
      'atualize a página (Ctrl+Shift+R) ou saia e entre de novo, e tente novamente.'
  }
  return msg
}

function toNumber(v: string): number {
  const n = Number(v.replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

function toQuota(v: string): number {
  return Math.max(0, Math.trunc(toNumber(v)))
}

export function PlansSettings({ agencyId, canWrite }: { agencyId: string; canWrite: boolean }) {
  const qc = useQueryClient()
  const [form, setForm] = useState<FormState>(EMPTY)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const plansQuery = useQuery({
    queryKey: ['plans-admin', agencyId],
    retry: 1,
    queryFn: async (): Promise<PlanRow[]> => {
      const { data, error } = await supabase
        .from('plans')
        .select(PLAN_COLUMNS)
        .eq('agency_id', agencyId)
        .order('active', { ascending: false })
        .order('monthly_price')
        .abortSignal(AbortSignal.timeout(REQUEST_TIMEOUT_MS))
      if (error) throw new Error(describeError(error))
      return (data ?? []) as unknown as PlanRow[]
    },
  })

  function resetForm() {
    setForm(EMPTY)
    setEditingId(null)
    setError(null)
  }

  function invalidate() {
    void qc.invalidateQueries({ queryKey: ['plans-admin', agencyId] })
    void qc.invalidateQueries({ queryKey: ['plans'] }) // atualiza o dropdown do cadastro de cliente
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const name = form.name.trim()
      if (!name) throw new Error('Nome do plano é obrigatório.')
      if (form.monthly_price.trim() === '') throw new Error('Valor mensal é obrigatório.')
      const price = toNumber(form.monthly_price)
      if (price < 0) throw new Error('Valor mensal não pode ser negativo.')

      const payload = {
        agency_id: agencyId,
        name,
        monthly_price: price,
        posts_feed_quota: toQuota(form.posts_feed_quota),
        posts_stories_quota: toQuota(form.posts_stories_quota),
        reels_quota: toQuota(form.reels_quota),
        paid_campaigns_quota: toQuota(form.paid_campaigns_quota),
        creative_pieces_quota: toQuota(form.creative_pieces_quota),
        includes_blog_posts: form.includes_blog_posts,
        includes_seo: form.includes_seo,
        includes_paid_traffic: form.includes_paid_traffic,
        active: form.active,
      }

      if (editingId) {
        const { error } = await supabase
          .from('plans')
          .update(payload)
          .eq('id', editingId)
          .abortSignal(AbortSignal.timeout(REQUEST_TIMEOUT_MS))
        if (error) throw new Error(describeError(error))
      } else {
        const { error } = await supabase
          .from('plans')
          .insert(payload)
          .abortSignal(AbortSignal.timeout(REQUEST_TIMEOUT_MS))
        if (error) throw new Error(describeError(error))
      }
    },
    onSuccess: () => {
      resetForm()
      invalidate()
    },
    onError: (e) => setError(e instanceof Error ? e.message : String(e)),
  })

  const toggleActive = useMutation({
    mutationFn: async (p: PlanRow) => {
      const { error } = await supabase
        .from('plans')
        .update({ active: !p.active })
        .eq('id', p.id)
        .abortSignal(AbortSignal.timeout(REQUEST_TIMEOUT_MS))
      if (error) throw new Error(describeError(error))
    },
    onSuccess: invalidate,
    onError: (e) => setError(e instanceof Error ? e.message : String(e)),
  })

  function startEdit(p: PlanRow) {
    setEditingId(p.id)
    setError(null)
    setForm({
      name: p.name,
      monthly_price: String(p.monthly_price ?? ''),
      posts_feed_quota: String(p.posts_feed_quota ?? ''),
      posts_stories_quota: String(p.posts_stories_quota ?? ''),
      reels_quota: String(p.reels_quota ?? ''),
      paid_campaigns_quota: String(p.paid_campaigns_quota ?? ''),
      creative_pieces_quota: String(p.creative_pieces_quota ?? ''),
      includes_blog_posts: p.includes_blog_posts,
      includes_seo: p.includes_seo,
      includes_paid_traffic: p.includes_paid_traffic,
      active: p.active,
    })
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    saveMutation.mutate()
  }

  const plans = plansQuery.data ?? []

  return (
    <div className="space-y-6">
      {canWrite && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Editar plano' : 'Novo plano'}</CardTitle>
            <CardDescription>
              Planos ativos aparecem no dropdown do cadastro de cliente, com o valor mensal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="plan-name">Nome do plano *</Label>
                  <Input
                    id="plan-name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ex.: Essencial, Plus, Premium"
                  />
                </div>
                <div>
                  <Label htmlFor="plan-price">Valor mensal (R$) *</Label>
                  <Input
                    id="plan-price"
                    type="number"
                    step="0.01"
                    min={0}
                    value={form.monthly_price}
                    onChange={(e) => setForm({ ...form, monthly_price: e.target.value })}
                    placeholder="Ex.: 1500.00"
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Cotas mensais (opcional)
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <QuotaField label="Posts feed" value={form.posts_feed_quota} onChange={(v) => setForm({ ...form, posts_feed_quota: v })} />
                  <QuotaField label="Stories" value={form.posts_stories_quota} onChange={(v) => setForm({ ...form, posts_stories_quota: v })} />
                  <QuotaField label="Reels" value={form.reels_quota} onChange={(v) => setForm({ ...form, reels_quota: v })} />
                  <QuotaField label="Campanhas" value={form.paid_campaigns_quota} onChange={(v) => setForm({ ...form, paid_campaigns_quota: v })} />
                  <QuotaField label="Peças criativas" value={form.creative_pieces_quota} onChange={(v) => setForm({ ...form, creative_pieces_quota: v })} />
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <CheckField label="Inclui blog posts" checked={form.includes_blog_posts} onChange={(v) => setForm({ ...form, includes_blog_posts: v })} />
                <CheckField label="Inclui SEO" checked={form.includes_seo} onChange={(v) => setForm({ ...form, includes_seo: v })} />
                <CheckField label="Inclui tráfego pago" checked={form.includes_paid_traffic} onChange={(v) => setForm({ ...form, includes_paid_traffic: v })} />
                <CheckField label="Ativo (aparece no cadastro)" checked={form.active} onChange={(v) => setForm({ ...form, active: v })} />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex items-center gap-2">
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Salvando…' : editingId ? 'Salvar alterações' : 'Cadastrar plano'}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar edição
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Planos cadastrados</CardTitle>
          <CardDescription>
            {canWrite
              ? 'Inativar mantém o histórico dos clientes; o plano só some do dropdown de novos cadastros.'
              : 'Apenas administradores e gestores podem criar ou editar planos.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {plansQuery.isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
          {plansQuery.isError && (
            <div className="space-y-2">
              <p className="text-sm text-destructive">
                {describeError(plansQuery.error as { message?: string })}
              </p>
              <Button type="button" variant="outline" size="sm" onClick={() => void plansQuery.refetch()}>
                Tentar de novo
              </Button>
            </div>
          )}

          {!plansQuery.isLoading && plans.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhum plano cadastrado ainda.
            </p>
          )}

          <div className="space-y-2">
            {plans.map((p) => (
              <div
                key={p.id}
                className={`flex items-center justify-between gap-3 rounded-md border p-3 ${
                  p.active ? '' : 'opacity-60'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{p.name}</span>
                    <Badge variant={p.active ? 'active' : 'default'}>
                      {p.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrencyBRL(p.monthly_price)}/mês
                    {planSummary(p) && <span> · {planSummary(p)}</span>}
                  </p>
                </div>
                {canWrite && (
                  <div className="flex shrink-0 gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => startEdit(p)}>
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={toggleActive.isPending}
                      onClick={() => toggleActive.mutate(p)}
                    >
                      {p.active ? 'Inativar' : 'Reativar'}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function planSummary(p: PlanRow): string {
  const parts: string[] = []
  if (p.posts_feed_quota) parts.push(`${p.posts_feed_quota} feed`)
  if (p.posts_stories_quota) parts.push(`${p.posts_stories_quota} stories`)
  if (p.reels_quota) parts.push(`${p.reels_quota} reels`)
  if (p.paid_campaigns_quota) parts.push(`${p.paid_campaigns_quota} campanhas`)
  if (p.creative_pieces_quota) parts.push(`${p.creative_pieces_quota} peças`)
  if (p.includes_blog_posts) parts.push('blog')
  if (p.includes_seo) parts.push('SEO')
  if (p.includes_paid_traffic) parts.push('tráfego pago')
  return parts.join(', ')
}

function QuotaField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input type="number" min={0} value={value} onChange={(e) => onChange(e.target.value)} placeholder="0" />
    </div>
  )
}

function CheckField({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 rounded border-input"
      />
      {label}
    </label>
  )
}
