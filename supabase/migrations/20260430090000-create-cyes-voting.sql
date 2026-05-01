CREATE TABLE IF NOT EXISTS public.cyes_award_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  voting_enabled BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cyes_award_nominees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.cyes_award_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  organization TEXT,
  bio TEXT,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cyes_award_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.cyes_award_categories(id) ON DELETE CASCADE,
  nominee_id UUID NOT NULL REFERENCES public.cyes_award_nominees(id) ON DELETE CASCADE,
  voter_name TEXT NOT NULL,
  voter_phone TEXT NOT NULL,
  voter_email TEXT,
  supabase_user_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  verification_provider TEXT NOT NULL DEFAULT 'supabase-phone-otp',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT cyes_award_votes_one_phone_per_category UNIQUE (category_id, voter_phone)
);

CREATE TABLE IF NOT EXISTS public.cyes_voting_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rate_key TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cyes_award_categories_status
  ON public.cyes_award_categories (status, voting_enabled, sort_order);

CREATE INDEX IF NOT EXISTS idx_cyes_award_nominees_category
  ON public.cyes_award_nominees (category_id, status, sort_order);

CREATE INDEX IF NOT EXISTS idx_cyes_award_votes_category
  ON public.cyes_award_votes (category_id);

CREATE INDEX IF NOT EXISTS idx_cyes_award_votes_nominee
  ON public.cyes_award_votes (nominee_id);

CREATE INDEX IF NOT EXISTS idx_cyes_voting_rate_limits_lookup
  ON public.cyes_voting_rate_limits (rate_key, action, created_at DESC);

ALTER TABLE public.cyes_award_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cyes_award_nominees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cyes_award_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cyes_voting_rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active CYES award categories"
ON public.cyes_award_categories;

CREATE POLICY "Public can view active CYES award categories"
ON public.cyes_award_categories
FOR SELECT
USING (status = 'active' AND voting_enabled = true);

DROP POLICY IF EXISTS "Public can view active CYES award nominees"
ON public.cyes_award_nominees;

CREATE POLICY "Public can view active CYES award nominees"
ON public.cyes_award_nominees
FOR SELECT
USING (
  status = 'active'
  AND EXISTS (
    SELECT 1
    FROM public.cyes_award_categories c
    WHERE c.id = cyes_award_nominees.category_id
      AND c.status = 'active'
      AND c.voting_enabled = true
  )
);

WITH seeded_categories(slug, name, sort_order) AS (
  VALUES
    ('youth-entrepreneur-of-the-year', 'Youth Entrepreneur of the Year', 10),
    ('startup-of-the-year', 'Startup of the Year', 20),
    ('technology-innovator-of-the-year', 'Technology Innovator of the Year', 30),
    ('agribusiness-of-the-year', 'Agribusiness of the Year', 40),
    ('outstanding-farmer-of-the-year', 'Outstanding Farmer of the Year', 45),
    ('creative-entrepreneur-of-the-year', 'Creative Entrepreneur of the Year', 50),
    ('social-impact-business-of-the-year', 'Social Impact Business of the Year', 60),
    ('community-leader-of-the-year', 'Community Leader of the Year', 70),
    ('ngo-of-the-year', 'NGO of the Year', 80),
    ('youth-empowerment-initiative-of-the-year', 'Youth Empowerment Initiative of the Year', 90),
    ('education-impact-of-the-year', 'Education Impact of the Year', 100),
    ('health-impact-of-the-year', 'Health Impact of the Year', 110),
    ('environmental-impact-of-the-year', 'Environmental Impact of the Year', 120),
    ('corporate-impact-of-the-year', 'Corporate Impact of the Year', 130),
    ('sme-of-the-year', 'SME of the Year', 140),
    ('financial-institution-of-the-year', 'Financial Institution of the Year', 150),
    ('woman-in-business-of-the-year', 'Woman in Business of the Year', 160),
    ('diaspora-impact-of-the-year', 'Diaspora Impact of the Year', 170),
    ('emerging-youth-leader-of-the-year', 'Emerging Youth Leader of the Year', 180),
    ('media-and-advocacy-of-the-year', 'Media & Advocacy of the Year', 190),
    ('voice-of-the-generation-award', 'Voice of the Generation Award', 200)
)
INSERT INTO public.cyes_award_categories (slug, name, sort_order, status, voting_enabled)
SELECT slug, name, sort_order, 'active', true
FROM seeded_categories
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();
