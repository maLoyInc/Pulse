# QA report

Generated 2026-09-07T09:51:02.855Z by `qa/global-teardown.ts` from what the
run actually recorded. Suites in this run: contrast, axe, cross-browser rendering, keyboard, interaction timing.
A section that says *not measured* means that suite did not run, not that it passed.

Everything below is produced by `npm run qa` against the production build on
`next start` — not the dev server, so what is measured is what would ship.

**181 checks ran; 181 completed and 0 did not.**

Every check that ran also finished, so every section below is backed by the
full set of checks its suite defines.

## Run conditions

Every timing figure below is a measurement of the app *and* of this machine.
Recorded here so a reader can tell the two apart before anyone optimises
something that was never slow.

| Sampled | When | CPU busy | Memory free |
| --- | --- | --- | --- |
| Before the first check | 2026-09-07T09:38:25.960Z | 26% | 0.5 GB of 7.7 GB |
| After the last check | 2026-09-07T09:51:02.331Z | 88% | 0.9 GB of 7.7 GB |

Host: 8 threads, 11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz.

**This host was under load while the run was measured** — up to 88% CPU busy with as little as 0.5 GB of 7.7 GB free. Interaction medians on a contended machine are upper bounds: a figure near its budget here is not yet evidence that the app is near its budget.

## 1. Colour contrast, WCAG 2.1 AA

Tokens are read out of `src/app/globals.css` at run time, so this table cannot
drift from the palette it claims to have checked. 52 pairs are held to a
WCAG 2.1 AA minimum; **0 are below it**.

| Theme | Usage | Foreground | Background | Ratio | Minimum | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| dark | control border against inset surface | `--line-strong` #64748b | `--surface-2` #1b2331 | 3.31:1 | 3:1 | pass |
| dark | control border against card | `--line-strong` #64748b | `--surface` #141b27 | 3.63:1 | 3:1 | pass |
| dark | focus ring against card | `--accent` #3b82f6 | `--surface` #141b27 | 4.70:1 | 3:1 | pass |
| dark | trend line and bars against card | `--chart-1` #3b82f6 | `--surface` #141b27 | 4.70:1 | 3:1 | pass |
| dark | tertiary text on card | `--fg-subtle` #7c8ca3 | `--surface` #141b27 | 5.05:1 | 4.5:1 | pass |
| dark | primary button label | `--accent-fg` #0a0f17 | `--accent` #3b82f6 | 5.22:1 | 4.5:1 | pass |
| dark | focus ring against page background | `--accent` #3b82f6 | `--bg` #0a0f17 | 5.22:1 | 3:1 | pass |
| dark | tertiary text on page background | `--fg-subtle` #7c8ca3 | `--bg` #0a0f17 | 5.61:1 | 4.5:1 | pass |
| dark | negative badge text on tint | `--neg-strong` #f87171 | `--neg-soft` #2e1618 | 6.10:1 | 4.5:1 | pass |
| dark | accent text on accent tint | `--accent-strong` #60a5fa | `--accent-soft` #16233a | 6.18:1 | 4.5:1 | pass |
| dark | negative delta on card | `--neg-strong` #f87171 | `--surface` #141b27 | 6.24:1 | 4.5:1 | pass |
| dark | accent text on card | `--accent-strong` #60a5fa | `--surface` #141b27 | 6.79:1 | 4.5:1 | pass |
| dark | secondary text on inset surface | `--fg-muted` #9fb0c6 | `--surface-2` #1b2331 | 7.14:1 | 4.5:1 | pass |
| dark | table header text on header row | `--fg-muted` #9fb0c6 | `--surface-2` #1b2331 | 7.14:1 | 4.5:1 | pass |
| dark | primary button label, hovered | `--accent-fg` #0a0f17 | `--accent-hover` #60a5fa | 7.55:1 | 4.5:1 | pass |
| dark | secondary text on card | `--fg-muted` #9fb0c6 | `--surface` #141b27 | 7.81:1 | 4.5:1 | pass |
| dark | secondary text on page background | `--fg-muted` #9fb0c6 | `--bg` #0a0f17 | 8.69:1 | 4.5:1 | pass |
| dark | neutral badge text on tint | `--flat-strong` #b6c3d3 | `--flat-soft` #1b2331 | 8.81:1 | 4.5:1 | pass |
| dark | positive badge text on tint | `--pos-strong` #4ade80 | `--pos-soft` #10291d | 8.88:1 | 4.5:1 | pass |
| dark | warning badge text on tint | `--warn-strong` #fbbf24 | `--warn-soft` #2b2110 | 9.47:1 | 4.5:1 | pass |
| dark | neutral text on card | `--flat-strong` #b6c3d3 | `--surface` #141b27 | 9.65:1 | 4.5:1 | pass |
| dark | positive delta on card | `--pos-strong` #4ade80 | `--surface` #141b27 | 9.91:1 | 4.5:1 | pass |
| dark | warning text on card | `--warn-strong` #fbbf24 | `--surface` #141b27 | 10.35:1 | 4.5:1 | pass |
| dark | body text on inset surface | `--fg` #e6ecf5 | `--surface-2` #1b2331 | 13.28:1 | 4.5:1 | pass |
| dark | body text on card | `--fg` #e6ecf5 | `--surface` #141b27 | 14.54:1 | 4.5:1 | pass |
| dark | body text on page background | `--fg` #e6ecf5 | `--bg` #0a0f17 | 16.17:1 | 4.5:1 | pass |
| light | control border against inset surface | `--line-strong` #64748b | `--surface-2` #f1f5f9 | 4.34:1 | 3:1 | pass |
| light | control border against card | `--line-strong` #64748b | `--surface` #ffffff | 4.76:1 | 3:1 | pass |
| light | focus ring against page background | `--accent` #2563eb | `--bg` #f5f7fa | 4.82:1 | 3:1 | pass |
| light | tertiary text on page background | `--fg-subtle` #5b6a7e | `--bg` #f5f7fa | 5.14:1 | 4.5:1 | pass |
| light | primary button label | `--accent-fg` #ffffff | `--accent` #2563eb | 5.17:1 | 4.5:1 | pass |
| light | focus ring against card | `--accent` #2563eb | `--surface` #ffffff | 5.17:1 | 3:1 | pass |
| light | trend line and bars against card | `--chart-1` #2563eb | `--surface` #ffffff | 5.17:1 | 3:1 | pass |
| light | tertiary text on card | `--fg-subtle` #5b6a7e | `--surface` #ffffff | 5.52:1 | 4.5:1 | pass |
| light | accent text on accent tint | `--accent-strong` #1d4ed8 | `--accent-soft` #eff6ff | 6.16:1 | 4.5:1 | pass |
| light | warning badge text on tint | `--warn-strong` #92400e | `--warn-soft` #fef3c7 | 6.37:1 | 4.5:1 | pass |
| light | positive badge text on tint | `--pos-strong` #166534 | `--pos-soft` #dcfce7 | 6.49:1 | 4.5:1 | pass |
| light | primary button label, hovered | `--accent-fg` #ffffff | `--accent-hover` #1d4ed8 | 6.70:1 | 4.5:1 | pass |
| light | accent text on card | `--accent-strong` #1d4ed8 | `--surface` #ffffff | 6.70:1 | 4.5:1 | pass |
| light | negative badge text on tint | `--neg-strong` #991b1b | `--neg-soft` #fee2e2 | 6.80:1 | 4.5:1 | pass |
| light | secondary text on inset surface | `--fg-muted` #475569 | `--surface-2` #f1f5f9 | 6.92:1 | 4.5:1 | pass |
| light | table header text on header row | `--fg-muted` #475569 | `--surface-2` #f1f5f9 | 6.92:1 | 4.5:1 | pass |
| light | secondary text on page background | `--fg-muted` #475569 | `--bg` #f5f7fa | 7.06:1 | 4.5:1 | pass |
| light | warning text on card | `--warn-strong` #92400e | `--surface` #ffffff | 7.09:1 | 4.5:1 | pass |
| light | positive delta on card | `--pos-strong` #166534 | `--surface` #ffffff | 7.13:1 | 4.5:1 | pass |
| light | secondary text on card | `--fg-muted` #475569 | `--surface` #ffffff | 7.58:1 | 4.5:1 | pass |
| light | negative delta on card | `--neg-strong` #991b1b | `--surface` #ffffff | 8.31:1 | 4.5:1 | pass |
| light | neutral badge text on tint | `--flat-strong` #334155 | `--flat-soft` #f1f5f9 | 9.45:1 | 4.5:1 | pass |
| light | neutral text on card | `--flat-strong` #334155 | `--surface` #ffffff | 10.35:1 | 4.5:1 | pass |
| light | body text on inset surface | `--fg` #0f172a | `--surface-2` #f1f5f9 | 16.30:1 | 4.5:1 | pass |
| light | body text on page background | `--fg` #0f172a | `--bg` #f5f7fa | 16.63:1 | 4.5:1 | pass |
| light | body text on card | `--fg` #0f172a | `--surface` #ffffff | 17.85:1 | 4.5:1 | pass |

### Measured, not gated

SC 1.4.11 asks for 3:1 on graphical objects *required to understand the
content*. These are not: the same figures are published as text in the same
card, which is asserted by the `every chart card publishes its figures as
text` test — if a chart card ever loses its Table view, that test fails and
this exemption goes with it. The numbers are printed anyway.

| Theme | Usage | Colour | Ratio | Why it is not gated |
| --- | --- | --- | --- | --- |
| dark | chart axis against card | `--axis` #2f3a4b | 1.50:1 | the X-axis baseline; its values are the tick labels, which are text at 4.5:1, and every chart card publishes the same numbers in its Table view |
| dark | chart series 5 against card | `--chart-5` #d55181 | 4.38:1 | only painted as donut slices, each ringed by a 2px surface stroke and named in the text legend beside it; the same figures are in the card's Table view |
| dark | chart series 2 against card | `--chart-2` #d95926 | 4.45:1 | only painted as donut slices, each ringed by a 2px surface stroke and named in the text legend beside it; the same figures are in the card's Table view |
| dark | chart series 3 against card | `--chart-3` #199e70 | 5.07:1 | only painted as donut slices, each ringed by a 2px surface stroke and named in the text legend beside it; the same figures are in the card's Table view |
| dark | chart series 6 against card | `--chart-6` #9085e9 | 5.53:1 | only painted as donut slices, each ringed by a 2px surface stroke and named in the text legend beside it; the same figures are in the card's Table view |
| dark | chart series 4 against card | `--chart-4` #c98500 | 5.62:1 | only painted as donut slices, each ringed by a 2px surface stroke and named in the text legend beside it; the same figures are in the card's Table view |
| light | chart axis against card | `--axis` #cbd5e1 | 1.48:1 | the X-axis baseline; its values are the tick labels, which are text at 4.5:1, and every chart card publishes the same numbers in its Table view |
| light | chart series 4 against card | `--chart-4` #eda100 | 2.17:1 | only painted as donut slices, each ringed by a 2px surface stroke and named in the text legend beside it; the same figures are in the card's Table view |
| light | chart series 5 against card | `--chart-5` #e87ba4 | 2.69:1 | only painted as donut slices, each ringed by a 2px surface stroke and named in the text legend beside it; the same figures are in the card's Table view |
| light | chart series 3 against card | `--chart-3` #1baf7a | 2.82:1 | only painted as donut slices, each ringed by a 2px surface stroke and named in the text legend beside it; the same figures are in the card's Table view |
| light | chart series 2 against card | `--chart-2` #eb6834 | 3.20:1 | only painted as donut slices, each ringed by a 2px surface stroke and named in the text legend beside it; the same figures are in the card's Table view |
| light | chart series 6 against card | `--chart-6` #4a3aa7 | 8.56:1 | only painted as donut slices, each ringed by a 2px surface stroke and named in the text legend beside it; the same figures are in the card's Table view |

## 2. Automated accessibility audit

axe-core 4.11.2 via `@axe-core/playwright`, tags `wcag2a wcag2aa wcag21a wcag21aa`,
run in Chromium. 11 scans, 247 passing rule checks, **0 violations**.

| Scope | Theme | Viewport | Violations | Needs review |
| --- | --- | --- | --- | --- |
| overview | light | desktop | none | 1 |
| analytics | light | desktop | none | 1 |
| data | light | desktop | none | 0 |
| settings | light | desktop | none | 0 |
| overview | dark | desktop | none | 1 |
| analytics | dark | desktop | none | 1 |
| data | dark | desktop | none | 0 |
| settings | dark | desktop | none | 0 |
| overview + nav drawer | light | mobile | none | 1 |
| data + empty state | light | desktop | none | 0 |
| overview + range validation error | light | desktop | none | 1 |

### Mitigations that are tested, not asserted

- **chart colour is never the only encoding** — 3 chart cards on Analytics offer a Table view with the same figures as text: Revenue over time, Revenue by category, Traffic sources

`incomplete` results are axe's own "needs a human" bucket, chiefly colour
contrast on gradients and text over images; the contrast table above is the
answer to those.

## 3. Cross-browser and cross-device rendering

Every route drawn in every engine at every breakpoint the design claims, with
charts measured for real geometry rather than presence in the DOM.

| Engine | Routes | Breakpoints | Charts drawn | H-overflow | Console errors |
| --- | --- | --- | --- | --- | --- |
| Chromium (Chrome/Edge engine) | 4 | desktop, tablet, mobile | 12 | no | no |
| Firefox (Gecko) | 4 | desktop, tablet, mobile | 12 | no | no |
| Safari (WebKit) | 4 | desktop, tablet, mobile | 12 | no | no |
| Google Chrome, shipping build | 4 | desktop, tablet, mobile | 12 | no | no |
| Microsoft Edge, shipping build | 4 | desktop, tablet, mobile | 12 | no | no |

Breakpoints exercised: desktop, tablet, mobile — 1280 / 768 / 360 px, the exact
boundaries in the requirements rather than comfortable widths inside them.

## 4. Keyboard operation

Tab to reach it, Enter or Space to use it, a visible focus ring while you are
there. 8 checks completed; each line below is what that run
observed, not what was intended.

- **skip link** — first Tab stop, Enter moves to #main-content, ring visible
- **data page tab order** — 40 stops walked; the role switcher, theme toggle, search, both dropdowns, all five sortable headers, export, rows-per-page and paging all reached
- **sortable header** — Amount column: aria-sort none → descending on Enter → ascending on Space, ring visible
- **segmented controls** — date preset activates on Enter, chart metric on Space; aria-pressed follows and the chart title changes
- **custom range validation** — start after end is rejected inline; the alert's id is the aria-describedby of both date fields
- **top bar controls** — theme toggle flips the palette on Enter; role switch reaches Viewer on Space
- **nav drawer** — opens on Enter with focus moved into the dialog, closes on Escape
- **empty state** — no match shows a reason and a Reset filters button that restores the rows from the keyboard

## 5. Interaction latency

The event is dispatched in the page and the clock stops on the second animation
frame after it — React 19 commits in the first, the compositor shows it in the
second. 5 samples each, median reported, Chromium only so the medians
describe one machine. 9 interactions completed; budget
200 ms, **0 over**.

| Interaction | Median | Worst | Samples (ms) | Verdict |
| --- | --- | --- | --- | --- |
| Sort by amount (168 rows) | 27.3 ms | 39.9 ms | 40, 23, 29, 26, 27 | pass |
| Status filter change | 26.3 ms | 34.6 ms | 33, 35, 24, 26, 26 | pass |
| Rows per page change (up to 50 rows) | 32.9 ms | 42.8 ms | 30, 43, 32, 33, 40 | pass |
| Next page | 28.7 ms | 29.5 ms | 19, 24, 30, 29, 29 | pass |
| Search keystroke to updated rows<br>_excludes the deliberate 250 ms debounce_ | 46.7 ms | 57.4 ms | 52, 47, 57, 32, 28 | pass |
| Trend chart metric switch | 66.5 ms | 80.5 ms | 20, 81, 70, 67, 64 | pass |
| Date preset click to loading state<br>_the 220 ms settle window that follows is a designed skeleton, not latency_ | 34.6 ms | 37.0 ms | 35, 30, 35, 37, 26 | pass |
| Light/dark switch | 28.0 ms | 36.6 ms | 28, 17, 34, 37, 25 | pass |
| Trend chart hover to tooltip | 12.1 ms | 47.6 ms | 48, 2, 14, 12, 9 | pass |

Two numbers carry a note because the delay is deliberate: search waits out a
250 ms debounce before it filters, and a date-range change opens a 220 ms
skeleton window. In both cases what is timed is the part the user is actually
waiting on — the debounce is subtracted, and the date preset is timed to the
frame that shows the skeleton.

Measured on 8 threads, 11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz, 0.5 GB of 7.7 GB memory free, CPU 26% busy — the same host recorded under
*Run conditions* above. A median is a statement about the app only to the
extent the machine was free to give it one; on a loaded host every number
here is an upper bound.

## 6. Initial load, Lighthouse

Lighthouse 13.4.1 against the production build (`next start`) on
http://127.0.0.1:3100 — mobile emulation, simulate throttling (Slow 4G preset: 150 ms RTT, 1638 Kbps, 4× CPU).
5 run(s); the median is shown, with the best and worst run beside
it wherever they differed.

Measured on 8 threads, 11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz, 0.4 GB of 7.7 GB memory free when the run started. That matters more than it looks: Lighthouse
multiplies CPU cost to imitate a mid-range phone, so on a machine that is
already busy it multiplies the contention too. Total Blocking Time, Time to
Interactive and the simulated Largest Contentful Paint all derive from CPU
time, and their spread below is mostly the host, not the page. Read them as an
upper bound.

| Category | Score |
| --- | --- |
| Performance | 55 / 100 · best 65 / 100, worst 51 / 100 |
| Accessibility | 100 / 100 |
| Best Practices | 100 / 100 |
| SEO | 100 / 100 |

| Metric | Value |
| --- | --- |
| First Contentful Paint | 0.88 s · best 0.77 s, worst 0.94 s |
| Largest Contentful Paint | 4.60 s · best 4.08 s, worst 5.17 s |
| Speed Index | 3.30 s · best 2.45 s, worst 5.01 s |
| Time to Interactive | 5.07 s · best 4.34 s, worst 6.44 s |
| Total Blocking Time | 1.75 s · best 0.93 s, worst 2.92 s |
| Cumulative Layout Shift | 0.000 |

### What the browser actually observed

The same traces before the network model is applied — the page's own cost on
this machine rather than the emulated phone on an emulated link. These barely
move between runs, which is what says the spread above belongs to the
simulation and the host.

| Metric | Value |
| --- | --- |
| First Contentful Paint | 1.36 s · best 0.92 s, worst 2.62 s |
| Largest Contentful Paint | 1.36 s · best 0.92 s, worst 2.62 s |
| DOMContentLoaded | 0.17 s · best 0.14 s, worst 0.27 s |
| Load | 0.53 s · best 0.32 s, worst 0.73 s |

### Payload

The part no amount of CPU fixes.

| Resource | Weight |
| --- | --- |
| JavaScript | 279 KB over the wire, 12 request(s), 932 KB unpacked |
| CSS | 7 KB over the wire, 1 request(s) |
| HTML | 7 KB over the wire, 1 request(s) |
| Everything | 341 KB over the wire, 16 request(s) |

Median of 5 runs against the production build, with the best and worst run shown wherever they differed. Cumulative Layout Shift is unitless; every other timing is seconds.

### Against the requirement

The target is an initial render under 2 seconds on a standard connection.
First Contentful Paint meets it; the simulated Largest Contentful Paint does
not, on this host. The two figures disagree because LCP here is a text
paragraph that is already in the HTML — it is not waiting on data or on a
chart, it is waiting on the main thread, and the main thread is being charged
4× on a machine with almost no free memory. The observed trace above and the
payload in the next section are the parts that do not depend on this host,
and both are well inside budget. A re-measure on an idle machine, or on the
deployed build, is the honest way to settle it.

## 7. Payload per route

The one performance figure that is the same on every machine. Timings on a
busy host wander by seconds; bytes do not, so this is what a change to the
app can actually be held to.

Measured by fetching each route and every `<script src>` its HTML asks for —
Turbopack no longer prints per-route sizes, so the served page is the only
honest source.

| Route | Scripts | JS unpacked | JS gzipped | HTML gzipped |
| --- | --- | --- | --- | --- |
| `/` | 10 | 636 KB | 198 KB | 6 KB |
| `/analytics` | 9 | 634 KB | 197 KB | 6 KB |
| `/data` | 9 | 631 KB | 196 KB | 7 KB |
| `/settings` | 9 | 616 KB | 192 KB | 5 KB |

Recharts is loaded in its own chunk rather than up front — it draws nothing
server-side anyway, since `ResponsiveContainer` waits for a resize
measurement, so deferring it costs no visible content. That took the three
chart routes from 1028 KB of initial JavaScript to the figures above, and
`/settings` — the one route that never had a chart — is unchanged, which is
what says the saving is Recharts and not something else moving.

The fixed-height box lives in the eagerly loaded half of each chart, so the
placeholder and the plot occupy the same space and the swap shifts nothing.
Cumulative Layout Shift stays at 0.000, measured above.

Every `<script src>` the route's HTML asks for, fetched and added up. Gzipped is what the link carries; unpacked is what the main thread has to parse, and that is the figure that turns into blocking time.

## 8. Visual record

Committed under `docs/screenshots/`, so the visual record is reviewable without
running anything: every route in both palettes at 1280px, the two data-heavy
routes at 768px and 360px, and the navigation drawer open on a phone.
