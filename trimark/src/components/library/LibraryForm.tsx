import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  CONTENT_TYPE_LABEL,
  DIFFICULTY_LABEL,
  type Difficulty,
  type LibraryContentType,
  type LibraryRow,
  type LibraryWritePayload,
} from '@/hooks/useLibrary'
import { useSpecialties } from '@/hooks/useSpecialties'

interface Props {
  initial?: Partial<LibraryRow>
  agencyId: string
  userRowId?: string
  submitLabel: string
  onSubmit: (payload: LibraryWritePayload) => Promise<void> | void
  onCancel?: () => void
  isSubmitting?: boolean
}

export function LibraryForm({
  initial, agencyId, userRowId, submitLabel, onSubmit, onCancel, isSubmitting,
}: Props) {
  const { data: specialties } = useSpecialties()
  const [title, setTitle] = useState(initial?.title ?? '')
  const [contentType, setContentType] = useState<LibraryContentType>(
    (initial?.content_type as LibraryContentType) ?? 'post_idea',
  )
  const [specialtyIds, setSpecialtyIds] = useState<string[]>(initial?.specialty_ids ?? [])
  const [category, setCategory] = useState(initial?.category ?? '')
  const [bodyMd, setBodyMd] = useState(initial?.body_markdown ?? '')
  const [suggestedCopy, setSuggestedCopy] = useState(initial?.suggested_copy ?? '')
  const [hashtags, setHashtags] = useState((initial?.suggested_hashtags ?? []).join(' '))
  const [suggestedFormat, setSuggestedFormat] = useState(initial?.suggested_format ?? '')
  const [externalLink, setExternalLink] = useState(initial?.external_link ?? '')
  const [relevantDate, setRelevantDate] = useState(initial?.relevant_date ?? '')
  const [difficulty, setDifficulty] = useState<Difficulty | ''>((initial?.difficulty as Difficulty) ?? '')
  const [ethicsNotes, setEthicsNotes] = useState(initial?.ethics_notes ?? '')
  const [ethicsCompliant, setEthicsCompliant] = useState(initial?.ethics_compliant ?? true)
  const [published, setPublished] = useState(initial?.published ?? false)
  const [error, setError] = useState<string | null>(null)

  function toggleSpecialty(id: string) {
    setSpecialtyIds((cur) => cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id])
  }

  async function handle(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!title.trim()) { setError('Título é obrigatório.'); return }
    if (specialtyIds.length === 0) { setError('Selecione ao menos uma especialidade.'); return }

    const tags = hashtags.split(/[\s,]+/).map((t) => t.trim().replace(/^#/, '')).filter(Boolean)

    const payload: LibraryWritePayload = {
      agency_id: agencyId,
      title: title.trim(),
      content_type: contentType,
      specialty_ids: specialtyIds,
      category: category.trim() || null,
      body_markdown: bodyMd || null,
      suggested_copy: suggestedCopy || null,
      suggested_hashtags: tags.length ? tags : null,
      suggested_format: suggestedFormat || null,
      external_link: externalLink || null,
      relevant_date: relevantDate || null,
      difficulty: (difficulty || null) as Difficulty | null,
      ethics_compliant: ethicsCompliant,
      ethics_notes: ethicsNotes || null,
      published,
      created_by: userRowId ?? null,
    }
    try { await onSubmit(payload) } catch (err) { setError((err as Error).message) }
  }

  return (
    <form onSubmit={handle} className="space-y-5 max-w-3xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Título *</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="ct">Tipo *</Label>
          <Select id="ct" value={contentType} onChange={(e) => setContentType(e.target.value as LibraryContentType)}>
            {(Object.keys(CONTENT_TYPE_LABEL) as LibraryContentType[]).map((t) => (
              <option key={t} value={t}>{CONTENT_TYPE_LABEL[t]}</option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label>Especialidades aplicáveis *</Label>
        <div className="flex flex-wrap gap-2 mt-1 max-h-40 overflow-y-auto rounded-md border p-2">
          {(specialties ?? []).map((s) => (
            <label key={s.id} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border bg-background hover:bg-muted/40 cursor-pointer">
              <input
                type="checkbox"
                checked={specialtyIds.includes(s.id)}
                onChange={() => toggleSpecialty(s.id)}
              />
              {s.name}
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="category">Categoria</Label>
          <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="prevenção, novidades…" />
        </div>
        <div>
          <Label htmlFor="format">Formato sugerido</Label>
          <Input id="format" value={suggestedFormat} onChange={(e) => setSuggestedFormat(e.target.value)} placeholder="reels, carrossel…" />
        </div>
        <div>
          <Label htmlFor="diff">Dificuldade</Label>
          <Select id="diff" value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}>
            <option value="">—</option>
            {(Object.keys(DIFFICULTY_LABEL) as Difficulty[]).map((d) => (
              <option key={d} value={d}>{DIFFICULTY_LABEL[d]}</option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="copy">Copy sugerida</Label>
        <Textarea id="copy" rows={4} value={suggestedCopy} onChange={(e) => setSuggestedCopy(e.target.value)} />
      </div>

      <div>
        <Label htmlFor="tags">Hashtags sugeridas</Label>
        <Input id="tags" value={hashtags} onChange={(e) => setHashtags(e.target.value)} placeholder="#saude #cardiologia" />
      </div>

      <div>
        <Label htmlFor="md">Conteúdo (markdown)</Label>
        <Textarea id="md" rows={6} value={bodyMd} onChange={(e) => setBodyMd(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="link">Link externo</Label>
          <Input id="link" type="url" value={externalLink} onChange={(e) => setExternalLink(e.target.value)} placeholder="https://…" />
        </div>
        <div>
          <Label htmlFor="rel">Data relevante</Label>
          <Input id="rel" type="date" value={relevantDate} onChange={(e) => setRelevantDate(e.target.value)} />
        </div>
      </div>

      <div className="space-y-2 rounded-md border p-3">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Conformidade ética</Label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={ethicsCompliant} onChange={(e) => setEthicsCompliant(e.target.checked)} />
          Confere com o código de ética da especialidade (CFM/CFO/CFP/etc).
        </label>
        <Textarea
          rows={2}
          value={ethicsNotes}
          onChange={(e) => setEthicsNotes(e.target.value)}
          placeholder="Notas de compliance (opcional)"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
        Publicar (clientes verão no portal)
      </label>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando…' : submitLabel}</Button>
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>}
      </div>
    </form>
  )
}
