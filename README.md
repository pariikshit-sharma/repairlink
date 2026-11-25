# REPAIRLINK — When Mobility Stops, Support Shouldn't

**Live Deployment:** [https://repairlink-taupe.vercel.app](https://repairlink-taupe.vercel.app)  
**Tagline:** *When Mobility Stops, Support Shouldn't.*  
**Secondary Wordmark Subtitle:** *Connecting People to Possibilities*

REPAIRLINK is a digital wheelchair repair and mobility-continuity platform connecting wheelchair users, vetted assistive-device technicians, participating hospitals, rehabilitation centres, NGOs, and platform administrators inside a unified operational ecosystem.

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

## Stakeholder Portals & RBAC

Access role-specific features via the dedicated portals:

| Role | Route | Key Capabilities |
| :--- | :--- | :--- |
| Wheelchair User | `/dashboard/user` | Real-time repair tickets, hospital loaner tracker, specs & mobility care points |
| Repair Provider | `/dashboard/provider` | Triage queue, itemized quotation builder, service notes & repair execution |
| Institution (Hospital / NGO) | `/dashboard/institution` | Clinical loan approvals, equipment inventory registry, return sanitization |
| Platform Administrator | `/dashboard/admin` | Credential verifications, account moderation, ticket monitors, audit logs |

---

## Live Deployment & Mobile Access

### Live Web Application
- **Production URL:** [https://repairlink-taupe.vercel.app](https://repairlink-taupe.vercel.app)

### Android Companion APK
- Located at [`RepairLink-debug.apk`](file:///d:/repairlink%20project/RepairLink-debug.apk) in the repository root.
- Install on your Android device and enter `https://repairlink-taupe.vercel.app` at the server prompt to test the native Android companion.
