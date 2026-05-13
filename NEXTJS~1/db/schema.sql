-- Commercial Intelligence — Postgres schema (Supabase)
-- Apply via Supabase SQL Editor or `pnpm db:push`

create extension if not exists "pgcrypto";
create extension if not exists "vector";

-- ============== CORE ==============
create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  brand text,
  city text,
  country text,
  total_rooms int,
  currency text default 'THB',
  timezone text default 'Asia/Bangkok',
  active boolean default true,
  created_at timestamp default now()
);

create table if not exists users (
  id uuid primary key,
  email text unique not null,
  name text,
  role text not null default 'viewer',
  property_id uuid references properties(id),
  preferences jsonb default '{}',
  created_at timestamp default now()
);

create table if not exists source_markets (
  iso2 text primary key,
  name text not null,
  region text,
  priority_tier int
);

create table if not exists channels (
  code text primary key,
  name text not null,
  type text not null,
  commission_pct numeric(5,2)
);

-- ============== FACTS ==============
create table if not exists fact_demand_daily (
  date date not null,
  property_id uuid references properties(id),
  source_market text references source_markets(iso2),
  search_index numeric,
  ga4_sessions int,
  ga4_engaged_sessions int,
  ga4_search_originated_sessions int,
  trend_index numeric,
  primary key (date, property_id, source_market)
);

create table if not exists fact_bookings_daily (
  date date not null,
  property_id uuid references properties(id),
  channel_code text references channels(code),
  source_market text references source_markets(iso2),
  room_nights int,
  bookings int,
  revenue numeric(14,2),
  adr numeric(10,2),
  avg_booking_window int,
  cancellations int default 0,
  primary key (date, property_id, channel_code, source_market)
);

create table if not exists bookings_raw (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id),
  reservation_id text not null,
  booked_at timestamp not null,
  checkin_date date not null,
  checkout_date date not null,
  channel_code text references channels(code),
  source_market text references source_markets(iso2),
  rate_code text,
  room_type text,
  room_nights int,
  revenue_gross numeric(14,2),
  revenue_net numeric(14,2),
  status text,
  guest_country text,
  is_loyalty_member boolean,
  raw_payload jsonb,
  ingested_at timestamp default now()
);
create index if not exists bookings_raw_property_date on bookings_raw(property_id, checkin_date);
create index if not exists bookings_raw_window on bookings_raw(property_id, booked_at, checkin_date);

create table if not exists fact_otb_snapshot (
  snapshot_date date not null,
  stay_date date not null,
  property_id uuid references properties(id),
  rooms_otb int,
  revenue_otb numeric(14,2),
  channel_mix jsonb,
  primary key (snapshot_date, stay_date, property_id)
);

create table if not exists fact_marketing_daily (
  date date not null,
  property_id uuid references properties(id),
  channel_code text references channels(code),
  campaign_id text,
  campaign_name text,
  source_market text references source_markets(iso2),
  impressions bigint,
  clicks int,
  sessions int,
  spend numeric(14,2),
  attributed_bookings int,
  attributed_revenue numeric(14,2),
  primary key (date, property_id, channel_code, campaign_id, source_market)
);

create table if not exists fact_ota_daily (
  date date not null,
  property_id uuid references properties(id),
  channel_code text references channels(code),
  bookings int,
  room_nights int,
  gross_revenue numeric(14,2),
  commission_amount numeric(14,2),
  net_revenue numeric(14,2),
  avg_commission_pct numeric(5,2),
  primary key (date, property_id, channel_code)
);

create table if not exists fact_compset_daily (
  date date not null,
  property_id uuid references properties(id),
  competitor_code text,
  competitor_name text,
  occupancy_pct numeric(5,2),
  adr numeric(10,2),
  revpar numeric(10,2),
  rate_published numeric(10,2),
  primary key (date, property_id, competitor_code)
);

create table if not exists fact_compset_indices (
  date date not null,
  property_id uuid references properties(id),
  mpi numeric(6,2),
  ari numeric(6,2),
  rgi numeric(6,2),
  market_share_pct numeric(5,2),
  compset_size int,
  primary key (date, property_id)
);

-- ============== FORECASTS ==============
create table if not exists forecast_runs (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id),
  run_at timestamp default now(),
  model_version text,
  features_used jsonb,
  mape_90d numeric(5,2),
  created_by text
);

create table if not exists forecast_predictions (
  forecast_run_id uuid references forecast_runs(id),
  stay_date date not null,
  property_id uuid references properties(id),
  occupancy_pct numeric(5,2),
  occupancy_lo numeric(5,2),
  occupancy_hi numeric(5,2),
  revenue numeric(14,2),
  revenue_lo numeric(14,2),
  revenue_hi numeric(14,2),
  adr numeric(10,2),
  primary key (forecast_run_id, stay_date)
);

-- ============== AI INSIGHTS ==============
create table if not exists insights (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id),
  detected_at timestamp default now(),
  category text not null,
  severity text not null,
  title text not null,
  context text not null,
  recommended_action text not null,
  confidence numeric(5,2),
  estimated_impact_value numeric(14,2),
  estimated_impact_unit text,
  detector_code text,
  source_data jsonb,
  status text default 'open',
  acknowledged_by uuid references users(id),
  acknowledged_at timestamp,
  embedding vector(1536),
  created_at timestamp default now()
);
create index if not exists insights_property_status on insights(property_id, status, detected_at desc);
create index if not exists insights_severity on insights(property_id, severity, detected_at desc);

-- ============== BRIEFING ==============
create table if not exists briefing_snapshots (
  user_id uuid references users(id),
  date date,
  summary text,
  payload jsonb,
  primary key (user_id, date)
);

-- ============== ROW LEVEL SECURITY ==============
alter table fact_demand_daily enable row level security;
alter table fact_bookings_daily enable row level security;
alter table bookings_raw enable row level security;
alter table fact_otb_snapshot enable row level security;
alter table fact_marketing_daily enable row level security;
alter table fact_ota_daily enable row level security;
alter table fact_compset_daily enable row level security;
alter table fact_compset_indices enable row level security;
alter table forecast_runs enable row level security;
alter table forecast_predictions enable row level security;
alter table insights enable row level security;
alter table briefing_snapshots enable row level security;

-- Generic property-scoped read policy generator
do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'fact_demand_daily','fact_bookings_daily','bookings_raw',
      'fact_otb_snapshot','fact_marketing_daily','fact_ota_daily',
      'fact_compset_daily','fact_compset_indices',
      'forecast_runs','forecast_predictions','insights'
    ])
  loop
    execute format($f$
      create policy "%I_select"
      on %I for select
      using (
        exists (
          select 1 from users
          where users.id = auth.uid()
          and (users.role = 'admin' or users.property_id = %I.property_id)
        )
      )
    $f$, t, t, t);
  end loop;
end$$;
