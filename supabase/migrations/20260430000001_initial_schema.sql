-- =============================================================================
-- TRIMARK — Migration inicial (Phase 1, schema completo do MVP)
-- Data: 2026-04-30  |  PRD v1.0 §§ 4–10, 12, 14
-- Notas:
--   * Toda tabela tem agency_id (PRD §3.2) e RLS habilitado (PRD §18.2).
--   * Toda FK relevante usa ON DELETE conforme política do PRD.
--   * pgcrypto habilitado para criptografia de CPF/CNPJ (PRD §18.3).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. Extensões
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. agencies (PRD §4.2)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.agencies (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  slug          text UNIQUE NOT NULL,
  logo_url      text,
  primary_color text DEFAULT '#1F4E79',
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 2. users (papéis internos da agência — espelha auth.users + role)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id  uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_id     uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  full_name     text NOT NULL,
  email         text NOT NULL,
  role          text NOT NULL DEFAULT 'viewer'
                  CHECK (role IN ('admin','manager','designer','traffic','salesperson','viewer')),
  avatar_url    text,
  active        boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_users_agency       ON public.users(agency_id);
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON public.users(auth_user_id);

-- -----------------------------------------------------------------------------
-- 3. specialties (PRD §4.2)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.specialties (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  text NOT NULL,
  category              text NOT NULL,
  council               text,
  ethics_rules_summary  text,
  active                boolean NOT NULL DEFAULT true,
  created_at            timestamptz NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 4. plans (PRD §4.2)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.plans (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id             uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  name                  text NOT NULL,
  monthly_price         numeric(10,2) NOT NULL,
  posts_feed_quota      int NOT NULL DEFAULT 0,
  posts_stories_quota   int NOT NULL DEFAULT 0,
  reels_quota           int NOT NULL DEFAULT 0,
  paid_campaigns_quota  int NOT NULL DEFAULT 0,
  creative_pieces_quota int NOT NULL DEFAULT 0,
  includes_blog_posts   boolean NOT NULL DEFAULT false,
  includes_seo          boolean NOT NULL DEFAULT false,
  includes_paid_traffic boolean NOT NULL DEFAULT false,
  active                boolean NOT NULL DEFAULT true,
  created_at            timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_plans_agency ON public.plans(agency_id);

-- -----------------------------------------------------------------------------
-- 5. clients (PRD §4.2)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clients (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id           uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  full_name           text NOT NULL,
  trade_name          text,
  doc_type            text CHECK (doc_type IN ('cpf','cnpj')),
  doc_number_encrypted bytea,            -- pgcrypto pgp_sym_encrypt (PRD §18.3)
  doc_number_hash     text,              -- hash p/ unicidade sem expor o doc
  specialty_id        uuid NOT NULL REFERENCES public.specialties(id),
  council_type        text,
  council_number      text,
  council_state       text,
  email               text,
  phone_primary       text,
  instagram_handle    text,
  facebook_url        text,
  tiktok_handle       text,
  website_url         text,
  address_json        jsonb,
  plan_id             uuid REFERENCES public.plans(id),
  billing_day         int CHECK (billing_day BETWEEN 1 AND 28),
  contract_value      numeric(10,2),
  contract_start_date date,
  contract_end_date   date,
  status              text NOT NULL DEFAULT 'prospect'
                        CHECK (status IN ('prospect','onboarding','active','suspended','canceled')),
  account_manager_id  uuid REFERENCES public.users(id),
  asaas_customer_id   text,              -- preenchido pela Edge Function generate-invoice
  notes               text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (agency_id, doc_number_hash)
);
CREATE INDEX IF NOT EXISTS idx_clients_agency      ON public.clients(agency_id);
CREATE INDEX IF NOT EXISTS idx_clients_status      ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_billing_day ON public.clients(billing_day) WHERE status = 'active';

-- -----------------------------------------------------------------------------
-- 6. client_users (PRD §6.4) — usuários do portal do cliente
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.client_users (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id             uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  auth_user_id          uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name          text,
  role                  text NOT NULL DEFAULT 'owner' CHECK (role IN ('owner','assistant')),
  invitation_token      text UNIQUE,
  invitation_expires_at timestamptz,
  first_login_at        timestamptz,
  last_login_at         timestamptz,
  active                boolean NOT NULL DEFAULT true,
  created_at            timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_client_users_client ON public.client_users(client_id);

-- -----------------------------------------------------------------------------
-- 7. content_posts (PRD §5.2)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.content_posts (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id               uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  client_id               uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title                   text,
  copy_text               text,
  hashtags                text[],
  platform                text CHECK (platform IN ('instagram','facebook','tiktok','linkedin','youtube','blog')),
  format                  text CHECK (format IN ('feed','stories','reels','carousel','video','article')),
  scheduled_at            timestamptz,
  published_at            timestamptz,
  status                  text NOT NULL DEFAULT 'draft'
                            CHECK (status IN ('draft','in_creation','awaiting_internal','awaiting_client',
                                              'approved','scheduled','published','archived','rejected')),
  created_by              uuid REFERENCES public.users(id),
  assigned_to             uuid REFERENCES public.users(id),
  approved_by_client_at   timestamptz,
  rejection_reason        text,
  revision_count          int NOT NULL DEFAULT 0,
  external_post_url       text,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_posts_agency_status ON public.content_posts(agency_id, status);
CREATE INDEX IF NOT EXISTS idx_posts_client        ON public.content_posts(client_id);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled     ON public.content_posts(scheduled_at);

-- -----------------------------------------------------------------------------
-- 8. content_post_media + content_post_approvals (PRD §5.2)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.content_post_media (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id         uuid NOT NULL REFERENCES public.content_posts(id) ON DELETE CASCADE,
  file_url        text NOT NULL,
  file_type       text CHECK (file_type IN ('image','video','gif')),
  file_size_bytes bigint,
  display_order   int NOT NULL DEFAULT 0,
  uploaded_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_post_media_post ON public.content_post_media(post_id);

CREATE TABLE IF NOT EXISTS public.content_post_approvals (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id        uuid NOT NULL REFERENCES public.content_posts(id) ON DELETE CASCADE,
  approved_by    uuid,                     -- pode ser users.id OU client_users.id
  approver_role  text NOT NULL CHECK (approver_role IN ('internal','client')),
  decision       text NOT NULL CHECK (decision IN ('approved','rejected','revision_requested')),
  comment        text,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_post_approvals_post ON public.content_post_approvals(post_id);

-- -----------------------------------------------------------------------------
-- 9. content_library + content_library_views (PRD §7.3)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.content_library (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id           uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  title               text NOT NULL,
  content_type        text NOT NULL CHECK (content_type IN
                        ('post_idea','reference_article','date_calendar',
                         'visual_template','educational_video','ethics_case')),
  specialty_ids       uuid[] NOT NULL,
  category            text,
  body_markdown       text,
  suggested_copy      text,
  suggested_hashtags  text[],
  suggested_format    text,
  media_urls          text[],
  external_link       text,
  relevant_date       date,
  difficulty          text CHECK (difficulty IN ('basic','intermediate','advanced')),
  ethics_compliant    boolean NOT NULL DEFAULT true,
  ethics_notes        text,
  created_by          uuid REFERENCES public.users(id),
  published           boolean NOT NULL DEFAULT false,
  view_count          int NOT NULL DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_library_agency_pub ON public.content_library(agency_id, published);
CREATE INDEX IF NOT EXISTS idx_library_specialty  ON public.content_library USING GIN (specialty_ids);
CREATE INDEX IF NOT EXISTS idx_library_date       ON public.content_library(relevant_date);

CREATE TABLE IF NOT EXISTS public.content_library_views (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  library_item_id uuid NOT NULL REFERENCES public.content_library(id) ON DELETE CASCADE,
  client_id       uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  client_user_id  uuid REFERENCES public.client_users(id),
  viewed_at       timestamptz NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 10. invoices + invoice_reminders (PRD §8.3)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invoices (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id             uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  client_id             uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  reference_month       text NOT NULL,           -- YYYY-MM
  amount                numeric(10,2) NOT NULL,
  issue_date            date NOT NULL,
  due_date              date NOT NULL,
  paid_at               timestamptz,
  payment_method        text CHECK (payment_method IN ('pix','boleto','credit_card')),
  status                text NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','paid','overdue','canceled','refunded')),
  asaas_payment_id      text UNIQUE,
  asaas_invoice_url     text,
  asaas_pix_qr_code     text,
  asaas_pix_copy_paste  text,
  asaas_boleto_barcode  text,
  asaas_boleto_url      text,
  description           text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  -- Idempotência: 1 fatura por cliente por mês de referência (PRD §8.4.1)
  UNIQUE (client_id, reference_month)
);
CREATE INDEX IF NOT EXISTS idx_invoices_agency_status ON public.invoices(agency_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date      ON public.invoices(due_date) WHERE status = 'pending';

CREATE TABLE IF NOT EXISTS public.invoice_reminders (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id      uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  reminder_type   text NOT NULL CHECK (reminder_type IN
                    ('pre_5d','due_day','post_1d','post_3d','post_7d','post_15d','suspension_warning')),
  channel         text NOT NULL CHECK (channel IN ('whatsapp','email','sms')),
  sent_at         timestamptz NOT NULL DEFAULT now(),
  zapi_message_id text,
  delivery_status text,
  error_message   text
);
CREATE INDEX IF NOT EXISTS idx_reminders_invoice ON public.invoice_reminders(invoice_id);

-- -----------------------------------------------------------------------------
-- 11. prospects + financial_entries + commissions (PRD §9.2)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.prospects (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id                uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  name                     text NOT NULL,
  phone                    text,
  email                    text,
  specialty_id             uuid REFERENCES public.specialties(id),
  source                   text,
  estimated_plan_id        uuid REFERENCES public.plans(id),
  estimated_value          numeric(10,2),
  stage                    text NOT NULL DEFAULT 'lead'
                             CHECK (stage IN ('lead','contacted','meeting_scheduled',
                                              'proposal_sent','negotiating','closed_won','closed_lost')),
  loss_reason              text,
  assigned_to              uuid REFERENCES public.users(id),
  notes                    text,
  converted_to_client_id   uuid REFERENCES public.clients(id),
  created_at               timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_prospects_agency_stage ON public.prospects(agency_id, stage);

CREATE TABLE IF NOT EXISTS public.financial_entries (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id   uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  entry_type  text NOT NULL CHECK (entry_type IN ('income','expense')),
  category    text,
  description text NOT NULL,
  amount      numeric(10,2) NOT NULL,
  entry_date  date NOT NULL,
  invoice_id  uuid REFERENCES public.invoices(id),
  recurrent   boolean NOT NULL DEFAULT false,
  created_by  uuid REFERENCES public.users(id),
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_finance_agency_date ON public.financial_entries(agency_id, entry_date);

CREATE TABLE IF NOT EXISTS public.commissions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id           uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  salesperson_id      uuid NOT NULL REFERENCES public.users(id),
  client_id           uuid NOT NULL REFERENCES public.clients(id),
  invoice_id          uuid REFERENCES public.invoices(id),
  commission_percent  numeric(5,2),
  commission_value    numeric(10,2),
  reference_month     text,
  status              text NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','approved','paid','canceled')),
  paid_at             timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_commissions_agency_status ON public.commissions(agency_id, status);

-- -----------------------------------------------------------------------------
-- 12. post_metrics + paid_campaigns (PRD §10.3)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.post_metrics (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id      uuid NOT NULL REFERENCES public.content_posts(id) ON DELETE CASCADE,
  reach        int,
  impressions  int,
  likes        int,
  comments     int,
  shares       int,
  saves        int,
  clicks       int,
  captured_at  timestamptz NOT NULL DEFAULT now(),
  captured_by  uuid REFERENCES public.users(id)
);
CREATE INDEX IF NOT EXISTS idx_post_metrics_post ON public.post_metrics(post_id);

CREATE TABLE IF NOT EXISTS public.paid_campaigns (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id       uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  client_id       uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name            text NOT NULL,
  platform        text,
  objective       text,
  start_date      date,
  end_date        date,
  budget_total    numeric(10,2),
  amount_spent    numeric(10,2),
  results_count   int,
  cost_per_result numeric(10,2),
  notes           text,
  status          text NOT NULL DEFAULT 'active',
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_campaigns_agency_client ON public.paid_campaigns(agency_id, client_id);

-- -----------------------------------------------------------------------------
-- 13. integration_logs (PRD §3.1, §20.1) — log de TODA chamada externa
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.integration_logs (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id         uuid REFERENCES public.agencies(id) ON DELETE SET NULL,
  client_id         uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  integration       text NOT NULL CHECK (integration IN ('asaas','zapi','anthropic','resend','system')),
  operation         text NOT NULL,
  level             text NOT NULL CHECK (level IN ('info','warn','error')),
  request_payload   jsonb,
  response_payload  jsonb,
  status_code       int,
  error_message     text,
  duration_ms       int,
  reference_id      text,
  created_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_logs_created  ON public.integration_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_int_op   ON public.integration_logs(integration, operation);
CREATE INDEX IF NOT EXISTS idx_logs_ref      ON public.integration_logs(reference_id);

-- =============================================================================
-- 14. Funções auxiliares de RLS (PRD §12.2)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_my_agency_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT agency_id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_my_client_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT client_id FROM public.client_users
  WHERE auth_user_id = auth.uid() AND active = true
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.users WHERE auth_user_id = auth.uid()),
    (SELECT 'client'::text FROM public.client_users
       WHERE auth_user_id = auth.uid() AND active = true LIMIT 1)
  );
$$;

-- =============================================================================
-- 15. RLS — ENABLE em TODAS as tabelas (PRD §18.2 — 100% obrigatório)
-- =============================================================================
ALTER TABLE public.agencies               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialties            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_posts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_post_media     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_post_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_library        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_library_views  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_reminders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospects              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_entries      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_metrics           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paid_campaigns         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_logs       ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 16. Policies (PRD §12 — exemplo §12.3 expandido a todas as tabelas)
-- =============================================================================

-- agencies: usuário interno vê a sua; clientes não enxergam.
CREATE POLICY agencies_internal_select ON public.agencies FOR SELECT
  USING (id = public.get_my_agency_id());

-- users: equipe vê colegas da mesma agência; admin/manager pode escrever.
CREATE POLICY users_internal_select ON public.users FOR SELECT
  USING (agency_id = public.get_my_agency_id());
CREATE POLICY users_admin_write ON public.users FOR ALL
  USING (agency_id = public.get_my_agency_id() AND public.get_my_role() IN ('admin'))
  WITH CHECK (agency_id = public.get_my_agency_id());

-- specialties: leitura pública para usuários autenticados (catálogo global).
CREATE POLICY specialties_select ON public.specialties FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY specialties_admin_write ON public.specialties FOR ALL
  USING (public.get_my_role() = 'admin') WITH CHECK (public.get_my_role() = 'admin');

-- plans: equipe vê os planos da agência; cliente vê o próprio plano via JOIN no app.
CREATE POLICY plans_internal_select ON public.plans FOR SELECT
  USING (agency_id = public.get_my_agency_id());
CREATE POLICY plans_admin_write ON public.plans FOR ALL
  USING (agency_id = public.get_my_agency_id() AND public.get_my_role() IN ('admin','manager'))
  WITH CHECK (agency_id = public.get_my_agency_id());

-- clients: equipe vê os clientes da agência; cliente vê apenas o próprio registro.
CREATE POLICY clients_internal_select ON public.clients FOR SELECT
  USING (agency_id = public.get_my_agency_id()
         AND public.get_my_role() IN ('admin','manager','designer','traffic','salesperson','viewer'));
CREATE POLICY clients_self_select ON public.clients FOR SELECT
  USING (id = public.get_my_client_id());
CREATE POLICY clients_admin_write ON public.clients FOR ALL
  USING (agency_id = public.get_my_agency_id() AND public.get_my_role() IN ('admin','manager'))
  WITH CHECK (agency_id = public.get_my_agency_id());

-- client_users: equipe da agência vê todos do seu pool; cliente vê apenas o próprio.
CREATE POLICY client_users_internal_select ON public.client_users FOR SELECT
  USING (client_id IN (SELECT id FROM public.clients WHERE agency_id = public.get_my_agency_id()));
CREATE POLICY client_users_self_select ON public.client_users FOR SELECT
  USING (auth_user_id = auth.uid());
CREATE POLICY client_users_admin_write ON public.client_users FOR ALL
  USING (
    client_id IN (SELECT id FROM public.clients WHERE agency_id = public.get_my_agency_id())
    AND public.get_my_role() IN ('admin','manager')
  )
  WITH CHECK (
    client_id IN (SELECT id FROM public.clients WHERE agency_id = public.get_my_agency_id())
  );

-- content_posts: PRD §12.3 (interno vê tudo da agência; cliente vê os próprios em estados visíveis).
CREATE POLICY posts_internal_select ON public.content_posts FOR SELECT
  USING (agency_id = public.get_my_agency_id()
         AND public.get_my_role() IN ('admin','manager','designer','traffic','viewer'));
CREATE POLICY posts_internal_write ON public.content_posts FOR ALL
  USING (agency_id = public.get_my_agency_id()
         AND public.get_my_role() IN ('admin','manager','designer'))
  WITH CHECK (agency_id = public.get_my_agency_id());
CREATE POLICY posts_client_select ON public.content_posts FOR SELECT
  USING (client_id = public.get_my_client_id()
         AND status IN ('awaiting_client','approved','scheduled','published'));
CREATE POLICY posts_client_update_approval ON public.content_posts FOR UPDATE
  USING (client_id = public.get_my_client_id() AND status = 'awaiting_client')
  WITH CHECK (client_id = public.get_my_client_id());

-- content_post_media: segue o post.
CREATE POLICY post_media_select ON public.content_post_media FOR SELECT
  USING (post_id IN (SELECT id FROM public.content_posts));  -- RLS do parent decide
CREATE POLICY post_media_write ON public.content_post_media FOR ALL
  USING (post_id IN (
    SELECT id FROM public.content_posts
    WHERE agency_id = public.get_my_agency_id()
      AND public.get_my_role() IN ('admin','manager','designer')
  ))
  WITH CHECK (post_id IN (
    SELECT id FROM public.content_posts WHERE agency_id = public.get_my_agency_id()
  ));

-- content_post_approvals: cliente registra a sua decisão; equipe lê tudo da agência.
CREATE POLICY approvals_internal_select ON public.content_post_approvals FOR SELECT
  USING (post_id IN (SELECT id FROM public.content_posts WHERE agency_id = public.get_my_agency_id()));
CREATE POLICY approvals_client_select ON public.content_post_approvals FOR SELECT
  USING (post_id IN (SELECT id FROM public.content_posts WHERE client_id = public.get_my_client_id()));
CREATE POLICY approvals_internal_insert ON public.content_post_approvals FOR INSERT
  WITH CHECK (
    approver_role = 'internal'
    AND post_id IN (SELECT id FROM public.content_posts WHERE agency_id = public.get_my_agency_id())
  );
CREATE POLICY approvals_client_insert ON public.content_post_approvals FOR INSERT
  WITH CHECK (
    approver_role = 'client'
    AND post_id IN (SELECT id FROM public.content_posts WHERE client_id = public.get_my_client_id())
  );

-- content_library: equipe (admin/manager) lê e escreve tudo da agência;
-- cliente vê apenas itens publicados que cobrem a sua specialty (PRD §7.5).
CREATE POLICY library_internal_select ON public.content_library FOR SELECT
  USING (agency_id = public.get_my_agency_id());
CREATE POLICY library_admin_write ON public.content_library FOR ALL
  USING (agency_id = public.get_my_agency_id() AND public.get_my_role() IN ('admin','manager'))
  WITH CHECK (agency_id = public.get_my_agency_id());
CREATE POLICY library_client_select ON public.content_library FOR SELECT
  USING (
    published = true
    AND specialty_ids @> ARRAY[(SELECT specialty_id FROM public.clients WHERE id = public.get_my_client_id())]
  );

-- content_library_views: cada cliente registra suas próprias views.
CREATE POLICY library_views_client_insert ON public.content_library_views FOR INSERT
  WITH CHECK (client_id = public.get_my_client_id());
CREATE POLICY library_views_internal_select ON public.content_library_views FOR SELECT
  USING (client_id IN (SELECT id FROM public.clients WHERE agency_id = public.get_my_agency_id()));

-- invoices: equipe vê tudo da agência; cliente vê apenas as próprias.
CREATE POLICY invoices_internal_select ON public.invoices FOR SELECT
  USING (agency_id = public.get_my_agency_id());
CREATE POLICY invoices_client_select ON public.invoices FOR SELECT
  USING (client_id = public.get_my_client_id());
-- Escrita só via service-role (Edge Functions). Sem policy de write = bloqueado para anon/authenticated.

-- invoice_reminders: equipe lê; sem write via app.
CREATE POLICY reminders_internal_select ON public.invoice_reminders FOR SELECT
  USING (invoice_id IN (SELECT id FROM public.invoices WHERE agency_id = public.get_my_agency_id()));

-- prospects: vendedor vê os próprios; admin/manager vê todos.
CREATE POLICY prospects_admin_select ON public.prospects FOR SELECT
  USING (agency_id = public.get_my_agency_id() AND public.get_my_role() IN ('admin','manager'));
CREATE POLICY prospects_self_select ON public.prospects FOR SELECT
  USING (assigned_to = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));
CREATE POLICY prospects_sales_write ON public.prospects FOR ALL
  USING (agency_id = public.get_my_agency_id() AND public.get_my_role() IN ('admin','manager','salesperson'))
  WITH CHECK (agency_id = public.get_my_agency_id());

-- financial_entries: somente admin/manager.
CREATE POLICY finance_admin_all ON public.financial_entries FOR ALL
  USING (agency_id = public.get_my_agency_id() AND public.get_my_role() IN ('admin','manager'))
  WITH CHECK (agency_id = public.get_my_agency_id());

-- commissions: admin vê tudo; vendedor vê as próprias.
CREATE POLICY commissions_admin_select ON public.commissions FOR SELECT
  USING (agency_id = public.get_my_agency_id() AND public.get_my_role() IN ('admin','manager'));
CREATE POLICY commissions_self_select ON public.commissions FOR SELECT
  USING (salesperson_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- post_metrics: equipe lê/escreve; cliente lê apenas dos próprios posts.
CREATE POLICY metrics_internal_all ON public.post_metrics FOR ALL
  USING (post_id IN (SELECT id FROM public.content_posts WHERE agency_id = public.get_my_agency_id()))
  WITH CHECK (post_id IN (SELECT id FROM public.content_posts WHERE agency_id = public.get_my_agency_id()));
CREATE POLICY metrics_client_select ON public.post_metrics FOR SELECT
  USING (post_id IN (SELECT id FROM public.content_posts WHERE client_id = public.get_my_client_id()));

-- paid_campaigns: traffic/admin/manager escrevem; cliente apenas lê as próprias.
CREATE POLICY campaigns_internal_select ON public.paid_campaigns FOR SELECT
  USING (agency_id = public.get_my_agency_id());
CREATE POLICY campaigns_internal_write ON public.paid_campaigns FOR ALL
  USING (agency_id = public.get_my_agency_id() AND public.get_my_role() IN ('admin','manager','traffic'))
  WITH CHECK (agency_id = public.get_my_agency_id());
CREATE POLICY campaigns_client_select ON public.paid_campaigns FOR SELECT
  USING (client_id = public.get_my_client_id());

-- integration_logs: somente admin lê via app; insert exclusivo via service-role.
CREATE POLICY logs_admin_select ON public.integration_logs FOR SELECT
  USING (
    (agency_id IS NULL OR agency_id = public.get_my_agency_id())
    AND public.get_my_role() = 'admin'
  );

-- =============================================================================
-- 17. Triggers utilitários — updated_at automático
-- =============================================================================
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated         BEFORE UPDATE ON public.users         FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER trg_clients_updated       BEFORE UPDATE ON public.clients       FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER trg_posts_updated         BEFORE UPDATE ON public.content_posts FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER trg_invoices_updated      BEFORE UPDATE ON public.invoices      FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =============================================================================
-- FIM da migration inicial.
-- Próximas migrations: storage buckets, pg_cron jobs, seeds de specialties.
-- =============================================================================
