CREATE TABLE IF NOT EXISTS public.cyes_vote_email_otps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.cyes_award_categories(id) ON DELETE CASCADE,
  nominee_id UUID NOT NULL REFERENCES public.cyes_award_nominees(id) ON DELETE CASCADE,
  voter_email TEXT NOT NULL,
  voter_phone TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cyes_vote_email_otps_lookup
  ON public.cyes_vote_email_otps (
    category_id,
    nominee_id,
    voter_email,
    voter_phone,
    created_at DESC
  );

CREATE INDEX IF NOT EXISTS idx_cyes_vote_email_otps_expires
  ON public.cyes_vote_email_otps (expires_at);

ALTER TABLE public.cyes_vote_email_otps ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.cyes_award_votes
  ALTER COLUMN verification_provider SET DEFAULT 'panache-email-otp';
