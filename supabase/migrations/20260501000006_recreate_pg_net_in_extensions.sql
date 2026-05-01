-- =============================================================================
-- TRIMARK — Mover pg_net para schema `extensions`
-- pg_net não aceita ALTER EXTENSION SET SCHEMA → DROP + CREATE WITH SCHEMA.
-- pg_net continua expondo funções em namespace `net` (independe do schema da
-- extensão), então invoke_edge_function permanece chamando net.http_post.
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS extensions;

DROP EXTENSION IF EXISTS pg_net CASCADE;
CREATE EXTENSION pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.invoke_edge_function(fn_name text, payload jsonb DEFAULT '{}'::jsonb)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, net, pg_temp
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
