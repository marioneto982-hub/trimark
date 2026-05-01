-- =============================================================================
-- TRIMARK — pg_cron + pg_net + helper de invocação de Edge Functions
-- Data: 2026-05-01
-- Crons ficam DEFINIDOS na função schedule_trimark_crons() mas NÃO agendados
-- automaticamente. Para ativar:
--   1) Inserir SERVICE_ROLE_KEY no vault:
--      SELECT vault.create_secret('eyJ...', 'trimark_service_role_key',
--                                 'Service role key for cron');
--   2) Confirmar que as Edge Functions correspondentes existem.
--   3) Rodar: SELECT public.schedule_trimark_crons();
-- Para parar: SELECT public.unschedule_trimark_crons();
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

GRANT USAGE ON SCHEMA cron TO postgres;

-- ----- Helper que dispara uma Edge Function -----
CREATE OR REPLACE FUNCTION public.invoke_edge_function(fn_name text, payload jsonb DEFAULT '{}'::jsonb)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_url           text;
  v_service_key   text;
  v_request_id    bigint;
BEGIN
  v_url := 'https://rrprzipocqxwadsiscpz.supabase.co/functions/v1/' || fn_name;

  SELECT decrypted_secret INTO v_service_key
  FROM vault.decrypted_secrets
  WHERE name = 'trimark_service_role_key'
  LIMIT 1;

  IF v_service_key IS NULL THEN
    RAISE NOTICE 'invoke_edge_function: vault secret trimark_service_role_key não encontrado — pulando %', fn_name;
    RETURN NULL;
  END IF;

  SELECT net.http_post(
    url := v_url,
    body := payload,
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || v_service_key
    )
  ) INTO v_request_id;

  RETURN v_request_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.invoke_edge_function(text, jsonb) FROM anon, public, authenticated;
GRANT  EXECUTE ON FUNCTION public.invoke_edge_function(text, jsonb) TO service_role;

-- ----- Função de ativação dos 7 crons (PRD §14) -----
CREATE OR REPLACE FUNCTION public.schedule_trimark_crons()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  PERFORM cron.unschedule(jobname) FROM cron.job
    WHERE jobname IN (
      'trimark_invoice_cron_daily',
      'trimark_post_pending_reminder',
      'trimark_metrics_monthly_snapshot',
      'trimark_monthly_report_generate',
      'trimark_client_suspend_overdue',
      'trimark_commission_calculate',
      'trimark_integration_logs_cleanup'
    );

  PERFORM cron.schedule('trimark_invoice_cron_daily',       '0 9 * * *',
    $sql$ SELECT public.invoke_edge_function('invoice-cron-daily'); $sql$);

  PERFORM cron.schedule('trimark_post_pending_reminder',    '0 14 * * *',
    $sql$ SELECT public.invoke_edge_function('post-pending-reminder'); $sql$);

  PERFORM cron.schedule('trimark_client_suspend_overdue',   '0 7 * * *',
    $sql$ SELECT public.invoke_edge_function('client-suspend-overdue'); $sql$);

  PERFORM cron.schedule('trimark_metrics_monthly_snapshot', '0 1 1 * *',
    $sql$ SELECT public.invoke_edge_function('metrics-monthly-snapshot'); $sql$);

  PERFORM cron.schedule('trimark_monthly_report_generate',  '0 2 1 * *',
    $sql$ SELECT public.invoke_edge_function('monthly-report-generate'); $sql$);

  PERFORM cron.schedule('trimark_commission_calculate',     '0 6 1 * *',
    $sql$ SELECT public.invoke_edge_function('commission-calculate'); $sql$);

  PERFORM cron.schedule('trimark_integration_logs_cleanup', '0 3 * * 0',
    $sql$ SELECT public.invoke_edge_function('integration-logs-cleanup'); $sql$);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.schedule_trimark_crons() FROM anon, public, authenticated;
GRANT  EXECUTE ON FUNCTION public.schedule_trimark_crons() TO service_role;

CREATE OR REPLACE FUNCTION public.unschedule_trimark_crons()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  PERFORM cron.unschedule(jobname) FROM cron.job WHERE jobname LIKE 'trimark\_%' ESCAPE '\';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.unschedule_trimark_crons() FROM anon, public, authenticated;
GRANT  EXECUTE ON FUNCTION public.unschedule_trimark_crons() TO service_role;
