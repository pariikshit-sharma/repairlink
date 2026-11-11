# REPAIRLINK — When Mobility Stops, Support Shouldn't

**Tagline:** *When Mobility Stops, Support Shouldn't.*  
**Secondary Wordmark Subtitle:** *Connecting People to Possibilities*

REPAIRLINK is a responsive digital wheelchair repair and mobility-continuity platform built for the **SBI Young Innovators Ideathon**. It connects wheelchair users, vetted assistive-device technicians, participating hospitals, rehabilitation centres, NGOs, and platform administrators inside a unified operational ecosystem.

---

## Core Platform Capabilities

1. **Smart Repair Discovery (`/find-repairs`, `/providers/[id]`, `/book-repair`)**
   - Wheelchair type and symptom intake (manual active rigid, folding transit, powered/electric, wheels, brakes, motors/batteries, cushions, frame welding).
   - Split list + interactive map discovery (`mapbox-gl` with built-in schematic fallback when a Mapbox token is absent).
   - Upfront digital quotations (parts, labor, inspection breakdown) approved before work starts inside [`/repairs/[id]`](file:///d:/repairlink%20project/src/app/repairs/[id]/page.tsx).

2. **Temporary Mobility Support (`/temporary-support`)**
   - Links ongoing primary wheelchair repairs (`#RL-XXXX`) to hospital, rehab centre, and NGO loaner inventories so daily independence never stops while spare parts are sourced.
   - Tracks 4-stage clinical approval, handover coordination, return due dates, and sanitization check-ins.

3. **Role-Scoped Operational Portals & RBAC**
   - **Wheelchair User (`/dashboard/user`)**: Wheelchair specifications, active repair tracking, quotation approval, temporary loan tracker, and emergency contact profile.
   - **Repair Provider (`/dashboard/provider`)**: Availability toggle, incoming triage queue, itemized quotation builder, active repair execution with service notes, service history, and editable workshop profile.
   - **Institution (`/dashboard/institution`)**: Live pool KPIs, patient loan clearance queue, active handover management, return sanitization bay, and inventory CRUD with device photo uploads.
   - **Platform Administrator (`/dashboard/admin`)**: Provider/institution credential verification queue, account suspension & reactivation moderation, platform ticket & loan monitors, dynamic category governance, and unified audit logs.

4. **Accessibility, Notifications & Trust Resources**
   - Reduced-motion-safe Framer Motion transitions (`<MotionConfig reducedMotion="user">`) and CSS `prefers-reduced-motion` fallbacks.
   - Role-scoped live Notification Centre (`NotificationBell`), Skip-to-Main-Content link, keyboard focus rings, mobile bottom bar (`MobileNav`), and dedicated [`/faq`](file:///d:/repairlink%20project/src/app/faq/page.tsx), [`/privacy`](file:///d:/repairlink%20project/src/app/privacy/page.tsx), [`/terms`](file:///d:/repairlink%20project/src/app/terms/page.tsx), and [`/accessibility`](file:///d:/repairlink%20project/src/app/accessibility/page.tsx) pages.

---

## Tech Stack

- **Framework:** Next.js 15 App Router (TypeScript)
- **Styling & UI:** Tailwind CSS, Radix UI primitives, Lucide React icons, Framer Motion, Sonner toasts
- **Forms & Validation:** React Hook Form + Zod
- **Backend & Database Schema:** Supabase Auth & PostgreSQL (`supabase/schema.sql` with Row Level Security policies)
- **Mapping:** Mapbox GL (`mapbox-gl`)
- **Deployment Target:** Vercel (includes PWA Web App Manifest + `vercel.json` security headers)

---

## Local Development Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Variables (Optional for Demo Mode, Required for Live Cloud)

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Configured variables:

- `NEXT_PUBLIC_SUPABASE_URL` — Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Your Supabase public anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Server-only Supabase service role key (never exposed to browser)
- `NEXT_PUBLIC_APP_URL` — Deployed URL (e.g., `http://localhost:3000` or Vercel domain)
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` — Optional Mapbox GL token for live street map tiles

> **Resilient Prototype Mode:** When `.env.local` uses placeholder or unset Supabase/Mapbox keys, REPAIRLINK runs seamlessly in demonstration mode backed by browser `localStorage`, session cookies (`repairlink_session`), realistic seeded Delhi NCR networks, and an interactive schematic provider map.

### 3. Database Schema & Row Level Security (Supabase)

To deploy with a live PostgreSQL/Supabase project:

1. Open the SQL Editor in your Supabase Dashboard.
2. Execute [`supabase/schema.sql`](file:///d:/repairlink%20project/supabase/schema.sql) to provision tables, enums (`user_role`, `repair_lifecycle_status`, `wheelchair_loan_status`, `loan_request_status`), triggers, and strict Row Level Security policies.

### 4. Run Development & Verification Commands

```bash
pnpm run dev
pnpm exec tsc --noEmit
pnpm run lint
pnpm run build
```

---

## Ideathon Evaluation & Demo Portals

Use **Portals & Dashboards -> Switch Stakeholder Role** in the top navigation bar (or the evaluation bar inside any dashboard) to switch cleanly between RBAC-enforced roles:

| Role | Demo Route | Focus Area |
| :--- | :--- | :--- |
| Wheelchair User | `/dashboard/user` | Book repairs, approve quotes, request hospital loaners |
| Repair Provider | `/dashboard/provider` | Triage queue, itemized quote builder, service notes |
| Institution (Hospital / NGO) | `/dashboard/institution` | Clinical loan approvals, inventory registry, return sanitization |
| Platform Administrator | `/dashboard/admin` | Credential verification, suspension moderation, categories & logs |

---

## Deploying to Vercel & Installing / Packaging for Android

### Deploy to Vercel

1. Push the repository to GitHub/GitLab/Bitbucket.
2. Import into Vercel (`vercel.json` is pre-configured with Next.js security headers).
3. Add the environment variables from `.env.example` in Vercel Project Settings (or leave unset to demonstrate seeded Ideathon mode).

### Installing & Testing on Android

- **Instant Android PWA Install (No Android SDK Required):**
  Once deployed over HTTPS (e.g., Vercel), open the URL in **Chrome on Android**. Because `src/app/manifest.ts` and square PNG launcher icons (`public/icons/icon-192.png`, `public/icons/icon-512.png`) are configured, tap the browser menu and select **Install app** / **Add to Home screen** to launch REPAIRLINK standalone without browser chrome.
- **Generating a Distributable `.apk` Binary (Requires External Toolchain):**
  Because this project is a Next.js App Router application with server/middleware routes (`src/middleware.ts`), generating a signed Android `.apk` requires wrapping the hosted HTTPS URL using **Capacitor** (`server.url`) or **Bubblewrap (Trusted Web Activity)** on a workstation that has **Java JDK (17+)** and the **Android SDK / Gradle** installed.
