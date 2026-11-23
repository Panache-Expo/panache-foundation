-- CIYES community project donations (2027: a borehole for an underserved community).
-- Payments go through Campay. Only the server (service role) reads or writes these tables.

CREATE TABLE IF NOT EXISTS public.ciyes_donation_campaigns (
  slug TEXT NOT NULL PRIMARY KEY,
  title TEXT NOT NULL,
  goal_xaf INTEGER CHECK (goal_xaf IS NULL OR goal_xaf > 0),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

INSERT INTO public.ciyes_donation_campaigns (slug, title, goal_xaf, active)
VALUES ('borehole-2027', 'CIYES 2027 community borehole', NULL, true)
ON CONFLICT (slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.ciyes_donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tx_ref TEXT NOT NULL UNIQUE,
  campay_reference TEXT UNIQUE,
  payment_link TEXT,
  campaign TEXT NOT NULL REFERENCES public.ciyes_donation_campaigns(slug) ON DELETE RESTRICT,
  amount_xaf INTEGER NOT NULL CHECK (amount_xaf BETWEEN 500 AND 2000000),
  currency TEXT NOT NULL DEFAULT 'XAF',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  provider_status TEXT,
  provider_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  verified_at TIMESTAMP WITH TIME ZONE,
  donor_name TEXT,
  whatsapp_phone TEXT,
  email TEXT,
  message TEXT CHECK (message IS NULL OR char_length(message) <= 200),
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'fr')),
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ciyes_donations_campaign_status
  ON public.ciyes_donations (campaign, status, created_at DESC);

ALTER TABLE public.ciyes_donation_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ciyes_donations ENABLE ROW LEVEL SECURITY;

-- No policies: anon and authenticated cannot read or write. Belt and braces on grants too.
REVOKE ALL ON public.ciyes_donation_campaigns FROM anon, authenticated;
REVOKE ALL ON public.ciyes_donations FROM anon, authenticated;
