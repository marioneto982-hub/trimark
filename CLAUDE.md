# Trimark — Guia de contexto para o Claude Code

> Documento canônico para qualquer sessão futura. Manter sincronizado com o PRD.
> **Fonte da verdade do produto:** `PRD_Trimark_v1.0.docx` (raiz do diretório).

## 1. O que é

Plataforma SaaS multi-tenant da agência Trimark — gestão 360° de marketing
para profissionais da saúde (médicos, dentistas, psicólogos, fisios, nutris,
veterinários etc.). Substitui Trello + WhatsApp + planilha + Google Drive
por uma plataforma única com portal do cliente, aprovação de posts,
biblioteca de conteúdo por especialidade, cobrança automatizada e relatórios.

## 2. Stack

| Camada       | Tecnologia                                                    |
|--------------|---------------------------------------------------------------|
| Frontend     | React 18 + TS + Vite + Tailwind + Shadcn/UI + React Router    |
| Backend      | Supabase: Postgres 15 + Edge Functions (Deno) + RLS + Storage |
| Auth         | Supabase Auth (e-mail/senha + OAuth Google)                   |
| WhatsApp     | Z-API                                                         |
| Pagamentos   | Asaas (PIX, boleto, cartão recorrente)                        |
| IA           | Anthropic Claude (`claude-sonnet-4-20250514`)                 |
| E-mail       | Resend                                                        |
| Hosting      | Vercel/Lovable                                                |

Stack alinhado ao **RecuperaCRM** — reaproveitar padrões já validados em
produção (HTTP 200 em webhooks, integration_logs, retry 2x, SERVICE_ROLE_KEY,
idempotência por chave única).

## 3. Estrutura do repositório

```
TRIMARK AGENCIA/
├── PRD_Trimark_v1.0.docx           # Fonte da verdade do produto
├── CLAUDE.md                        # Este arquivo
├── .env.example                     # 14 secrets do PRD §15
├── .gitignore
├── trimark/                         # App React (Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── admin/               # Telas equipe Trimark
│   │   │   └── portal/              # Telas cliente final
│   │   ├── components/
│   │   │   ├── ui/                  # Shadcn primitives
│   │   │   ├── clients/
│   │   │   ├── posts/
│   │   │   └── shared/
│   │   ├── hooks/
│   │   ├── lib/                     # supabase client, utils
│   │   ├── types/                   # Tipos do domínio (gerados via supabase gen depois)
│   │   └── styles/
│   └── package.json
└── supabase/
    ├── config.toml                  # Config CLI local
    ├── migrations/
    │   └── 20260430000001_initial_schema.sql   # 19 tabelas + RLS + funções
    └── functions/
        ├── _shared/                 # cors, logging, retry, response, supabase admin
        ├── generate-invoice/
        ├── asaas-webhook/
        ├── send-invoice-whatsapp/
        ├── invoice-cron-daily/
        ├── client-invite/
        ├── post-approval-notify/
        ├── post-pending-reminder/
        ├── ai-content-helper/
        ├── ai-ethics-check/
        ├── metrics-monthly-snapshot/
        ├── monthly-report-generate/
        ├── whatsapp-receive/
        ├── client-suspend-overdue/
        ├── library-track-view/
        ├── commission-calculate/
        └── integration-logs-cleanup/
```

## 4. Modelo multi-tenant (PRD §3.2)

- **Toda tabela tem `agency_id`** (FK obrigatória para `agencies`).
- Quando aplicável, também tem `client_id`.
- RLS é obrigatório em **100%** das tabelas.
- Funções auxiliares: `get_my_agency_id()`, `get_my_client_id()`, `get_my_role()`.
- Nunca consultar tabela sem filtro de `agency_id` (PRD §20.2).

## 5. Papéis (PRD §13)

`admin` · `manager` · `designer` · `traffic` · `salesperson` · `viewer` · `client`

`client` é resolvido via tabela `client_users` (não `users`).

## 6. Regras invioláveis (PRD §20)

### Sempre fazer
- Webhooks externos: HTTP 200 mesmo em erro interno (evita reentrega).
- Logar em `integration_logs` toda chamada externa (Asaas, Z-API, Anthropic, Resend).
- Edge Functions usam `SUPABASE_SERVICE_ROLE_KEY`, nunca anon.
- Validar payload de entrada antes de processar.
- Idempotência: chave única por evento (ex: `invoices` tem `UNIQUE (client_id, reference_month)`).
- Retry 2x em chamadas externas via `_shared/retry.ts`.
- Persistir estado no banco **antes** de chamar serviço externo.

### Nunca fazer
- Hardcoded de secrets em código-fonte.
- Query sem filtro de `agency_id`.
- Cliente A enxergar dado do cliente B (RLS é a barreira).
- Confiar em payload de webhook sem validar token.
- Enviar WhatsApp sem registrar em `invoice_reminders`.
- Usar `SUPABASE_ANON_KEY` em Edge Function.
- Deletar dados financeiros sem soft delete.

## 7. Convenções (PRD §20.3)

| Elemento          | Convenção                                          |
|-------------------|----------------------------------------------------|
| Tabelas           | snake_case plural — `clients`, `content_posts`     |
| Edge Functions    | kebab-case — `generate-invoice`, `asaas-webhook`   |
| Componentes React | PascalCase — `ClientCard`, `PostApprovalDialog`    |
| Variáveis JS      | camelCase                                          |
| Constantes        | SCREAMING_SNAKE_CASE                               |

## 8. Padrão obrigatório de Edge Function

```ts
import { handleOptions, corsHeaders } from '../_shared/cors.ts'
import { json, jsonError, webhookAck } from '../_shared/response.ts'
import { supabaseAdmin } from '../_shared/supabase.ts'
import { logIntegration } from '../_shared/logging.ts'
import { withRetry } from '../_shared/retry.ts'

Deno.serve(async (req) => {
  const cors = handleOptions(req); if (cors) return cors

  try {
    // 1) validar payload
    const body = await req.json()
    // 2) validar token (webhooks)
    // 3) operação principal — retry 2x para chamadas externas
    // 4) logar em integration_logs
    return json({ ok: true })
  } catch (err) {
    await logIntegration({ integration: 'system', operation: 'unknown', level: 'error', error_message: String(err) })
    // PRD §20.1: webhook → ack mesmo em erro; interno → jsonError
    return webhookAck({ handled: false })
  }
})
```

## 9. Roadmap (PRD §17)

- **Phase 0 — Setup (semana 1):** ✅ scaffold local concluído. Falta: criar projeto Supabase remoto, aplicar migration, configurar Storage buckets, secrets.
- **Phase 1 — Núcleo (sem 2-4):** módulo Clientes + Calendário (CRUD), auth multi-papel, layout admin.
- **Phase 2 — Portal (sem 5-6):** portal cliente + fluxo de aprovação + convite por e-mail.
- **Phase 3 — Cobrança (sem 7-8):** integração Asaas + Z-API + crons.
- **Phase 4 — Biblioteca + financeiro (sem 9-10):** módulos 4 e 6.
- **Phase 5 — Relatórios (sem 11-12):** módulo 7 + IA helpers + auditoria + beta.

## 10. Critérios de aceite do MVP (PRD §18 — RESUMO)

- 100% das tabelas com RLS habilitado ✅ (migration inicial cumpre).
- 100% das Edge Functions retornam HTTP 200 mesmo em erro interno.
- Tempo de resposta médio do portal < 2s; webhook < 3s.
- Senhas mín. 8 chars; CPF/CNPJ via pgcrypto.
- Beta com 3+ clientes reais por 30 dias sem incidente bloqueante.
- 1 ciclo de cobrança completo executado ponta a ponta.

## 11. Próximos passos imediatos

1. Confirmar criação do projeto Supabase remoto (custo + irreversível — pedir ao Mario).
2. Aplicar `20260430000001_initial_schema.sql` na instância remota.
3. Migration seguinte: criar buckets Storage (`post-media`, `client-documents`, `library-media`, `agency-assets`).
4. Migration: configurar pg_cron para os 6 jobs cron do PRD §14.
5. Seed inicial de `specialties` (cardiologia, ortodontia, psicologia, nutrição etc.).
6. Implementar `client-invite` (primeira Edge Function — bloqueia onboarding).
