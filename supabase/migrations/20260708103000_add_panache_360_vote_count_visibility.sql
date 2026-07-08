create table if not exists public.panache_360_public_settings (
  id text primary key,
  vote_counts_visible boolean not null default false,
  updated_at timestamp with time zone not null default now()
);

insert into public.panache_360_public_settings (id, vote_counts_visible)
values ('vote-counts', false)
on conflict (id) do nothing;

alter table public.panache_360_public_settings enable row level security;

revoke all on table public.panache_360_public_settings from anon, authenticated;

comment on table public.panache_360_public_settings is
  'Service-role managed public display settings for Panache 360 voting.';
