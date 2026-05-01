import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  title: string
  prdRef: string
  bullets?: string[]
}

export function PlaceholderPage({ title, prdRef, bullets }: Props) {
  return (
    <div className="p-8 max-w-4xl">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Em construção
        </p>
        <h1 className="text-2xl font-semibold mt-1">{title}</h1>
      </header>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Próximas implementações</CardTitle>
          <CardDescription>{prdRef}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          {(bullets ?? ['Esta seção será implementada nas próximas fases do roadmap.']).map((b) => (
            <p key={b}>• {b}</p>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
