-- Order tracking feature: customer-facing progress page + internal ops board.
-- Run this once in the Supabase SQL editor for the project.

create table orders (
  id uuid primary key default gen_random_uuid(),
  seq bigint generated always as identity,
  order_number text generated always as ('MP-' || (2400 + seq)) stored unique,
  -- order_number + random suffix, built in app code before insert; the unguessable part of the tracking URL
  tracking_slug text not null unique,
  customer_name text not null,
  customer_phone text not null,
  customer_company text,
  product_label text not null,
  quantity text not null,
  unit_price numeric,
  order_total numeric,
  currency text not null default 'EGP',
  lead_time_days int,
  phase text not null default 'order_confirmed'
    check (phase in (
      'order_confirmed','artwork_pre_press','artwork_approved',
      'sample_produced','sample_approved','plates_tooling','printing',
      'finishing_die_cut','quality_check','packed','out_for_delivery','delivered'
    )),
  estimated_delivery date,
  delivered_at timestamptz,
  sample_images jsonb not null default '[]',
  source text not null default 'quote_form',
  notes text,
  failed_verify_attempts int not null default 0,
  verify_locked_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  type text not null check (type in (
    'created','phase_change','customer_approved','customer_requested_changes',
    'note','reminder_sent'
  )),
  phase text,
  actor text not null check (actor in ('system','staff','customer')),
  message text,
  created_at timestamptz not null default now()
);

create index order_events_order_id_created_at_idx on order_events (order_id, created_at);

-- Enabled with no policies defined: only the service-role key is ever used
-- server-side to reach this schema, and it bypasses RLS entirely, so this is
-- a deny-all backstop in case an anon/publishable key is ever wired up later.
alter table orders enable row level security;
alter table order_events enable row level security;
