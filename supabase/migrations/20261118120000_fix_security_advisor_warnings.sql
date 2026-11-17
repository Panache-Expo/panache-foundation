-- Fix Supabase security-advisor findings (lints 0010, 0011, 0028, 0029).
--
-- Background: Supabase's default privileges in `public` grant EXECUTE on every
-- new function to anon, authenticated and service_role explicitly. Earlier
-- migrations only ran `REVOKE ... FROM PUBLIC`, which does not remove those
-- explicit grants, so functions meant for service_role only ended up callable
-- by anyone through /rest/v1/rpc/*.
--
-- Intentionally left public (called from the browser with the anon key):
--   get_miss_panache_public_voting()
--   public_verify_panache_dor_contestant_password(text, text)
--   public_verify_panache_360_contestant_password(text, text)
--   public_verify_cyes_contestant_password(text, text)

-- 1. Service-role-only functions: remove anon/authenticated EXECUTE.
--    The server (server/api/*.js) calls these with the service-role key, and
--    the public_verify_* wrappers call the inner verify_* functions as their
--    owner (postgres), so neither path needs anon/authenticated.

-- Lets anyone reset any CYES nominee's access-pass password by nominee id.
REVOKE EXECUTE ON FUNCTION public.set_cyes_contestant_password(uuid, text) FROM PUBLIC, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.verify_cyes_contestant_password(text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.verify_panache_dor_contestant_password(text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.verify_panache_360_contestant_password(text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.verify_miss_panache_contestant_password(text, text) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.set_cyes_contestant_password(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.verify_cyes_contestant_password(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.verify_panache_dor_contestant_password(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.verify_panache_360_contestant_password(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.verify_miss_panache_contestant_password(text, text) TO service_role;

-- 2. rls_auto_enable() is the event-trigger function behind `ensure_rls`.
--    Postgres does not check EXECUTE when an event trigger fires, so this only
--    removes the pointless /rest/v1/rpc/rls_auto_enable endpoint.
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;

-- 3. Vote-count views: run with the caller's permissions instead of the
--    owner's. Today anon can read raw counts (and Panache D'or amounts in XAF)
--    from /rest/v1/<view> even while the API hides them during blind voting.
--    The server reads them with service_role (bypasses RLS) and the SECURITY
--    DEFINER verify_* functions read them as postgres (bypasses RLS), so the
--    site keeps the same numbers. Panache 360 and Miss Panache views already
--    use security_invoker.
ALTER VIEW public.cyes_nominee_vote_counts SET (security_invoker = true);
ALTER VIEW public.cyes_category_vote_counts SET (security_invoker = true);
ALTER VIEW public.panache_dor_nominee_vote_counts SET (security_invoker = true);
ALTER VIEW public.panache_dor_category_vote_counts SET (security_invoker = true);
ALTER VIEW public.panache_dor_leaderboard SET (security_invoker = true);

-- 4. Trigger function on panache_dor_campay_transactions: pin search_path.
--    The body only uses built-ins (coalesce, regexp_replace, jsonb_build_object).
ALTER FUNCTION public.exclude_panache_dor_non_disbursement_campay_transactions()
  SET search_path = pg_catalog, public;
