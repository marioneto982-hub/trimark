-- =============================================================================
-- TRIMARK — Hardening de segurança pós migration inicial
-- Data: 2026-05-01
-- Motivo: corrigir 7 warnings do Supabase security advisor:
--   * function_search_path_mutable em tg_set_updated_at
--   * SECURITY DEFINER functions (get_my_*) executáveis por anon e authenticated
-- Decisão: anon perde EXECUTE; authenticated mantém (RLS depende disso).
-- =============================================================================

-- 1) tg_set_updated_at — fix search_path mutável
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- 2) Revogar EXECUTE das funções RLS auxiliares do role anon e do PUBLIC.
--    `authenticated` mantém — as policies usam essas funções no contexto do usuário logado.
--    `service_role` mantém para uso em Edge Functions.
REVOKE EXECUTE ON FUNCTION public.get_my_agency_id() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_my_client_id() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_my_role()      FROM anon, public;

GRANT EXECUTE ON FUNCTION public.get_my_agency_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_my_client_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_my_role()      TO authenticated, service_role;
