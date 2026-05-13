# Commercial Intelligence — Architecture & Build Spec

A production-grade hotel commercial intelligence platform. Combines GA4, Booking.com, Expedia, compset, paid media, and in-house data into one executive dashboard with an AI insight engine.

Built for: Performance Marketing & Commercial team at a luxury hotel.
Reference property: Fairmont Bangkok Sukhumvit.

---

## 1. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | **Next.js 15 + React 19 + TypeScript** | App Router for nested layouts; server components keep query traffic off the client |
| Styling | **Tailwind CSS 4** with custom theme tokens | Black-white-grayscale design system, dark mode via class strategy |
| UI primitives | **shadcn/ui** + Radix | Accessible, themable; lets us own the components in-repo |
| Charts | **Recharts** | React-native, composable, monochrome-friendly. (Falls back to Chart.js for any chart Recharts can't handle cleanly.) |
| Data warehouse | **BigQuery** (primary) or **Supabase Postgres** (MVP) | BigQuery for production scale + ML; Supabase if budget/team prefers managed Postgres |
| API layer | **Next.js Route Handlers** + **tRPC** | Type-safe end-to-end; tRPC routers organized by domain |
| Auth | **Supabase Auth** (email magic link + Google SSO + Microsoft SSO) | Built-in, RBAC via JWT claims, no separate auth service needed |
| Background ETL | **Inngest** (or **Airbyte** + dbt for warehouse pattern) | Inngest for orchestration; dbt for transformations if BigQuery |
| Vector / RAG (insight engine) | **pgvector** in Supabase or **BigQuery ML** | Embed insight history and similar-period lookups |
| LLM | **OpenAI GPT-4o-mini** for insight generation; **Anthropic Claude Haiku** as fallback | Cheap, fast, accurate enough for templated insights with structured input |
| Hosting | **Vercel** | Native Next.js, edge functions, preview deployments, Inngest integration |
| Observability | **Sentry** + **Vercel Analytics** + **PostHog** (product analytics) | Errors, perf, user behavior |
| Email | **Resend** + **React Email** | Daily briefing emails, alert digests |
| Storage | **Supabase Storage** | Report exports (PDF/CSV), uploaded creative previews |

---

## 2. Folder structure

```
commercial-intel/
├── .github/
│   └── workflows/
│       ├── deploy.yml              # Vercel auto-deploy (handled by Vercel GitHub app)
│       ├── lint-test.yml           # ESLint + Vitest on PR
│       └── etl-trigger.yml         # Optional: cron to trigger Inngest
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── callback/route.ts
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Sidebar + topbar shell
│   │   ├── overview/page.tsx       # Section 1: Executive Overview
│   │   ├── demand/page.tsx         # Section 2: Demand Intelligence
│   │   ├── pace/page.tsx           # Section 3: Booking Window & Pace
│   │   ├── marketing/page.tsx      # Section 4: Marketing Attribution
│   │   ├── ota/page.tsx            # Section 5: OTA vs Direct
│   │   ├── compset/page.tsx        # Section 6: Competitor Benchmark
│   │   ├── forecast/page.tsx       # Section 7: Forecasting
│   │   ├── insights/page.tsx       # Section 8: AI Recommendations
│   │   ├── reports/
│   │   ├── settings/
│   │   └── loading.tsx
│   ├── api/
│   │   ├── trpc/[trpc]/route.ts
│   │   ├── inngest/route.ts        # Inngest webhook
│   │   ├── export/[type]/route.ts  # PDF/CSV export
│   │   └── webhooks/
│   │       ├── booking/route.ts    # Booking.com Connectivity API
│   │       ├── expedia/route.ts    # Expedia EQC API
│   │       └── meta/route.ts       # Meta Conversions API
│   ├── globals.css
│   └── layout.tsx                  # Root, sets Montserrat
├── components/
│   ├── ui/                         # shadcn primitives
│   ├── charts/
│   │   ├── KPICard.tsx
│   │   ├── RevenueTrend.tsx
│   │   ├── ChannelDonut.tsx
│   │   ├── MarketBar.tsx
│   │   ├── DemandLines.tsx
│   │   ├── PaceCurve.tsx
│   │   ├── WindowHistogram.tsx
│   │   ├── FunnelChart.tsx
│   │   ├── ForecastBand.tsx
│   │   ├── CompsetBar.tsx
│   │   └── Sparkline.tsx
│   ├── dashboard/
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   ├── FilterBar.tsx
│   │   ├── DateRangePicker.tsx
│   │   ├── ExportMenu.tsx
│   │   └── ThemeToggle.tsx
│   ├── insights/
│   │   ├── InsightCard.tsx
│   │   ├── InsightSeverity.tsx
│   │   └── InsightFeed.tsx
│   └── tables/
│       ├── DataTable.tsx
│       └── columns/
├── server/
│   ├── trpc/
│   │   ├── routers/
│   │   │   ├── overview.ts
│   │   │   ├── demand.ts
│   │   │   ├── pace.ts
│   │   │   ├── marketing.ts
│   │   │   ├── ota.ts
│   │   │   ├── compset.ts
│   │   │   ├── forecast.ts
│   │   │   └── insights.ts
│   │   ├── context.ts
│   │   └── root.ts
│   ├── db/
│   │   ├── schema/                 # Drizzle schemas (Postgres) or BigQuery typed clients
│   │   │   ├── core.ts
│   │   │   ├── facts.ts
│   │   │   └── insights.ts
│   │   └── queries/
│   ├── etl/
│   │   ├── connectors/
│   │   │   ├── ga4.ts              # GA4 Data API client
│   │   │   ├── booking.ts          # Booking.com Connectivity API
│   │   │   ├── expedia.ts          # Expedia Lodging Partner Services
│   │   │   ├── google-ads.ts       # Google Ads API (REST)
│   │   │   ├── meta-ads.ts         # Meta Marketing API
│   │   │   ├── opera.ts            # Hotel PMS (Opera Cloud)
│   │   │   ├── compset.ts          # STR / Lighthouse / Demand360
│   │   │   └── search-trends.ts    # Google Trends scraper / API
│   │   ├── transforms/             # dbt-style transformations
│   │   └── jobs/                   # Inngest functions
│   │       ├── nightly-sync.ts
│   │       ├── hourly-pace.ts
│   │       ├── insight-generator.ts
│   │       └── briefing-emails.ts
│   ├── ai/
│   │   ├── prompts/
│   │   │   ├── insight-prompt.ts
│   │   │   └── briefing-prompt.ts
│   │   ├── detectors/              # Rule-based anomaly detectors
│   │   │   ├── demand-surge.ts
│   │   │   ├── pace-collapse.ts
│   │   │   ├── roas-anomaly.ts
│   │   │   └── occupancy-risk.ts
│   │   └── insight-engine.ts       # Orchestrator
│   └── lib/
│       ├── auth.ts
│       ├── supabase.ts
│       ├── bigquery.ts
│       └── permissions.ts
├── lib/
│   ├── utils.ts
│   ├── formatters.ts               # Currency, percent, dates
│   ├── constants.ts
│   └── types.ts
├── public/
│   ├── fonts/                      # Local Montserrat fallback (optional)
│   └── icons/
├── docs/
│   ├── ARCHITECTURE.md             # This file
│   ├── DESIGN_SYSTEM.md
│   ├── ETL_RUNBOOK.md
│   └── DEPLOY.md
├── scripts/
│   ├── seed-dummy-data.ts          # Populate dev DB with realistic sample data
│   ├── migrate.ts
│   └── benchmark-insights.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/                        # Playwright
├── .env.example
├── .env.local                      # gitignored
├── .gitignore
├── package.json
├── pnpm-lock.yaml
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
├── vercel.json
└── README.md
```

---

## 3. Database schema

Two-tier model: **raw fact tables** (one per source system) and **conformed marts** for the dashboard. Below is the conformed mart layer in PostgreSQL/Supabase syntax. For BigQuery, replace `uuid` with `STRING`, `timestamp` with `TIMESTAMP`, `numeric` with `NUMERIC`.

```sql
-- ============== CORE ==============
CREATE TABLE properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,           -- 'fairmont-bkk-sukhumvit'
  name text NOT NULL,
  brand text,
  city text,
  country text,
  total_rooms int,
  currency text DEFAULT 'THB',
  timezone text DEFAULT 'Asia/Bangkok',
  active boolean DEFAULT true,
  created_at timestamp DEFAULT now()
);

CREATE TABLE users (
  id uuid PRIMARY KEY,                  -- mirrors auth.users.id
  email text UNIQUE NOT NULL,
  name text,
  role text NOT NULL DEFAULT 'viewer',  -- 'admin' | 'commercial' | 'marketing' | 'viewer' | 'gm'
  property_id uuid REFERENCES properties(id),
  preferences jsonb DEFAULT '{}',
  created_at timestamp DEFAULT now()
);

CREATE TABLE source_markets (
  iso2 text PRIMARY KEY,                -- 'US', 'SG', 'JP'...
  name text NOT NULL,
  region text,
  priority_tier int                     -- 1 = primary, 2 = secondary, 3 = watch
);

CREATE TABLE channels (
  code text PRIMARY KEY,                -- 'direct-web', 'booking', 'expedia', 'agoda', 'pmax', 'meta', 'tiktok'
  name text NOT NULL,
  type text NOT NULL,                   -- 'direct' | 'ota' | 'paid' | 'organic' | 'wholesale'
  commission_pct numeric(5,2)
);

-- ============== FACTS ==============
-- daily_demand: search/interest signals
CREATE TABLE fact_demand_daily (
  date date NOT NULL,
  property_id uuid REFERENCES properties(id),
  source_market text REFERENCES source_markets(iso2),
  search_index numeric,                 -- normalized 100 = baseline
  ga4_sessions int,
  ga4_engaged_sessions int,
  ga4_search_originated_sessions int,
  trend_index numeric,
  PRIMARY KEY (date, property_id, source_market)
);

-- daily_bookings: each booking creates one row in raw; aggregated here
CREATE TABLE fact_bookings_daily (
  date date NOT NULL,                   -- booking date (date booked)
  property_id uuid REFERENCES properties(id),
  channel_code text REFERENCES channels(code),
  source_market text REFERENCES source_markets(iso2),
  room_nights int,
  bookings int,
  revenue numeric(14,2),
  adr numeric(10,2),
  avg_booking_window int,               -- days advance
  cancellations int DEFAULT 0,
  PRIMARY KEY (date, property_id, channel_code, source_market)
);

-- raw bookings for window analysis
CREATE TABLE bookings_raw (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id),
  reservation_id text NOT NULL,
  booked_at timestamp NOT NULL,
  checkin_date date NOT NULL,
  checkout_date date NOT NULL,
  channel_code text REFERENCES channels(code),
  source_market text REFERENCES source_markets(iso2),
  rate_code text,
  room_type text,
  room_nights int,
  revenue_gross numeric(14,2),
  revenue_net numeric(14,2),            -- after commission
  status text,                          -- 'confirmed' | 'cancelled' | 'noshow' | 'in_house' | 'checked_out'
  guest_country text,
  is_loyalty_member boolean,
  raw_payload jsonb,
  ingested_at timestamp DEFAULT now()
);
CREATE INDEX bookings_raw_property_date ON bookings_raw(property_id, checkin_date);
CREATE INDEX bookings_raw_window ON bookings_raw(property_id, booked_at, checkin_date);

-- daily on-the-books snapshot (for pace)
CREATE TABLE fact_otb_snapshot (
  snapshot_date date NOT NULL,          -- as-of date
  stay_date date NOT NULL,              -- the future stay date
  property_id uuid REFERENCES properties(id),
  rooms_otb int,
  revenue_otb numeric(14,2),
  channel_mix jsonb,                    -- {direct: 32, booking: 28, ...}
  PRIMARY KEY (snapshot_date, stay_date, property_id)
);

-- marketing spend & performance
CREATE TABLE fact_marketing_daily (
  date date NOT NULL,
  property_id uuid REFERENCES properties(id),
  channel_code text REFERENCES channels(code),
  campaign_id text,
  campaign_name text,
  source_market text REFERENCES source_markets(iso2),
  impressions bigint,
  clicks int,
  sessions int,
  spend numeric(14,2),
  attributed_bookings int,
  attributed_revenue numeric(14,2),
  PRIMARY KEY (date, property_id, channel_code, campaign_id, source_market)
);

-- OTA / channel economics
CREATE TABLE fact_ota_daily (
  date date NOT NULL,
  property_id uuid REFERENCES properties(id),
  channel_code text REFERENCES channels(code),
  bookings int,
  room_nights int,
  gross_revenue numeric(14,2),
  commission_amount numeric(14,2),
  net_revenue numeric(14,2),
  avg_commission_pct numeric(5,2),
  PRIMARY KEY (date, property_id, channel_code)
);

-- compset (from STR, Lighthouse, Demand360)
CREATE TABLE fact_compset_daily (
  date date NOT NULL,
  property_id uuid REFERENCES properties(id),
  competitor_code text,                 -- 'park-hyatt-bkk', 'four-seasons-bkk', etc.
  competitor_name text,
  occupancy_pct numeric(5,2),
  adr numeric(10,2),
  revpar numeric(10,2),
  rate_published numeric(10,2),
  PRIMARY KEY (date, property_id, competitor_code)
);

-- compset indices computed nightly
CREATE TABLE fact_compset_indices (
  date date NOT NULL,
  property_id uuid REFERENCES properties(id),
  mpi numeric(6,2),                     -- market penetration index (occupancy)
  ari numeric(6,2),                     -- average rate index
  rgi numeric(6,2),                     -- revenue generation index
  market_share_pct numeric(5,2),
  compset_size int,
  PRIMARY KEY (date, property_id)
);

-- ============== FORECASTS ==============
CREATE TABLE forecast_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id),
  run_at timestamp DEFAULT now(),
  model_version text,
  features_used jsonb,
  mape_90d numeric(5,2),                -- accuracy backtest
  created_by text                       -- 'system' | userId
);

CREATE TABLE forecast_predictions (
  forecast_run_id uuid REFERENCES forecast_runs(id),
  stay_date date NOT NULL,
  property_id uuid REFERENCES properties(id),
  occupancy_pct numeric(5,2),
  occupancy_lo numeric(5,2),            -- lower bound 80% CI
  occupancy_hi numeric(5,2),
  revenue numeric(14,2),
  revenue_lo numeric(14,2),
  revenue_hi numeric(14,2),
  adr numeric(10,2),
  PRIMARY KEY (forecast_run_id, stay_date)
);

-- ============== AI INSIGHTS ==============
CREATE TABLE insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id),
  detected_at timestamp DEFAULT now(),
  category text NOT NULL,               -- 'demand' | 'pace' | 'marketing' | 'ota' | 'forecast' | 'compset' | 'operations'
  severity text NOT NULL,               -- 'action' | 'attention' | 'watch' | 'opportunity'
  title text NOT NULL,
  context text NOT NULL,                -- LLM-generated 1–2 sentence explanation
  recommended_action text NOT NULL,
  confidence numeric(5,2),              -- 0.0–1.0
  estimated_impact_value numeric(14,2), -- THB impact estimate
  estimated_impact_unit text,           -- 'revenue' | 'roas' | 'cost' | 'occupancy_pp'
  detector_code text,                   -- 'demand-surge-singapore', 'roas-meta-retarget'
  source_data jsonb,                    -- the numbers behind the insight
  status text DEFAULT 'open',           -- 'open' | 'acknowledged' | 'actioned' | 'dismissed'
  acknowledged_by uuid REFERENCES users(id),
  acknowledged_at timestamp,
  embedding vector(1536),               -- pgvector, for similarity to past insights
  created_at timestamp DEFAULT now()
);
CREATE INDEX insights_property_status ON insights(property_id, status, detected_at DESC);
CREATE INDEX insights_severity ON insights(property_id, severity, detected_at DESC);
```

**Indexes that matter for the dashboard:**

- `fact_demand_daily(date, source_market)` — top markets query
- `fact_bookings_daily(date, channel_code)` — channel mix
- `fact_otb_snapshot(snapshot_date, stay_date)` — pace queries
- `fact_marketing_daily(date, channel_code)` — attribution
- `insights(property_id, status, detected_at)` — feed

**Row-level security:** Every fact table has RLS enabled. Users scoped to their `property_id`. Admins see all.

---

## 4. API architecture

### tRPC router structure

Each dashboard section maps to a router. Every procedure takes a `propertyId` and filter object, returns typed data.

```typescript
// server/trpc/routers/overview.ts
export const overviewRouter = router({
  kpis: protectedProcedure
    .input(z.object({
      propertyId: z.string().uuid(),
      dateFrom: z.string(),
      dateTo: z.string(),
      compareTo: z.enum(['ly', 'lp']).optional()
    }))
    .query(async ({ ctx, input }) => {
      return getKPIs(ctx.db, input);
    }),

  revenueTrend: protectedProcedure
    .input(z.object({ propertyId: z.string().uuid(), months: z.number().default(12) }))
    .query(async ({ ctx, input }) => {
      return getRevenueTrend(ctx.db, input);
    }),

  channelMix: protectedProcedure.input(...).query(...),
  topMarkets: protectedProcedure.input(...).query(...),
  todaySnapshot: protectedProcedure.input(...).query(...),
});
```

### Example REST endpoint (for non-tRPC consumers)

```typescript
// app/api/insights/route.ts
export async function GET(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return new Response('Unauthorized', { status: 401 });

  const url = new URL(req.url);
  const status = url.searchParams.get('status') ?? 'open';
  const severity = url.searchParams.get('severity');
  const limit = parseInt(url.searchParams.get('limit') ?? '20');

  const insights = await db.query.insights.findMany({
    where: and(
      eq(insightsTable.propertyId, user.propertyId),
      eq(insightsTable.status, status),
      severity ? eq(insightsTable.severity, severity) : undefined
    ),
    orderBy: [desc(insightsTable.detectedAt)],
    limit,
  });

  return Response.json({ insights });
}
```

### Webhook endpoints (inbound data)

- `POST /api/webhooks/booking` — Booking.com Connectivity API push
- `POST /api/webhooks/expedia` — Expedia LPS push
- `POST /api/webhooks/meta` — Meta Conversions API (for direct booking attribution)
- `POST /api/webhooks/pms` — Opera Cloud reservations push

Each webhook validates signature, queues an Inngest job, returns 200 fast.

---

## 5. ETL recommendations

Two-tier ETL: real-time webhooks for time-sensitive data, scheduled batch for slower-moving sources.

### Real-time

| Source | Method | Latency target |
|---|---|---|
| Booking.com new reservations | Connectivity API webhook | < 60 seconds |
| Expedia new reservations | EQC webhook | < 60 seconds |
| Opera Cloud PMS | Reservation webhook | < 30 seconds |
| Meta Conversions API | Real-time conversion send | < 5 seconds |

### Scheduled (Inngest functions)

| Source | Schedule | Notes |
|---|---|---|
| GA4 export to BigQuery | Hourly | Use BigQuery linked export, then dbt model |
| Google Ads | Daily 02:00 local | Last 7 days backfill window |
| Meta Ads (insights) | Daily 02:30 local | 7-day attribution window backfill |
| TikTok Ads | Daily 03:00 local | Same |
| STR / Demand360 compset | Daily 06:00 local | They publish overnight |
| Booking.com market insights | Weekly Monday | Demand360-style market reports |
| Google Trends (search proxy) | Daily | Pytrends → BigQuery |
| OTB snapshot | Hourly | Read PMS, snapshot future stay dates |
| Compset indices computation | Nightly 06:30 | MPI/ARI/RGI calculation |
| Forecast model run | Nightly 07:00 | Prophet or BigQuery ML ARIMA_PLUS |
| Insight detector sweep | Every 30 min (peak), hourly (off-peak) | Run detectors, generate insights |
| Daily briefing email | 06:30 user local | Per-user, summarizes top insights |

### Recommended approach: hybrid

For MVP (Phase 1), do all of this in Inngest functions with direct API calls.
For Phase 2, move to **Airbyte connectors + BigQuery + dbt** for production data pipeline. Airbyte handles incremental syncs and schema drift; dbt handles transformations into the conformed marts.

```
Sources → Airbyte → BigQuery (raw) → dbt → BigQuery (marts) → Dashboard
                                       ↓
                                  Inngest (orchestration)
                                       ↓
                                  Insight detectors → LLM → insights table
```

---

## 6. AI insight engine architecture

The insight engine has three stages: **detect**, **explain**, **rank**.

### Stage 1 — Detect (rule-based, fast, deterministic)

Each detector is a typed function that runs against the marts and returns `Insight | null`. Examples:

```typescript
// server/ai/detectors/demand-surge.ts
export async function detectDemandSurge(propertyId: string, market: string): Promise<DemandSurge | null> {
  const last7d = await getDemandAvg(propertyId, market, 7);
  const prior7d = await getDemandAvg(propertyId, market, 7, 7);
  const change = (last7d - prior7d) / prior7d;

  if (change < 0.10) return null;  // <10% lift = not surge-worthy

  return {
    category: 'demand',
    severity: change > 0.20 ? 'opportunity' : 'watch',
    detectorCode: `demand-surge-${market.toLowerCase()}`,
    confidence: Math.min(0.95, 0.5 + change * 2),
    rawData: { market, last7d, prior7d, change_pct: change * 100 },
  };
}
```

Detector library to ship in Phase 1:

| Detector | Triggers when |
|---|---|
| `demand-surge` | Search index up ≥10% WoW for a market |
| `demand-decline` | Search index down ≥10% WoW |
| `pace-collapse` | Booking window shortens ≥30% in 14 days |
| `pace-acceleration` | OTB pace exceeds forecast by ≥15% |
| `roas-anomaly` | Channel ROAS drops ≥30% vs trailing 14-day avg |
| `roas-positive-anomaly` | Channel ROAS up ≥30% (opportunity to scale) |
| `frequency-saturation` | Meta frequency ≥10 with declining CTR |
| `occupancy-risk` | Forecast occupancy <60% any future 7-day window |
| `ota-commission-shift` | OTA commission % moves ≥1pp |
| `direct-share-shift` | Direct share moves ≥3pp WoW |
| `compset-rate-gap` | Our rate >5% above/below compset median |
| `compset-occupancy-gap` | Our occupancy >5pp below compset |
| `cancellation-spike` | Cancellation rate up ≥2pp WoW |

### Stage 2 — Explain (LLM, slow, generative)

When a detector fires, the raw data is passed to an LLM prompt that generates a one-sentence title, two-sentence context, and one recommended action.

```typescript
// server/ai/prompts/insight-prompt.ts
export function buildInsightPrompt(detector: DetectorOutput): string {
  return `You are a luxury hotel commercial analyst. Convert this anomaly signal into an executive insight.

Detector: ${detector.detectorCode}
Severity: ${detector.severity}
Raw data: ${JSON.stringify(detector.rawData, null, 2)}

Write three things:
1. TITLE — one sentence stating what changed and by how much. Use specific numbers. Sentence case.
2. CONTEXT — two sentences explaining what's likely happening and why it matters. Reference the data.
3. ACTION — one short imperative recommendation, ≤12 words.

Format your response as JSON: { "title": "...", "context": "...", "action": "..." }`;
}
```

Call GPT-4o-mini with `response_format: { type: "json_object" }`. Cost is ~$0.0005 per insight.

### Stage 3 — Rank and dedupe

- **Embed** the insight title with OpenAI `text-embedding-3-small` → store in `insights.embedding`
- **Cosine-similarity check** against last 14 days of insights. If similarity > 0.85, mark as duplicate and link to original instead of creating new.
- **Rank by impact** — `estimated_impact_value` field, computed by detector based on market size + booking value at risk.

### Daily briefing generation

Once detectors complete, the top 3 insights are passed into a briefing prompt that generates a single-sentence morning summary for the user. Cached in `briefing_snapshots`.

---

## 7. Dummy data generation

For development, seed realistic data so the dashboard renders meaningfully without live integrations.

```typescript
// scripts/seed-dummy-data.ts
import { faker } from '@faker-js/faker';

// Seed 365 days of bookings with realistic patterns
async function seed() {
  const startDate = subDays(new Date(), 365);
  const markets = ['US','UK','JP','AU','SG','KR','HK','DE','CA','TW','TH','MY','VN','PH','ID'];
  const channels = ['direct-web','direct-loyalty','booking','expedia','agoda','wholesale'];

  // Realistic seasonal occupancy: 60–90% range, weekly cycle, holiday spikes
  for (let i = 0; i < 365; i++) {
    const date = addDays(startDate, i);
    const dow = date.getDay();
    const seasonal = 0.75 + 0.15 * Math.sin((i / 365) * Math.PI * 2);
    const weekly = dow === 0 || dow === 6 ? 0.95 : 0.85;
    const occupancy = Math.min(0.98, seasonal * weekly + (Math.random() - 0.5) * 0.1);
    const roomsBooked = Math.floor(occupancy * 280);  // 280-room hotel

    // Distribute across channels with realistic mix
    for (const channel of channels) {
      const channelMix = { 'direct-web': 0.22, 'direct-loyalty': 0.10, 'booking': 0.28, 'expedia': 0.18, 'agoda': 0.12, 'wholesale': 0.10 };
      const bookings = Math.floor(roomsBooked * channelMix[channel]);
      const adr = channel.startsWith('direct') ? 12500 + Math.random() * 1500 : 11000 + Math.random() * 1500;

      // ... insert into fact_bookings_daily
    }
  }
}
```

A full seed script lives in `scripts/seed-dummy-data.ts` — run with `pnpm seed:dummy`. Generates ~50k rows across all fact tables with realistic correlations (channel mix shifts seasonally, booking window varies by market, etc.).

---

## 8. Environment variables

```bash
# .env.example

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...    # server-side only

# BigQuery (if used)
GCP_PROJECT_ID=fairmont-bkk-data
GCP_SERVICE_ACCOUNT_EMAIL=etl@fairmont-bkk-data.iam.gserviceaccount.com
GCP_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
BQ_DATASET_MARTS=marts
BQ_DATASET_RAW=raw

# OpenAI (for insight engine)
OPENAI_API_KEY=sk-...
OPENAI_MODEL_INSIGHTS=gpt-4o-mini

# Anthropic (fallback)
ANTHROPIC_API_KEY=sk-ant-...

# Inngest
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=signkey-prod-...

# Resend (email)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=ops@your-domain.com

# OAuth providers
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
MICROSOFT_CLIENT_ID=...
MICROSOFT_CLIENT_SECRET=...

# Source connectors
GA4_PROPERTY_ID=properties/123456789
GA4_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'

BOOKING_CONNECTIVITY_USERNAME=...
BOOKING_CONNECTIVITY_PASSWORD=...
BOOKING_HOTEL_ID=12345678

EXPEDIA_PARTNER_USERNAME=...
EXPEDIA_PARTNER_PASSWORD=...
EXPEDIA_HOTEL_ID=98765432

GOOGLE_ADS_DEVELOPER_TOKEN=...
GOOGLE_ADS_CLIENT_ID=...
GOOGLE_ADS_CLIENT_SECRET=...
GOOGLE_ADS_REFRESH_TOKEN=...
GOOGLE_ADS_CUSTOMER_ID=1234567890

META_ACCESS_TOKEN=...
META_AD_ACCOUNT_ID=act_123456789

# Internal
NEXTAUTH_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -base64 32)
```

Copy `.env.example` to `.env.local` for development. In Vercel, set all variables in **Project Settings → Environment Variables**.

---

## 9. Authentication & RBAC

Supabase Auth handles identity. Authorization is enforced in two places:

1. **Database RLS policies** — every fact table has a policy: `auth.uid()`'s `property_id` matches the row's `property_id`.
2. **tRPC middleware** — `protectedProcedure` checks JWT and attaches `user` to context.

Roles:

| Role | Read | Write | Notes |
|---|---|---|---|
| `admin` | All properties | All | Anthropic / Accor corporate |
| `gm` | Own property | Acknowledge insights, mark actions | General Manager |
| `commercial` | Own property | All commercial settings | Director of Sales & Marketing |
| `marketing` | Own property (marketing sections) | Campaign data, marketing notes | PM Marketing Manager |
| `viewer` | Own property (read-only) | None | Stakeholders, e.g., GM's EA |

RLS example:

```sql
CREATE POLICY fact_demand_select ON fact_demand_daily
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'admin' OR users.property_id = fact_demand_daily.property_id)
    )
  );
```

---

## 10. Deployment

### GitHub setup

```bash
# Create the repo
gh repo create fairmont-commercial-intel --public --source=. --remote=origin --push
```

Or via web:
1. github.com → New repository → `fairmont-commercial-intel`
2. Push code: `git remote add origin git@github.com:USER/fairmont-commercial-intel.git && git push -u origin main`

### Vercel deployment

1. **Sign in to Vercel** with GitHub at vercel.com
2. **Import the repo** — Vercel auto-detects Next.js
3. **Set environment variables** — paste everything from `.env.local` into Project Settings → Environment Variables. Mark `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, and other secrets as **Production-only**.
4. **Connect domains** — Vercel gives you a `your-project.vercel.app` URL immediately. Add a custom domain in Settings → Domains.
5. **Set up preview deployments** — every PR auto-deploys to a preview URL. Magic.
6. **Connect Inngest** — install the Vercel + Inngest integration; it auto-configures `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY`.

### Supabase setup

1. supabase.com → New project
2. Run migrations: `pnpm db:migrate` (uses Drizzle migrations)
3. Seed dev data: `pnpm seed:dummy`
4. Enable Auth providers: Authentication → Providers → Google + Microsoft + Magic Link
5. Copy connection strings and keys into Vercel env vars

### Production checklist

- [ ] All environment variables set in Vercel
- [ ] Supabase production project created with RLS enabled
- [ ] BigQuery service account created with `roles/bigquery.dataViewer` + `roles/bigquery.jobUser`
- [ ] Inngest production endpoint configured
- [ ] OpenAI API key with billing enabled
- [ ] Resend domain verified for email sending
- [ ] Sentry project created and DSN set
- [ ] Booking.com, Expedia, GA4, Google Ads, Meta credentials obtained and tested
- [ ] Custom domain added with SSL active
- [ ] First detector run completes without errors
- [ ] First daily briefing email delivered to test user

---

## 11. Phased roadmap

### Phase 1 — Foundation (Weeks 1–6)

**Goal:** Static dashboard with manual data + working insight engine.

- Next.js + Tailwind + Supabase scaffolding
- All 8 dashboard sections with dummy data
- Auth + RBAC
- Database schema + RLS
- Manual CSV upload for marketing/PMS data
- 5 rule-based detectors (demand-surge, pace-collapse, roas-anomaly, occupancy-risk, ota-shift)
- LLM explanation layer
- Daily briefing email
- Dark/light theme
- Mobile responsive
- Vercel deployment with preview URLs

Phase 1 ships a real product that the commercial team can use with weekly manual data refreshes.

### Phase 2 — Connectors (Weeks 7–14)

**Goal:** Replace manual uploads with live data pipes.

- GA4 BigQuery export + dbt models
- Google Ads connector
- Meta Ads connector
- TikTok Ads connector
- Booking.com Connectivity API (reservations + market insights)
- Expedia LPS connector
- Opera Cloud PMS reservations webhook
- STR / Demand360 compset feed
- Hourly OTB snapshot job
- Nightly forecast model (BigQuery ML ARIMA_PLUS)
- Insight engine runs every 30 min
- Slack integration (alerts to channel)

By Phase 2, the dashboard updates without human intervention.

### Phase 3 — Intelligence (Weeks 15–22)

**Goal:** Predictive and prescriptive layer.

- Multi-touch attribution model (data-driven, not last-touch)
- Dynamic pricing recommendations (rate optimization suggestions based on demand + compset)
- Channel mix optimization model (budget reallocation suggestions)
- Anomaly explanation with confounding-factor analysis (was the SG surge from organic search, paid, or a partner promo?)
- Forecast confidence improvement with weather, events, flight data
- Natural-language query interface ("Why did Singapore drop yesterday?")
- Custom alert rules (per-user threshold configuration)
- Multi-property support (chain-wide rollup)
- Public-facing widget (embed key KPIs on an internal portal)

By Phase 3, this is a true AI commercial analyst — not just a dashboard.

---

## 12. Cost estimates (monthly)

| Service | Phase 1 | Phase 2 | Phase 3 |
|---|---|---|---|
| Vercel Pro | $20 | $20 | $20 |
| Supabase Pro | $25 | $25 | $50 |
| BigQuery | — | $20–50 | $80–150 |
| OpenAI (insights) | $5 | $20 | $50 |
| Resend | $0 (free tier) | $20 | $20 |
| Sentry | $0 (free tier) | $26 | $26 |
| Inngest | $0 (free tier) | $20 | $20 |
| PostHog | $0 (free tier) | $0 | $50 |
| Domain | $1 | $1 | $1 |
| **Total** | **~$51** | **~$152–182** | **~$317–387** |

Cheap to run. Most cost is in the data pipeline rather than the app.

---

## 13. References & inspiration

- **Stripe Dashboard** — typographic restraint, monochrome charts, premium feel
- **Linear** — sidebar navigation, command palette, theme system
- **Vercel Dashboard** — clean metric cards, dark mode done right
- **Notion** — typography hierarchy, calm interaction
- **Monocle Magazine** — editorial layout principles, eyebrow labels
- **Robinhood (institutional)** — KPI density without visual noise
- **Plaid Console** — sophisticated data viz in monochrome

Every screen should pass the test: *would this look out of place on stripe.com/dashboard?*
