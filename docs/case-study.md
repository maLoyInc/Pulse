# Pulse — building a dashboard around its state, not its layout

**Live demo:** <https://pulse-dashboard-id.vercel.app>

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Recharts

---

## The problem

Most dashboard demos are a grid of cards. They photograph well and fall apart the
moment someone uses two controls at once: pick a date range, type in the search
box, and the range quietly resets. The interesting part of a dashboard is not the
layout — it is the state underneath it, and whether independent controls can
narrow the same dataset without overwriting each other.

Pulse is a fictional B2B analytics product built to that brief: a global date
range, a search box, two dropdowns, a sortable header, paging, a role switch and
a CSV export, all reading one seeded in-process dataset. There is no backend, so
nothing on screen can hide behind a network call — every behaviour is the front
end's own.

## The approach

Shared state is split by *kind*, not by page. One context owns the date range,
one owns permissions, one owns the theme, one owns toasts; search, sort and page
stay local to the table, because nothing outside it reads them. A single app-wide
store works until two features write it in the same tick, and then every bug is a
whodunnit.

Everything derived is a pure function. Filtering, sorting and paging live outside
any component as one query object evaluated in a fixed order. Because the
pipeline is a function of a query rather than a sequence of `setState` calls, the
four controls compose instead of fight — and the CSV export can ask for *exactly
the rows on screen*, filtered, searched and sorted, rather than dumping the raw
dataset.

---

## Decisions worth defending

### 180 days of data for a 90-day maximum range

Every metric card compares the active range against an equally long window
immediately before it — 30 days against the 30 before, 90 against the 90 before.
A dataset covering only the longest selectable range would have nothing to
compare that range *to*, so "vs. previous period" on the widest view would be
either blank or invented. Generating 180 days for a 90-day maximum keeps the
comparison honest at every range.

That is a data-model decision taken by reading what the UI promises, not by
reaching for a framework feature.

### The insight banner is allowed to say nothing

Overview carries one automatic insight: revenue over the last 7 days against the
7 before, attributed to whichever traffic channel moved most in the same
direction. It is computed end to end — nothing is hardcoded. Below a 2% change it
renders nothing at all.

An "insight" that fires on every 0.3% wobble trains people to ignore the banner,
and a banner everyone ignores is worse than no banner. The threshold is the
feature.

### Chart colours pass the audit because the figures are also text

Three light-mode series colours sit below 3:1 against the card surface. WCAG 2.1
SC 1.4.11 asks for 3:1 on graphical objects *required to understand the content* —
and these are not required, because every chart card publishes the same numbers
as a Table view one click away, which also hands keyboard users every value
without hovering.

An exemption is only legitimate while it stays true, so it is asserted: a test
walks every chart card, switches it to Table, and fails if a card ever loses that
view. The day someone ships a chart without its table twin, the suite goes red
and the exemption goes with it.

### Recharts deferred — and the box left behind

Recharts is ~400 KB unpacked and draws nothing on the server: `ResponsiveContainer`
waits for a resize measurement, so the server-rendered markup is an empty box
whether the library ships in the first chunk or not. Moving it into its own chunk
therefore costs no visible content, and took the three chart routes from 1028 KB
of initial JavaScript to ~635 KB unpacked.

The second half is the part that took thought. The fixed-height wrapper stays in
the *eagerly* loaded module, so the skeleton and the plot occupy exactly the same
space — the lazy component receives no props and could not be told its height
even if it wanted to be. Lazy-loading a chart normally buys speed and pays for it
in layout shift. Cumulative Layout Shift stayed at **0.000** across ten runs,
locally and on the deployed build.

### Tooling that only ever confirms your work is not tooling

The harness found a real accessibility bug in the app. `--line-strong` — the
border that is the *only* thing identifying an outlined input, select or
secondary button — measured **1.23:1** against its surface, far under the 3:1
that SC 1.4.11 requires. One step to slate 500 clears it in both palettes.
`--line` was deliberately left alone: it frames cards and table rows, which are
identified by their content and owe no minimum, and raising it would have made
every static edge shout to fix a problem it did not have.

The same harness also found four bugs in *itself*, which is the more useful
story:

1. Results were collected in an in-memory array. Playwright spawns a fresh worker
   after a failure, which empties it — 56 of 62 contrast rows vanished and the
   report read as a clean pass. Every check now appends to a `.jsonl` as it goes.
2. The keyboard suite derived each focused control's accessible name from its
   markup. A control named by `<label for>` carries no `aria-label` and no text of
   its own, so it read as unnamed and the tab-order assertion silently checked
   nothing.
3. The Lighthouse reporter labelled the lowest value in a spread "best" for every
   figure. Right for timings, backwards for scores — it would have published the
   worst run as the best one.
4. On Windows, `chrome-launcher` deletes its temp profile after the report is
   already on disk and loses that race to Chrome's own file handles: exit code 1,
   complete report. The harness was failing finished runs.

Contrast tokens are read out of `globals.css` at run time rather than copied into
the test, so the published table cannot drift from the palette it claims to have
checked. A suite that did not run prints as *not measured* rather than quietly
counting as a pass.

---

## Measured

The figures that are the same on every machine, and therefore the ones worth
quoting: **0 axe violations** across 11 scans, **0 of 52 colour pairs below AA**,
clean renders on all five engines at three breakpoints, every interaction inside
a 200 ms budget with a worst median of 66.5 ms, **CLS 0.000**, and 198 KB of
gzipped JavaScript on the heaviest route. Lighthouse scores Accessibility, Best
Practices and SEO at 100.

Lighthouse Performance is the one number this project does *not* claim: 55 on
localhost, 49 on the deployed build, both measured from the same encumbered
laptop. The bytes were identical across those two runs and the blocking time
tripled, which says the figure is describing the host, not the app or the
hosting. Deploying to an edge CDN closed none of the gap — which rules the server
out, and leaves the question open until it is measured somewhere idle. The
observed trace, before the simulated phone and link are applied, puts first and
largest paint at 1.9 s with real network transit included.

Method and every figure: [`docs/qa-report.md`](./qa-report.md).

## What is deliberately not here

No database, no API, no authentication. The role switch is a client-side
simulation and says so — it exists to show how a read-only view differs from an
admin one, not to pretend at security. A demo that claimed otherwise would be the
one thing on this page not worth defending.
