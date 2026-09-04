# Pulse — Product Requirements Document (PRD)

**SaaS Analytics Dashboard**
*"See your business metrics in real time."*

| | |
|---|---|
| **Jenis Dokumen** | Product Requirements Document (PRD) |
| **Versi** | v2.0 |
| **Tanggal** | 4 September 2026 |
| **Kategori Upwork** | Full-Stack Development / Data Visualization Dashboard |
| **Status Produk** | Fiktif — Portfolio Self-Directed Project |
| **Status Development** | Core product **selesai & terverifikasi** (build, lint, type-check, code review). Sisa scope: deploy, QA manual, dokumentasi. |
| **Project Terkait** | Chatly, Solstice (portfolio series sebelumnya) |
| **Menggantikan** | Pulse-PRD.md v1.0 (3 September 2026) |

Dokumen ini adalah revisi dari PRD v1.0 setelah seluruh scope Bagian 8 (Spesifikasi Fitur) diimplementasikan dan diverifikasi terhadap kode sungguhan di repo `Pulse.zip` — bukan asumsi dari nama file. Task yang sudah selesai dihapus dari breakdown; dokumen ini hanya menyisakan spesifikasi untuk pekerjaan yang **belum** bisa dipastikan selesai.

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

Dengan demikian, fokus PRD v2.0 bergeser dari *pengembangan fitur* ke **penyelesaian rantai terakhir sebelum produk ini bisa dipakai sebagai portfolio piece**: push ke GitHub, deploy ke Vercel, QA manual (visual & performa), dan penulisan dokumentasi/case study. Bagian 8 pada dokumen ini tidak lagi berisi task breakdown — hanya status ringkas per fitur sebagai referensi. Task yang tersisa dijabarkan lengkap di Bagian 10.

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
| **Dokumentasi README** | ✅ Sudah ada dan lengkap (lihat catatan Bagian 8) |

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
| **Chart Library** | Recharts ^3.10.1 | Client-side, tema warna terpusat di `chart-theme.ts` |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/postcss`) | Design token di `globals.css` (light & dark) |
| **Tema** | next-themes ^0.4.6 | No-flash theme injection |
| **Ikon** | lucide-react ^1.40.0 | |
| **Utility** | clsx, tailwind-merge | class merging |
| **Data** | Mock data seeded (generator internal, bukan file JSON statis) | 180 hari time-series + 168 transaksi, deterministik |
| **Deployment** | Vercel (target) | **Belum ter-deploy** — lihat Bagian 10.2 |
| **Repo & Dokumentasi** | GitHub + README | README sudah ditulis lengkap; **riwayat commit belum mencakup fitur terbaru** — lihat Bagian 10.1 |

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
| — | README project | ✅ Sudah ditulis lengkap (stack, cara run, struktur folder, data model, catatan build, "deliberately not built") | `README.md` |

*Tabel 8.1 — Status implementasi. Detail user story/FR/acceptance criteria per fitur tersedia di histori PRD v1.0 bila dibutuhkan sebagai referensi arsip.*

---

## 9. Non-Functional Requirements

### 9.1 Sudah Terverifikasi (via build, lint, type-check, code review)

| Kategori | Status |
|---|---|
| **Kualitas Kode** | ✅ TypeScript bersih, ESLint 0 error, komponen modular (`MetricCard`, `DataTable`, chart wrappers). |
| **Struktur/Maintainability** | ✅ Mengikuti App Router; `lib/` terpisah dari komponen presentasi — mengganti mock generator dengan API nyata hanya perlu menulis ulang `lib/mock-data.ts`. |
| **Aksesibilitas (kode)** | ✅ Terverifikasi dari kode: fokus ring terlihat, sortable header sebagai `<button>` ber-`aria-sort`, skip link, label field, error inline via `aria-describedby`, caption tabel mengumumkan jumlah baris terfilter. |
| **Build & Runtime** | ✅ `npm run build` sukses, keempat route prerender, `next start` menyajikan HTML yang benar. |

### 9.2 Belum Bisa Dipastikan (perlu QA manual — lihat Bagian 10)

| Kategori | Requirement Awal | Kenapa Belum Terverifikasi |
|---|---|---|
| **Performa** | Interaksi <200ms persepsi pengguna; render awal <2 detik | Belum ada hasil profiling/Lighthouse nyata — baru asumsi dari struktur kode. |
| **Kontras Warna (WCAG AA)** | Rasio kontras teks & chart memenuhi AA | README menyebut token sudah "diperiksa", tapi belum ada audit otomatis (mis. axe/Lighthouse) yang tercatat. |
| **Kompatibilitas Browser** | 2 versi terakhir Chrome, Firefox, Safari, Edge | Belum diuji lintas browser sungguhan, baru diverifikasi di satu environment. |
| **Responsivitas visual nyata** | Desktop/tablet/mobile | Kode menunjukkan breakpoint sudah diterapkan (grid stack, tabel scroll, sidebar drawer), tapi belum ada screenshot/QA visual di device sungguhan. |

*Tabel 9.1 — NFR dipecah antara yang sudah terverifikasi lewat kode/build dan yang masih butuh pengujian manual.*

---

## 10. Sisa Pekerjaan (Open Tasks)

Ini satu-satunya bagian dengan task breakdown aktif. Disusun berdasarkan temuan langsung dari repo (`git status`, `.gitignore`, struktur file) — bukan asumsi.

### 10.1 Git Hygiene & Push ke GitHub

**Temuan aktual dari repo:**
- `.gitignore` **sudah benar** — `/node_modules` sudah dikecualikan, jadi risiko 557MB ikut ter-push **tidak ada** selama commit dilakukan dari working tree yang bersih (bukan dari hasil unzip yang mengandung `node_modules`).
- Namun `git log` hanya menunjukkan satu commit: *"Initial commit from Create Next App"*. Seluruh fitur (halaman Analytics, Data, Settings, seluruh folder `components/`, `hooks/`, `lib/`, `providers/`, serta `README.md` dan `Pulse-PRD.md`) masih **berstatus uncommitted** (`git status` menunjukkan modified & untracked).

**Kriteria Penerimaan**
- [ ] Seluruh source code fitur ter-commit dengan histori commit yang wajar (bukan satu commit raksasa).
- [ ] `git status` bersih setelah push.
- [ ] Repo GitHub publik/dapat diakses menampilkan seluruh struktur folder yang sudah diverifikasi.

**Task Breakdown**

| Task | Detail | Estimasi |
|---|---|---|
| Review `git diff` sebelum commit | Pastikan tidak ada file build (`.next/`, `graphify-out/`) ikut ter-stage | S |
| Commit bertahap per area fitur | Mis. layout, dashboard, charts, data-table, providers | S |
| Push ke remote GitHub | Buat repo bila belum ada | S |

### 10.2 Deploy ke Vercel

**Temuan aktual:** tidak ditemukan folder `.vercel/`, konfigurasi project Vercel, atau bukti live URL di repo — deployment belum pernah dilakukan.

**Kriteria Penerimaan**
- [ ] Project ter-deploy dan dapat diakses publik di domain `*.vercel.app` tanpa error runtime.
- [ ] Keempat route dapat diakses langsung (bukan hanya via navigasi client-side) tanpa 404.
- [ ] Build production di Vercel sukses tanpa konfigurasi tambahan (sudah sesuai klaim README: "prerender static, no configuration").

**Task Breakdown**

| Task | Detail | Estimasi |
|---|---|---|
| Hubungkan repo GitHub ke Vercel | Prasyarat: Bagian 10.1 selesai lebih dulu | S |
| Verifikasi environment (Node ≥20.9) | Sesuaikan Vercel project settings bila perlu | S |
| Smoke test live URL | Cek keempat route, toggle tema, role switch, export CSV di production | S |
| Update README dengan link live demo | | S |

### 10.3 QA Visual Lintas Browser/Device & Audit Kontras WCAG AA

**Kriteria Penerimaan**
- [ ] Layout diverifikasi visual pada Chrome, Firefox, Safari, Edge (2 versi terakhir).
- [ ] Breakpoint desktop (≥1280px), tablet (≥768px), mobile (≥360px) diperiksa langsung (bukan hanya dari kode CSS).
- [ ] Rasio kontras teks & elemen chart diukur dengan tool otomatis (mis. axe DevTools, Lighthouse Accessibility) dan memenuhi WCAG AA.
- [ ] Elemen interaktif (sort header, filter, toggle) dites navigasi keyboard penuh (Tab/Enter/Space) secara manual.

**Task Breakdown**

| Task | Detail | Estimasi |
|---|---|---|
| Setup checklist QA per browser/breakpoint | | S |
| Jalankan audit aksesibilitas otomatis (axe/Lighthouse) di tiap halaman | Catat skor & temuan | M |
| Perbaiki temuan kontras/aksesibilitas bila ada | Kondisional | M |
| Dokumentasikan hasil QA (screenshot/report) | Untuk dilampirkan ke case study | S |

### 10.4 Pengukuran Performa Nyata

**Kriteria Penerimaan**
- [ ] Render awal halaman diukur dan berada di bawah 2 detik pada koneksi standar (mis. via Lighthouse throttled 4G).
- [ ] Interaksi chart (hover, toggle) dan tabel (sort, filter, search) diukur dan berada di bawah 200ms.
- [ ] Hasil pengukuran didokumentasikan (skor Lighthouse / Web Vitals), bukan hanya klaim.

**Task Breakdown**

| Task | Detail | Estimasi |
|---|---|---|
| Jalankan Lighthouse pada production URL (setelah 10.2 selesai) | Performance, Accessibility, Best Practices, SEO | S |
| Profiling interaksi tabel/chart di DevTools Performance tab | Catat waktu render pada dataset 168 baris | M |
| Optimasi bila ada bottleneck | Kondisional, mis. memoization tambahan | M |

### 10.5 Case Study untuk Profil Upwork

**Temuan aktual:** tidak ditemukan file case study di repo — hanya README teknis.

**Kriteria Penerimaan**
- [ ] Tersedia ringkasan problem → pendekatan → keputusan teknis (bukan sekadar daftar fitur).
- [ ] Menonjolkan keputusan teknis yang menunjukkan product-thinking, mis.: kenapa satu context per jenis state, kenapa 180 hari data digenerate untuk range maksimum 90 hari, kenapa insight punya threshold signifikansi.
- [ ] Format ringkas dan siap ditempel ke profil Upwork (bukan dokumen panjang).

**Task Breakdown**

| Task | Detail | Estimasi |
|---|---|---|
| Tulis draft case study (problem/approach/decisions) | Sumber: README "Notes on the build" sudah punya bahan mentahnya | S |
| Sertakan link live demo & screenshot | Prasyarat: 10.2 selesai | S |
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
| **Fase 7 — Git Push, Deploy & Dokumentasi** | ⬜ **Sisa fase aktif** — lihat Bagian 10 |

*Tabel 12.1 — Roadmap. Fase 7 dipecah lebih detail di Bagian 10 karena ini satu-satunya fase yang belum selesai.*

---

## 13. Definition of Done

- [ ] Live demo ter-deploy di Vercel dan dapat diakses publik tanpa error. *(Bagian 10.2)*
- [x] Seluruh interaksi data (filter, sort, search, date range, toggle metric) berfungsi tanpa bug — terverifikasi via build, route test, dan code review.
- [x] Repo memiliki README yang menjelaskan konteks project, tech stack, dan cara menjalankan project.
- [ ] Repo ter-push ke GitHub dengan histori commit yang mencerminkan pekerjaan sungguhan. *(Bagian 10.1)*
- [ ] Tersedia case study singkat yang dapat ditempel di profil Upwork. *(Bagian 10.5)*
- [ ] QA visual lintas browser/device & audit kontras WCAG AA terdokumentasi. *(Bagian 10.3)*
- [ ] Pengukuran performa nyata (Lighthouse/Web Vitals) terdokumentasi. *(Bagian 10.4)*

---

## 14. Risiko & Asumsi

### Risiko

- **Deploy pertama kali gagal karena env/versi Node** — Next.js 16 mensyaratkan Node ≥20.9; mitigasi: cek Vercel project settings sebelum deploy pertama.
- **Audit kontras/aksesibilitas menemukan pelanggaran AA** — token warna diklaim sudah diperiksa di README tapi belum diverifikasi tool otomatis; mitigasi: jalankan audit sebelum klaim ini dimasukkan ke case study.
- **Commit history yang berantakan** — karena seluruh fitur saat ini uncommitted, ada risiko satu commit raksasa yang kurang mencerminkan proses kerja; mitigasi: commit bertahap per area (lihat 10.1).

### Asumsi

- Data seeded deterministik dianggap cukup representatif untuk mensimulasikan skenario penggunaan nyata; tidak diperlukan data real-time.
- Role-based view cukup disimulasikan di client-side tanpa backend auth sungguhan, sesuai tujuan portfolio.
- Hasil build/lint/route test yang sudah dilakukan dianggap valid dan tidak perlu diulang pada siklus kerja berikutnya (per keputusan eksplisit di dokumen ini) — verifikasi ulang hanya dilakukan jika ada perubahan kode baru pada fitur yang bersangkutan.

---

## 15. Lampiran

### 15.1 Skill Tags untuk Portfolio

- Next.js · React · TypeScript · Data Visualization · Full-Stack Development · Dashboard Design

### 15.2 Referensi

- *Project Brief: Pulse — SaaS Analytics Dashboard* (input awal untuk PRD v1.0)
- `Pulse-PRD.md` v1.0 (3 September 2026) — diarsipkan sebagai referensi spesifikasi detail per fitur (user story, FR, acceptance criteria) bila dibutuhkan kembali.
- `README.md` di repo — sumber utama untuk detail implementasi & struktur proyek aktual.