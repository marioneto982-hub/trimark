import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  HeartPulse,
  LineChart,
  MessageCircle,
  PencilLine,
  Rocket,
  Shield,
  Sparkles,
  Stethoscope,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// =============================================================================
// Trimark — Landing pública
// Inspiração visual: Prime2B (clean, generous whitespace, bold display headlines,
// pill CTAs com copy conversacional). Identidade: azul corporativo #1F4E79 +
// acento laranja warm. Voz: ética, respeitosa aos códigos de classe, focada em
// resultado mensurável.
// =============================================================================

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Header />
      <Hero />
      <Pillars />
      <Stats />
      <Services />
      <Specialties />
      <Process />
      <Manifesto />
      <FinalCTA />
      <Footer />
    </div>
  )
}

// -----------------------------------------------------------------------------
// Header
// -----------------------------------------------------------------------------
function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/60">
      <nav className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/logo-trimark.png"
            alt="Trimark"
            className="h-7 w-auto"
            width={120}
            height={28}
          />
          <span className="text-xs text-muted-foreground hidden sm:inline border-l pl-3 border-border">
            Agência 360 · Saúde
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm">
          <a href="#pilares" className="text-muted-foreground hover:text-foreground transition-colors">Pilares</a>
          <a href="#servicos" className="text-muted-foreground hover:text-foreground transition-colors">Serviços</a>
          <a href="#especialidades" className="text-muted-foreground hover:text-foreground transition-colors">Especialidades</a>
          <a href="#processo" className="text-muted-foreground hover:text-foreground transition-colors">Processo</a>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost" size="sm">Entrar</Button>
          </Link>
          <a href="#contato">
            <Button size="sm" className="rounded-full px-5">Vamos conversar</Button>
          </a>
        </div>
      </nav>
    </header>
  )
}

// -----------------------------------------------------------------------------
// Hero
// -----------------------------------------------------------------------------
function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* fundo decorativo sutil */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-32 -right-24 size-[480px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 size-[420px] rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_hsl(var(--border))_1px,_transparent_0)] [background-size:32px_32px] opacity-40" />
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Marketing 360 para profissionais da saúde
          </span>

          <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
            Da consulta ao consultório lotado.
            <br />
            <span className="text-primary">Marketing que respeita seu</span>{' '}
            <span className="relative inline-block">
              <span className="relative z-10">código de ética.</span>
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-accent/30 -z-0" />
            </span>
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
            Estratégia, conteúdo, tráfego pago, identidade visual, gestão de redes e
            relatórios — tudo dentro do que o seu conselho permite. CFM, CFO, CFP, CFN,
            COFFITO e demais resoluções respeitadas em cada peça publicada.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <a href="#contato">
              <Button size="lg" className="rounded-full px-7">
                Falar com um especialista
                <ArrowRight className="size-4 ml-2" />
              </Button>
            </a>
            <a href="#servicos">
              <Button size="lg" variant="outline" className="rounded-full px-7">
                Ver o que fazemos
              </Button>
            </a>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Aprovação de posts em 2 cliques · Cobrança automática no WhatsApp · Portal próprio para o cliente
          </p>
        </div>
      </div>
    </section>
  )
}

// -----------------------------------------------------------------------------
// 4 pilares (substitui o "Da inclusão à performance" do Prime2B)
// -----------------------------------------------------------------------------
const PILLARS = [
  {
    n: '01',
    icon: Shield,
    title: 'Ética inegociável',
    body:
      'Cada conteúdo é validado pelas resoluções CFM 2.336/2023, CFO 196/2019 e equivalentes antes de publicar. Sem promessa de resultado, sem antes/depois indevido.',
  },
  {
    n: '02',
    icon: Stethoscope,
    title: 'Especialização real',
    body:
      'Cardiologista não fala como dentista. Biblioteca de conteúdo curada por especialidade — 41 áreas atendidas, da clínica geral à harmonização orofacial.',
  },
  {
    n: '03',
    icon: Sparkles,
    title: 'Operação transparente',
    body:
      'Você aprova posts pelo portal em 2 cliques. Vê calendário, métricas, faturas e conversa direto com seu account manager pelo WhatsApp.',
  },
  {
    n: '04',
    icon: LineChart,
    title: 'Crescimento mensurável',
    body:
      'Relatório mensal em PDF mostra alcance, engajamento, novos seguidores e ROI das campanhas pagas. Sem vaidade — só o que vira agendamento.',
  },
] as const

function Pillars() {
  return (
    <section id="pilares" className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <SectionHeader
          eyebrow="Nossa filosofia"
          title="Quatro princípios. Zero atalhos."
          subtitle="O marketing para a saúde tem regras diferentes. A gente trabalha dentro delas — e tira o melhor de cada uma."
        />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-px bg-border/60 rounded-2xl overflow-hidden border border-border/60">
          {PILLARS.map(({ n, icon: Icon, title, body }) => (
            <article
              key={n}
              className="bg-background p-8 group hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-start justify-between mb-6">
                <Icon className="size-7 text-primary" strokeWidth={1.6} />
                <span className="text-xs font-mono text-muted-foreground/70">{n}</span>
              </div>
              <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

// -----------------------------------------------------------------------------
// Stats
// -----------------------------------------------------------------------------
const STATS = [
  { n: '41', label: 'especialidades atendidas' },
  { n: '60%', label: 'menos tempo em aprovações' },
  { n: '70%', label: 'redução de inadimplência' },
  { n: '< 30min', label: 'para onboarding completo' },
] as const

function Stats() {
  return (
    <section className="border-t border-border/60">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(({ n, label }) => (
            <div key={label}>
              <p className="text-3xl md:text-4xl font-semibold tracking-tight text-primary">{n}</p>
              <p className="mt-2 text-sm text-muted-foreground leading-snug">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// -----------------------------------------------------------------------------
// Serviços (grid)
// -----------------------------------------------------------------------------
const SERVICES = [
  { icon: PencilLine,    title: 'Gestão de redes',    body: 'Feed, stories, reels e LinkedIn. Pauta semanal, edição, publicação e engajamento.' },
  { icon: Rocket,        title: 'Tráfego pago',       body: 'Meta Ads e Google Ads para captação local de pacientes, com criativos próprios.' },
  { icon: HeartPulse,    title: 'Conteúdo educativo', body: 'Artigos, carrosséis e vídeos curtos que constroem autoridade na sua especialidade.' },
  { icon: Sparkles,      title: 'Identidade visual',  body: 'Branding, paleta, tipografia e templates. Consultório com cara de consultório sério.' },
  { icon: CalendarCheck, title: 'Calendário editorial', body: 'Datas comemorativas da saúde + planejamento de 30/60/90 dias por especialidade.' },
  { icon: LineChart,     title: 'SEO local',          body: 'Google Meu Negócio otimizado, reviews, e site responsivo que aparece em "perto de mim".' },
  { icon: MessageCircle, title: 'Atendimento WhatsApp', body: 'Padronização de respostas, automações e gestão da fila de mensagens.' },
  { icon: Users,         title: 'Posicionamento',     body: 'Quem você quer atender, como quer ser lembrado, qual sua tese — antes de qualquer post.' },
] as const

function Services() {
  return (
    <section id="servicos" className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <SectionHeader
          eyebrow="O que entregamos"
          title="Uma agência. Tudo que seu consultório precisa."
          subtitle="Não terceirizamos a operação. Designer, gestor de tráfego, copywriter e account manager trabalham juntos no seu projeto."
        />

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SERVICES.map(({ icon: Icon, title, body }) => (
            <article
              key={title}
              className="rounded-xl border border-border bg-background p-6 hover:border-primary/40 hover:shadow-sm transition-all"
            >
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="size-5 text-primary" strokeWidth={1.8} />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

// -----------------------------------------------------------------------------
// Especialidades atendidas
// -----------------------------------------------------------------------------
const SPECIALTY_GROUPS = [
  { name: 'Medicina',        items: ['Cardiologia','Dermatologia','Pediatria','Ortopedia','Psiquiatria','Endocrinologia','Cirurgia Plástica','Medicina Estética','+6 outras'] },
  { name: 'Odontologia',     items: ['Ortodontia','Implantodontia','Endodontia','Estética & Harmonização Orofacial','+3 outras'] },
  { name: 'Psicologia',      items: ['Clínica','Infantil','Casal e Família'] },
  { name: 'Nutrição',        items: ['Clínica','Esportiva','Materno-Infantil'] },
  { name: 'Fisioterapia',    items: ['Ortopédica','Esportiva','Neurofuncional','Pilates / RPG'] },
  { name: 'Mais áreas',      items: ['Veterinária','Fonoaudiologia','Biomedicina','Farmácia','Enfermagem'] },
] as const

function Specialties() {
  return (
    <section id="especialidades" className="border-t border-border/60">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <SectionHeader
          eyebrow="Quem atendemos"
          title="41 especialidades. Cada uma com sua linguagem."
          subtitle="Não falamos da sua área genericamente. Conhecemos a resolução do seu conselho e o tom que constrói confiança no seu paciente."
        />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SPECIALTY_GROUPS.map((g) => (
            <div key={g.name} className="rounded-xl border border-border bg-background p-6">
              <h3 className="font-semibold text-primary">{g.name}</h3>
              <ul className="mt-3 space-y-1.5">
                {g.items.map((it) => (
                  <li key={it} className="text-sm text-muted-foreground flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// -----------------------------------------------------------------------------
// Como funciona (processo)
// -----------------------------------------------------------------------------
const STEPS = [
  {
    n: '01',
    title: 'Diagnóstico em 30 minutos',
    body: 'Conversamos sobre seu consultório, posicionamento atual e onde você quer chegar. Sem custo, sem compromisso.',
  },
  {
    n: '02',
    title: 'Plano e contrato',
    body: 'Você escolhe um plano (Bronze, Prata, Ouro ou Diamante). Em até 30 minutos do aceite, está tudo configurado.',
  },
  {
    n: '03',
    title: 'Operação rolando',
    body: 'Equipe sobe o calendário do mês, você aprova pelo portal, a gente publica. Cobrança automática toda mês no WhatsApp.',
  },
  {
    n: '04',
    title: 'Resultado mensurável',
    body: 'Relatório no início de cada mês mostra o que cresceu e o que vamos ajustar. Reunião quinzenal com seu account manager.',
  },
] as const

function Process() {
  return (
    <section id="processo" className="border-t border-border/60 bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary-foreground/70">
            Como funciona
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
            De zero ao consultório lotado em 4 passos.
          </h2>
          <p className="mt-4 text-primary-foreground/80">
            Onboarding sem fricção. Você cuida dos pacientes, a gente cuida do funil.
          </p>
        </div>

        <ol className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map(({ n, title, body }) => (
            <li key={n} className="bg-primary-foreground/10 rounded-xl p-6 backdrop-blur-sm border border-primary-foreground/10">
              <span className="text-xs font-mono text-primary-foreground/60">{n}</span>
              <h3 className="mt-2 font-semibold text-lg">{title}</h3>
              <p className="mt-2 text-sm text-primary-foreground/80 leading-relaxed">{body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

// -----------------------------------------------------------------------------
// Manifesto — carrossel scroll-snap com 5 slides
// -----------------------------------------------------------------------------
const MANIFESTO_SLIDES = [
  { src: '/manifesto/1.png', alt: 'Quem é bem posicionado não precisa disputar atenção' },
  { src: '/manifesto/2.png', alt: 'Você pode até estar presente nas redes, mas isso não garante reconhecimento' },
  { src: '/manifesto/3.png', alt: 'Foi aí que nasceu a Trimark — Clareza · Resposta · Direção' },
  { src: '/manifesto/4.png', alt: 'Enquanto o mercado insiste em volume e fórmulas prontas, nós escolhemos outro caminho' },
  { src: '/manifesto/5.png', alt: 'Pensar, estruturar e construir marcas com estratégia de verdade' },
] as const

function Manifesto() {
  return (
    <section className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
            Manifesto
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
            Por que a Trimark{' '}
            <span className="text-primary">existe.</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Enquanto o mercado insiste em volume, tendências e fórmulas prontas,
            nós escolhemos outro caminho — clareza, resposta e direção.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Arraste para o lado para ler o manifesto completo →
          </p>
        </div>

        {/* Carrossel scroll-snap horizontal — comportamento Instagram */}
        <div className="mt-10 -mx-6 sm:mx-0">
          <div
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-6 px-6 sm:px-0 scrollbar-thin"
            style={{ scrollbarWidth: 'thin' }}
          >
            {MANIFESTO_SLIDES.map((s, i) => (
              <figure
                key={s.src}
                className="snap-center shrink-0 w-[260px] sm:w-[320px] md:w-[360px] rounded-2xl overflow-hidden border border-border bg-background shadow-sm"
              >
                <img
                  src={s.src}
                  alt={s.alt}
                  className="w-full h-auto block aspect-[4/5] object-cover"
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
              </figure>
            ))}
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground italic">
          “Quem é bem posicionado não precisa disputar atenção.”
        </p>
      </div>
    </section>
  )
}

// -----------------------------------------------------------------------------
// CTA final
// -----------------------------------------------------------------------------
function FinalCTA() {
  return (
    <section id="contato" className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-4xl px-6 py-20 md:py-28">
        <div className="rounded-3xl bg-background border border-border p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute -top-20 -right-20 size-72 rounded-full bg-accent/15 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 size-72 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Pronto pra parar de improvisar seu marketing?
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              30 minutos, sem compromisso. A gente analisa seu posicionamento atual e mostra
              o que muda nos primeiros 90 dias.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://wa.me/5500000000000?text=Quero%20conversar%20sobre%20a%20Trimark"
                target="_blank"
                rel="noreferrer"
              >
                <Button size="lg" className="rounded-full px-8">
                  <MessageCircle className="size-4 mr-2" />
                  Falar no WhatsApp
                </Button>
              </a>
              <a href="mailto:contato@trimark.com.br">
                <Button size="lg" variant="outline" className="rounded-full px-8">
                  contato@trimark.com.br
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// -----------------------------------------------------------------------------
// Footer
// -----------------------------------------------------------------------------
function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div className="col-span-2 md:col-span-1">
            <img src="/logo-trimark.png" alt="Trimark" className="h-7 w-auto" />
            <p className="mt-3 text-muted-foreground">
              Agência 360 de marketing para profissionais da saúde.
            </p>
          </div>
          <div>
            <p className="font-semibold mb-3">Produto</p>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#servicos" className="hover:text-foreground">Serviços</a></li>
              <li><a href="#especialidades" className="hover:text-foreground">Especialidades</a></li>
              <li><a href="#processo" className="hover:text-foreground">Processo</a></li>
              <li><Link to="/login" className="hover:text-foreground">Acessar plataforma</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-3">Contato</p>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="mailto:contato@trimark.com.br" className="hover:text-foreground">contato@trimark.com.br</a></li>
              <li><a href="#contato" className="hover:text-foreground">WhatsApp</a></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-3">Compliance</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>CFM 2.336/2023</li>
              <li>CFO 196/2019</li>
              <li>LGPD</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Trimark. Todos os direitos reservados.</p>
          <p>Marketing 360 · Saúde · Ético por padrão.</p>
        </div>
      </div>
    </footer>
  )
}

// -----------------------------------------------------------------------------
// SectionHeader (reuso interno)
// -----------------------------------------------------------------------------
function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string
  title: string
  subtitle?: string
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">{title}</h2>
      {subtitle && <p className="mt-4 text-muted-foreground">{subtitle}</p>}
    </div>
  )
}
