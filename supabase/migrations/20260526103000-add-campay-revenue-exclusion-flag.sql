ALTER TABLE public.panache_dor_campay_transactions
  ADD COLUMN IF NOT EXISTS excluded_from_revenue BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS revenue_exclusion_note TEXT;

CREATE INDEX IF NOT EXISTS panache_dor_campay_transactions_revenue_excluded_idx
  ON public.panache_dor_campay_transactions (excluded_from_revenue)
  WHERE excluded_from_revenue;
