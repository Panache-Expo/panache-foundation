CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

ALTER TABLE public.cyes_award_nominees
  ADD COLUMN IF NOT EXISTS slug TEXT;

ALTER TABLE public.cyes_award_nominees
  ADD COLUMN IF NOT EXISTS contestant_password_hash TEXT;

WITH normalized_nominees AS (
  SELECT
    id,
    COALESCE(
      NULLIF(
        TRIM(
          BOTH '-' FROM regexp_replace(
            lower(replace(COALESCE(name, ''), '&', ' and ')),
            '[^a-z0-9]+',
            '-',
            'g'
          )
        ),
        ''
      ),
      'cyes-nominee-' || substring(id::text, 1, 8)
    ) AS base_slug,
    sort_order,
    name
  FROM public.cyes_award_nominees
),
ranked_nominees AS (
  SELECT
    id,
    base_slug,
    row_number() OVER (
      PARTITION BY base_slug
      ORDER BY sort_order, name, id
    ) AS duplicate_index
  FROM normalized_nominees
)
UPDATE public.cyes_award_nominees nominees
SET
  slug = CASE
    WHEN ranked.duplicate_index = 1 THEN ranked.base_slug
    ELSE ranked.base_slug || '-' || ranked.duplicate_index::text
  END,
  updated_at = now()
FROM ranked_nominees ranked
WHERE nominees.id = ranked.id
  AND NULLIF(TRIM(nominees.slug), '') IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_cyes_award_nominees_slug
  ON public.cyes_award_nominees (slug);

ALTER TABLE public.cyes_award_nominees
  ALTER COLUMN slug SET NOT NULL;

CREATE OR REPLACE FUNCTION public.verify_cyes_contestant_password(
  p_slug TEXT,
  p_password TEXT
)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  name TEXT,
  organization TEXT,
  bio TEXT,
  photo_url TEXT,
  category_name TEXT,
  category_slug TEXT,
  total_votes INTEGER,
  verified_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    n.id,
    n.slug,
    n.name,
    n.organization,
    n.bio,
    n.photo_url,
    c.name AS category_name,
    c.slug AS category_slug,
    COALESCE(v.vote_count, 0)::integer AS total_votes,
    now() AS verified_at
  FROM public.cyes_award_nominees n
  JOIN public.cyes_award_categories c
    ON c.id = n.category_id
  LEFT JOIN public.cyes_nominee_vote_counts v
    ON v.nominee_id = n.id
  WHERE n.slug = p_slug
    AND n.status = 'active'
    AND c.status = 'active'
    AND n.contestant_password_hash IS NOT NULL
    AND n.contestant_password_hash = extensions.crypt(p_password, n.contestant_password_hash)
  LIMIT 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.public_verify_cyes_contestant_password(
  p_slug TEXT,
  p_password TEXT
)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  name TEXT,
  organization TEXT,
  bio TEXT,
  photo_url TEXT,
  category_name TEXT,
  category_slug TEXT,
  total_votes INTEGER,
  verified_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.verify_cyes_contestant_password(p_slug, p_password);
END;
$$;

CREATE OR REPLACE FUNCTION public.set_cyes_contestant_password(
  p_nominee_id UUID,
  p_password TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
BEGIN
  IF p_nominee_id IS NULL THEN
    RAISE EXCEPTION 'Nominee id is required.';
  END IF;

  IF NULLIF(TRIM(p_password), '') IS NULL THEN
    RAISE EXCEPTION 'Password is required.';
  END IF;

  UPDATE public.cyes_award_nominees
  SET
    contestant_password_hash = extensions.crypt(p_password, extensions.gen_salt('bf')),
    updated_at = now()
  WHERE id = p_nominee_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'CYES nominee not found.';
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.verify_cyes_contestant_password(TEXT, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.public_verify_cyes_contestant_password(TEXT, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_cyes_contestant_password(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_verify_cyes_contestant_password(TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.verify_cyes_contestant_password(TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.set_cyes_contestant_password(UUID, TEXT) TO service_role;

REVOKE SELECT ON public.cyes_award_nominees FROM anon, authenticated;
GRANT SELECT (
  id,
  category_id,
  slug,
  name,
  organization,
  bio,
  photo_url,
  status,
  sort_order,
  created_at,
  updated_at
) ON public.cyes_award_nominees TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cyes_award_nominees TO service_role;
GRANT SELECT ON public.cyes_award_categories TO anon, authenticated, service_role;
GRANT SELECT ON public.cyes_nominee_vote_counts TO anon, authenticated, service_role;
