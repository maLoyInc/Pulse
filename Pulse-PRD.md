# Pulse — Product Requirements Document (PRD)

**SaaS Analytics Dashboard**
*"See your business metrics in real time."*

| | |
|---|---|
| **Jenis Dokumen** | Product Requirements Document (PRD) |
| **Versi** | v2.2 |
| **Tanggal** | 7 September 2026 |
| **Kategori Upwork** | Full-Stack Development / Data Visualization Dashboard |
| **Status Produk** | Fiktif — Portfolio Self-Directed Project |
| **Status Development** | Core product selesai & terverifikasi. Suite QA **sudah dijalankan sampai selesai** (181 pemeriksaan, 0 gagal) dan Lighthouse **sudah diukur**. Recharts sudah dipisah ke chunk sendiri. Sisa: deploy Vercel (sengaja ditunda), case study, dan commit ronde kedua untuk tooling QA + docs. |
| **Project Terkait** | Chatly, Solstice (portfolio series sebelumnya) |
| **Menggantikan** | Pulse-PRD.md v2.1 (5 September 2026) |

Dokumen ini menggantikan PRD v2.1 karena **v2.1 salah secara faktual di dua tempat**, bukan sekadar usang:

1. **Bagian 10.1 v2.1 menyatakan `git log` hanya berisi satu commit "Initial commit from Create Next App" dan seluruh fitur masih uncommitted.** Itu tidak benar. Repo punya 17 commit granular per area fitur dan `origin/main` sudah sinkron ke GitHub. Klaim itu ditulis dari pembacaan repo yang keliru dan sempat merambat ke Bagian 13 dan Bagian 14 — ketiganya dikoreksi di sini.
2. **Bagian 10.3 dan 10.4 v2.1 menandai QA dan performa sebagai belum dijalankan.** Sejak itu suite QA sudah dijalankan sampai selesai dan Lighthouse sudah diukur, jadi status keduanya berubah dari terbuka menjadi selesai — dengan hasil apa adanya, termasuk angka yang tidak memenuhi target.

Selain itu, satu pekerjaan yang benar-benar dilakukan tapi tidak tercatat sama sekali di v2.1 — pemisahan Recharts ke chunk terpisah (code-split) — ditambahkan di Bagian 9.1 dan 10.4.

Sama seperti v2.1, tidak ada re-verifikasi terhadap item yang sudah dikonfirmasi selesai di v2.0 (Bagian 8, fitur inti). Yang diverifikasi ulang hanya hal yang diklaim salah di v2.1, dibaca langsung dari repo (`git log`, `git status`, `git remote`, `.gitignore`, `package.json`, `docs/qa-report.md`).

---

## Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Latar Belakang & Posisi Project](#2-latar-belakang--posisi-project)
3. [Tujuan Produk](#3-tujuan-produk)
4. [Target Pengguna & Persona](#4-target-pengguna--persona)
5. [Ruang Lingkup (Scope)](#5-ruang-lingkup-scope)
6. [Tech Stack Aktual](#6-tech-stack-aktual)
7. [Sitemap / Struktur Halaman](#7-sitemap--struktur-halaman)
8. [Status Implementasi Fitur](#8-status-implementasi-fitur)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [Sisa Pekerjaan (Open Tasks)](#10-sisa-pekerjaan-open-tasks)
11. [Struktur Data (Mock Data Model Aktual)](#11-struktur-data-mock-data-model-aktual)
12. [Milestone & Rencana Pengembangan](#12-milestone--rencana-pengembangan)
13. [Definition of Done](#13-definition-of-done)
14. [Risiko & Asumsi](#14-risiko--asumsi)
15. [Lampiran](#15-lampiran)

---

## 1. Ringkasan Eksekutif

**Pulse** adalah dashboard analytics SaaS berbasis B2B yang dibangun sebagai portfolio piece untuk kategori Upwork *Full-Stack Development / Data Visualization Dashboard*. Seluruh fitur inti pada scope v1.0 — Overview, Analytics, Data table, role simulation, export CSV, insight otomatis, dan dark/light mode — sudah **diimplementasikan dan lolos verifikasi**: `npm run build` sukses, TypeScript bersih, ESLint 0 error, keempat route (`/`, `/analytics`, `/data`, `/settings`) merespons HTTP 200 dengan konten yang benar, dan kode tiap fitur sudah direview langsung (bukan hanya diasumsikan dari struktur folder).

Sejak v2.0, fokus dokumen ini bergeser dari *pengembangan fitur* ke **penyelesaian rantai terakhir sebelum produk ini bisa dipakai sebagai portfolio piece**: push ke GitHub, QA terukur, pengukuran performa, deploy, dan penulisan case study.

Pada v2.2, sebagian besar rantai itu sudah tertutup. Kode fitur sudah ter-push ke GitHub dalam 17 commit granular. Suite QA otomatis sudah dijalankan sampai selesai — 181 pemeriksaan, 0 gagal, mencakup 5 engine browser, 11 pemindaian axe tanpa pelanggaran, seluruh pemeriksaan keyboard lolos, dan 9 interaksi yang semuanya di bawah budget 200 ms. Performa sudah diukur dengan Lighthouse, dan Recharts sudah dipindahkan keluar dari chunk awal sehingga sekitar 392 KB JavaScript per route chart kini tiba setelah first paint.

Satu hal dinyatakan terbuka dengan sengaja: **Largest Contentful Paint tersimulasi 4,60 s tidak memenuhi target di bawah 2 detik**, meski First Contentful Paint 0,88 s memenuhinya. Angka itu diambil pada mesin yang kehabisan memori dan merupakan batas atas, tapi selama belum diukur ulang, dokumen ini tidak menandainya lolos.

Yang benar-benar tersisa: deploy ke Vercel (sengaja ditunda), case study, dan commit ronde kedua untuk tooling QA beserta dokumentasinya. Bagian 8 tidak berisi task breakdown — hanya status ringkas per fitur sebagai referensi. Task yang tersisa dijabarkan lengkap di Bagian 10.

---

## 2. Latar Belakang & Posisi Project

### 2.1 Konteks

Riset informal terhadap job posting Upwork menunjukkan bahwa jenis dashboard paling konsisten diminta klien adalah **SaaS admin/analytics dashboard** berbasis Next.js + React, dengan pola kebutuhan yang berulang: metric cards, chart interaktif, data table yang filterable, dan role/user management. Mayoritas klien meminta dashboard generik/multi-purpose — bukan super niche ke satu industri.

### 2.2 Kenapa Dipisah dari Project Solstice

Pulse sengaja dipisah dari project Solstice (ecommerce) untuk memperkuat variasi portfolio: satu project customer-facing (Solstice, B2C), satu project data/operational-facing (Pulse, B2B).

| Aspek | Pulse | Solstice |
|---|---|---|
| **Model bisnis** | B2B — tool internal bisnis | B2C — toko online konsumen |
| **Audiens** | Founder, PM, tim ops | Konsumen akhir / shopper |
| **Fokus skill** | Data viz, state kompleks, tabel | Customer journey, checkout, katalog |
| **Tone** | Profesional, data-forward, terpercaya | Menarik, persuasif, brand-forward |

*Tabel 2.1 — Perbandingan posisi Pulse vs Solstice dalam portfolio.*

---

## 3. Tujuan Produk

### 3.1 Tujuan Portfolio (Business Goals)

- Menunjukkan kemampuan full-stack (data layer + state management + visualisasi) kepada calon klien Upwork.
- Menjadi bukti konkret untuk skill tags: Next.js, React, Data Visualization, Full-Stack Development, Dashboard Design.
- Melengkapi variasi portfolio dengan studi kasus B2B/data-facing, berbeda dari Chatly dan Solstice.

### 3.2 Tujuan Produk (Product Goals)

- Dashboard terasa generik & reusable sehingga calon klien dari berbagai niche dapat membayangkan dashboard serupa untuk bisnis mereka.
- Kualitas interaksi data (chart responsif terhadap hover/filter, tabel yang smooth saat sort/search) menjadi prioritas utama.
- Struktur navigasi dan komponen mencerminkan pemahaman terhadap kebutuhan produk SaaS nyata (role, empty state, loading state).

### 3.3 Non-Goals (Di Luar Cakupan)

- Bukan produk produksi nyata dengan pengguna sungguhan.
- Tidak memerlukan backend/database sungguhan — seluruh data adalah mock data seeded.
- Tidak memerlukan sistem autentikasi & otorisasi sungguhan.
- Tidak dirancang spesifik untuk satu industri tertentu.

---

## 4. Target Pengguna & Persona

| Persona | Kebutuhan Utama | Pain Point yang Diselesaikan |
|---|---|---|
| **Founder / Business Owner** | Ringkasan cepat kesehatan bisnis: revenue, growth, tren. | Harus membuka banyak tool terpisah untuk melihat metrik dasar bisnis. |
| **Product Manager** | Breakdown data per kategori/periode untuk pengambilan keputusan produk. | Data mentah sulit dibaca cepat tanpa visualisasi dan filter yang baik. |
| **Tim Operasional / Data** | Akses ke data mentah (tabel) yang bisa disortir, difilter, dan diekspor. | Butuh detail granular, bukan cuma ringkasan, untuk operasional harian. |

*Tabel 4.1 — Persona pengguna Pulse.*

---

## 5. Ruang Lingkup (Scope)

### 5.1 In-Scope — Status

| Item | Status |
|---|---|
| Halaman Overview (metric cards, date range, chart ringkasan) | ✅ Selesai |
| Halaman Analytics (chart interaktif, toggle metric) | ✅ Selesai |
| Halaman Data (tabel sortable/filterable/searchable/paginate) | ✅ Selesai |
| Halaman Settings | ✅ Selesai |
| Role-based view (Admin vs Viewer, client-side) | ✅ Selesai |
| Export CSV | ✅ Selesai |
| Notifikasi/insight otomatis | ✅ Selesai |
| Dark/light mode toggle | ✅ Selesai |
| Mock data JSON time-series realistis | ✅ Selesai |
| **Deployment ke Vercel** | ⬜ Belum — lihat Bagian 10.2 |
| **Dokumentasi README** | ✅ Sudah ada dan lengkap; pada v2.2 diperbarui untuk menyebut script `qa:*`, cakupan harness QA, dan lokasi buktinya |
| **Tooling & bukti QA** (`qa/`, `docs/qa-report.md`, `docs/screenshots/`) | ✅ Selesai — di luar scope v1.0, ditambahkan sebagai pekerjaan verifikasi (Bagian 10.3) |
| **Code-split Recharts** (`*-plot.tsx`) | ✅ Selesai — di luar scope v1.0, ditambahkan sebagai optimasi performa (Bagian 10.4) |

### 5.2 Out-of-Scope (tidak berubah)

- Backend/database sungguhan, autentikasi/otorisasi nyata.
- Integrasi payment, billing, atau notifikasi email/push sungguhan.
- Multi-tenancy sungguhan, aplikasi mobile native.
- Data real-time (websocket/live update).

---

## 6. Tech Stack Aktual

Diverifikasi langsung dari `package.json` — beberapa versi berbeda dari asumsi awal di v1.0 (mis. Next.js 16, React 19, Tailwind v4, bukan versi generik).

| Layer | Teknologi Aktual | Catatan |
|---|---|---|
| **Framework** | Next.js 16.3.4 (App Router), React 19.2.8 | Node ≥20.9 dibutuhkan |
| **Bahasa** | TypeScript ^5 | Type-check lolos sebagai bagian dari `next build` |
| **Chart Library** | Recharts ^3.10.1 | Client-side, tema warna terpusat di `chart-theme.ts`. Dimuat lewat `next/dynamic` (`ssr: false`), jadi tidak ikut chunk awal — lihat Bagian 10.4 |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/postcss`) | Design token di `globals.css` (light & dark) |
| **Tema** | next-themes ^0.4.6 | No-flash theme injection |
| **Ikon** | lucide-react ^1.40.0 | |
| **Utility** | clsx, tailwind-merge | class merging |
| **Data** | Mock data seeded (generator internal, bukan file JSON statis) | 180 hari time-series + 168 transaksi, deterministik |
| **QA & Tooling** | Playwright 1.62.1, @axe-core/playwright 4.11.2, axe-core 4.11.2, Lighthouse 13.4.1 | devDependencies. Berjalan terhadap production build (`next start`), bukan dev server — lihat Bagian 10.3 |
| **Deployment** | Vercel (target) | **Belum ter-deploy** — lihat Bagian 10.2 |
| **Repo & Dokumentasi** | GitHub (`maLoyInc/Pulse`) + README | Kode fitur sudah ter-push: 17 commit granular, `origin/main` sinkron dengan `HEAD`. Yang belum ter-commit adalah tooling QA, code-split, perbaikan kontras, dan `docs/` — lihat Bagian 10.1 |

*Tabel 6.1 — Tech stack aktual Pulse (terverifikasi dari kode, bukan rencana).*

---

## 7. Sitemap / Struktur Halaman

| # | Halaman | Route | Status |
|---|---|---|---|
| 1 | **Overview** | `/` | ✅ HTTP 200, render benar |
| 2 | **Analytics** | `/analytics` | ✅ HTTP 200, render benar |
| 3 | **Data** | `/data` | ✅ HTTP 200, render benar |
| 4 | **Settings** | `/settings` | ✅ HTTP 200, render benar |

*Tabel 7.1 — Struktur halaman, sudah diverifikasi via `next start` + curl ke tiap route.*

Navigasi antar halaman menggunakan sidebar persisten dengan indikator halaman aktif, collapse menjadi drawer di layar kecil (topbar membawa role switcher & theme toggle).

---

## 8. Status Implementasi Fitur

Bagian ini menggantikan Bagian 8 (Spesifikasi Fitur) pada v1.0. Task breakdown dihapus karena seluruh item sudah selesai; yang tersisa hanya ringkasan status dan lokasi kode untuk referensi.

| # | Fitur | Status | Lokasi Kode Utama |
|---|---|---|---|
| 8.1 | Overview: metric card, date range (preset + custom), validasi start>end | ✅ Berfungsi | `dashboard/metric-card.tsx`, `dashboard/date-range-filter.tsx`, `lib/metrics.ts` |
| 8.2 | Chart interaktif: line/area (metric switcher), bar kategori, donut traffic, tooltip | ✅ Berfungsi | `components/charts/*` |
| 8.3 | Data table: sort, filter (status+kategori), search debounced, pagination 10/25/50 | ✅ Berfungsi | `data-table/*`, `lib/table.ts` |
| 8.4 | Role & navigasi: Admin/Viewer switch, sidebar aktif, skeleton, empty state | ✅ Berfungsi | `layout/*`, `providers/role-provider.tsx` |
| 8.5 | Export CSV: filtered rows, RFC4180 escaping, admin-only, toast sukses | ✅ Berfungsi | `lib/csv.ts`, `data-table/export-button.tsx` |
| 8.6 | Insight otomatis: delta W-o-W, threshold signifikansi, dismiss per sesi | ✅ Berfungsi | `lib/insight.ts`, `dashboard/insight-banner.tsx` |
| 8.7 | Dark/light mode: no-flash, token warna, palet chart terpisah per tema | ✅ Berfungsi | `providers/theme-provider.tsx`, `globals.css`, `charts/chart-theme.ts` |
| — | Design system (Fase 0): token warna, tipografi, spacing | ✅ Selesai | `globals.css` |
| — | Code-split Recharts: wrapper `next/dynamic` + tiga file plot terpisah | ✅ Berfungsi | `charts/{trend,category-bar,traffic-donut}-{chart,plot}.tsx` |
| — | Harness QA: kontras, axe, 5 engine, keyboard, timing, screenshot, Lighthouse, payload | ✅ Berfungsi, sudah dijalankan penuh | `qa/*`, `playwright.config.ts` |
| — | README project | ✅ Sudah ditulis lengkap (stack, cara run, script `qa:*`, cakupan QA & lokasi bukti, struktur folder, data model, catatan build, "deliberately not built") | `README.md` |
| — | Bukti QA | ✅ Tersedia — laporan rakitan otomatis + 13 screenshot | `docs/qa-report.md`, `docs/screenshots/` |

*Tabel 8.1 — Status implementasi. Detail user story/FR/acceptance criteria per fitur tersedia di histori PRD v1.0 bila dibutuhkan sebagai referensi arsip.*

---

## 9. Non-Functional Requirements

### 9.1 Sudah Terverifikasi (via build, lint, type-check, code review, audit otomatis)

| Kategori | Status |
|---|---|
| **Kualitas Kode** | ✅ TypeScript bersih, ESLint 0 error, komponen modular (`MetricCard`, `DataTable`, chart wrappers). |
| **Struktur/Maintainability** | ✅ Mengikuti App Router; `lib/` terpisah dari komponen presentasi — mengganti mock generator dengan API nyata hanya perlu menulis ulang `lib/mock-data.ts`. |
| **Aksesibilitas (kode)** | ✅ Terverifikasi dari kode: fokus ring terlihat, sortable header sebagai `<button>` ber-`aria-sort`, skip link, label field, error inline via `aria-describedby`, caption tabel mengumumkan jumlah baris terfilter. |
| **Build & Runtime** | ✅ `npm run build` sukses, keempat route prerender, `next start` menyajikan HTML yang benar. Diverifikasi ulang setelah perbaikan kontras: `tsc --noEmit` bersih, `npm run lint` bersih, `npm run build` sukses (7 halaman statis, 23.4s). |
| **Kontras Warna — elemen teks & interaktif** | ✅ Diaudit otomatis (skrip audit kontras berbasis token CSS): 55/62 pasangan warna lolos AA. 1 pelanggaran nyata ditemukan (garis tepi input/select/tombol, `--line` 1,23:1) dan **sudah diperbaiki** — diganti `--line-strong` (`#64748b`), lolos 3:1 di kedua tema (4,76:1 terang, 3,63:1 gelap). Run QA final: 52 pasangan diuji ulang terhadap ambang AA, **0 di bawah ambang**. |
| **Aksesibilitas (runtime)** | ✅ axe-core 4.11.2 (`wcag2a wcag2aa wcag21a wcag21aa`) di seluruh route, dua tema, tiga viewport: 11 pemindaian, 247 rule check lolos, **0 pelanggaran**. Ini melengkapi baris "Aksesibilitas (kode)" di atas — yang satu dibaca dari kode, yang ini diukur di browser. |
| **Kompatibilitas Browser** | ✅ 5 engine (Chromium, Gecko, WebKit, plus build Chrome & Edge yang benar-benar terpasang) × 4 route × 3 breakpoint. Semua chart tergambar dengan geometri nyata, tanpa horizontal overflow, tanpa error console. |
| **Navigasi Keyboard** | ✅ 8 pemeriksaan lolos, termasuk 40 tab stop di halaman Data, focus trap pada nav drawer, dan validasi inline yang `aria-describedby`-nya benar-benar menunjuk ke alert-nya. |
| **Latensi Interaksi** | ✅ 9 interaksi diukur terhadap budget 200 ms, **0 lewat budget**; sampel terburuk 80,5 ms (metric switch pada trend chart). Diukur sampai animation frame kedua setelah event, bukan sampai state React berubah. |
| **Payload / Code-Split** | ✅ Recharts dipindahkan keluar dari chunk awal lewat `next/dynamic` (`ssr: false`) — tiga file `*-plot.tsx` baru. Route chart turun dari 1.028 KB JavaScript awal (unpacked) menjadi 636/634/631 KB; `/settings`, satu-satunya route tanpa chart, tidak berubah — itulah yang membuktikan penghematan berasal dari Recharts, bukan dari hal lain yang kebetulan bergeser. CLS tetap 0,000. Detail di Bagian 10.4. |

### 9.2 Pengecualian Beralasan (Documented, Tidak Diubah)

| Kategori | Temuan | Alasan |
|---|---|---|
| **Kontras chart** (garis sumbu grafik, 5 warna irisan donat) | Di bawah 3:1 pada audit otomatis | Setiap kartu grafik punya toggle Chart/Table yang menampilkan angka yang sama sebagai teks (keputusan desain di `chart-card.tsx`) — data tetap dapat diakses tanpa bergantung pada warna. Ditambahkan test otomatis yang gagal bila toggle Table hilang, supaya pengecualian ini tidak jadi klaim kosong. |

### 9.3 Sudah Diukur tapi Belum Memenuhi Target, dan yang Masih Terbuka

Suite QA sudah dijalankan sampai selesai (181 pemeriksaan, 0 gagal) dan Lighthouse sudah diukur, jadi tabel ini tidak lagi berisi "belum diukur". Yang tersisa adalah satu angka yang diukur tapi tidak lolos, dan satu item yang memang belum dikerjakan.

| Kategori | Requirement Awal | Status |
|---|---|---|
| **Performa — interaksi** | Interaksi <200 ms persepsi pengguna | ✅ **Terpenuhi.** 9 interaksi diukur, 0 lewat budget, sampel terburuk 80,5 ms. |
| **Performa — render awal** | Render awal <2 detik | ⚠️ **Terukur, sebagian terpenuhi.** First Contentful Paint 0,88 s — memenuhi. Largest Contentful Paint tersimulasi 4,60 s — **tidak memenuhi** pada host ini. Tidak diklaim lolos; lihat 10.4 untuk alasan dan apa yang perlu dilakukan untuk menyelesaikannya secara jujur. |
| **Kompatibilitas Browser** | 2 versi terakhir Chrome, Firefox, Safari, Edge | ✅ **Terpenuhi.** 5 engine × 4 route × 3 breakpoint, semua bersih (lihat 9.1). |
| **Keyboard & Screenshot QA** | Navigasi keyboard penuh, screenshot visual per breakpoint | ✅ **Terpenuhi.** 8 pemeriksaan keyboard lolos; 13 screenshot tersimpan di `docs/screenshots/`. |
| **Deploy** | Live URL publik | ⬜ Sengaja ditunda (keputusan eksplisit; lihat 10.2). |

*Tabel 9.1–9.3 — NFR dipecah: sudah terverifikasi, pengecualian beralasan yang didokumentasikan, dan yang sudah diukur tapi belum sepenuhnya memenuhi target.*

---

## 10. Sisa Pekerjaan (Open Tasks)

Ini satu-satunya bagian dengan task breakdown aktif. Disusun berdasarkan temuan langsung dari repo (`git log`, `git status`, `git remote`, `.gitignore`, `package.json`, struktur file) dan dari `docs/qa-report.md` — bukan asumsi, dan bukan disalin dari status di v2.1.

Klaim itu perlu ditegaskan karena v2.1 mengklaim hal yang sama tapi ternyata keliru membaca `git log`. Di v2.2, setiap baris berstatus ✅ atau ⬜ di bawah ini punya perintah atau file yang bisa dijalankan ulang untuk mengeceknya.

**Ringkasan status Bagian 10:**

| Sub-bagian | Status |
|---|---|
| 10.1 Git hygiene & push | 🟡 Sebagian — fitur inti sudah ter-push; commit ronde kedua belum |
| 10.2 Deploy ke Vercel | ⬜ Belum — sengaja ditunda |
| 10.3 QA visual & audit kontras | ✅ Selesai |
| 10.4 Pengukuran performa | ✅ Selesai sebagai pengukuran — satu target belum terpenuhi |
| 10.5 Case study | ⬜ Belum |

### 10.1 Git Hygiene & Push ke GitHub

> **Koreksi terhadap v2.1.** PRD v2.1 menyatakan `git log` hanya berisi satu commit *"Initial commit from Create Next App"* dan seluruh fitur masih uncommitted. **Itu salah.** Pembacaan ulang langsung dari repo menunjukkan yang sebaliknya. Bagian ini ditulis ulang seluruhnya.

**Temuan aktual dari repo (dibaca ulang 7 September 2026):**

- **Ada 17 commit, bukan satu.** Histori sudah granular per area fitur, persis bentuk yang jadi kriteria penerimaan di v2.1: `chore` dependency & ignore rules, lalu design system, UI primitives, seeded data, providers, layout, metrics, charts, dashboard, insight, halaman, data-table, export, halaman Data, Settings, dan terakhir `docs:` untuk README + PRD.
- **Sudah ter-push.** `origin` mengarah ke `https://github.com/maLoyInc/Pulse.git`, dan `origin/main` menunjuk commit yang sama persis dengan `HEAD` (`d532c37`) — tidak ada commit lokal yang tertinggal.
- **`.gitignore` benar.** `/node_modules` dikecualikan, jadi risiko 557 MB ikut ter-push memang tidak ada — bagian ini dari v2.1 tetap valid.

**Yang benar-benar masih uncommitted** adalah pekerjaan ronde kedua, yaitu seluruh hal yang dikerjakan *setelah* commit `d532c37` — bukan fitur inti:

| Perubahan | Isi | Kenapa belum ter-commit |
|---|---|---|
| Tooling QA (baru) | `qa/` (5 spec, helper, global setup/teardown, `lighthouse.mjs`, `payload.mjs`) + `playwright.config.ts` | Ronde kedua; belum dicommit sejak suite selesai dijalankan |
| Code-split Recharts (baru) | `src/components/charts/{trend,category-bar,traffic-donut}-plot.tsx` | Idem |
| Code-split Recharts (modifikasi) | Tiga file `*-chart.tsx` jadi wrapper `next/dynamic` | Idem |
| Perbaikan kontras (modifikasi) | `src/app/globals.css` (`--line-strong`) + `button.tsx`, `field.tsx`, `select.tsx`, `skeleton.tsx` | Idem |
| Bukti QA (baru) | `docs/qa-report.md` + 13 file di `docs/screenshots/` | Idem |
| Dependency & ignore (modifikasi) | `package.json`, `package-lock.json` (Playwright, axe-core), `.gitignore` (`/qa/results`) | Idem |
| Dokumen ini (modifikasi) | `Pulse-PRD.md` v2.2, dan README yang kini menyebut tooling QA | Idem |

#### Keputusan: `qa/results/` sengaja di-gitignore

`/qa/results` masuk `.gitignore`. Artinya `lighthouse.json`, `payload.json`, `report.json` dan seluruh `.jsonl` mentah **tetap lokal**, dan yang ikut ter-commit hanya `docs/qa-report.md` yang sudah dirakit dari file-file itu, plus `docs/screenshots/`.

Ini keputusan sadar, bukan kelalaian:

- **Laporan adalah deliverable-nya, JSON mentah bukan.** `docs/qa-report.md` sudah memuat setiap angka yang bisa dipertanggungjawabkan, dalam bentuk yang bisa dibaca orang tanpa menjalankan apa pun.
- **JSON mentah basi begitu suite dijalankan ulang**, dan karena isinya penuh timing yang bergantung mesin, diff-nya akan berisik setiap kali tanpa menambah informasi.
- **`report.json` saja ~1 MB** — memenuhi histori repo portfolio dengan artefak yang tak seorang pun baca.
- Konsekuensinya diterima secara eksplisit: **angka di `docs/qa-report.md` tidak bisa diaudit ulang dari repo saja**, harus dengan menjalankan `npm run qa`. Karena laporan itu dirakit otomatis oleh `global-teardown.ts` dari apa yang benar-benar direkam (bukan ditulis tangan), dan menandai suite yang tidak jalan sebagai *not measured* alih-alih diam-diam menganggapnya lolos, trade-off ini dinilai sepadan.

**Kriteria Penerimaan**

- [x] Seluruh source code fitur ter-commit dengan histori commit yang wajar (bukan satu commit raksasa) — 17 commit granular.
- [x] Repo GitHub dapat diakses menampilkan seluruh struktur folder yang sudah diverifikasi.
- [ ] `git status` bersih setelah commit ronde kedua (tooling QA, code-split, perbaikan kontras, `docs/`, README + PRD ini).

**Task Breakdown**

| Task | Detail | Estimasi | Status |
|---|---|---|---|
| Commit bertahap per area fitur | Layout, dashboard, charts, data-table, providers | S | ✅ Selesai (17 commit) |
| Push ke remote GitHub | `origin/main` sinkron dengan `HEAD` | S | ✅ Selesai |
| Review `git diff` sebelum commit ronde kedua | Pastikan `.next/`, `graphify-out/`, `qa/results/` tidak ikut ter-stage | S | ⬜ Belum |
| Update README + PRD | README kini menyebut script `qa:*`, cakupan harness, dan lokasi bukti; PRD ini naik ke v2.2 | S | ✅ Selesai (belum ter-commit) |
| Commit ronde kedua | Tooling QA, code-split Recharts, perbaikan kontras, `docs/`, dependency, README + PRD | S | ⬜ Belum |

### 10.2 Deploy ke Vercel

**Status: sengaja ditunda** — bukan diblokir oleh masalah teknis, ini keputusan eksplisit untuk menyelesaikan QA dan dokumentasi lebih dulu sebelum ada live URL publik.

**Kriteria Penerimaan**
- [ ] Project ter-deploy dan dapat diakses publik di domain `*.vercel.app` tanpa error runtime.
- [ ] Keempat route dapat diakses langsung (bukan hanya via navigasi client-side) tanpa 404.
- [ ] Build production di Vercel sukses tanpa konfigurasi tambahan (sudah sesuai klaim README: "prerender static, no configuration").

**Task Breakdown**

| Task | Detail | Estimasi |
|---|---|---|
| Hubungkan repo GitHub ke Vercel | Prasyarat sudah terpenuhi — repo sudah ada di GitHub dan `origin/main` sinkron (10.1). Idealnya commit ronde kedua dilakukan lebih dulu supaya yang ter-deploy sudah memuat code-split Recharts dan perbaikan kontras | S |
| Verifikasi environment (Node ≥20.9) | Sesuaikan Vercel project settings bila perlu | S |
| Smoke test live URL | Cek keempat route, toggle tema, role switch, export CSV di production | S |
| Ukur ulang Lighthouse pada build ter-deploy | Ini yang menyelesaikan pertanyaan terbuka di 10.4: pengukuran lokal dilakukan pada mesin yang kehabisan memori, jadi angka turunan CPU-nya batas atas | S |
| Update README dengan link live demo | Belum ditambahkan sekarang — belum ada deployment, dan link mati lebih buruk daripada tidak ada link | S |

### 10.3 QA Visual Lintas Browser/Device & Audit Kontras WCAG AA — ✅ SELESAI

> **Koreksi terhadap v2.1.** v2.1 menandai bagian ini "belum dijalankan sampai selesai". Suite kini **sudah dijalankan sampai tuntas** dan `docs/qa-report.md` sudah dihasilkan.

**Hasil run lengkap:**

| Yang diukur | Hasil |
|---|---|
| Total pemeriksaan | **181 selesai, 0 gagal** |
| Engine browser | **5** — Chromium, Gecko, WebKit, plus build Chrome & Edge yang benar-benar terpasang di mesin |
| Cakupan rendering | 4 route × 3 breakpoint (1280 / 768 / 360 px) × 5 engine; 12 chart tergambar per engine, tanpa horizontal overflow, tanpa error console |
| axe-core | **11 pemindaian, 0 pelanggaran**, 247 rule check lolos (tag `wcag2a wcag2aa wcag21a wcag21aa`) |
| Kontras | 52 pasangan diuji terhadap ambang AA, **0 di bawah ambang** |
| Keyboard | **8 pemeriksaan, semuanya lolos** — termasuk 40 tab stop di halaman Data dan focus trap nav drawer |
| Latensi interaksi | **9 interaksi, 0 lewat budget 200 ms**; sampel terburuk 80,5 ms |
| Screenshot | **13 file** tersimpan di `docs/screenshots/` |
| Laporan | `docs/qa-report.md` dirakit otomatis oleh `qa/global-teardown.ts` |

Suite berjalan terhadap production build (`next start`), bukan dev server — jadi yang diukur adalah yang akan dikirim ke pengguna.

**Catatan kejujuran soal kondisi mesin.** Run direkam pada host yang sedang terbeban: CPU 26% → 88% sibuk, memori bebas 0,5 GB dari 7,7 GB. Kondisi itu dicatat di dalam laporan itu sendiri, dan konsekuensinya dinyatakan terbuka: **median latensi pada mesin terbeban adalah batas atas, bukan angka final.** Karena seluruh 9 interaksi berada jauh di bawah budget (terburuk 80,5 ms terhadap 200 ms), kesimpulan "lolos" tetap aman — angka pada mesin yang lebih lega hanya akan lebih kecil, tidak lebih besar. Ini berbeda dengan situasi di 10.4, di mana beban mesin benar-benar menentukan hasil.

Dua bug harness yang ditemukan & diperbaiki saat membangun tooling ini (tercatat di v2.1, tetap berlaku): bug parser palet gelap pada audit kontras, dan bug perekaman hasil test akibat Playwright membuat worker baru tiap ada kegagalan. Keduanya ditemukan justru karena tooling-nya dipakai sungguhan, bukan hanya ditulis.

Keputusan soal artefak mentah `qa/results/` yang tidak ikut ter-commit: lihat 10.1.

**Kriteria Penerimaan**

- [x] Rasio kontras teks & elemen interaktif diukur dengan tool otomatis dan memenuhi WCAG AA (setelah perbaikan `--line-strong`).
- [x] Pengecualian kontras chart didokumentasikan dengan alasan yang diverifikasi test otomatis (toggle Chart/Table wajib ada).
- [x] Layout diverifikasi visual pada Chrome, Firefox, Safari, Edge — 5 engine, semua bersih.
- [x] Breakpoint desktop/tablet/mobile diperiksa langsung via screenshot suite — 13 screenshot tersimpan.
- [x] Elemen interaktif dites navigasi keyboard penuh via suite otomatis — 8 pemeriksaan lolos.

**Task Breakdown**

| Task | Detail | Estimasi | Status |
|---|---|---|---|
| Bangun tooling audit kontras otomatis | Skrip baca token CSS + hitung rasio kontras | M | ✅ Selesai |
| Perbaiki bug parser palet gelap | Audit sempat mengukur warna terang untuk mode dark | S | ✅ Selesai |
| Perbaiki bug perekaman hasil test (Playwright worker) | Ganti ke tulis `.jsonl` per pemeriksaan + rakit di `global-teardown.ts` | M | ✅ Selesai |
| Migrasi 5 file test ke cara rekam baru | | S | ✅ Selesai |
| Perbaiki pelanggaran kontras nyata (`--line` → `--line-strong`) | Diterapkan ke input, select, tombol | S | ✅ Selesai |
| Tambah test yang memvalidasi pengecualian chart (toggle Table wajib ada) | | S | ✅ Selesai |
| Jalankan suite lengkap: a11y (axe), 5 browser, keyboard, timing, screenshot | 181 pemeriksaan, 0 gagal | M | ✅ Selesai |
| Tulis `docs/qa-report.md` final dari hasil run lengkap | Otomatis dari `global-teardown.ts` | S | ✅ Selesai |

### 10.4 Pengukuran Performa Nyata — ✅ SELESAI SEBAGAI PENGUKURAN

> **Koreksi terhadap v2.1.** v2.1 menandai bagian ini belum diukur sama sekali. Lighthouse **sudah dijalankan** (5 run, median dilaporkan), latensi interaksi **sudah diukur**, dan payload per-route **sudah diukur**.
>
> "Selesai sebagai pengukuran" dipilih dengan sengaja, bukan "selesai": pekerjaan mengukurnya tuntas, tapi **satu angka tidak memenuhi target dan itu tidak diklaim lolos.**

#### Code-split Recharts — pekerjaan yang tidak tercatat di v2.1

Tidak ada satu pun bagian di v2.1 yang menyebut ini, padahal ini satu-satunya optimasi performa nyata yang dikerjakan. Dicatat di sini supaya PRD tidak lagi lebih miskin dari repo-nya.

**Masalah.** Recharts ikut dalam chunk awal setiap route yang punya chart, padahal library itu tidak menggambar apa pun di server: `ResponsiveContainer` menunggu pengukuran `ResizeObserver` lebih dulu, jadi markup hasil server-render berupa kotak kosong — dengan atau tanpa Recharts di dalam bundle awal. Biayanya nyata (parse di main thread), hasilnya nol sampai browser mengukur ukuran kontainer.

**Yang dilakukan.** Tiap chart dipecah dua: bagian yang menggambar dipindahkan ke file `*-plot.tsx` baru, dan file `*-chart.tsx` lama tinggal jadi wrapper yang memuatnya lewat `next/dynamic` dengan `ssr: false`.

| Baru | Wrapper yang memuatnya |
|---|---|
| `src/components/charts/trend-plot.tsx` | `trend-chart.tsx` |
| `src/components/charts/category-bar-plot.tsx` | `category-bar-chart.tsx` |
| `src/components/charts/traffic-donut-plot.tsx` | `traffic-donut-chart.tsx` |

**Hasil terukur** (unpacked — angka inilah yang berubah jadi blocking time, karena itu yang harus di-parse main thread):

| Route | JS awal sebelum | JS awal sesudah |
|---|---|---|
| `/` | 1.028 KB | **636 KB** |
| `/analytics` | 1.028 KB | **634 KB** |
| `/data` | 1.028 KB | **631 KB** |
| `/settings` (tanpa chart) | 616 KB | **616 KB — tidak berubah** |

Sekitar **392–397 KB unpacked per route chart kini tiba setelah first paint**, bukan sebelumnya. Baris `/settings` adalah kontrolnya: route itu satu-satunya yang tidak pernah punya chart, dan angkanya tidak bergerak sedikit pun — itulah yang membuktikan penghematan benar-benar berasal dari Recharts, bukan dari hal lain yang kebetulan ikut bergeser.

**Dampak pada metrik:** First Contentful Paint dan Speed Index membaik. **Cumulative Layout Shift tetap 0,000** — dan itu bukan kebetulan: kotak ber-tinggi-tetap sengaja diletakkan di paruh yang dimuat eager (di dalam `*-chart.tsx`), sehingga skeleton dan plot menempati ruang yang persis sama dan pertukaran keduanya tidak menggeser apa pun. Komponen `loading` bahkan tidak menerima props, jadi secara struktural ia tidak mungkin salah tinggi.

#### Hasil Lighthouse (setelah code-split)

Lighthouse 13.4.1, production build via `next start`, mobile emulation + simulate throttling (Slow 4G: RTT 150 ms, 1638 Kbps, CPU 4×). 5 run, median dilaporkan.

| Kategori | Skor |
|---|---|
| Performance | **55 / 100** (terbaik 65, terburuk 51) |
| Accessibility | **100 / 100** |
| Best Practices | **100 / 100** |
| SEO | **100 / 100** |

| Metrik | Nilai |
|---|---|
| First Contentful Paint | **0,88 s** |
| Largest Contentful Paint | **4,60 s** |
| Speed Index | **3,30 s** |
| Total Blocking Time | **1,75 s** |
| Cumulative Layout Shift | **0,000** |

#### Terhadap requirement: apa yang lolos dan apa yang tidak

Requirement awal: render awal di bawah 2 detik.

- **First Contentful Paint 0,88 s — memenuhi.**
- **Largest Contentful Paint tersimulasi 4,60 s — tidak memenuhi.** Ini dinyatakan apa adanya. Tidak ada klaim lolos untuk angka ini.

Kenapa keduanya berselisih jauh: LCP di halaman ini adalah satu paragraf teks yang **sudah ada di dalam HTML**. Ia tidak menunggu data dan tidak menunggu chart — ia menunggu main thread. Dan main thread sedang ditagih 4× oleh emulasi CPU Lighthouse, **di atas mesin yang saat run hanya punya 0,4 GB memori bebas dari 7,7 GB.**

**Semua angka turunan CPU di tabel di atas — Performance score, Total Blocking Time, Time to Interactive, dan LCP tersimulasi — adalah batas atas, bukan nilai sebenarnya dari aplikasi.** Lighthouse mengalikan biaya CPU untuk meniru ponsel kelas menengah; pada mesin yang sudah sibuk, yang ikut terkalikan adalah kontensinya juga. Sebaran antar-run menunjukkan hal yang sama: Performance bergerak 51–65 dan TBT 0,93–2,92 s antar-run pada halaman yang identik — sebaran sebesar itu milik host, bukan milik halaman.

Dua angka yang **tidak** bergantung pada host, dan keduanya lega:

- **Trace yang benar-benar diamati browser** (sebelum model jaringan diterapkan): FCP dan LCP sama-sama 1,36 s, DOMContentLoaded 0,17 s, Load 0,53 s.
- **Payload:** 279 KB JavaScript over the wire (341 KB total, 16 request).

**Cara jujur menutup pertanyaan ini adalah mengukur ulang di mesin yang lega atau di build yang sudah ter-deploy (10.2) — bukan menulis ulang kesimpulannya.** Sampai itu dilakukan, statusnya tetap: terukur, terdokumentasi, sebagian belum memenuhi target.

**Kriteria Penerimaan**

- [x] Interaksi chart & tabel diukur dan berada di bawah 200 ms — 9 interaksi, 0 lewat budget, terburuk 80,5 ms.
- [x] Hasil pengukuran didokumentasikan (skor Lighthouse / Web Vitals), bukan hanya klaim — `docs/qa-report.md` Bagian 6 & 7.
- [~] Render awal diukur dan berada di bawah 2 detik — **diukur; FCP memenuhi, LCP tersimulasi tidak.** Belum bisa ditandai lolos sampai ada pengukuran ulang pada host yang tidak terbeban (lihat 10.2).

**Task Breakdown**

| Task | Detail | Estimasi | Status |
|---|---|---|---|
| Jalankan Lighthouse | 5 run terhadap production build, median dilaporkan | S | ✅ Selesai |
| Ukur latensi interaksi tabel/chart | 9 interaksi × 5 sampel, dataset 168 baris, diukur sampai animation frame kedua | M | ✅ Selesai |
| Ukur payload per route | `qa/payload.mjs` — ambil tiap `<script src>` yang diminta HTML route, jumlahkan | S | ✅ Selesai |
| Optimasi bottleneck | Code-split Recharts via `next/dynamic` | M | ✅ Selesai |
| Ukur ulang di host yang tidak terbeban / build ter-deploy | Untuk menutup pertanyaan LCP secara jujur | S | ⬜ Belum (tergantung 10.2) |

### 10.5 Case Study untuk Profil Upwork

**Temuan aktual:** masih belum ada file case study di repo — hanya README teknis. Ini satu-satunya deliverable di Bagian 10 yang belum disentuh sama sekali.

Bahan mentahnya kini jauh lebih lengkap dari saat v2.1 ditulis: selain "Notes on the build" di README, sudah tersedia `docs/qa-report.md` (angka QA & performa nyata, termasuk yang tidak lolos) dan 13 screenshot di `docs/screenshots/` yang bisa dipakai tanpa menunggu deploy.

**Kriteria Penerimaan**
- [ ] Tersedia ringkasan problem → pendekatan → keputusan teknis (bukan sekadar daftar fitur).
- [ ] Menonjolkan keputusan teknis yang menunjukkan product-thinking, mis.: kenapa satu context per jenis state, kenapa 180 hari data digenerate untuk range maksimum 90 hari, kenapa insight punya threshold signifikansi.
- [ ] Format ringkas dan siap ditempel ke profil Upwork (bukan dokumen panjang).

**Task Breakdown**

| Task | Detail | Estimasi |
|---|---|---|
| Tulis draft case study (problem/approach/decisions) | Sumber: README "Notes on the build" sudah punya bahan mentahnya | S |
| Sertakan screenshot | Sudah tersedia di `docs/screenshots/` — tidak lagi menunggu 10.2 | S |
| Sertakan link live demo | Prasyarat: 10.2 selesai | S |
| Review & persingkat untuk format profil Upwork | | S |

---

## 11. Struktur Data (Mock Data Model Aktual)

Diverifikasi langsung dari `src/lib/types.ts` — beberapa field lebih kaya dari placeholder di PRD v1.0 (mis. `categoryMix` per hari, bukan hanya di level transaksi).

```ts
interface DailyMetric {
  date: string;                    // ISO YYYY-MM-DD, UTC-based
  revenue: number;
  users: number;
  orders: number;
  trafficSource: {                 // persen per channel, total 100
    organic: number; paid: number; referral: number; direct: number;
  };
  categoryMix: Record<TransactionCategory, number>; // persen revenue per kategori, total 100
}

interface Transaction {
  id: string;                      // "TRX-10493"
  date: string;
  customer: string;
  category: "Subscription" | "One-time Purchase" | "Upgrade" | "Renewal" | "Add-on";
  amount: number;
  status: "paid" | "pending" | "failed" | "refunded";
}
```

**Volume data aktual:** 180 hari time-series (bukan 90 seperti rencana v1.0 — sengaja digandakan karena tiap kartu metrik membandingkan range aktif terhadap window yang sama panjang persis sebelumnya, jadi range 90 hari butuh 180 hari histori) dan 168 baris transaksi tersebar di 90 hari terakhir. Data digenerate deterministik dari seed tetap saat module di-load (bukan file JSON statis) — server dan client menghasilkan angka identik sehingga hydration tidak mismatch.

---

## 12. Milestone & Rencana Pengembangan

| Fase & Deliverable | Status |
|---|---|
| **Fase 0 — Design System & Setup** | ✅ Selesai |
| **Fase 1 — Layout & Navigasi Statis** | ✅ Selesai |
| **Fase 2 — Data Layer & Mock Data** | ✅ Selesai |
| **Fase 3 — Metric Cards, Date Range & Chart** | ✅ Selesai |
| **Fase 4 — Data Table Interactions** | ✅ Selesai |
| **Fase 5 — Fitur Tambahan** (export CSV, insight, role view, dark/light) | ✅ Selesai |
| **Fase 6 — Polish & QA (kode)** | ✅ Selesai (build/lint/type-check bersih, code review fitur) |
| **Fase 6b — QA Terukur & Performa** (suite Playwright 5-browser, axe, kontras, keyboard, timing, Lighthouse, code-split Recharts) | ✅ Selesai — 181 pemeriksaan, 0 gagal; lihat Bagian 10.3 & 10.4 |
| **Fase 7 — Git Push, Deploy & Dokumentasi** | 🟡 **Sebagian** — push fitur inti selesai (17 commit, `origin/main` sinkron); sisa: commit ronde kedua, deploy Vercel, case study |

*Tabel 12.1 — Roadmap. Fase 6b ditambahkan di v2.2: pekerjaan ini nyata dilakukan tapi tidak punya tempat di roadmap v2.1. Fase 7 dipecah lebih detail di Bagian 10.*

---

## 13. Definition of Done

- [x] Seluruh interaksi data (filter, sort, search, date range, toggle metric) berfungsi tanpa bug — terverifikasi via build, route test, code review, **dan kini juga via suite QA di 5 engine browser**.
- [x] Repo memiliki README yang menjelaskan konteks project, tech stack, dan cara menjalankan project — **sudah diperbarui**: script `qa:*` masuk tabel, ada bagian yang menjelaskan cakupan harness QA dan lokasi buktinya (`docs/qa-report.md`, `docs/screenshots/`).
- [x] Audit kontras WCAG AA dijalankan; pelanggaran nyata ditemukan & diperbaiki, sisanya pengecualian terdokumentasi dan tervalidasi test. *(Bagian 9.1–9.2)*
- [x] Repo ter-push ke GitHub dengan histori commit yang mencerminkan pekerjaan sungguhan — **17 commit granular, `origin/main` sinkron**. *(dinyatakan salah di v2.1; dikoreksi di Bagian 10.1)*
- [x] Suite QA lintas browser/keyboard/screenshot dijalankan sampai selesai & `docs/qa-report.md` final tersedia — **181 pemeriksaan, 0 gagal, 13 screenshot**. *(Bagian 10.3)*
- [x] Pengukuran performa nyata (Lighthouse/Web Vitals) terdokumentasi — **Lighthouse 5 run, latensi 9 interaksi, payload per-route, semuanya di `docs/qa-report.md`**. *(Bagian 10.4)*
- [~] Render awal di bawah 2 detik — **diukur, belum sepenuhnya terpenuhi**: FCP 0,88 s memenuhi, LCP tersimulasi 4,60 s tidak. Sengaja tidak ditandai lolos; angka turunan CPU diambil pada mesin yang kehabisan memori dan merupakan batas atas. *(Bagian 10.4)*
- [ ] Commit ronde kedua: tooling QA, code-split Recharts, perbaikan kontras, `docs/`, README + PRD ini. *(Bagian 10.1)*
- [ ] Live demo ter-deploy di Vercel dan dapat diakses publik tanpa error. *(Bagian 10.2 — sengaja ditunda)*
- [ ] Tersedia case study singkat yang dapat ditempel di profil Upwork. *(Bagian 10.5)*

Legenda: `[x]` selesai · `[~]` selesai sebagai pengukuran, target belum sepenuhnya terpenuhi · `[ ]` belum.

## 14. Risiko & Asumsi

### Risiko

- **Deploy pertama kali gagal karena env/versi Node** — Next.js 16 mensyaratkan Node ≥20.9; mitigasi: cek Vercel project settings sebelum deploy pertama.
- ~~Audit kontras/aksesibilitas menemukan pelanggaran AA~~ — **terealisasi & sudah ditangani**: audit otomatis menemukan 1 pelanggaran nyata (garis tepi input/select/tombol) dan sudah diperbaiki (`--line-strong`); sisanya pengecualian beralasan dan terdokumentasi.
- ~~Suite QA lintas browser/keyboard/screenshot belum dijalankan sampai selesai~~ — **tidak lagi berlaku**: suite sudah dijalankan sampai tuntas (181 pemeriksaan, 0 gagal) dan `docs/qa-report.md` sudah ada.
- ~~Commit history yang berantakan karena seluruh fitur uncommitted~~ — **premisnya salah sejak awal.** v2.1 menyatakan seluruh fitur uncommitted; kenyataannya sudah ada 17 commit granular dan `origin/main` sinkron. Risiko ini dicoret bukan karena sudah dimitigasi, melainkan karena tidak pernah ada.
- **PRD menyimpang dari repo** — risiko baru, dan yang paling terbukti nyata sejauh ini: v2.1 memuat dua klaim yang salah tentang isi repo, dan menghilangkan satu pekerjaan (code-split Recharts) sepenuhnya. Mitigasi yang dipakai untuk v2.2: setiap klaim status dibaca ulang langsung dari repo (`git log`, `git status`, `git remote`, `.gitignore`, `package.json`) atau dari `docs/qa-report.md` yang dirakit otomatis dari hasil run — bukan dari ingatan atau dari PRD versi sebelumnya.
- **Skor performa dibaca sebagai vonis final** — Performance 55 dan LCP tersimulasi 4,60 s diukur pada mesin dengan 0,4 GB memori bebas, dan Lighthouse mengalikan biaya CPU 4×, jadi kontensinya ikut terkalikan. Risikonya dua arah: mengklaimnya lolos padahal tidak, atau mengoptimasi sesuatu yang sebenarnya tidak pernah lambat. Mitigasi: kondisi mesin dicatat di dalam laporan itu sendiri, angka turunan CPU dinyatakan sebagai batas atas, dan pengukuran ulang pada build ter-deploy dijadwalkan di 10.2.
- **Bukti QA tidak bisa diaudit ulang dari repo saja** — konsekuensi yang diterima dari keputusan meng-gitignore `qa/results/` (lihat 10.1): yang ter-commit hanya laporan rakitan, bukan JSON mentahnya. Mitigasi: laporan dihasilkan otomatis oleh `global-teardown.ts` dari apa yang benar-benar direkam, dan menandai suite yang tidak jalan sebagai *not measured* alih-alih menganggapnya lolos.

### Asumsi

- Data seeded deterministik dianggap cukup representatif untuk mensimulasikan skenario penggunaan nyata; tidak diperlukan data real-time.
- Role-based view cukup disimulasikan di client-side tanpa backend auth sungguhan, sesuai tujuan portfolio.
- Hasil build/lint/route test yang sudah dilakukan dianggap valid dan tidak perlu diulang pada siklus kerja berikutnya (per keputusan eksplisit di dokumen ini) — verifikasi ulang hanya dilakukan jika ada perubahan kode baru pada fitur yang bersangkutan.
- **Status di PRD versi sebelumnya tidak diasumsikan benar.** Asumsi ini ditambahkan di v2.2 karena kebalikannya sudah terbukti merugikan: klaim status di v2.1 disalin dari pembacaan repo yang keliru dan bertahan tiga bagian dokumen. Status kini dianggap valid hanya bila bisa ditelusuri ke perintah git, isi file, atau laporan yang dihasilkan otomatis.
- Angka performa yang diturunkan dari waktu CPU dianggap sebagai batas atas selama diukur di mesin yang terbeban, dan tidak dipakai untuk menyatakan lolos maupun untuk memicu optimasi — sampai ada pengukuran ulang di host yang lega atau di build ter-deploy.

---

## 15. Lampiran

### 15.1 Skill Tags untuk Portfolio

- Next.js · React · TypeScript · Data Visualization · Full-Stack Development · Dashboard Design

### 15.2 Referensi

- *Project Brief: Pulse — SaaS Analytics Dashboard* (input awal untuk PRD v1.0)
- `Pulse-PRD.md` v1.0 (3 September 2026) — diarsipkan sebagai referensi spesifikasi detail per fitur (user story, FR, acceptance criteria) bila dibutuhkan kembali.
- `Pulse-PRD.md` v2.1 (5 September 2026) — **digantikan dokumen ini.** Jangan dipakai sebagai rujukan status: Bagian 10.1-nya keliru soal isi `git log`, dan Bagian 10.3–10.4-nya sudah usang.
- `docs/qa-report.md` — sumber untuk seluruh angka QA & performa di Bagian 9 dan 10 dokumen ini. Dirakit otomatis oleh `qa/global-teardown.ts` dari hasil run, bukan ditulis tangan.
- `docs/screenshots/` — 13 screenshot: tiap route di dua palet pada 1280px, dua route padat data pada 768px dan 360px, plus nav drawer terbuka di layar ponsel.
- `README.md` di repo — sumber utama untuk detail implementasi & struktur proyek aktual.