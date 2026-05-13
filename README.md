# commercial-dashboard
A modern luxury hotel analytics dashboard designed for commercial, revenue, and digital marketing teams.
[README.md](https://github.com/user-attachments/files/27681892/README.md)
# Commercial Intelligence — Fairmont Bangkok Sukhumvit

Production-grade hotel commercial intelligence platform. Combines GA4, Booking.com, Expedia, compset, paid media, and in-house data into one executive dashboard with an AI insight engine.

## What's in this repo

```
commercial-intel/
├── index.html                       ← static demo of all 8 sections (open in browser)
├── ARCHITECTURE.md                  ← tech stack, schema, API, ETL, deployment, roadmap
├── nextjs-scaffold/                 ← starting point for the production Next.js app
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── app/
│   │   ├── layout.tsx               ← Montserrat font config + theme shell
│   │   ├── globals.css              ← CSS variables for light/dark
│   │   └── api/insights/route.ts    ← sample API route
│   ├── components/
│   │   ├── charts/KPICard.tsx       ← reusable KPI card with sparkline
│   │   ├── charts/RevenueTrend.tsx  ← Recharts line chart
│   │   └── insights/InsightCard.tsx ← AI insight card component
│   ├── lib/
│   │   ├── ai/insight-engine.ts     ← LLM explanation + cosine dedupe
│   │   ├── supabase/server.ts       ← Supabase server client
│   │   └── utils.ts                 ← formatters, cn helper
│   ├── db/schema.sql                ← full Postgres schema with RLS
│   └── .env.example                 ← all env vars listed
└── README.md
```

## Quick start — view the static demo

The fastest way to see what this looks like: open `index.html` in your browser. Single file, no build step, fully interactive with dark/light toggle and section switching.

You can also deploy `index.html` directly to **Netlify Drop** (drag and drop) or **GitHub Pages** in under 5 minutes — see "Deploy demo" below.

## Quick start — production app

```bash
git clone https://github.com/YOUR-USERNAME/fairmont-commercial-intel.git
cd fairmont-commercial-intel/nextjs-scaffold
cp .env.example .env.local            # fill in Supabase + OpenAI keys
pnpm install
pnpm db:push                          # apply schema.sql to Supabase
pnpm seed:dummy                       # generate 365 days of sample data
pnpm dev                              # localhost:3000
```

## Eight dashboard sections

1. **Executive Overview** — Revenue, RevPAR, occupancy, ADR; channel mix; top markets; today's snapshot; top 3 AI insights
2. **Demand Intelligence** — search demand index, top 10 source markets with WoW delta, demand-to-booking ratio
3. **Booking Window & Pace** — cumulative pace this year vs last year, booking window distribution, OTB by future month
4. **Marketing Attribution** — channel performance table (Google Ads, Meta, TikTok, SEO, email), funnel, ROAS trend
5. **OTA vs Direct** — channel share over time, channel economics per booking (net rate after commission)
6. **Competitor Benchmark** — MPI / ARI / RGI, rate comparison vs Bangkok luxury compset (Park Hyatt, Capella, Four Seasons, etc.)
7. **Forecasting** — 30/60/90-day occupancy forecast with 80% confidence band, occupancy risk periods, forecast accuracy
8. **AI Recommendations** — feed of detected anomalies and opportunities with severity, confidence, estimated impact, and recommended action

## AI Insight Engine

Three-stage architecture: **detect → explain → rank**.

- **Detectors** are deterministic rule-based functions that watch the conformed marts and fire when thresholds are crossed (demand surge ≥10% WoW, booking window collapse ≥30%, ROAS drop ≥30%, etc.)
- **LLM explanation** (GPT-4o-mini) converts raw detector output into a one-sentence title, two-sentence context, and one recommended action
- **Embedding + cosine similarity** deduplicates against the last 14 days of insights before storing

See `ARCHITECTURE.md` Section 6 for full detail.

## Tech stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4** with custom Montserrat-led theme
- **Supabase** (Postgres + Auth + RLS + Realtime + Storage)
- **BigQuery** for the warehouse layer (Phase 2)
- **Recharts** for charts (monochrome data viz)
- **OpenAI GPT-4o-mini** for insight explanation
- **Inngest** for background ETL and scheduled jobs
- **Resend** for email
- **Vercel** for hosting

## Design language

This dashboard inherits the **Fairmont Digital Design Language** — pure white background, black text, Montserrat throughout, generous whitespace, minimal color, hairline dividers over heavy cards, sharp corners. See `../Fairmont_Digital_Design_Language.md` for the full creative direction document.

Dark mode is a true inversion: pure black background, white text, grayscale only.

## Deploy demo

### Option 1 — Netlify Drop (60 seconds)
1. Open https://app.netlify.com/drop
2. Drag `index.html` onto the page
3. Get a live URL instantly

### Option 2 — GitHub Pages (10 minutes)
1. Create a new public repo on GitHub
2. Upload `index.html` (rename ensures GitHub Pages serves it as the index)
3. Settings → Pages → Source: deploy from branch `main`, folder `/ (root)`
4. Wait 1–2 minutes; your URL is `https://YOUR-USERNAME.github.io/REPO-NAME/`

## Deploy production app

### One-time setup

1. **Supabase:** Create a new project at supabase.com. Run `db/schema.sql` in the SQL Editor. Enable Auth providers (Email magic link + Google + Microsoft).
2. **OpenAI:** Get an API key at platform.openai.com. Enable billing.
3. **Vercel:** Sign in with GitHub. Import your repo. Set all environment variables from `.env.example` in Project Settings. Vercel will auto-deploy on every push to `main`.
4. **Domain (optional):** Add a custom domain in Vercel Settings → Domains.

### Continuous deployment

Every `git push origin main` triggers a Vercel build. Pull requests get preview deployments at unique URLs — useful for showing the team a feature before merging.

## Roadmap

| Phase | Duration | Scope |
|---|---|---|
| 1 — Foundation | 6 weeks | Static dashboard + manual data uploads + 5 detectors + auth + theme + mobile |
| 2 — Connectors | 8 weeks | GA4, Booking.com, Expedia, Google Ads, Meta, Opera, STR live data pipes |
| 3 — Intelligence | 8 weeks | Multi-touch attribution, dynamic pricing, NL query, multi-property |

Full breakdown in `ARCHITECTURE.md` Section 11.

## Cost

Roughly **$50/month** to run Phase 1 (Vercel Pro + Supabase Pro + OpenAI). Scales to **~$300–400/month** at Phase 3 with BigQuery + all connectors. See `ARCHITECTURE.md` Section 12.

## License

Internal. Not open source.
