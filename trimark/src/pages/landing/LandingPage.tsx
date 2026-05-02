import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
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
import { Reveal } from '@/components/shared/Reveal'
import IntroAnimation from '@/components/shared/IntroAnimation'
import { CountUp } from '@/hooks/useCountUp'
import { cn } from '@/lib/utils'

// =============================================================================
// Trimark — Landing pública v2
// Inspiração: prime2b.digital, com identidade Trimark (navy #1B2D5C + acento
// laranja). Scroll reveal via IntersectionObserver, marquee CSS puro,
// counter animado, carrossel com controles, hover effects sofisticados.
// Respeita prefers-reduced-motion.
// =============================================================================

export default function LandingPage() {
  // Intro cinematografica: roda em toda visita.
  // Quando termina (ou e pulada), libera o site.
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
        <Services />
        <Specialties />
        <Process />
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
          <a href="#pilares" className="text-muted-foreground hover:text-foreground transition-colors">Pilares</a>
          <a href="#servicos" className="text-muted-foreground hover:text-foreground transition-colors">Serviços</a>
          <a href="#especialidades" className="text-muted-foreground hover:text-foreground transition-colors">Especialidades</a>
          <a href="#processo" className="text-muted-foreground hover:text-foreground transition-colors">Processo</a>
          <a href="#manifesto" className="text-muted-foreground hover:text-foreground transition-colors">Manifesto</a>
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
// Hero — logo em destaque + headline poderosa
// -----------------------------------------------------------------------------
function Hero() {
  return (
    <section className="relative overflow-hidden bg-mesh">
      {/* dots grid */}
      <div className="absolute inset-0 -z-10 bg-dots opacity-30" />

      {/* blobs decorativos animados */}
      <div className="pointer-events-none absolute -top-40 -right-32 size-[520px] rounded-full bg-primary/10 blur-3xl animate-blob -z-10" />
      <div className="pointer-events-none absolute -bottom-40 -left-32 size-[480px] rounded-full bg-accent/15 blur-3xl animate-blob -z-10" style={{ animationDelay: '6s' }} />

      <div className="mx-auto max-w-6xl px-6 pt-16 pb-24 md:pt-24 md:pb-32 text-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Marketing 360 para profissionais da saúde
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
            Da consulta ao{' '}
            <span className="text-primary">consultório lotado.</span>
            <br />
            Marketing que respeita seu{' '}
            <span className="relative inline-block">
              <span className="relative z-10">código de ética.</span>
              <span className="absolute bottom-1 left-0 right-0 h-3 md:h-4 bg-accent/40 -z-0 -skew-x-3" />
            </span>
          </h1>
        </Reveal>

        <Reveal delay={320}>
          <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Estratégia, conteúdo, tráfego pago, identidade visual e gestão de redes
            — tudo dentro do que o seu conselho permite.
          </p>
        </Reveal>

        <Reveal delay={420}>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="#contato">
              <Button size="lg" className="rounded-full px-8 h-12 text-base group shadow-lg shadow-primary/20">
                Falar com um especialista
                <ArrowRight className="size-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </a>
            <a href="#servicos">
              <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base bg-background/60 backdrop-blur">
                Ver o que fazemos
              </Button>
            </a>
          </div>
        </Reveal>

        <Reveal delay={520}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              Aprovação em 2 cliques
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              Cobrança automática no WhatsApp
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              Portal próprio do cliente
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// -----------------------------------------------------------------------------
// Marquee — faixa rolando com especialidades
// -----------------------------------------------------------------------------
const MARQUEE_ITEMS = [
  'Cardiologia', 'Dermatologia', 'Ortodontia', 'Psicologia', 'Nutrição', 'Fisioterapia',
  'Implantodontia', 'Pediatria', 'Veterinária', 'Estética Médica', 'Endocrinologia',
  'Harmonização Orofacial', 'Fonoaudiologia', 'Ginecologia', 'Biomedicina', 'Enfermagem',
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
// Pillars
// -----------------------------------------------------------------------------
const PILLARS = [
  { n: '01', icon: Shield,      title: 'Ética inegociável',     body: 'Cada conteúdo validado pelas resoluções CFM 2.336/2023, CFO 196/2019 e equivalentes antes de publicar. Sem promessa de resultado. Sem antes/depois indevido.' },
  { n: '02', icon: Stethoscope, title: 'Especialização real',   body: 'Cardiologista não fala como dentista. Biblioteca curada por especialidade — 41 áreas atendidas, da clínica geral à harmonização orofacial.' },
  { n: '03', icon: Sparkles,    title: 'Operação transparente', body: 'Você aprova posts pelo portal em 2 cliques. Vê calendário, métricas, faturas e conversa direto com seu account manager.' },
  { n: '04', icon: LineChart,   title: 'Crescimento mensurável',body: 'Relatório mensal mostra alcance, engajamento, novos seguidores e ROI das campanhas. Sem vaidade — só o que vira agendamento.' },
] as const

function Pillars() {
  return (
    <section id="pilares" className="bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <Reveal>
          <SectionHeader
            eyebrow="Nossa filosofia"
            title="Quatro princípios. Zero atalhos."
            subtitle="O marketing para a saúde tem regras diferentes. A gente trabalha dentro delas — e tira o melhor de cada uma."
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
// Stats — counter animado
// -----------------------------------------------------------------------------
const STATS = [
  { n: '41',      label: 'especialidades atendidas' },
  { n: '60%',     label: 'menos tempo em aprovações' },
  { n: '70%',     label: 'redução de inadimplência' },
  { n: '30',      label: 'minutos de onboarding' },
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
// Services
// -----------------------------------------------------------------------------
const SERVICES = [
  { icon: PencilLine,    title: 'Gestão de redes',       body: 'Feed, stories, reels e LinkedIn. Pauta semanal, edição, publicação e engajamento.' },
  { icon: Rocket,        title: 'Tráfego pago',          body: 'Meta Ads e Google Ads para captação local de pacientes, com criativos próprios.' },
  { icon: HeartPulse,    title: 'Conteúdo educativo',    body: 'Artigos, carrosséis e vídeos que constroem autoridade na sua especialidade.' },
  { icon: Sparkles,      title: 'Identidade visual',     body: 'Branding, paleta, tipografia e templates. Consultório com cara de consultório sério.' },
  { icon: CalendarCheck, title: 'Calendário editorial',  body: 'Datas comemorativas da saúde + planejamento de 30/60/90 dias por especialidade.' },
  { icon: LineChart,     title: 'SEO local',             body: 'Google Meu Negócio otimizado, reviews, e site responsivo que aparece em "perto de mim".' },
  { icon: MessageCircle, title: 'Atendimento WhatsApp',  body: 'Padronização de respostas, automações e gestão da fila de mensagens.' },
  { icon: Users,         title: 'Posicionamento',        body: 'Quem você quer atender, como quer ser lembrado, qual sua tese — antes de qualquer post.' },
] as const

function Services() {
  return (
    <section id="servicos" className="bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <Reveal>
          <SectionHeader
            eyebrow="O que entregamos"
            title="Uma agência. Tudo que seu consultório precisa."
            subtitle="Não terceirizamos a operação. Designer, gestor de tráfego, copywriter e account manager trabalham juntos no seu projeto."
          />
        </Reveal>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SERVICES.map(({ icon: Icon, title, body }, i) => (
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
        </div>
      </div>
    </section>
  )
}

// -----------------------------------------------------------------------------
// Specialties
// -----------------------------------------------------------------------------
const SPECIALTY_GROUPS = [
  { name: 'Medicina',     items: ['Cardiologia','Dermatologia','Pediatria','Ortopedia','Psiquiatria','Endocrinologia','Cirurgia Plástica','Medicina Estética','+6 outras'] },
  { name: 'Odontologia',  items: ['Ortodontia','Implantodontia','Endodontia','Estética & Harmonização Orofacial','+3 outras'] },
  { name: 'Psicologia',   items: ['Clínica','Infantil','Casal e Família'] },
  { name: 'Nutrição',     items: ['Clínica','Esportiva','Materno-Infantil'] },
  { name: 'Fisioterapia', items: ['Ortopédica','Esportiva','Neurofuncional','Pilates / RPG'] },
  { name: 'Mais áreas',   items: ['Veterinária','Fonoaudiologia','Biomedicina','Farmácia','Enfermagem'] },
] as const

function Specialties() {
  return (
    <section id="especialidades">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <Reveal>
          <SectionHeader
            eyebrow="Quem atendemos"
            title="41 especialidades. Cada uma com sua linguagem."
            subtitle="Não falamos da sua área genericamente. Conhecemos a resolução do seu conselho e o tom que constrói confiança no seu paciente."
          />
        </Reveal>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SPECIALTY_GROUPS.map((g, i) => (
            <Reveal key={g.name} delay={i * 80}>
              <div className="rounded-2xl border border-border bg-background p-6 h-full hover:border-primary/30 transition-colors">
                <h3 className="font-semibold text-primary text-lg">{g.name}</h3>
                <ul className="mt-3 space-y-1.5">
                  {g.items.map((it) => (
                    <li key={it} className="text-sm text-muted-foreground flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// -----------------------------------------------------------------------------
// Process
// -----------------------------------------------------------------------------
const STEPS = [
  { n: '01', title: 'Diagnóstico em 30 minutos',  body: 'Conversamos sobre seu consultório, posicionamento atual e onde você quer chegar. Sem custo, sem compromisso.' },
  { n: '02', title: 'Plano e contrato',           body: 'Você escolhe um plano (Bronze, Prata, Ouro ou Diamante). Em até 30 minutos do aceite, está tudo configurado.' },
  { n: '03', title: 'Operação rolando',           body: 'Equipe sobe o calendário, você aprova pelo portal, a gente publica. Cobrança automática toda mês no WhatsApp.' },
  { n: '04', title: 'Resultado mensurável',       body: 'Relatório no início de cada mês mostra o que cresceu e o que vamos ajustar. Reunião quinzenal com seu account manager.' },
] as const

function Process() {
  return (
    <section id="processo" className="relative bg-primary text-primary-foreground overflow-hidden">
      {/* decoração */}
      <div className="absolute inset-0 bg-dots opacity-[0.06]" />
      <div className="absolute -top-24 -right-24 size-96 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-widest uppercase text-primary-foreground/70">
              Como funciona
            </p>
            <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight">
              De zero ao consultório lotado em 4 passos.
            </h2>
            <p className="mt-4 text-primary-foreground/80 text-lg">
              Onboarding sem fricção. Você cuida dos pacientes, a gente cuida do funil.
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
// Manifesto — carrossel com setas + dots
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

  // sincroniza activeIdx ao rolar manualmente
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
    <section id="manifesto" className="bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <Reveal>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
              Manifesto
            </p>
            <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight">
              Você pode até estar nas redes.{' '}
              <span className="text-primary">Mas isso não garante reconhecimento.</span>
            </h2>
            <p className="mt-6 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A Trimark nasceu de duas dentistas — Marcelia e Thayná — que viveram,
              na pele, o limite estreito entre o que o conselho permite e o que o
              mercado de marketing exige. Foi aí que nasceu a Trimark — que veio
              como <strong className="text-foreground/90">Clareza · Resposta · Direção</strong>.
              Enquanto o mercado insiste em volume, tendências e fórmulas prontas,
              nós escolhemos outro caminho.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-12 relative">
            {/* track */}
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

            {/* setas (desktop) */}
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

        <Reveal delay={300}>
          <p className="mt-10 text-center text-base md:text-lg text-foreground/80 italic max-w-xl mx-auto">
            “Quem é bem posicionado não precisa disputar atenção.”
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
                Pronto pra parar de improvisar seu marketing?
              </h2>
              <p className="mt-4 text-primary-foreground/85 max-w-xl mx-auto text-lg">
                30 minutos, sem compromisso. A gente analisa seu posicionamento atual e mostra
                o que muda nos primeiros 90 dias.
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
              Agência 360 de marketing para profissionais da saúde.
            </p>
          </div>
          <div>
            <p className="font-semibold mb-3">Produto</p>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#servicos" className="hover:text-foreground transition-colors">Serviços</a></li>
              <li><a href="#especialidades" className="hover:text-foreground transition-colors">Especialidades</a></li>
              <li><a href="#processo" className="hover:text-foreground transition-colors">Processo</a></li>
              <li><Link to="/login" className="hover:text-foreground transition-colors">Acessar plataforma</Link></li>
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
// Founders — Quem está construindo a Trimark
// Nova seção: apresenta Marcelia e Thayná. Sem fotos reais ainda — usa
// placeholders com iniciais sobre gradient da identidade.
// Quando as fotos limpas (sem o lettering do Instagram) chegarem, basta
// trocar src nos <img />.
// -----------------------------------------------------------------------------
const FOUNDERS = [
  {
    photo: '/founders/marcelia.jpg',
    initial: 'M',
    name: 'Marcelia',
    role: 'Cofundadora · Estratégia',
    bio: 'Dentista de formação. Lidera posicionamento, estratégia e relacionamento com clientes.',
  },
  {
    photo: '/founders/thayna.jpg',
    initial: 'T',
    name: 'Thayná',
    role: 'Cofundadora · Conteúdo & Marca',
    bio: 'Dentista de formação. Lidera direção criativa, conteúdo e identidade visual da marca.',
  },
] as const

function Founders() {
  return (
    <section id="fundadoras" className="bg-background">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <Reveal>
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
              Quem está construindo a Trimark
            </p>
            <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight">
              Duas dentistas que escolheram{' '}
              <span className="text-primary">o marketing</span>.
            </h2>
            <p className="mt-6 text-muted-foreground text-lg leading-relaxed">
              Conhecemos por dentro o que o seu conselho permite, porque vivemos
              sob ele todos os dias. Não é teoria de quem leu a resolução —
              é prática de quem operou dentro dela.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {FOUNDERS.map(({ photo, initial, name, role, bio }, i) => (
            <Reveal key={name} delay={i * 120}>
              <article className="rounded-3xl border border-border bg-background p-6 md:p-8 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 h-full flex flex-col items-center text-center">
                {/* Foto circular da fundadora.
                    onError mostra a inicial como fallback caso a imagem nao
                    carregue (ex: arquivo ainda nao subido). */}
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
