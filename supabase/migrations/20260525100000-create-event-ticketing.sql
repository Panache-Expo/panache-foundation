CREATE TABLE IF NOT EXISTS public.event_ticket_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  short_title TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_date_label TEXT NOT NULL,
  venue TEXT NOT NULL DEFAULT 'Buea, Cameroon',
  brand TEXT NOT NULL CHECK (brand IN ('cyes', 'panache-dor')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_ticket_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.event_ticket_events(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_xaf INTEGER NOT NULL CHECK (price_xaf > 0),
  admit_count INTEGER NOT NULL CHECK (admit_count > 0),
  benefits JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  style_key TEXT NOT NULL DEFAULT 'standard',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (event_id, slug)
);

CREATE TABLE IF NOT EXISTS public.event_ticket_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.event_ticket_events(id) ON DELETE RESTRICT,
  package_id UUID NOT NULL REFERENCES public.event_ticket_packages(id) ON DELETE RESTRICT,
  tx_ref TEXT NOT NULL UNIQUE,
  campay_reference TEXT UNIQUE,
  payment_link TEXT,
  provider TEXT NOT NULL DEFAULT 'campay',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_whatsapp TEXT,
  whatsapp_consent BOOLEAN NOT NULL DEFAULT false,
  amount_xaf INTEGER NOT NULL CHECK (amount_xaf > 0),
  currency TEXT NOT NULL DEFAULT 'XAF',
  provider_status TEXT,
  provider_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  verified_at TIMESTAMP WITH TIME ZONE,
  failure_reason TEXT,
  ticket_email_sent_at TIMESTAMP WITH TIME ZONE,
  ticket_email_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL UNIQUE REFERENCES public.event_ticket_orders(id) ON DELETE RESTRICT,
  event_id UUID NOT NULL REFERENCES public.event_ticket_events(id) ON DELETE RESTRICT,
  package_id UUID NOT NULL REFERENCES public.event_ticket_packages(id) ON DELETE RESTRICT,
  ticket_code TEXT NOT NULL UNIQUE,
  qr_token TEXT NOT NULL UNIQUE,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_whatsapp TEXT,
  admit_count INTEGER NOT NULL CHECK (admit_count > 0),
  checked_in_count INTEGER NOT NULL DEFAULT 0 CHECK (checked_in_count >= 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_checked_in_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_ticket_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.event_tickets(id) ON DELETE RESTRICT,
  event_id UUID NOT NULL REFERENCES public.event_ticket_events(id) ON DELETE RESTRICT,
  checked_in_count INTEGER NOT NULL CHECK (checked_in_count > 0),
  checked_in_by TEXT,
  notes TEXT,
  method TEXT NOT NULL DEFAULT 'qr' CHECK (method IN ('qr', 'manual')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_event_ticket_packages_event_status
  ON public.event_ticket_packages (event_id, status, sort_order);

CREATE INDEX IF NOT EXISTS idx_event_ticket_orders_status_created
  ON public.event_ticket_orders (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_event_ticket_orders_event_status
  ON public.event_ticket_orders (event_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_event_tickets_event_status
  ON public.event_tickets (event_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_event_tickets_buyer_lookup
  ON public.event_tickets (buyer_email, buyer_whatsapp);

ALTER TABLE public.event_ticket_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_ticket_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_ticket_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_ticket_checkins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active ticket events"
ON public.event_ticket_events;

CREATE POLICY "Public can view active ticket events"
ON public.event_ticket_events
FOR SELECT
USING (status = 'active');

DROP POLICY IF EXISTS "Public can view active ticket packages"
ON public.event_ticket_packages;

CREATE POLICY "Public can view active ticket packages"
ON public.event_ticket_packages
FOR SELECT
USING (
  status = 'active'
  AND EXISTS (
    SELECT 1
    FROM public.event_ticket_events e
    WHERE e.id = event_ticket_packages.event_id
      AND e.status = 'active'
  )
);

WITH seeded_events(slug, title, short_title, event_date, event_date_label, venue, brand, sort_order) AS (
  VALUES
    ('cyes-awards-night', 'CYES Awards Night', 'CYES Awards', DATE '2026-07-09', '9 July 2026', 'Buea, Cameroon', 'cyes', 10),
    ('panache-dor-awards-night', 'Panache D''or Awards Night', 'Panache D''or', DATE '2026-07-11', '11 July 2026', 'Buea, Cameroon', 'panache-dor', 20)
)
INSERT INTO public.event_ticket_events (
  slug,
  title,
  short_title,
  event_date,
  event_date_label,
  venue,
  brand,
  sort_order,
  status
)
SELECT slug, title, short_title, event_date, event_date_label, venue, brand, sort_order, 'active'
FROM seeded_events
ON CONFLICT (slug) DO UPDATE
SET
  title = EXCLUDED.title,
  short_title = EXCLUDED.short_title,
  event_date = EXCLUDED.event_date,
  event_date_label = EXCLUDED.event_date_label,
  venue = EXCLUDED.venue,
  brand = EXCLUDED.brand,
  sort_order = EXCLUDED.sort_order,
  status = EXCLUDED.status,
  updated_at = now();

WITH package_seed(slug, name, description, price_xaf, admit_count, benefits, sort_order, style_key) AS (
  VALUES
    (
      'prestige-table-8',
      'Prestige Table',
      'Group table for 8 guests with premium drinks service.',
      100000,
      8,
      '["2 whisky (Chivas or Black)", "2 Baileys", "2 wine", "10 beer"]'::jsonb,
      10,
      'prestige'
    ),
    (
      'premium-table-5',
      'Premium Table',
      'Group table for 5 guests with a balanced drinks package.',
      50000,
      5,
      '["1 whisky (Chivas or Black)", "1 Baileys", "1 wine", "5 beer"]'::jsonb,
      20,
      'premium'
    ),
    (
      'classic-table-3',
      'Classic Table',
      'Group table for 3 guests with wine, Baileys, and beer.',
      25000,
      3,
      '["1 Baileys", "1 wine", "5 beer"]'::jsonb,
      30,
      'classic'
    ),
    (
      'access-beer',
      'Access Pass',
      'Entry for one guest with one beer.',
      2000,
      1,
      '["Access", "1 beer"]'::jsonb,
      40,
      'access'
    )
)
INSERT INTO public.event_ticket_packages (
  event_id,
  slug,
  name,
  description,
  price_xaf,
  admit_count,
  benefits,
  sort_order,
  style_key,
  status
)
SELECT
  e.id,
  p.slug,
  p.name,
  p.description,
  p.price_xaf,
  p.admit_count,
  p.benefits,
  p.sort_order,
  p.style_key,
  'active'
FROM public.event_ticket_events e
CROSS JOIN package_seed p
WHERE e.slug IN ('cyes-awards-night', 'panache-dor-awards-night')
ON CONFLICT (event_id, slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_xaf = EXCLUDED.price_xaf,
  admit_count = EXCLUDED.admit_count,
  benefits = EXCLUDED.benefits,
  sort_order = EXCLUDED.sort_order,
  style_key = EXCLUDED.style_key,
  status = EXCLUDED.status,
  updated_at = now();
