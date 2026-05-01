import './App.css'

export default function App() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="max-w-2xl px-6 py-12 text-center space-y-4">
        <p className="text-sm uppercase tracking-widest text-primary font-medium">
          Trimark Agência
        </p>
        <h1 className="text-4xl md:text-5xl font-semibold text-foreground">
          Plataforma 360 — Marketing para Profissionais da Saúde
        </h1>
        <p className="text-muted-foreground">
          MVP em construção · Phase 0: scaffolding concluído.
          <br />
          Próximas fases: schema + RLS, módulos 1–7, portal do cliente.
        </p>
        <div className="pt-6 flex gap-3 justify-center">
          <a
            href="https://supabase.com/docs"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Supabase Docs
          </a>
          <a
            href="https://ui.shadcn.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            shadcn/ui
          </a>
        </div>
      </div>
    </main>
  )
}
