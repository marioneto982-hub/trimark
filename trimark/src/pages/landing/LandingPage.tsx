import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Cpu,
  Headset,
  Megaphone,
  MessageCircle,
  Sparkles,
  Target,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/shared/Reveal'
import IntroAnimation from '@/components/shared/IntroAnimation'
import { cn } from '@/lib/utils'

// =============================================================================
// Trimark — Landing pública v4 (simplificada) — 2026-07
// Filosofia: primeira tela limpa apresentando os SERVIÇOS. O visitante clica
// no serviço que interessa e as informações extras expandem ali mesmo.
// Conteúdo antigo (processo, modelos de parceria, setores) foi distribuído
// dentro de cada serviço. Manifesto + fundadoras viraram "Sobre" discreto.
// Mantém identidade navy + primitivos (Reveal, IntroAnimation, Button).
// =============================================================================

const WHATSAPP = 'https://wa.me/5534974004930'

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
        <Services />
        <FinalCTA />
        <About />
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
      <nav className="mx-auto max-w-5xl px-6 h-20 flex items-center justify-between">
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
          <a href="#servicos" className="text-muted-foreground hover:text-foreground transition-colors">Serviços</a>
          <a href="#sobre" className="text-muted-foreground hover:text-foreground transition-colors">Sobre</a>
          <a href="#contato" className="text-muted-foreground hover:text-foreground transition-colors">Contato</a>
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
// Hero — curto e direto
// -----------------------------------------------------------------------------
function Hero() {
  return (
    <section className="relative overflow-hidden bg-mesh">
      <div className="absolute inset-0 -z-10 bg-dots opacity-30" />
      <div className="pointer-events-none absolute -top-40 -right-32 size-[520px] rounded-full bg-primary/10 blur-3xl animate-blob -z-10" />

      <div className="mx-auto max-w-4xl px-6 pt-14 pb-16 md:pt-20 md:pb-20 text-center">
        <Reveal>
          <img
            src="/logo-trimark.png"
            alt="Trimark"
            className="mx-auto h-36 sm:h-48 md:h-60 lg:h-72 w-auto drop-shadow-sm"
            width={720}
            height={288}
          />
        </Reveal>

        <Reveal delay={120}>
          <h1 className="mt-8 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-[1.1] text-balance">
            Marketing de resultado e{' '}
            <span className="text-primary">tecnologia proprietária.</span>
          </h1>
        </Reveal>

        <Reveal delay={220}>
          <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Escolha abaixo o que sua empresa precisa — e veja como a gente entrega.
          </p>
        </Reveal>

        <Reveal delay={320}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
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
// Services — apresentação clicável (expande na própria página)
// -----------------------------------------------------------------------------
type Service = {
  icon: typeof Target
  title: string
  tagline: string
  detail: string
  img: string
  deliverables: string[]
  models: string[]
  cta: string
}

const SERVICES: Service[] = [
  {
    icon: Target,
    title: 'Estratégia & Dados',
    tagline: 'Posicionamento, pesquisa e inteligência de mercado.',
    img: '/services/estrategia.svg',
    detail: 'Diagnóstico do seu setor, funil e metas — e um plano claro para crescer.',
    deliverables: [
      'Diagnóstico e posicionamento',
      'Plano de marketing com metas',
      'BI e relatórios transparentes',
    ],
    models: ['Por projeto', 'Incluído no fee mensal'],
    cta: 'Quero um diagnóstico da minha empresa',
  },
  {
    icon: Sparkles,
    title: 'Criação & Conteúdo',
    tagline: 'Branding, design e conteúdo que constroem marca.',
    img: '/services/criacao.svg',
    detail: 'Identidade visual, social media e conteúdo com estratégia e cadência.',
    deliverables: [
      'Branding e identidade visual',
      'Social media e calendário editorial',
      'Conteúdo validado por setor',
    ],
    models: ['Fee mensal', 'Por projeto (branding)'],
    cta: 'Quero fortalecer minha marca',
  },
  {
    icon: Megaphone,
    title: 'Performance & Mídia',
    tagline: 'Tráfego pago, SEO e CRM com meta de retorno.',
    img: '/services/performance.svg',
    detail: 'Campanhas, SEO e automação com metas de CPL, CPA, ROAS e vendas.',
    deliverables: [
      'Tráfego pago (Meta, Google)',
      'SEO e CRM',
      'Otimização e relatórios mensais',
    ],
    models: ['Fee mensal', 'Performance', 'Híbrido'],
    cta: 'Quero gerar mais vendas e leads',
  },
  {
    icon: Cpu,
    title: 'Tecnologia & Produto',
    tagline: 'Software sob medida, automação e IA.',
    img: '/services/tecnologia.svg',
    detail: 'Software, automações e IA próprios que viram diferencial competitivo seu.',
    deliverables: [
      'Sistemas sob medida',
      'Automações e integrações',
      'IA aplicada ao seu funil',
    ],
    models: ['Por projeto', 'Assinatura SaaS'],
    cta: 'Quero tecnologia trabalhando pra mim',
  },
  {
    icon: Headset,
    title: 'Sucesso do Cliente',
    tagline: 'Gestão de conta, processos e previsibilidade.',
    img: '/services/sucesso.svg',
    detail: 'Tudo sob um mesmo teto e uma única conta — entrega previsível todo mês.',
    deliverables: [
      'Gestão de conta dedicada',
      'Portal do cliente',
      'Relatórios com cadência',
    ],
    models: ['Incluído em qualquer parceria'],
    cta: 'Quero uma parceria integrada',
  },
]

function Services() {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  return (
    <section id="servicos" className="bg-muted/30 border-y border-border/60">
      <div className="mx-auto max-w-4xl px-6 py-16 md:py-24">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
              Nossos serviços
            </p>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
              O que a Trimark faz pela sua empresa.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Clique no serviço que interessa para ver os detalhes.
            </p>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="mt-10 rounded-2xl border border-border bg-background divide-y divide-border overflow-hidden shadow-sm">
            {SERVICES.map((service, i) => (
              <ServiceCard
                key={service.title}
                service={service}
                open={openIdx === i}
                onToggle={() => setOpenIdx(openIdx === i ? null : i)}
              />
            ))}
            <div className="flex items-center justify-center gap-2.5 p-4 md:p-5 bg-primary text-primary-foreground text-center">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
              <p className="text-sm">
                <strong>Tudo se integra:</strong> as cinco frentes trabalham juntas — uma estratégia, os mesmos dados, uma única conta.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function ServiceCard({
  service,
  open,
  onToggle,
}: {
  service: Service
  open: boolean
  onToggle: () => void
}) {
  const { icon: Icon, title, tagline, detail, img, deliverables, models, cta } = service

  return (
    <article
      className={cn(
        'transition-colors duration-300 overflow-hidden',
        open ? 'bg-muted/30' : 'hover:bg-muted/20',
      )}
    >
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center gap-4 p-4 md:p-5 text-left"
      >
        <div
          className={cn(
            'size-12 shrink-0 rounded-xl flex items-center justify-center transition-colors',
            open ? 'bg-primary' : 'bg-primary/10',
          )}
        >
          <Icon
            className={cn('size-6 transition-colors', open ? 'text-primary-foreground' : 'text-primary')}
            strokeWidth={1.7}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg tracking-tight">{title}</h3>
          <p className="text-sm text-muted-foreground truncate">{tagline}</p>
        </div>
        <ChevronDown
          className={cn(
            'size-5 shrink-0 text-muted-foreground transition-transform duration-300',
            open && 'rotate-180 text-primary',
          )}
        />
      </button>

      <div
        className={cn(
          'grid transition-all duration-300 ease-in-out',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <div className="px-5 md:px-6 pb-6 pt-1 border-t border-border/60 mt-0">
            <img
              src={img}
              alt={title}
              className="mt-4 w-full h-auto rounded-xl border border-border/60"
              loading="lazy"
              width={800}
              height={480}
            />
            <p className="mt-4 text-muted-foreground leading-relaxed">{detail}</p>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-3">
                  O que entregamos
                </p>
                <ul className="space-y-2">
                  {deliverables.map((d) => (
                    <li key={d} className="flex items-start gap-2 text-sm text-foreground/85">
                      <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-3">
                  Como contratar
                </p>
                <ul className="space-y-1.5">
                  {models.map((m) => (
                    <li key={m} className="text-sm text-muted-foreground">
                      · {m}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <a
              href={`${WHATSAPP}?text=${encodeURIComponent(`${cta} — vi no site da Trimark (${title}).`)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-6"
            >
              <Button className="rounded-full px-6 group">
                <MessageCircle className="size-4 mr-2" />
                {cta}
                <ArrowRight className="size-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}

// -----------------------------------------------------------------------------
// Final CTA
// -----------------------------------------------------------------------------
function FinalCTA() {
  return (
    <section id="contato">
      <div className="mx-auto max-w-4xl px-6 py-16 md:py-24">
        <Reveal>
          <div className="rounded-3xl bg-primary text-primary-foreground p-10 md:p-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-dots opacity-[0.08]" />
            <div className="absolute -top-24 -right-24 size-80 rounded-full bg-accent/30 blur-3xl" />

            <div className="relative">
              <h2 className="text-2xl md:text-4xl font-semibold tracking-tight">
                Não achou o que procurava?
              </h2>
              <p className="mt-4 text-primary-foreground/85 max-w-lg mx-auto">
                Conte seu setor e seu desafio. A gente volta com um diagnóstico — sem compromisso.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={`${WHATSAPP}?text=${encodeURIComponent('Quero conversar sobre a Trimark')}`}
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
// About — manifesto + fundadoras, discreto (fechado por padrão)
// -----------------------------------------------------------------------------
const FOUNDERS = [
  {
    photo: '/founders/marcelia.jpg',
    initial: 'M',
    name: 'Marcelia',
    role: 'Cofundadora · Estratégia',
    bio: 'Lidera posicionamento, estratégia e relacionamento com clientes.',
  },
  {
    photo: '/founders/thayna.jpg',
    initial: 'T',
    name: 'Thayná',
    role: 'Cofundadora · Conteúdo & Marca',
    bio: 'Lidera direção criativa, conteúdo e identidade visual.',
  },
] as const

function About() {
  const [open, setOpen] = useState(false)

  return (
    <section id="sobre" className="bg-muted/30 border-t border-border/60">
      <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="w-full flex items-center justify-between gap-4 text-left group"
        >
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
              Sobre a Trimark
            </p>
            <h2 className="mt-2 text-xl md:text-2xl font-semibold tracking-tight group-hover:text-primary transition-colors">
              Quem é bem posicionado não precisa disputar atenção.
            </h2>
          </div>
          <ChevronDown
            className={cn(
              'size-5 shrink-0 text-muted-foreground transition-transform duration-300',
              open && 'rotate-180 text-primary',
            )}
          />
        </button>

        <div
          className={cn(
            'grid transition-all duration-300 ease-in-out',
            open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
          )}
        >
          <div className="overflow-hidden">
            <p className="mt-6 text-muted-foreground leading-relaxed max-w-2xl">
              A Trimark nasceu de duas dentistas — Marcelia e Thayná — que viveram, na
              pele, o limite estreito entre o que o conselho permite e o que o mercado
              exige. Dessa disciplina nasceu nosso método:{' '}
              <strong className="text-foreground/90">Clareza · Resposta · Direção</strong>.
              Hoje aplicamos esse mesmo rigor a qualquer setor — unindo estratégia,
              performance e tecnologia. Enquanto o mercado insiste em fórmulas prontas,
              nós escolhemos outro caminho.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
              {FOUNDERS.map(({ photo, initial, name, role, bio }) => (
                <article
                  key={name}
                  className="rounded-2xl border border-border bg-background p-5 flex items-center gap-4"
                >
                  <div className="size-16 shrink-0 rounded-full overflow-hidden ring-2 ring-primary/10 relative">
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
                      className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-primary-foreground select-none"
                      style={{
                        background: 'linear-gradient(135deg, #1B2D5C 0%, #2A4280 100%)',
                        display: 'none',
                      }}
                      aria-hidden="true"
                    >
                      {initial}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold tracking-tight">{name}</h3>
                    <p className="text-xs text-primary font-medium">{role}</p>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{bio}</p>
                  </div>
                </article>
              ))}
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
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8 text-sm">
          <div className="max-w-xs">
            <img src="/logo-trimark.png" alt="Trimark" className="h-8 w-auto" />
            <p className="mt-4 text-muted-foreground">
              Agência híbrida de marketing e tecnologia.
            </p>
          </div>
          <div className="flex gap-16">
            <div>
              <p className="font-semibold mb-3">Empresa</p>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#servicos" className="hover:text-foreground transition-colors">Serviços</a></li>
                <li><a href="#sobre" className="hover:text-foreground transition-colors">Sobre</a></li>
                <li><Link to="/login" className="hover:text-foreground transition-colors">Acessar plataforma</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-3">Contato</p>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="mailto:contato@trimark.com.br" className="hover:text-foreground transition-colors">contato@trimark.com.br</a></li>
                <li><a href={WHATSAPP} target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">WhatsApp · (34) 97400-4930</a></li>
                <li><a href="https://www.instagram.com/trimarkagencia" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">Instagram · @trimarkagencia</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Trimark. Todos os direitos reservados.</p>
          <p>Marketing + Tecnologia · Multi-setorial</p>
        </div>
      </div>
    </footer>
  )
}
