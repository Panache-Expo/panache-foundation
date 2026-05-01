insert into public.cyes_award_categories (
  slug,
  name,
  sort_order,
  status,
  voting_enabled
)
values (
  'outstanding-farmer-of-the-year',
  'Outstanding Farmer of the Year',
  45,
  'active',
  true
)
on conflict (slug) do update
set
  name = excluded.name,
  status = 'active',
  voting_enabled = true,
  sort_order = excluded.sort_order,
  updated_at = now();
