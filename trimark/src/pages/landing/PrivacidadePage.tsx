import { useEffect, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

// =============================================================================
// Política de Privacidade pública (rota /privacidade).
// Exigida pelos formulários de cadastro da Meta (Lead Ads). Texto alinhado à
// LGPD (Lei 13.709/2018). Ao mudar o conteúdo, atualizar ATUALIZADO_EM.
// =============================================================================

const ATUALIZADO_EM = '24 de novembro de 2026'
const WHATSAPP = 'https://wa.me/5534974004930'
const INSTAGRAM = 'https://www.instagram.com/trimarkagencia'
const EMAIL = 'trimarkagencia@gmail.com'

export default function PrivacidadePage() {
  useEffect(() => {
    const anterior = document.title
    document.title = 'Política de Privacidade — Trimark'
    window.scrollTo(0, 0)
    return () => {
      document.title = anterior
    }
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <header className="border-b border-border/60">
        <nav className="mx-auto max-w-3xl px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src="/logo-trimark.png" alt="Trimark" className="h-9 w-auto" width={144} height={36} />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Voltar ao site
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12 md:py-16">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Política de Privacidade</h1>
        <p className="mt-3 text-sm text-muted-foreground">Atualizada em {ATUALIZADO_EM}.</p>

        <p className="mt-8 leading-relaxed">
          Esta política explica como a Trimark Agência de Marketing trata os dados pessoais de quem
          entra em contato conosco, preenche nossos formulários ou usa nossos serviços, de acordo com a
          Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).
        </p>

        <Secao titulo="1. Quem somos">
          <p>
            Trimark Agência de Marketing, com atuação em Iturama (MG) e região, é a responsável
            (controladora) pelos dados descritos nesta política. Para qualquer assunto sobre seus dados,
            fale conosco pelo e-mail <LinkExterno href={`mailto:${EMAIL}`}>{EMAIL}</LinkExterno>, pelo{' '}
            <LinkExterno href={WHATSAPP}>WhatsApp (34) 97400-4930</LinkExterno> ou pelo Instagram{' '}
            <LinkExterno href={INSTAGRAM}>@trimarkagencia</LinkExterno>.
          </p>
        </Secao>

        <Secao titulo="2. Quais dados coletamos">
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Formulários dos nossos anúncios no Facebook e no Instagram:</strong> nome, telefone ou
              WhatsApp, e-mail (quando informado), nome da empresa, perfil do Instagram, segmento e as
              respostas que você der às perguntas do formulário, como investimento previsto e prazo para
              começar.
            </li>
            <li>
              <strong>Conversas pelo WhatsApp ou pelo Instagram:</strong> as informações que você nos enviar.
            </li>
            <li>
              <strong>Clientes com acesso à nossa plataforma:</strong> nome, e-mail de acesso e os conteúdos
              e informações compartilhados durante a prestação do serviço.
            </li>
            <li>
              <strong>Navegação no site:</strong> dados técnicos básicos, como endereço IP e tipo de
              navegador, registrados automaticamente pelo provedor de hospedagem. Não usamos cookies de
              publicidade neste site; o login da plataforma usa apenas o armazenamento do próprio navegador.
            </li>
          </ul>
        </Secao>

        <Secao titulo="3. Para que usamos seus dados">
          <ul className="list-disc pl-5 space-y-2">
            <li>Responder ao seu contato e entender a necessidade da sua empresa.</li>
            <li>Avaliar se nossos serviços atendem ao seu caso e enviar uma proposta.</li>
            <li>Prestar os serviços contratados e manter o relacionamento com clientes.</li>
            <li>Cumprir obrigações legais e regulatórias.</li>
          </ul>
          <p className="mt-3">Não vendemos nem alugamos dados pessoais.</p>
        </Secao>

        <Secao titulo="4. Bases legais">
          <p>
            Tratamos dados com base no seu consentimento, ao enviar um formulário ou iniciar uma conversa;
            na execução de contrato ou de procedimentos preliminares a pedido seu, como o envio de uma
            proposta; no cumprimento de obrigação legal; e no nosso legítimo interesse, sempre respeitando
            seus direitos (art. 7º da LGPD).
          </p>
        </Secao>

        <Secao titulo="5. Com quem compartilhamos">
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Meta (Facebook, Instagram e WhatsApp):</strong> os formulários dos anúncios e as conversas
              acontecem nas plataformas da Meta, que também tratam esses dados conforme a política de
              privacidade dela.
            </li>
            <li>
              <strong>Fornecedores de tecnologia:</strong> empresas de hospedagem, banco de dados e ferramentas
              que usamos para operar o site e a plataforma, apenas na medida necessária para o serviço.
            </li>
            <li>
              <strong>Autoridades:</strong> quando houver obrigação legal ou ordem judicial.
            </li>
          </ul>
          <p className="mt-3">
            Alguns desses fornecedores podem armazenar dados fora do Brasil. Nesses casos, a transferência
            segue as hipóteses e salvaguardas previstas na LGPD.
          </p>
        </Secao>

        <Secao titulo="6. Por quanto tempo guardamos">
          <p>
            Dados de contatos que não se tornaram clientes são guardados por até 12 meses após o último
            contato. Dados de clientes são guardados enquanto durar o contrato e, depois, pelo prazo exigido
            por lei. Após esses prazos, os dados são eliminados ou anonimizados.
          </p>
        </Secao>

        <Secao titulo="7. Seus direitos">
          <p>
            Você pode, a qualquer momento e sem custo, pedir: confirmação de que tratamos seus dados; acesso
            aos dados; correção de dados incompletos ou desatualizados; anonimização, bloqueio ou eliminação
            de dados desnecessários; portabilidade; informação sobre com quem compartilhamos; e revogação do
            consentimento (art. 18 da LGPD). Para isso, fale conosco pelo e-mail{' '}
            <LinkExterno href={`mailto:${EMAIL}`}>{EMAIL}</LinkExterno> ou pelo{' '}
            <LinkExterno href={WHATSAPP}>WhatsApp</LinkExterno>. Você também pode apresentar reclamação à
            Autoridade Nacional de Proteção de Dados (ANPD).
          </p>
        </Secao>

        <Secao titulo="8. Segurança">
          <p>
            Adotamos medidas técnicas e administrativas para proteger os dados contra acesso não autorizado,
            perda ou uso indevido. O acesso é restrito às pessoas da equipe que precisam dele para o trabalho.
          </p>
        </Secao>

        <Secao titulo="9. Público">
          <p>Nossos serviços são destinados a empresas e a pessoas maiores de 18 anos.</p>
        </Secao>

        <Secao titulo="10. Alterações nesta política">
          <p>
            Esta política pode ser atualizada. A data da versão em vigor aparece no topo desta página.
          </p>
        </Secao>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-3xl px-6 py-8 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Trimark. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  )
}

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold tracking-tight">{titulo}</h2>
      <div className="mt-3 leading-relaxed text-foreground/90">{children}</div>
    </section>
  )
}

function LinkExterno({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-primary">
      {children}
    </a>
  )
}
