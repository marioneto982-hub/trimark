-- =============================================================================
-- TRIMARK — Storage buckets + RLS (PRD §11.4 e §19)
-- Convenções de path:
--   post-media:        <agency_id>/<client_id>/<post_id>/<filename>
--   client-documents:  <agency_id>/<client_id>/<filename>
--   library-media:     <agency_id>/<library_item_id>/<filename>
--   agency-assets:     <agency_id>/<filename>           (público — logo, etc.)
-- Limite por arquivo: 50MB (PRD §19 — mitigação custo storage).
-- =============================================================================

-- 1. Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('post-media',       'post-media',       false, 52428800,
    ARRAY['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/quicktime','application/pdf']),
  ('client-documents', 'client-documents', false, 52428800,
    ARRAY['application/pdf','image/jpeg','image/png']),
  ('library-media',    'library-media',    false, 52428800,
    ARRAY['image/jpeg','image/png','image/webp','image/gif','video/mp4','application/pdf']),
  ('agency-assets',    'agency-assets',    true,  10485760,
    ARRAY['image/jpeg','image/png','image/webp','image/svg+xml'])
ON CONFLICT (id) DO UPDATE SET
  public             = EXCLUDED.public,
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Policies — storage.objects

-- ============== post-media ==============
DROP POLICY IF EXISTS post_media_internal_select ON storage.objects;
DROP POLICY IF EXISTS post_media_client_select   ON storage.objects;
DROP POLICY IF EXISTS post_media_internal_write  ON storage.objects;
DROP POLICY IF EXISTS post_media_internal_delete ON storage.objects;

CREATE POLICY post_media_internal_select ON storage.objects FOR SELECT
  USING (
    bucket_id = 'post-media'
    AND (storage.foldername(name))[1] = public.get_my_agency_id()::text
    AND public.get_my_role() IN ('admin','manager','designer','traffic','viewer')
  );

CREATE POLICY post_media_client_select ON storage.objects FOR SELECT
  USING (
    bucket_id = 'post-media'
    AND (storage.foldername(name))[2] = public.get_my_client_id()::text
  );

CREATE POLICY post_media_internal_write ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'post-media'
    AND (storage.foldername(name))[1] = public.get_my_agency_id()::text
    AND public.get_my_role() IN ('admin','manager','designer')
  );

CREATE POLICY post_media_internal_delete ON storage.objects FOR DELETE
  USING (
    bucket_id = 'post-media'
    AND (storage.foldername(name))[1] = public.get_my_agency_id()::text
    AND public.get_my_role() IN ('admin','manager','designer')
  );

-- ============== client-documents ==============
DROP POLICY IF EXISTS client_docs_internal_select ON storage.objects;
DROP POLICY IF EXISTS client_docs_client_select   ON storage.objects;
DROP POLICY IF EXISTS client_docs_internal_write  ON storage.objects;
DROP POLICY IF EXISTS client_docs_internal_delete ON storage.objects;

CREATE POLICY client_docs_internal_select ON storage.objects FOR SELECT
  USING (
    bucket_id = 'client-documents'
    AND (storage.foldername(name))[1] = public.get_my_agency_id()::text
    AND public.get_my_role() IN ('admin','manager')
  );

CREATE POLICY client_docs_client_select ON storage.objects FOR SELECT
  USING (
    bucket_id = 'client-documents'
    AND (storage.foldername(name))[2] = public.get_my_client_id()::text
  );

CREATE POLICY client_docs_internal_write ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'client-documents'
    AND (storage.foldername(name))[1] = public.get_my_agency_id()::text
    AND public.get_my_role() IN ('admin','manager')
  );

CREATE POLICY client_docs_internal_delete ON storage.objects FOR DELETE
  USING (
    bucket_id = 'client-documents'
    AND (storage.foldername(name))[1] = public.get_my_agency_id()::text
    AND public.get_my_role() = 'admin'
  );

-- ============== library-media ==============
DROP POLICY IF EXISTS library_media_select         ON storage.objects;
DROP POLICY IF EXISTS library_media_internal_write ON storage.objects;
DROP POLICY IF EXISTS library_media_internal_delete ON storage.objects;

CREATE POLICY library_media_select ON storage.objects FOR SELECT
  USING (
    bucket_id = 'library-media'
    AND (
      (storage.foldername(name))[1] = public.get_my_agency_id()::text
      OR (storage.foldername(name))[1] IN (
        SELECT id::text FROM public.agencies
        WHERE id IN (SELECT agency_id FROM public.clients WHERE id = public.get_my_client_id())
      )
    )
  );

CREATE POLICY library_media_internal_write ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'library-media'
    AND (storage.foldername(name))[1] = public.get_my_agency_id()::text
    AND public.get_my_role() IN ('admin','manager')
  );

CREATE POLICY library_media_internal_delete ON storage.objects FOR DELETE
  USING (
    bucket_id = 'library-media'
    AND (storage.foldername(name))[1] = public.get_my_agency_id()::text
    AND public.get_my_role() IN ('admin','manager')
  );

-- ============== agency-assets ==============
-- Bucket é PÚBLICO: acesso direto via URL pública não precisa de policy de SELECT.
-- Manter SELECT habilitaria listagem via Storage API (não desejável).
-- Apenas write/delete restritos a admin da agência.
DROP POLICY IF EXISTS agency_assets_admin_write   ON storage.objects;
DROP POLICY IF EXISTS agency_assets_admin_delete  ON storage.objects;

CREATE POLICY agency_assets_admin_write ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'agency-assets'
    AND (storage.foldername(name))[1] = public.get_my_agency_id()::text
    AND public.get_my_role() = 'admin'
  );

CREATE POLICY agency_assets_admin_delete ON storage.objects FOR DELETE
  USING (
    bucket_id = 'agency-assets'
    AND (storage.foldername(name))[1] = public.get_my_agency_id()::text
    AND public.get_my_role() = 'admin'
  );
