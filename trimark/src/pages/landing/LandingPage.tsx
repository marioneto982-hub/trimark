import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Factory,
  GraduationCap,
  Headset,
  HeartPulse,
  Layers,
  LineChart,
  Megaphone,
  MessageCircle,
  Repeat,
  ShoppingBag,
  Sparkles,
  Target,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/shared/Reveal'
import IntroAnimation from '@/components/shared/IntroAnimation'
import { CountUp } from '@/hooks/useCountUp'
import { cn } from '@/lib/utils'

// =============================================================================
// Trimark — Landing pública v3 (multi-setorial) — reposicionamento 2026
// Reposicionamento: de "marketing 360 para a saúde" para AGÊNCIA HÍBRIDA
// (marketing + tecnologia) multi-setorial. Saúde vira vertical-âncora.
// Modelo: plataforma horizontal de capacidades + verticais de mercado.
// Mantém identidade Trimark (navy #1B2D5C + acento) e os primitivos existentes
// (Reveal, IntroAnimation, CountUp, Button). Respeita prefers-reduced-motion.
// =============================================================================

export default function LandingPage() {
  const [introDone, setIntroDone] = useState(false)

  return (
    <>
      {!introDone && <IntroAnimation onComplete={() => setIntroDone(true)} />}
      <div
        className="min-h-screen bg-background text-foreground antialiased overflow-x-hidden"
        style={{
          opacity: introDone ? 1 : 0,
          transition: 'opacity 0.6s ease-out',
        }}
      >
        <Header />
        <Hero />
        <Marquee />
        <Pillars />
        <Stats />
        <Capabilities />
        <Model />
        <Verticals />
        <Process />
        <Pricing />
        <Manifesto />
        <Founders />
        <FinalCTA />
        <Footer />
      </div>
    </>
  )
}

// -----------------------------------------------------------------------------
// Header
// -----------------------------------------------------------------------------
function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/85 border-b border-border/60">
      <nav className="mx-auto max-w-6xl px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/logo-trimark.png"
            alt="Trimark"
            className="h-10 w-auto transition-transform group-hover:scale-105"
            width={160}
            height={40}
          />
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="#capacidades" className="text-muted-foreground hover:text-foreground transition-colors">O que fazemos</a>
          <a href="#modelo" className="text-muted-foreground hover:text-foreground transition-colors">Modelo</a>
          <a href="#setores" className="text-muted-foreground hover:text-foreground transition-colors">Setores</a>
          <a href="#diferenciais" className="text-muted-foreground hover:text-foreground transition-colors">Por que a Trimark</a>
          <a href="#processo" className="text-muted-foreground hover:text-foreground transition-colors">Processo</a>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost" size="sm">Entrar</Button>
          </Link>
          <a href="#contato" className="hidden sm:block">
            <Button size="sm" className="rounded-full px-5 group">
              Vamos conversar
              <ArrowRight className="size-3.5 ml-1.5 transition-transform group-hover:translate-x-0.5" />
            </Button>
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
    <section className="relative overflow-hidden bg-mesh">
      <div className="absolute inset-0 -z-10 bg-dots opacity-30" />
      <div className="pointer-events-none absolute -top-40 -right-32 size-[520px] rounded-full bg-primary/10 blur-3xl animate-blob -z-10" />
      <div className="pointer-events-none absolute -bottom-40 -left-32 size-[480px] rounded-full bg-accent/15 blur-3xl animate-blob -z-10" style={{ animationDelay: '6s' }} />

      <div className="mx-auto max-w-6xl px-6 pt-16 pb-24 md:pt-24 md:pb-32 text-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Agência híbrida · Marketing + Tecnologia
          </span>
        </Reveal>

        <Reveal delay={120}>
          <img
            src="/logo-trimark.png"
            alt="Trimark"
            className="mx-auto mt-8 h-32 sm:h-44 md:h-56 lg:h-64 w-auto drop-shadow-sm"
            width={640}
            height={256}
          />
        </Reveal>

        <Reveal delay={220}>
          <h1 className="mt-10 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05] text-balance max-w-4xl mx-auto">
            Marketing de resultado e{' '}
            <span className="text-primary">tecnologia proprietária.</span>
            <br />
            Para{' '}
            <span className="relative inline-block">
              <span className="relative z-10">qualquer setor.</span>
              <span className="absolute bottom-1 left-0 right-0 h-3 md:h-4 bg-accent/40 -z-0 -skew-x-3" />
            </span>
          </h1>
        </Reveal>

        <Reveal delay={320}>
          <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A Trimark une estratégia, performance e software sob medida numa única
            parceria — com a profundidade de um especialista no seu setor e a escala
            de uma plataforma.
          </p>
        </Reveal>

        <Reveal delay={420}>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="#contato">
              <Button size="lg" className="rounded-full px-8 h-12 text-base group shadow-lg shadow-primary/20">
                Crescer com previsibilidade
                <ArrowRight className="size-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </a>
            <a href="#modelo">
              <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base bg-background/60 backdrop-blur">
                Como funciona
              </Button>
            </a>
          </div>
        </Reveal>

        <Reveal delay={520}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              Especialista por setor
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              Tecnologia proprietária
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              Resultado mensurável
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// -----------------------------------------------------------------------------
// Marquee — setores
// -----------------------------------------------------------------------------
const MARQUEE_ITEMS = [
  'Saúde', 'Varejo & E-commerce', 'Serviços & B2B', 'Imobiliário', 'Educação',
  'Indústria', 'Advocacia', 'Automotivo', 'Food & Beverage', 'Tecnologia',
] as const

function Marquee() {
  return (
    <section className="border-y border-border/60 bg-primary text-primary-foreground py-5 overflow-hidden">
      <div className="marquee-track flex items-center gap-12 whitespace-nowrap">
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
          <span key={i} className="flex items-center gap-12 text-base font-medium tracking-tight">
            {item}
            <span className="size-1.5 rounded-full bg-accent shrink-0" />
          </span>
        ))}
      </div>
    </section>
  )
}

// -----------------------------------------------------------------------------
// Pillars — Por que a Trimark
// -----------------------------------------------------------------------------
const PILLARS = [
  { n: '01', icon: Target,  title: 'Especialista, não generalista', body: 'Você é atendido por uma vertical que conhece a linguagem, as regras e os clientes do seu setor. Profundidade, não superfície.' },
  { n: '02', icon: Cpu,     title: 'Tecnologia proprietária',       body: 'Construímos software, automações e IA próprios — não só campanha. Isso vira seu diferencial competitivo e gera recorrência.' },
  { n: '03', icon: LineChart, title: 'Resultado mensurável',        body: 'Trabalhamos com metas de negócio — CPL, CPA, ROAS, vendas — e relatórios transparentes. Sem métrica de vaidade.' },
  { n: '04', icon: Layers,  title: 'Parceria integrada',            body: 'Estratégia, execução e tecnologia sob um mesmo teto e uma única conta. Acabou o malabarismo com vários fornecedores.' },
] as const

function Pillars() {
  return (
    <section id="diferenciais" className="bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <Reveal>
          <SectionHeader
            eyebrow="Por que a Trimark"
            title="O que nos separa de uma agência comum."
            subtitle="Agência tradicional só executa marketing. Fábrica de software só programa. A Trimark faz as duas coisas — orientada a resultado."
          />
        </Reveal>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-px bg-border/60 rounded-2xl overflow-hidden border border-border/60">
          {PILLARS.map(({ n, icon: Icon, title, body }, i) => (
            <Reveal key={n} delay={i * 80} as="article" className="bg-background p-8 md:p-10 group hover:bg-muted/50 transition-colors duration-500 relative">
              <div className="flex items-start justify-between mb-6">
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all">
                  <Icon className="size-6 text-primary group-hover:text-primary-foreground transition-colors" strokeWidth={1.6} />
                </div>
                <span className="text-xs font-mono text-muted-foreground/70">{n}</span>
              </div>
              <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">{body}</p>
            </Reveal>
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
  { n: '6',    label: 'setores atendidos' },
  { n: '5',    label: 'capacidades integradas' },
  { n: '4',    label: 'modelos de parceria' },
  { n: '100%', label: 'orientado a dados e metas' },
] as const

function Stats() {
  return (
    <section className="border-y border-border/60 bg-background">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-left">
          {STATS.map(({ n, label }, i) => (
            <Reveal key={label} delay={i * 100}>
              <p className="text-4xl md:text-5xl font-semibold tracking-tight text-primary">
                <CountUp to={n} />
              </p>
              <p className="mt-2 text-sm text-muted-foreground leading-snug">{label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// -----------------------------------------------------------------------------
// Capabilities — o que fazemos
// -----------------------------------------------------------------------------
const CAPABILITIES = [
  { icon: Target,    title: 'Estratégia & Dados',      body: 'Posicionamento, pesquisa, inteligência de mercado e BI. Decisões por números, não por achismo.' },
  { icon: Sparkles,  title: 'Criação & Conteúdo',      body: 'Branding, design e produção de conteúdo que constroem marca e geram demanda.' },
  { icon: Megaphone, title: 'Performance & Mídia',     body: 'Tráfego pago, SEO, CRM e automação de marketing com meta de aquisição e retorno.' },
  { icon: Cpu,       title: 'Tecnologia & Produto',    body: 'Software sob medida, automações e IA que ampliam o resultado e viram diferencial seu.' },
  { icon: Headset,   title: 'Sucesso do Cliente',      body: 'Gestão de contas, processos e qualidade que mantêm a entrega previsível, mês após mês.' },
] as const

function Capabilities() {
  return (
    <section id="capacidades">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <Reveal>
          <SectionHeader
            eyebrow="O que fazemos"
            title="Cinco capacidades. Uma conta. Resultado integrado."
            subtitle="Em vez de juntar fornecedores soltos, você tem estratégia, criação, mídia e tecnologia operando como um time só."
          />
        </Reveal>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CAPABILITIES.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 60}>
              <article className="h-full rounded-2xl border border-border bg-background p-6 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 group">
                <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary transition-colors">
                  <Icon className="size-5 text-primary group-hover:text-primary-foreground transition-colors" strokeWidth={1.8} />
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
              </article>
            </Reveal>
          ))}
          <Reveal delay={360}>
            <article className="h-full rounded-2xl bg-primary text-primary-foreground p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-lg">Tudo conectado</h3>
                <p className="mt-2 text-sm text-primary-foreground/80 leading-relaxed">
                  As cinco capacidades trabalham juntas sobre a mesma estratégia e os mesmos dados.
                </p>
              </div>
              <a href="#contato" className="mt-5">
                <Button size="sm" variant="secondary" className="rounded-full bg-background text-foreground hover:bg-background/95 group">
                  Começar
                  <ArrowRight className="size-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
                </Button>
              </a>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

// -----------------------------------------------------------------------------
// Model — plataforma horizontal + verticais
// -----------------------------------------------------------------------------
const VERTICAL_CHIPS = ['Saúde', 'Varejo & E-commerce', 'Serviços & B2B', 'Imobiliário', 'Educação', 'Indústria'] as const
const PLATFORM_CHIPS = ['Estratégia & Dados', 'Criação & Conteúdo', 'Performance & Mídia', 'Tecnologia & Produto', 'Sucesso do Cliente'] as const

function Model() {
  return (
    <section id="modelo" className="bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <Reveal>
          <SectionHeader
            eyebrow="Nosso modelo"
            title="Especialista no seu setor. Eficiente como plataforma."
            subtitle="Funcionamos como os grandes grupos do mercado: uma base de capacidades que serve todos os clientes, com verticais que dominam a fundo cada setor."
          />
        </Reveal>

        <div className="mt-14 space-y-4">
          <Reveal>
            <div className="rounded-2xl border border-border bg-background p-6 md:p-8">
              <div className="flex items-center gap-2 mb-4">
                <Target className="size-5 text-primary" />
                <h3 className="font-semibold text-lg">Verticais de mercado</h3>
                <span className="text-sm text-muted-foreground">— conhecimento de domínio</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {VERTICAL_CHIPS.map((c) => (
                  <span key={c} className="text-sm font-medium px-4 py-2 rounded-full bg-muted/60 border border-border text-foreground/90">{c}</span>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <p className="text-center text-xs font-semibold tracking-widest uppercase text-primary">▼ &nbsp; acionam &nbsp; ▼</p>
          </Reveal>

          <Reveal delay={120}>
            <div className="rounded-2xl bg-primary text-primary-foreground p-6 md:p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-dots opacity-[0.06]" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="size-5" />
                  <h3 className="font-semibold text-lg">Plataforma de capacidades — núcleo compartilhado</h3>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {PLATFORM_CHIPS.map((c) => (
                    <span key={c} className="text-sm font-medium px-4 py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20">{c}</span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

// -----------------------------------------------------------------------------
// Verticals — setores que atendemos
// -----------------------------------------------------------------------------
const VERTICALS: { icon: typeof HeartPulse; tag: string; live: boolean; title: string; body: string; ethics?: string }[] = [
  { icon: HeartPulse,    tag: 'Vertical-âncora', live: true,  title: 'Saúde',                body: 'Marketing 360 para médicos, dentistas, psicólogos e clínicas — onde nasceu a Trimark.', ethics: 'Ética inegociável: conteúdo validado pelas resoluções CFM, CFO, CFP, CFN e COFFITO antes de publicar.' },
  { icon: ShoppingBag,   tag: 'Ativo',           live: true,  title: 'Varejo & E-commerce',  body: 'Aquisição, recompra e CRM. Performance ligada direto à venda e ao ticket médio.' },
  { icon: Briefcase,     tag: 'Ativo',           live: true,  title: 'Serviços & B2B',       body: 'Geração de leads qualificados e nutrição para ciclos de venda mais longos e consultivos.' },
  { icon: Building2,     tag: 'Em expansão',     live: false, title: 'Imobiliário & Construção', body: 'Captação de leads para lançamentos, CRM de funil e automação de relacionamento.' },
  { icon: GraduationCap, tag: 'Em expansão',     live: false, title: 'Educação',             body: 'Captação e matrícula, jornada do aluno e conteúdo que constrói autoridade.' },
  { icon: Factory,       tag: 'Em expansão',     live: false, title: 'Indústria',            body: 'Marketing técnico B2B, geração de demanda e projetos de tecnologia sob medida.' },
]

function Verticals() {
  return (
    <section id="setores">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <Reveal>
          <SectionHeader
            eyebrow="Setores que atendemos"
            title="Cada cliente, atendido por quem entende do seu mercado."
            subtitle="A especialização que construímos na saúde agora se aplica a vários setores — com a mesma profundidade."
          />
        </Reveal>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {VERTICALS.map(({ icon: Icon, tag, live, title, body, ethics }, i) => (
            <Reveal key={title} delay={i * 80}>
              <article className="relative rounded-2xl border border-border bg-background p-6 h-full hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300">
                <span className={cn(
                  'absolute top-5 right-5 text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full',
                  live ? 'bg-emerald-500/15 text-emerald-600' : 'bg-muted text-muted-foreground',
                )}>
                  {tag}
                </span>
                <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="size-5 text-primary" strokeWidth={1.8} />
                </div>
                <h3 className="font-semibold text-lg">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
                {ethics && (
                  <p className="mt-4 text-xs text-primary bg-muted/60 border-l-2 border-accent pl-3 py-2 rounded-r-lg leading-relaxed">
                    {ethics}
                  </p>
                )}
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200}>
          <p className="mt-10 text-center text-muted-foreground">
            Seu setor não está aqui?{' '}
            <a href="#contato" className="text-primary font-medium hover:underline">Fale com a gente</a>
            {' '}— atendemos novos mercados quando há fit.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

// -----------------------------------------------------------------------------
// Process
// -----------------------------------------------------------------------------
const STEPS = [
  { n: '01', title: 'Diagnóstico & Estratégia', body: 'Entendemos seu setor, seu funil e suas metas. Saímos com um plano claro, não com promessas.' },
  { n: '02', title: 'Execução de marketing',    body: 'Criação, conteúdo, mídia e CRM rodando com cadência e dados — o motor de aquisição.' },
  { n: '03', title: 'Tecnologia sob medida',    body: 'Quando faz sentido, plugamos automação, IA e software próprios para escalar o que funciona.' },
  { n: '04', title: 'Otimização contínua',      body: 'Medimos, ajustamos e reportamos. Previsibilidade mês após mês, com transparência.' },
] as const

function Process() {
  return (
    <section id="processo" className="relative bg-primary text-primary-foreground overflow-hidden">
      <div className="absolute inset-0 bg-dots opacity-[0.06]" />
      <div className="absolute -top-24 -right-24 size-96 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-widest uppercase text-primary-foreground/70">
              Como trabalhamos
            </p>
            <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight">
              Do diagnóstico ao resultado, em 4 passos.
            </h2>
            <p className="mt-4 text-primary-foreground/80 text-lg">
              Onboarding sem fricção. Você cuida do seu negócio, a gente cuida do funil e da tecnologia.
            </p>
          </div>
        </Reveal>

        <ol className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map(({ n, title, body }, i) => (
            <Reveal key={n} delay={i * 100} as="li">
              <div className="bg-primary-foreground/10 rounded-2xl p-6 backdrop-blur-sm border border-primary-foreground/15 h-full hover:bg-primary-foreground/15 transition-colors">
                <span className="text-xs font-mono text-primary-foreground/60">{n}</span>
                <h3 className="mt-2 font-semibold text-lg">{title}</h3>
                <p className="mt-2 text-sm text-primary-foreground/80 leading-relaxed">{body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}

// -----------------------------------------------------------------------------
// Pricing — modelos de parceria
// -----------------------------------------------------------------------------
const PRICING = [
  { icon: Repeat,    lbl: 'Fee mensal',   title: 'Execução recorrente', body: 'Time dedicado de marketing rodando sua operação mês a mês.' },
  { icon: Layers,    lbl: 'Por projeto',  title: 'Escopo fechado',      body: 'Diagnóstico, branding ou desenvolvimento de software com início, meio e fim.' },
  { icon: BarChart3, lbl: 'Performance',  title: 'Atrelado a resultado', body: 'Parte da remuneração ligada a metas de aquisição e vendas. Dividimos o risco.' },
  { icon: Cpu,       lbl: 'SaaS',         title: 'Plataforma própria',   body: 'Software setorial por assinatura, para escalar com baixo custo marginal.' },
] as const

function Pricing() {
  return (
    <section className="bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <Reveal>
          <SectionHeader
            eyebrow="Modelos de parceria"
            title="Você escolhe como trabalhar com a gente."
            subtitle="Estruturas flexíveis — do fee mensal ao modelo atrelado a resultado e à assinatura de software."
          />
        </Reveal>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRICING.map(({ icon: Icon, lbl, title, body }, i) => (
            <Reveal key={title} delay={i * 80}>
              <article className="h-full rounded-2xl border border-border bg-background p-6 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <Icon className="size-5 text-primary" strokeWidth={1.8} />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">{lbl}</p>
                <h3 className="mt-1 font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// -----------------------------------------------------------------------------
// Manifesto — origem da marca (carrossel)
// -----------------------------------------------------------------------------
const MANIFESTO_SLIDES = [
  { src: '/manifesto/1.png', alt: 'Quem é bem posicionado não precisa disputar atenção' },
  { src: '/manifesto/2.png', alt: 'Você pode até estar nas redes, mas isso não garante reconhecimento' },
  { src: '/manifesto/3.png', alt: 'Foi aí que nasceu a Trimark — Clareza · Resposta · Direção' },
  { src: '/manifesto/4.png', alt: 'Enquanto o mercado insiste em fórmulas prontas, escolhemos outro caminho' },
  { src: '/manifesto/5.png', alt: 'Pensar, estruturar e construir marcas com estratégia de verdade' },
] as const

function Manifesto() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeIdx, setActiveIdx] = useState(0)

  function scrollToIdx(i: number) {
    const el = trackRef.current
    if (!el) return
    const child = el.children[i] as HTMLElement | undefined
    if (child) {
      el.scrollTo({ left: child.offsetLeft - 24, behavior: 'smooth' })
    }
  }
  function next() { scrollToIdx(Math.min(activeIdx + 1, MANIFESTO_SLIDES.length - 1)) }
  function prev() { scrollToIdx(Math.max(activeIdx - 1, 0)) }

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const handler = () => {
      const slideW = (el.children[0] as HTMLElement)?.offsetWidth ?? 320
      const idx = Math.round(el.scrollLeft / (slideW + 16))
      setActiveIdx(Math.min(Math.max(0, idx), MANIFESTO_SLIDES.length - 1))
    }
    el.addEventListener('scroll', handler, { passive: true })
    return () => el.removeEventListener('scroll', handler)
  }, [])

  return (
    <section id="manifesto" className="bg-background">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <Reveal>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
              Manifesto
            </p>
            <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight">
              Quem é bem posicionado{' '}
              <span className="text-primary">não precisa disputar atenção.</span>
            </h2>
            <p className="mt-6 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A Trimark nasceu de duas dentistas — Marcelia e Thayná — que viveram, na
              pele, o limite estreito entre o que o conselho permite e o que o mercado
              exige. Dessa disciplina nasceu nosso método:{' '}
              <strong className="text-foreground/90">Clareza · Resposta · Direção</strong>.
              Hoje aplicamos esse mesmo rigor a qualquer setor — unindo estratégia,
              performance e tecnologia. Enquanto o mercado insiste em fórmulas prontas,
              nós escolhemos outro caminho.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-12 relative">
            <div
              ref={trackRef}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-6 px-1 no-scrollbar scroll-smooth"
            >
              {MANIFESTO_SLIDES.map((s, i) => (
                <figure
                  key={s.src}
                  className="snap-center shrink-0 w-[280px] sm:w-[340px] md:w-[380px] rounded-2xl overflow-hidden border border-border bg-background shadow-md"
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

            <button
              onClick={prev}
              aria-label="Slide anterior"
              className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 size-11 rounded-full bg-background/95 border border-border shadow-md items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={activeIdx === 0}
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={next}
              aria-label="Próximo slide"
              className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 size-11 rounded-full bg-background/95 border border-border shadow-md items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={activeIdx === MANIFESTO_SLIDES.length - 1}
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </Reveal>

        <Reveal delay={220}>
          <div className="mt-6 flex items-center justify-center gap-2">
            {MANIFESTO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToIdx(i)}
                aria-label={`Ir para slide ${i + 1}`}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === activeIdx ? 'bg-primary w-8' : 'bg-muted-foreground/30 w-1.5 hover:bg-muted-foreground/60',
                )}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// -----------------------------------------------------------------------------
// Founders
// -----------------------------------------------------------------------------
const FOUNDERS = [
  {
    photo: '/founders/marcelia.jpg',
    initial: 'M',
    name: 'Marcelia',
    role: 'Cofundadora · Estratégia',
    bio: 'Lidera posicionamento, estratégia e relacionamento com clientes em todas as verticais.',
  },
  {
    photo: '/founders/thayna.jpg',
    initial: 'T',
    name: 'Thayná',
    role: 'Cofundadora · Conteúdo & Marca',
    bio: 'Lidera direção criativa, conteúdo e identidade visual da marca e dos clientes.',
  },
] as const

function Founders() {
  return (
    <section id="fundadoras" className="bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <Reveal>
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
              Quem está construindo a Trimark
            </p>
            <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight">
              Da especialização em saúde{' '}
              <span className="text-primary">para todos os setores</span>.
            </h2>
            <p className="mt-6 text-muted-foreground text-lg leading-relaxed">
              Começamos atendendo profissionais da saúde, onde a régua de exigência é
              altíssima. Esse rigor virou método — e agora o aplicamos a qualquer mercado.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {FOUNDERS.map(({ photo, initial, name, role, bio }, i) => (
            <Reveal key={name} delay={i * 120}>
              <article className="rounded-3xl border border-border bg-background p-6 md:p-8 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 h-full flex flex-col items-center text-center">
                <div className="size-40 md:size-48 rounded-full overflow-hidden ring-4 ring-primary/10 shadow-lg shadow-primary/20 relative">
                  <img
                    src={photo}
                    alt={name}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: 'center 20%' }}
                    onError={(e) => {
                      const target = e.currentTarget
                      target.style.display = 'none'
                      const fallback = target.nextElementSibling as HTMLElement | null
                      if (fallback) fallback.style.display = 'flex'
                    }}
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center text-5xl md:text-6xl font-semibold text-primary-foreground select-none"
                    style={{
                      background:
                        'linear-gradient(135deg, #1B2D5C 0%, #2A4280 100%)',
                      display: 'none',
                    }}
                    aria-hidden="true"
                  >
                    {initial}
                  </div>
                </div>
                <h3 className="mt-6 text-2xl font-semibold tracking-tight">
                  {name}
                </h3>
                <p className="mt-1 text-sm text-primary font-medium">{role}</p>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  {bio}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={300}>
          <p className="mt-12 text-center text-sm text-muted-foreground italic max-w-xl mx-auto">
            “Quem é bem posicionado não precisa disputar atenção. E isso muda tudo.”
          </p>
        </Reveal>
      </div>
    </section>
  )
}

// -----------------------------------------------------------------------------
// Final CTA
// -----------------------------------------------------------------------------
function FinalCTA() {
  return (
    <section id="contato">
      <div className="mx-auto max-w-5xl px-6 py-24 md:py-32">
        <Reveal>
          <div className="rounded-3xl bg-primary text-primary-foreground p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-dots opacity-[0.08]" />
            <div className="absolute -top-24 -right-24 size-80 rounded-full bg-accent/30 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 size-80 rounded-full bg-primary-foreground/10 blur-3xl" />

            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">
                Pronto para crescer com método e tecnologia?
              </h2>
              <p className="mt-4 text-primary-foreground/85 max-w-xl mx-auto text-lg">
                Conte seu setor e seu desafio. A gente volta com um diagnóstico — sem compromisso.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="https://wa.me/5534974004930?text=Quero%20conversar%20sobre%20a%20Trimark"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button size="lg" variant="secondary" className="rounded-full px-8 h-12 text-base group bg-background text-foreground hover:bg-background/95">
                    <MessageCircle className="size-4 mr-2" />
                    Falar no WhatsApp
                    <ArrowRight className="size-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </a>
                <a href="mailto:contato@trimark.com.br">
                  <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                    contato@trimark.com.br
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </Reveal>
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
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div className="col-span-2 md:col-span-1">
            <img src="/logo-trimark.png" alt="Trimark" className="h-8 w-auto" />
            <p className="mt-4 text-muted-foreground">
              Agência híbrida de marketing e tecnologia. Resultado com a profundidade
              de um especialista e a escala de uma plataforma.
            </p>
          </div>
          <div>
            <p className="font-semibold mb-3">Empresa</p>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#capacidades" className="hover:text-foreground transition-colors">O que fazemos</a></li>
              <li><a href="#modelo" className="hover:text-foreground transition-colors">Modelo</a></li>
              <li><a href="#setores" className="hover:text-foreground transition-colors">Setores</a></li>
              <li><Link to="/login" className="hover:text-foreground transition-colors">Acessar plataforma</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-3">Setores</p>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#setores" className="hover:text-foreground transition-colors">Saúde</a></li>
              <li><a href="#setores" className="hover:text-foreground transition-colors">Varejo & E-commerce</a></li>
              <li><a href="#setores" className="hover:text-foreground transition-colors">Serviços & B2B</a></li>
              <li><a href="#setores" className="hover:text-foreground transition-colors">Imobiliário</a></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-3">Contato</p>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="mailto:contato@trimark.com.br" className="hover:text-foreground transition-colors">contato@trimark.com.br</a></li>
              <li><a href="https://wa.me/5534974004930" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">WhatsApp · (34) 97400-4930</a></li>
              <li><a href="https://www.instagram.com/trimarkagencia" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">Instagram · @trimarkagencia</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Trimark. Todos os direitos reservados.</p>
          <p>Marketing + Tecnologia · Multi-setorial</p>
        </div>
      </div>
    </footer>
  )
}

// -----------------------------------------------------------------------------
// SectionHeader
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
      <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight">{title}</h2>
      {subtitle && <p className="mt-4 text-muted-foreground text-lg leading-relaxed">{subtitle}</p>}
    </div>
  )
}
