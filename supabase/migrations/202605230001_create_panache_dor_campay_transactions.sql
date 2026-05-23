create table if not exists public.panache_dor_campay_transactions (
  id uuid primary key default gen_random_uuid(),
  campay_reference text unique,
  external_reference text,
  direction text not null default 'unknown' check (direction in ('deposit', 'withdrawal', 'unknown')),
  amount_xaf integer not null default 0,
  currency text not null default 'XAF',
  status text not null default 'UNKNOWN',
  phone text,
  operator text,
  description text,
  transaction_date timestamptz,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists panache_dor_campay_transactions_direction_idx
  on public.panache_dor_campay_transactions(direction);

create index if not exists panache_dor_campay_transactions_status_idx
  on public.panache_dor_campay_transactions(status);

create index if not exists panache_dor_campay_transactions_transaction_date_idx
  on public.panache_dor_campay_transactions(transaction_date desc);
