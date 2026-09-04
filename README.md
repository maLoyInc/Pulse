# Pulse — SaaS Analytics Dashboard

> *See your business metrics in real time.*

A B2B analytics dashboard built as a self-directed portfolio piece for the
**Full-Stack Development / Data Visualization** category on Upwork.

**Pulse is a fictional product.** There is no company behind it, and no real backend: no
database, no API server, no authentication. Every number on screen is produced by a seeded
generator that runs inside the app, so the dashboard looks identical on every load while
still behaving like a real data-heavy product.

The interesting part of a dashboard is not the layout — it is the state underneath it. Pulse
was built around that: a global date range, a search box, two dropdowns and a sortable
header all compose over one dataset instead of overwriting each other, and every card,
chart and table reads from the same source of truth.

**Stack** — Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Recharts ·
next-themes · lucide-react

---

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. There is no `.env` file and nothing to start alongside it —
the data is generated in process.

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build, including the TypeScript check |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint, via `eslint-config-next` |

Needs Node 20.9 or newer (a Next.js 16 requirement). All four routes prerender as static
content, so the project deploys to Vercel with no configuration.

---

## The four pages

| Page | What it answers |
| --- | --- |
| **Overview** (`/`) | Headline numbers for the selected range, and what moved |
| **Analytics** (`/analytics`) | How the metric moved, which categories earned it, where traffic came from |
| **Data** (`/data`) | Every transaction — searchable, filterable, sortable, exportable |
| **Settings** (`/settings`) | Theme, simulated role, and what the demo dataset is made of |

A persistent sidebar links all four with an active indicator, and collapses behind a drawer
on small screens. The top bar carries the role switcher and the theme toggle.

## Features

**One date range, shared globally.** Presets for Today / 7 / 30 / 90 days plus a custom range
with inline validation — a start date after the end date is rejected before it reaches the
data layer. The range lives in a single context, so a range picked on Overview still applies
on Analytics and on the Data table.

**Metric cards.** Total revenue, total users, total orders and a growth rate, each with a
sparkline and a delta measured against the equally long window immediately before the
selected one. Growth rate deliberately tracks 7-day revenue momentum instead of repeating
what the revenue card's own delta already says.

**Charts (Recharts).** An area/line trend with a metric switcher (revenue · users · orders),
a horizontal bar chart for revenue by product category, and a donut for the traffic-source
mix. All three read the global range and share one theme module, so a metric keeps the same
colour on every page, and each has its own tooltip, skeleton and empty state.

**Data table.** 168 transactions with debounced search, status and category dropdowns,
sortable columns and paging at 10 / 25 / 50 rows. The four features compose in a fixed order
— filter, search, sort, then paginate — and anything that changes the result set returns to
page 1, which is the usual way these features break each other. The filtered row count is
always on screen; an empty result offers a reset.

**CSV export.** Exports exactly what the table is showing — filtered, searched and sorted
rows, not the raw dataset — generated client-side as a Blob. Values stay machine-readable
(ISO dates, unformatted amounts) so a spreadsheet can sum the column it just opened. Admin
only, disabled when nothing matches, with a toast on success.

**Automatic insight.** A banner on Overview computed from the series: this week's revenue
against last week's. A move below the significance threshold produces no banner at all, so it
never becomes noise people learn to skip. Dismissal lasts the session.

**Role simulation.** An Admin/Viewer switch in the top bar, client-side only. A Viewer keeps
every chart and table but loses CSV export and the Settings page — shown as a disabled
control with a reason rather than a silently missing button.

**Light and dark.** Two separately chosen palettes rather than one inverted, each with its own
chart series colours. `next-themes` writes the theme class before first paint, so there is no
wrong-theme flash on load.

---

## Project structure

```
src/
├── app/                     # App Router — one folder per route
│   ├── layout.tsx           # font, metadata, provider stack, skip link
│   ├── globals.css          # design tokens (light + dark) and the Tailwind theme
│   ├── page.tsx             # Overview
│   ├── analytics/           # Analytics
│   ├── data/                # Data
│   └── settings/            # Settings
├── components/
│   ├── charts/              # Recharts wrappers + the shared chart theme
│   ├── dashboard/           # metric cards, date filter, insight banner, chart cards
│   ├── data-table/          # table, toolbar, pagination, export button
│   ├── layout/              # app shell, sidebar, top bar, role switcher, theme toggle
│   ├── settings/            # settings panel
│   └── ui/                  # button, card, badge, select, segmented, skeleton, empty state
├── hooks/                   # debounced value, hydration flag, session value
├── lib/
│   ├── mock/                # seeded generators: random, time series, transactions
│   ├── mock-data.ts         # the one generated dataset the app imports
│   ├── metrics.ts           # range filtering, totals, deltas, distributions
│   ├── table.ts             # filter → search → sort → paginate pipeline
│   ├── insight.ts           # week-over-week insight calculation
│   ├── csv.ts               # CSV serialisation + browser download
│   └── …                    # date, format, types, metric metadata, class helper
└── providers/               # theme, role, global filter, toast
```

Presentation never generates data: components read from `lib/`, so replacing the mock
generator with a real API means rewriting `lib/mock-data.ts` and leaving everything else
where it is.

## Data model

Generated once at module scope from a fixed seed — 180 days of daily metrics, and 168
transactions spread across the last 90 days.

```ts
interface DailyMetric {
  date: string;          // ISO, UTC-based so server and client agree
  revenue: number;
  users: number;
  orders: number;
  trafficSource: { organic: number; paid: number; referral: number; direct: number };
  categoryMix: Record<TransactionCategory, number>;
}

interface Transaction {
  id: string;            // "TRX-10493"
  date: string;
  customer: string;
  category: "Subscription" | "One-time Purchase" | "Upgrade" | "Renewal" | "Add-on";
  amount: number;
  status: "paid" | "pending" | "failed" | "refunded";
}
```

The generated window is 180 days even though the UI offers at most 90, because every card
compares its range against the equally long window before it — a 90-day range needs 180 days
of history to have something to compare to.

## Notes on the build

- **One owner per piece of state.** Date range and role are contexts; table state stays local
  to the table. Nothing is stored twice, so nothing can disagree.
- **Filters compose instead of overwriting.** `selectTransactions` applies range, status,
  category and search in a fixed order and returns sorted rows; pagination only slices that
  result, so no combination of controls can produce a wrong page.
- **Deterministic data.** A seeded PRNG gives the server and the client identical numbers,
  which keeps hydration quiet and makes the demo reproducible.
- **Tokens, not hardcoded colours.** Both palettes are CSS custom properties. The chart series
  colours were checked for lightness band, chroma, colour-blind separation and contrast
  against the actual card surfaces in each theme, rather than picked by eye.
- **Accessibility.** Keyboard-reachable controls with visible focus rings, sortable headers as
  real buttons carrying `aria-sort`, a skip link, labelled fields, inline errors wired through
  `aria-describedby`, and a table caption that announces the filtered row count.
- **Responsive.** The metric grid stacks on mobile, charts resize with their container, the
  table scrolls horizontally rather than crushing its columns, and the sidebar becomes a
  drawer below the tablet breakpoint.
- **Designed loading and empty states.** Skeletons match the footprint of the content they
  stand in for, so a filter change never shifts the page; empty states explain the cause and,
  where it helps, offer the way out.

## Deliberately not built

No real backend or database, no authentication, no payments or billing, no multi-tenancy, no
websockets or live updates, and no native app. Each was out of scope for the brief: the point
of this project is the quality of the data interaction, and a server would not have made it
demonstrate any more of that.

---

Portfolio demo — the product, the company, the customers and every figure are invented.

