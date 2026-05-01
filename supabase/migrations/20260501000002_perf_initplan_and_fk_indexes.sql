-- =============================================================================
-- TRIMARK — Performance fixes pós migration inicial
-- Data: 2026-05-01
-- Cobre 26 dos 133 lints do performance advisor:
--   * 4 auth_rls_initplan: wrap auth.uid() em (SELECT auth.uid()) → InitPlan cacheado
--   * 22 unindexed_foreign_keys: índice em toda FK que não tinha cobertura
-- DÍVIDA TÉCNICA documentada (não corrigida nesta migration):
--   * 80 multiple_permissive_policies — refatorar para 1 policy por (role, action)
--     usando OR. Trade-off: clareza vs perf. Tabela vazia = perf não importa ainda.
--   * 26 unused_index — provavelmente falsos positivos (DB sem tráfego). Re-avaliar
--     em produção após 30d.
--   * 1 auth_db_connections_absolute — config de Auth, fora do scope de migration.
-- =============================================================================

-- ============== 1) auth_rls_initplan ==============
DROP POLICY IF EXISTS specialties_select         ON public.specialties;
DROP POLICY IF EXISTS client_users_self_select   ON public.client_users;
DROP POLICY IF EXISTS prospects_self_select      ON public.prospects;
DROP POLICY IF EXISTS commissions_self_select    ON public.commissions;

CREATE POLICY specialties_select ON public.specialties FOR SELECT
  USING ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY client_users_self_select ON public.client_users FOR SELECT
  USING (auth_user_id = (SELECT auth.uid()));

CREATE POLICY prospects_self_select ON public.prospects FOR SELECT
  USING (assigned_to = (SELECT id FROM public.users WHERE auth_user_id = (SELECT auth.uid())));

CREATE POLICY commissions_self_select ON public.commissions FOR SELECT
  USING (salesperson_id = (SELECT id FROM public.users WHERE auth_user_id = (SELECT auth.uid())));

-- ============== 2) Índices em FKs ==============
CREATE INDEX IF NOT EXISTS idx_clients_specialty       ON public.clients(specialty_id);
CREATE INDEX IF NOT EXISTS idx_clients_plan            ON public.clients(plan_id);
CREATE INDEX IF NOT EXISTS idx_clients_account_manager ON public.clients(account_manager_id);

CREATE INDEX IF NOT EXISTS idx_prospects_specialty            ON public.prospects(specialty_id);
CREATE INDEX IF NOT EXISTS idx_prospects_assigned_to          ON public.prospects(assigned_to);
CREATE INDEX IF NOT EXISTS idx_prospects_estimated_plan       ON public.prospects(estimated_plan_id);
CREATE INDEX IF NOT EXISTS idx_prospects_converted_to_client  ON public.prospects(converted_to_client_id);

CREATE INDEX IF NOT EXISTS idx_posts_created_by  ON public.content_posts(created_by);
CREATE INDEX IF NOT EXISTS idx_posts_assigned_to ON public.content_posts(assigned_to);

CREATE INDEX IF NOT EXISTS idx_library_created_by ON public.content_library(created_by);

CREATE INDEX IF NOT EXISTS idx_library_views_item        ON public.content_library_views(library_item_id);
CREATE INDEX IF NOT EXISTS idx_library_views_client      ON public.content_library_views(client_id);
CREATE INDEX IF NOT EXISTS idx_library_views_client_user ON public.content_library_views(client_user_id);

CREATE INDEX IF NOT EXISTS idx_commissions_salesperson ON public.commissions(salesperson_id);
CREATE INDEX IF NOT EXISTS idx_commissions_client      ON public.commissions(client_id);
CREATE INDEX IF NOT EXISTS idx_commissions_invoice     ON public.commissions(invoice_id);

CREATE INDEX IF NOT EXISTS idx_finance_invoice    ON public.financial_entries(invoice_id);
CREATE INDEX IF NOT EXISTS idx_finance_created_by ON public.financial_entries(created_by);

CREATE INDEX IF NOT EXISTS idx_logs_agency ON public.integration_logs(agency_id);
CREATE INDEX IF NOT EXISTS idx_logs_client ON public.integration_logs(client_id);

CREATE INDEX IF NOT EXISTS idx_post_metrics_captured_by ON public.post_metrics(captured_by);
