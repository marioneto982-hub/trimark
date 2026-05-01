import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useClients } from '@/hooks/useClients'
import {
  POST_STATUS_LABEL,
  PLATFORM_LABEL,
  FORMAT_LABEL,
  type PostRow,
  type PostWritePayload,
} from '@/hooks/usePosts'
import type { Platform, PostFormat, PostStatus } from '@/types'

interface Props {
  initial?: Partial<PostRow>
  defaultDate?: string // YYYY-MM-DD
  agencyId: string
  userRowId?: string
  submitLabel: string
  onSubmit: (payload: PostWritePayload) => Promise<void> | void
  onCancel?: () => void
  isSubmitting?: boolean
}

function toLocalDateTimeInputValue(iso: string | null | undefined, fallbackDate?: string): string {
  if (iso) {
    const d = new Date(iso)
    if (!Number.isNaN(d.getTime())) {
      const off = d.getTimezoneOffset() * 60_000
      return new Date(d.getTime() - off).toISOString().slice(0, 16)
    }
  }
  if (fallbackDate) return `${fallbackDate}T09:00`
  return ''
}

export function PostForm({
  initial,
  defaultDate,
  agencyId,
  userRowId,
  submitLabel,
  onSubmit,
  onCancel,
  isSubmitting,
}: Props) {
  const { data: clients } = useClients({ status: 'active' })
  const [clientId, setClientId] = useState(initial?.client_id ?? '')
  const [title, setTitle] = useState(initial?.title ?? '')
  const [copyText, setCopyText] = useState(initial?.copy_text ?? '')
  const [hashtags, setHashtags] = useState((initial?.hashtags ?? []).join(' '))
  const [platform, setPlatform] = useState<Platform | ''>((initial?.platform as Platform) ?? '')
  const [format, setFormat] = useState<PostFormat | ''>((initial?.format as PostFormat) ?? '')
  const [scheduledAt, setScheduledAt] = useState(
    toLocalDateTimeInputValue(initial?.scheduled_at, defaultDate),
  )
  const [status, setStatus] = useState<PostStatus>((initial?.status as PostStatus) ?? 'draft')
  const [error, setError] = useState<string | null>(null)

  // Pre-seleciona primeiro cliente ativo se vazio (criação nova)
  useEffect(() => {
    if (!clientId && clients && clients.length > 0) {
      setClientId(clients[0].id)
    }
  }, [clients, clientId])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!clientId) {
      setError('Selecione um cliente.')
      return
    }
    const tags = hashtags
      .split(/[\s,]+/)
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean)

    const payload: PostWritePayload = {
      agency_id: agencyId,
      client_id: clientId,
      title: title || null,
      copy_text: copyText || null,
      hashtags: tags.length ? tags : null,
      platform: (platform || null) as Platform | null,
      format: (format || null) as PostFormat | null,
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      status,
      created_by: userRowId ?? null,
    }

    try {
      await onSubmit(payload)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="client">Cliente *</Label>
          <Select id="client" value={clientId} onChange={(e) => setClientId(e.target.value)}>
            <option value="">— selecione —</option>
            {(clients ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.trade_name ?? c.full_name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select id="status" value={status} onChange={(e) => setStatus(e.target.value as PostStatus)}>
            {(Object.keys(POST_STATUS_LABEL) as PostStatus[]).map((s) => (
              <option key={s} value={s}>{POST_STATUS_LABEL[s]}</option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="title">Título interno</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Identificador do post (opcional)" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="platform">Plataforma</Label>
          <Select id="platform" value={platform} onChange={(e) => setPlatform(e.target.value as Platform)}>
            <option value="">—</option>
            {(Object.keys(PLATFORM_LABEL) as Platform[]).map((p) => (
              <option key={p} value={p}>{PLATFORM_LABEL[p]}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="format">Formato</Label>
          <Select id="format" value={format} onChange={(e) => setFormat(e.target.value as PostFormat)}>
            <option value="">—</option>
            {(Object.keys(FORMAT_LABEL) as PostFormat[]).map((f) => (
              <option key={f} value={f}>{FORMAT_LABEL[f]}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="scheduled_at">Data/hora prevista</Label>
          <Input
            id="scheduled_at"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="copy">Copy</Label>
        <Textarea
          id="copy"
          rows={6}
          value={copyText}
          onChange={(e) => setCopyText(e.target.value)}
          placeholder="Texto do post…"
        />
      </div>

      <div>
        <Label htmlFor="hashtags">Hashtags</Label>
        <Input
          id="hashtags"
          value={hashtags}
          onChange={(e) => setHashtags(e.target.value)}
          placeholder="#saude #cardiologia (separe por espaço ou vírgula)"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando…' : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}
