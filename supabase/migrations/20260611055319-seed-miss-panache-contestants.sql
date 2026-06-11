INSERT INTO public.miss_panache_award_categories (slug, name, sort_order, status)
VALUES ('miss-panache-2026', 'Miss Panache 2026', 10, 'active')
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  sort_order = EXCLUDED.sort_order,
  status = EXCLUDED.status,
  updated_at = now();

WITH category AS (
  SELECT id
  FROM public.miss_panache_award_categories
  WHERE slug = 'miss-panache-2026'
),
seeded_contestants(
  slug,
  name,
  organization,
  bio,
  photo_url,
  sort_order
) AS (
  VALUES
    (
      'mambe-ancella',
      'Mambe Ancella',
      'Contestant #1',
      'Finalist for Miss Panache Expo 2026.',
      '/miss-panache-contestants/mambe-ancella.jpeg',
      10
    ),
    (
      'zee-precious',
      'Zee Precious',
      'Contestant #2',
      'Finalist for Miss Panache Expo 2026.',
      '/miss-panache-contestants/zee-precious.jpeg',
      20
    ),
    (
      'marry-clair',
      'Marry Clair',
      'Contestant #3',
      'Finalist for Miss Panache Expo 2026.',
      '/miss-panache-contestants/marry-clair.jpeg',
      30
    ),
    (
      'eyong-fidel',
      'Eyong Fidel',
      'Contestant #4',
      'Finalist for Miss Panache Expo 2026.',
      '/miss-panache-contestants/eyong-fidel.jpeg',
      40
    ),
    (
      'ateawung-beatrice',
      'Ateawung Beatrice',
      'Contestant #5',
      'Finalist for Miss Panache Expo 2026.',
      '/miss-panache-contestants/ateawung-beatrice.jpeg',
      50
    ),
    (
      'sharon-foncha',
      'Sharon Foncha',
      'Contestant #6',
      'Finalist for Miss Panache Expo 2026.',
      '/miss-panache-contestants/sharon-foncha.jpeg',
      60
    ),
    (
      'otteh-susan',
      'Otteh Susan',
      'Contestant #7',
      'Finalist for Miss Panache Expo 2026.',
      '/miss-panache-contestants/otteh-susan.jpeg',
      70
    )
)
INSERT INTO public.miss_panache_award_nominees (
  category_id,
  slug,
  name,
  organization,
  bio,
  photo_url,
  status,
  sort_order
)
SELECT
  category.id,
  seeded_contestants.slug,
  seeded_contestants.name,
  seeded_contestants.organization,
  seeded_contestants.bio,
  seeded_contestants.photo_url,
  'active',
  seeded_contestants.sort_order
FROM category
CROSS JOIN seeded_contestants
ON CONFLICT (slug) DO UPDATE
SET
  category_id = EXCLUDED.category_id,
  name = EXCLUDED.name,
  organization = EXCLUDED.organization,
  bio = EXCLUDED.bio,
  photo_url = EXCLUDED.photo_url,
  status = EXCLUDED.status,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();
