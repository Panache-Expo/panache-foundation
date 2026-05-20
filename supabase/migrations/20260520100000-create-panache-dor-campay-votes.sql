CREATE TABLE IF NOT EXISTS public.panache_dor_vote_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nominee_id UUID NOT NULL REFERENCES public.panache_dor_award_nominees(id) ON DELETE RESTRICT,
  category_id UUID NOT NULL REFERENCES public.panache_dor_award_categories(id) ON DELETE RESTRICT,
  tx_ref TEXT NOT NULL UNIQUE,
  campay_reference TEXT UNIQUE,
  payment_link TEXT,
  provider TEXT NOT NULL DEFAULT 'campay',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  voter_email TEXT,
  voter_whatsapp TEXT,
  vote_count INTEGER NOT NULL CHECK (vote_count > 0),
  vote_price_xaf INTEGER NOT NULL DEFAULT 100 CHECK (vote_price_xaf >= 0),
  processing_fee_per_vote_xaf INTEGER NOT NULL DEFAULT 5 CHECK (processing_fee_per_vote_xaf >= 0),
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

CREATE INDEX IF NOT EXISTS idx_panache_dor_vote_payments_nominee_status
  ON public.panache_dor_vote_payments (nominee_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_panache_dor_vote_payments_category_status
  ON public.panache_dor_vote_payments (category_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_panache_dor_vote_payments_status_created
  ON public.panache_dor_vote_payments (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_panache_dor_vote_payments_voter_email
  ON public.panache_dor_vote_payments (voter_email);

ALTER TABLE public.panache_dor_vote_payments ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE VIEW public.panache_dor_nominee_vote_counts AS
SELECT
  n.id AS nominee_id,
  COUNT(p.id)::integer AS completed_payment_count,
  COALESCE(SUM(p.vote_count), 0)::integer AS total_votes,
  COALESCE(SUM(p.amount_xaf), 0)::integer AS total_amount_xaf
FROM public.panache_dor_award_nominees n
LEFT JOIN public.panache_dor_vote_payments p
  ON p.nominee_id = n.id
  AND p.status = 'completed'
GROUP BY n.id;

CREATE OR REPLACE VIEW public.panache_dor_category_vote_counts AS
SELECT
  c.id AS category_id,
  COUNT(p.id)::integer AS completed_payment_count,
  COALESCE(SUM(p.vote_count), 0)::integer AS total_votes,
  COALESCE(SUM(p.amount_xaf), 0)::integer AS total_amount_xaf
FROM public.panache_dor_award_categories c
LEFT JOIN public.panache_dor_vote_payments p
  ON p.category_id = c.id
  AND p.status = 'completed'
GROUP BY c.id;

CREATE OR REPLACE VIEW public.panache_dor_leaderboard AS
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
FROM public.panache_dor_award_nominees n
JOIN public.panache_dor_award_categories c
  ON c.id = n.category_id
LEFT JOIN public.panache_dor_nominee_vote_counts vc
  ON vc.nominee_id = n.id
WHERE n.status = 'active'
  AND c.status = 'active';
