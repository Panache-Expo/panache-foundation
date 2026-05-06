ALTER TABLE public.cyes_award_votes
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'completed',
  ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'cyes_award_votes_status_check'
      AND conrelid = 'public.cyes_award_votes'::regclass
  ) THEN
    ALTER TABLE public.cyes_award_votes
      ADD CONSTRAINT cyes_award_votes_status_check
      CHECK (status IN ('pending_otp', 'completed', 'verified', 'unknown'));
  END IF;
END $$;

UPDATE public.cyes_award_votes
SET
  status = 'completed',
  verified_at = COALESCE(verified_at, created_at),
  updated_at = COALESCE(updated_at, created_at, now())
WHERE status IS NULL OR status = 'completed';

ALTER TABLE public.cyes_award_votes
  DROP CONSTRAINT IF EXISTS cyes_award_votes_one_phone_per_category;

DROP INDEX IF EXISTS public.idx_cyes_award_votes_one_email_per_category;
DROP INDEX IF EXISTS public.idx_cyes_award_votes_one_phone_completed_per_category;
DROP INDEX IF EXISTS public.idx_cyes_award_votes_one_email_completed_per_category;

CREATE UNIQUE INDEX IF NOT EXISTS idx_cyes_award_votes_one_phone_completed_per_category
  ON public.cyes_award_votes (category_id, voter_phone)
  WHERE status IN ('completed', 'verified');

CREATE UNIQUE INDEX IF NOT EXISTS idx_cyes_award_votes_one_email_completed_per_category
  ON public.cyes_award_votes (category_id, voter_email)
  WHERE voter_email IS NOT NULL
    AND status IN ('completed', 'verified');

CREATE INDEX IF NOT EXISTS idx_cyes_award_votes_completed_counts
  ON public.cyes_award_votes (category_id, nominee_id)
  WHERE status IN ('completed', 'verified');

CREATE INDEX IF NOT EXISTS idx_cyes_award_votes_pending_phone_lookup
  ON public.cyes_award_votes (category_id, voter_phone, status, created_at DESC)
  WHERE status IN ('pending_otp', 'unknown');

CREATE INDEX IF NOT EXISTS idx_cyes_award_votes_pending_email_lookup
  ON public.cyes_award_votes (category_id, voter_email, status, created_at DESC)
  WHERE voter_email IS NOT NULL
    AND status IN ('pending_otp', 'unknown');

CREATE OR REPLACE VIEW public.cyes_nominee_vote_counts AS
SELECT
  nominee_id,
  category_id,
  COUNT(*)::INTEGER AS vote_count
FROM public.cyes_award_votes
WHERE status IN ('completed', 'verified')
GROUP BY nominee_id, category_id;

CREATE OR REPLACE VIEW public.cyes_category_vote_counts AS
SELECT
  category_id,
  COUNT(*)::INTEGER AS vote_count
FROM public.cyes_award_votes
WHERE status IN ('completed', 'verified')
GROUP BY category_id;
