CREATE TABLE IF NOT EXISTS public.panache_dor_award_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.panache_dor_award_nominees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.panache_dor_award_categories(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_panache_dor_award_categories_status
  ON public.panache_dor_award_categories (status, sort_order, name);

CREATE INDEX IF NOT EXISTS idx_panache_dor_award_nominees_category
  ON public.panache_dor_award_nominees (category_id, status, sort_order, name);

CREATE INDEX IF NOT EXISTS idx_panache_dor_award_nominees_sync_id
  ON public.panache_dor_award_nominees (ayati_sync_id)
  WHERE ayati_sync_id IS NOT NULL;

ALTER TABLE public.panache_dor_award_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.panache_dor_award_nominees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active Panache D'or categories"
ON public.panache_dor_award_categories;

CREATE POLICY "Public can view active Panache D'or categories"
ON public.panache_dor_award_categories
FOR SELECT
USING (status = 'active');

DROP POLICY IF EXISTS "Public can view active Panache D'or nominees"
ON public.panache_dor_award_nominees;

CREATE POLICY "Public can view active Panache D'or nominees"
ON public.panache_dor_award_nominees
FOR SELECT
USING (
  status = 'active'
  AND EXISTS (
    SELECT 1
    FROM public.panache_dor_award_categories c
    WHERE c.id = panache_dor_award_nominees.category_id
      AND c.status = 'active'
  )
);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'panache-dor-nominee-photos',
  'panache-dor-nominee-photos',
  true,
  3145728,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public can view Panache D'or nominee photos"
ON storage.objects;

CREATE POLICY "Public can view Panache D'or nominee photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'panache-dor-nominee-photos');

WITH seeded_categories(slug, name, sort_order) AS (
  VALUES
    ('fashion-designer-of-the-year', 'Fashion Designer of the Year', 10),
    ('emerging-fashion-designer-of-the-year', 'Emerging Fashion Designer of the Year', 20),
    ('creative-photographer-of-the-year', 'Creative Photographer of the Year', 30),
    ('content-creator-of-the-year', 'Content Creator of the Year', 40),
    ('makeup-artist-of-the-year', 'Makeup Artist of the Year', 50),
    ('lash-artist-of-the-year', 'Lash and Brow Artist of the Year', 60),
    ('hair-and-wig-specialist-of-the-year', 'Hair and Wig Installation Specialist of the Year', 70),
    ('braider-of-the-year', 'Braider of the Year', 80),
    ('nail-artist-of-the-year', 'Nail Artist of the Year', 90),
    ('barber-of-the-year', 'Barber of the Year', 100),
    ('creative-entrepreneur-of-the-year', 'Creative Entrepreneur of the Year', 110),
    ('emerging-creative-talent-of-the-year', 'Emerging Creative Entrepreneur of the Year', 120),
    ('beauty-brand-of-the-year', 'Beauty Brand of the Year', 130),
    ('beauty-educator-of-the-year', 'Beauty Trainer of the Year', 140),
    ('model-of-the-year', 'Model of the Year', 150),
    ('fashion-stylist-of-the-year', 'Fashion Stylist of the Year', 160)
)
INSERT INTO public.panache_dor_award_categories (slug, name, sort_order, status)
SELECT slug, name, sort_order, 'active'
FROM seeded_categories
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  sort_order = EXCLUDED.sort_order,
  status = EXCLUDED.status,
  updated_at = now();

UPDATE public.panache_dor_award_categories
SET status = 'archived', updated_at = now()
WHERE slug IN (
  'male-model-of-the-year',
  'female-model-of-the-year',
  'emerging-model-of-the-year'
);

UPDATE public.panache_dor_award_categories
SET status = 'draft', updated_at = now()
WHERE slug = 'fashion-stylist-of-the-year'
  AND NOT EXISTS (
    SELECT 1
    FROM public.panache_dor_award_nominees n
    WHERE n.category_id = panache_dor_award_categories.id
  );
