CREATE TABLE IF NOT EXISTS public.competition_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_code TEXT NOT NULL UNIQUE,
  competition_slug TEXT NOT NULL,
  category TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT,
  country TEXT,
  instagram_handle TEXT,
  tiktok_handle TEXT,
  portfolio_url TEXT,
  years_experience INTEGER,
  motivation TEXT,
  form_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_platform TEXT,
  payment_reference TEXT,
  payment_amount NUMERIC,
  paid_at TIMESTAMP WITH TIME ZONE,
  review_status TEXT NOT NULL DEFAULT 'submitted',
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_competition_applications_slug
  ON public.competition_applications (competition_slug);

CREATE INDEX IF NOT EXISTS idx_competition_applications_payment_status
  ON public.competition_applications (payment_status);

CREATE INDEX IF NOT EXISTS idx_competition_applications_created_at
  ON public.competition_applications (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_competition_applications_email
  ON public.competition_applications (email);

ALTER TABLE public.competition_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit competition applications" ON public.competition_applications;

CREATE POLICY "Anyone can submit competition applications"
ON public.competition_applications
FOR INSERT
WITH CHECK (true);
