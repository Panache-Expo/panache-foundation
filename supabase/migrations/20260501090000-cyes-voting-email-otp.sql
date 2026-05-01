CREATE UNIQUE INDEX IF NOT EXISTS idx_cyes_award_votes_one_email_per_category
  ON public.cyes_award_votes (category_id, voter_email)
  WHERE voter_email IS NOT NULL;

ALTER TABLE public.cyes_award_votes
  ALTER COLUMN verification_provider SET DEFAULT 'panache-email-otp';
