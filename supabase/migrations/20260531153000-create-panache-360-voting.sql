CREATE TABLE IF NOT EXISTS public.panache_360_award_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.panache_360_award_nominees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.panache_360_award_categories(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  organization TEXT,
  bio TEXT,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  ayati_vote_url TEXT,
  ayati_sync_id TEXT,
  ayati_vote_count INTEGER NOT NULL DEFAULT 0,
  ayati_last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.panache_360_vote_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nominee_id UUID NOT NULL REFERENCES public.panache_360_award_nominees(id) ON DELETE RESTRICT,
  category_id UUID NOT NULL REFERENCES public.panache_360_award_categories(id) ON DELETE RESTRICT,
  tx_ref TEXT NOT NULL UNIQUE,
  campay_reference TEXT UNIQUE,
  payment_link TEXT,
  provider TEXT NOT NULL DEFAULT 'campay',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  voter_email TEXT,
  voter_whatsapp TEXT,
  vote_count INTEGER NOT NULL CHECK (vote_count > 0),
  vote_price_xaf INTEGER NOT NULL DEFAULT 100 CHECK (vote_price_xaf >= 0),
  processing_fee_per_vote_xaf INTEGER NOT NULL DEFAULT 0 CHECK (processing_fee_per_vote_xaf >= 0),
  amount_xaf INTEGER NOT NULL CHECK (amount_xaf > 0),
  currency TEXT NOT NULL DEFAULT 'XAF',
  provider_status TEXT,
  provider_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  verified_at TIMESTAMP WITH TIME ZONE,
  failure_reason TEXT,
  receipt_email_sent_at TIMESTAMP WITH TIME ZONE,
  receipt_email_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.panache_360_campay_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campay_reference TEXT UNIQUE,
  external_reference TEXT,
  direction TEXT NOT NULL DEFAULT 'unknown' CHECK (direction IN ('deposit', 'withdrawal', 'unknown')),
  amount_xaf INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'XAF',
  status TEXT NOT NULL DEFAULT 'UNKNOWN',
  phone TEXT,
  operator TEXT,
  description TEXT,
  transaction_date TIMESTAMP WITH TIME ZONE,
  raw JSONB NOT NULL DEFAULT '{}'::jsonb,
  excluded_from_revenue BOOLEAN NOT NULL DEFAULT false,
  revenue_exclusion_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_panache_360_award_categories_status
  ON public.panache_360_award_categories (status, sort_order, name);

CREATE INDEX IF NOT EXISTS idx_panache_360_award_nominees_category
  ON public.panache_360_award_nominees (category_id, status, sort_order, name);

CREATE INDEX IF NOT EXISTS idx_panache_360_award_nominees_sync_id
  ON public.panache_360_award_nominees (ayati_sync_id)
  WHERE ayati_sync_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_panache_360_vote_payments_nominee_status
  ON public.panache_360_vote_payments (nominee_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_panache_360_vote_payments_category_status
  ON public.panache_360_vote_payments (category_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_panache_360_vote_payments_status_created
  ON public.panache_360_vote_payments (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_panache_360_vote_payments_voter_email
  ON public.panache_360_vote_payments (voter_email);

CREATE INDEX IF NOT EXISTS idx_panache_360_campay_transactions_direction
  ON public.panache_360_campay_transactions (direction);

CREATE INDEX IF NOT EXISTS idx_panache_360_campay_transactions_status
  ON public.panache_360_campay_transactions (status);

CREATE INDEX IF NOT EXISTS idx_panache_360_campay_transactions_transaction_date
  ON public.panache_360_campay_transactions (transaction_date DESC);

ALTER TABLE public.panache_360_award_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.panache_360_award_nominees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.panache_360_vote_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.panache_360_campay_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active Panache 360 categories"
ON public.panache_360_award_categories;

CREATE POLICY "Public can view active Panache 360 categories"
ON public.panache_360_award_categories
FOR SELECT
USING (status = 'active');

DROP POLICY IF EXISTS "Public can view active Panache 360 nominees"
ON public.panache_360_award_nominees;

CREATE POLICY "Public can view active Panache 360 nominees"
ON public.panache_360_award_nominees
FOR SELECT
USING (
  status = 'active'
  AND EXISTS (
    SELECT 1
    FROM public.panache_360_award_categories c
    WHERE c.id = panache_360_award_nominees.category_id
      AND c.status = 'active'
  )
);

CREATE OR REPLACE VIEW public.panache_360_nominee_vote_counts
WITH (security_invoker = true) AS
SELECT
  n.id AS nominee_id,
  COUNT(p.id)::integer AS completed_payment_count,
  COALESCE(SUM(p.vote_count), 0)::integer AS total_votes,
  COALESCE(SUM(p.amount_xaf), 0)::integer AS total_amount_xaf
FROM public.panache_360_award_nominees n
LEFT JOIN public.panache_360_vote_payments p
  ON p.nominee_id = n.id
  AND p.status = 'completed'
GROUP BY n.id;

CREATE OR REPLACE VIEW public.panache_360_category_vote_counts
WITH (security_invoker = true) AS
SELECT
  c.id AS category_id,
  COUNT(p.id)::integer AS completed_payment_count,
  COALESCE(SUM(p.vote_count), 0)::integer AS total_votes,
  COALESCE(SUM(p.amount_xaf), 0)::integer AS total_amount_xaf
FROM public.panache_360_award_categories c
LEFT JOIN public.panache_360_vote_payments p
  ON p.category_id = c.id
  AND p.status = 'completed'
GROUP BY c.id;

CREATE OR REPLACE VIEW public.panache_360_leaderboard
WITH (security_invoker = true) AS
SELECT
  n.id AS nominee_id,
  n.slug AS nominee_slug,
  n.name AS nominee_name,
  n.organization,
  n.photo_url,
  c.id AS category_id,
  c.slug AS category_slug,
  c.name AS category_name,
  COALESCE(vc.total_votes, 0)::integer AS total_votes,
  COALESCE(vc.total_amount_xaf, 0)::integer AS total_amount_xaf
FROM public.panache_360_award_nominees n
JOIN public.panache_360_award_categories c
  ON c.id = n.category_id
LEFT JOIN public.panache_360_nominee_vote_counts vc
  ON vc.nominee_id = n.id
WHERE n.status = 'active'
  AND c.status = 'active';

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'panache-360-nominee-photos',
  'panache-360-nominee-photos',
  true,
  3145728,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public can view Panache 360 nominee photos"
ON storage.objects;

CREATE POLICY "Public can view Panache 360 nominee photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'panache-360-nominee-photos');

WITH seeded_categories(slug, name, sort_order) AS (
  VALUES
    ('barbing', 'Barbing', 10),
    ('beauty-makeup', 'Beauty Makeup', 20),
    ('sfx-makeup', 'SFX Makeup', 30),
    ('braiding', 'Braiding', 40),
    ('artistic-hairstyling', 'Artistic Hairstyling', 50),
    ('wig-installation', 'Wig Installation', 60),
    ('nails-installation', 'Nails Installation', 70),
    ('lash-extensions-installation', 'Lash Extensions Installation', 80)
)
INSERT INTO public.panache_360_award_categories (slug, name, sort_order, status)
SELECT slug, name, sort_order, 'active'
FROM seeded_categories
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  sort_order = EXCLUDED.sort_order,
  status = EXCLUDED.status,
  updated_at = now();
