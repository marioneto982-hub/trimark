import { useState } from 'react'
import { Check, MessageSquare, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/lib/AuthContext'
import { usePortalApprovePost, usePortalAwaitingApproval } from '@/hooks/usePortal'
import { FORMAT_LABEL, PLATFORM_LABEL } from '@/hooks/usePosts'
import { formatDateBR } from '@/lib/format'

type Decision = 'approved' | 'rejected' | 'revision_requested'

export default function ApprovalsPage() {
  const { profile } = useAuth()
  const clientId = profile?.kind === 'client' ? profile.client_id : undefined
  const approverId = profile?.kind === 'client' ? profile.client_user_row_id : ''

  const { data: posts, isLoading, isError, error, refetch } = usePortalAwaitingApproval(clientId)
  const approve = usePortalApprovePost()

  const [activeFor, setActiveFor] = useState<{ postId: string; decision: Decision } | null>(null)
  const [comment, setComment] = useState('')
  const [serverError, setServerError] = useState<string | null>(null)

  if (profile?.kind !== 'client') return null

  async function submit(postId: string, decision: Decision) {
    setServerError(null)
    try {
      await approve.mutateAsync({
        postId,
        decision,
        comment: comment.trim() || null,
        approverClientUserId: approverId,
      })
      setActiveFor(null)
      setComment('')
      void refetch()
    } catch (err) {
      setServerError((err as Error).message)
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Aprovações pendentes</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Posts esperando sua decisão. Você pode aprovar, rejeitar, ou pedir revisão (PRD §6.2.2).
        </p>
      </header>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      {isError && <p className="text-sm text-destructive">Erro: {(error as Error).message}</p>}

      {posts && posts.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Nenhum post aguardando aprovação. 🎉
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {(posts ?? []).map((p) => {
          const expanded = activeFor?.postId === p.id
          return (
            <Card key={p.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">{p.title || '(sem título)'}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {p.platform ? PLATFORM_LABEL[p.platform] : '—'} ·{' '}
                      {p.format ? FORMAT_LABEL[p.format] : '—'} ·{' '}
                      {p.scheduled_at ? `agendado para ${formatDateBR(p.scheduled_at)}` : 'sem data'}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {p.copy_text && (
                  <p className="whitespace-pre-wrap text-sm bg-muted/40 rounded-md p-3 border">
                    {p.copy_text}
                  </p>
                )}
                {p.hashtags && p.hashtags.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {p.hashtags.map((h) => `#${h}`).join(' ')}
                  </p>
                )}

                {!expanded ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => submit(p.id, 'approved')}
                      disabled={approve.isPending}
                    >
                      <Check className="size-4 mr-1" /> Aprovar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => { setActiveFor({ postId: p.id, decision: 'revision_requested' }); setComment('') }}
                    >
                      <MessageSquare className="size-4 mr-1" /> Pedir revisão
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => { setActiveFor({ postId: p.id, decision: 'rejected' }); setComment('') }}
                    >
                      <X className="size-4 mr-1" /> Rejeitar
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 border-t pt-4">
                    <p className="text-sm font-medium">
                      {activeFor?.decision === 'rejected' ? 'Rejeitar este post' : 'Pedir revisão'}
                    </p>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Conte ao time o que precisa mudar…"
                      rows={3}
                    />
                    {serverError && <p className="text-sm text-destructive">{serverError}</p>}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => submit(p.id, activeFor!.decision)}
                        disabled={approve.isPending}
                      >
                        Confirmar
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => { setActiveFor(null); setComment('') }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
