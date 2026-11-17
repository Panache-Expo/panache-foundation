-- CIYES app waitlist (homepage form at panache-foundation.org/waitlist).
-- One row per WhatsApp number. Anyone can insert (through /api/ciyes-waitlist); nobody can read publicly.

CREATE TABLE IF NOT EXISTS public.ciyes_waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 80),
  whatsapp_phone TEXT NOT NULL CHECK (whatsapp_phone ~ '^\+[1-9][0-9]{7,14}$'),
  email TEXT CHECK (email IS NULL OR char_length(email) <= 120),
  city TEXT CHECK (city IS NULL OR char_length(city) <= 60),
  role TEXT NOT NULL CHECK (role IN ('entrepreneur', 'organiser', 'ngo', 'customer')),
  phone_os TEXT CHECK (phone_os IS NULL OR phone_os IN ('iphone', 'android')),
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'fr')),
  source TEXT CHECK (source IS NULL OR char_length(source) <= 60),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ciyes_waitlist_whatsapp_phone_key
  ON public.ciyes_waitlist (whatsapp_phone);

CREATE INDEX IF NOT EXISTS idx_ciyes_waitlist_created_at
  ON public.ciyes_waitlist (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ciyes_waitlist_role
  ON public.ciyes_waitlist (role);

ALTER TABLE public.ciyes_waitlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can join the CIYES waitlist" ON public.ciyes_waitlist;

CREATE POLICY "Anyone can join the CIYES waitlist"
ON public.ciyes_waitlist
FOR INSERT
WITH CHECK (true);
