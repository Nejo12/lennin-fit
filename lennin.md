# Lennin.fit — Master Plan, Build Log & Status Tracker

> Single source of truth for vision, decisions, roadmap, tasks, and status. Keep this doc updated as you ship.

---

## 1) Vision & Positioning

**One‑liner:** **Fit your whole business in one app.**  
**Who it’s for:** Freelancers / solo service providers (designers, devs, coaches, consultants).  
**Core promise:** Stop juggling tools; run **clients, projects, tasks, calendar, invoices & payments** in one place.  
**Domain:** **lennin.fit** (primary).  
**Slogan (site masthead):** _Fit your whole business in one app._

**Why this wins:** Saves hours of admin per week; touches cashflow (invoices/payments) → perceived as business‑critical.

---

## 2) North‑Star Metrics (first 6 months)

- **MRR:** €2,000
- **Active users (WAU):** 150
- **Onboarding conversion (visit → email):** ≥ 5%
- **Signup → Activated (first project+task created):** ≥ 40%
- **Free → Paid (Pro):** ≥ 10%

**Week‑1 launch KPIs (landing only):** 100 unique visitors, 10% CTA clicks, 5% emails captured.

---

## 3) Roadmap (brutal 6‑month plan)

### Month 1 — Validation

- [ ] Landing page (hero, features, pricing, CTA form)
- [ ] Waitlist + messaging tests in freelance communities
- [ ] Offer lifetime beta deal to 20 testers (€99)
- [ ] Decision checkpoint: proceed if ≥10 pre‑pays

### Month 2 — MVP Core

- [ ] Clients (CRM lite) CRUD
- [ ] Projects + Tasks CRUD
- [ ] Weekly Calendar (tasks shown by due date)
- [ ] Auth + org bootstrap (`init_user`)

### Month 3 — Money Hooks

- [ ] Invoices + line items + totals
- [ ] Payments (manual) + dashboard card “Unpaid invoices”
- [ ] Export CSV/PDF (basic)

### Month 4 — Differentiators

- [ ] AI assist (task breakdown, weekly focus)
- [ ] Calendar sync (Google) and/or ICS publish
- [ ] Onboarding polish

### Month 5 — Growth Machine

- [ ] Public beta launch (PH, communities)
- [ ] Affiliate program (30% recurring)
- [ ] Case studies & testimonials

### Month 6 — Monetization Expansion

- [ ] Client portal + custom branding (Business plan)
- [ ] Pricing page polish + self‑serve upgrades

> **Hard gates:** If any month’s core KPI flops, sharpen the niche/features before proceeding.

---

## 4) Architecture & Stack (summary)

**Frontend:** React 18 + TypeScript + Vite, SCSS modules, TanStack Query, RHF + Zod, date‑fns.  
**Backend:** Supabase (Postgres, Auth, Storage, RLS).  
**Serverless:** Netlify Functions (Stripe webhooks, Checkout, ICS feed).  
**Payments:** Stripe Checkout.  
**Telemetry:** Sentry (errors), PostHog (product analytics).

**Data model (high‑level):** organizations, memberships, profiles, clients, projects, tasks, invoices, invoice_items, payments, activities, public_links, subscriptions.  
**Security:** RLS with `is_member(org_id)`; `init_user` creates default org & membership.

> Full SQL for schema & RLS already drafted (see previous assistant message). Paste into Supabase SQL editor, then call `rpc('init_user')` post‑login.

---

## 5) Landing Site (current workstream)

**Repo:** `lennin-fit` (Vite + React + TS + SCSS).  
**Pages/sections:** Hero, Social Proof chips, Features, Pricing (Free/Pro/Business), CTA form.  
**Copy:**

- **Hero:** _Fit your whole business in one app._
- **Subtext:** _Stop juggling 5 tools. Lennin gives freelancers tasks, clients, and invoices in one place—so you work smart and stress less._
- **CTA button:** _Start Free_ / _Fit My Business Now_.

**Form:** Formspree or Netlify Forms (swap endpoint when ready).  
**SEO:** title/description/OG tags, `sitemap.xml`, `robots.txt`, `og.jpg`.  
**Analytics (optional now):** PostHog key via `VITE_POSTHOG_KEY`.

**Status checklist (landing):**

- [ ] Repo scaffolded with Vite React TS
- [ ] Global theme + components committed
- [ ] Copy inserted (hero, features, pricing)
- [ ] Form connected (test submit)
- [ ] Netlify deploy (main branch → dist)
- [ ] Domain attached: **lennin.fit** → Netlify DNS/records
- [ ] SSL active + `www` → apex redirect
- [ ] Analytics verified

---

## 6) Domain & DNS

**Decision:** Use **lennin.fit** now (budget‑friendly, brand tie‑in). Optionally park **lennin.site** to redirect.  
**Registrar:** Prefer Cloudflare or Porkbun/Namecheap (free WHOIS privacy, transparent renewals).  
**DNS Steps:**

1. Buy `lennin.fit` at registrar.
2. In Netlify → **Add custom domain** → follow DNS wizard (CNAME/ALIAS to Netlify or switch nameservers).
3. Set primary to `https://lennin.fit`.
4. Add `www` → apex redirect (present in `netlify.toml`).
5. Wait for SSL; test HTTP→HTTPS and `www` redirects.

---

## 7) Billing Setup (Stripe)

**Plans:** Pro (monthly/yearly), Business (monthly/yearly).  
**Netlify Functions:** `create-checkout-session`, `stripe-webhook`.  
**Env (Netlify):** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `APP_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.  
**Gate:** Read `subscriptions` by `org_id`; Pro/Business features behind `org_has_active_subscription`.

**Status checklist (billing):**

- [ ] Stripe products & prices created
- [ ] Function: create checkout session
- [ ] Function: webhook updates `subscriptions`
- [ ] Billing page + Upgrade CTA wired
- [ ] Test with real card (or test mode) end‑to‑end

---

## 8) App MVP Backlog (post‑landing)

**Clients**

- [ ] List, create, edit, archive
- [ ] Notes & contact info

**Projects & Tasks**

- [ ] Projects by client (status: planned/active/done)
- [ ] Tasks (status, priority, due, estimate)
- [ ] Weekly calendar view (from task due dates)

**Invoices & Payments**

- [ ] Create invoice + items (auto totals)
- [ ] Mark paid / overdue; payments table
- [ ] Dashboard cards (Unpaid total, Today/Week tasks)

**Platform**

- [ ] Auth (email link/password) + `init_user`
- [ ] RLS verified for all tables
- [ ] Activity log (lightweight)

---

## 9) Differentiators (Wedge)

- [ ] **AI assist**: Generate task breakdown & weekly focus from project text
- [ ] **Calendar**: ICS publish (fast) → later Google OAuth sync
- [ ] **Client portal** (Business): read‑only project status, shared docs, invoice status

---

## 10) Go‑To‑Market (first 8 weeks)

**Week 1–2** (landing live)

- [ ] Share in 3 freelancer communities (Reddit, LI groups, IndieHackers)
- [ ] 3 short demo clips (YouTube/LinkedIn)
- [ ] Set up waitlist autoresponder (welcome + 1 follow‑up)

**Week 3–4** (MVP testers)

- [ ] Onboard 15–20 testers (Zoom/DM)
- [ ] Ask for 2 measurable outcomes (hours saved, clarity, invoices collected)

**Week 5–8** (Beta)

- [ ] Ship testimonials to homepage
- [ ] Affiliate pilot (30% recurring) with 3 coaches/creators
- [ ] Product Hunt soft launch

---

## 11) Risks & Mitigations

- **Risk:** Looks like “another to‑do app”.  
  **Mitigation:** Lead with invoices/payments dashboard & client CRM; copy emphasizes money + time.
- **Risk:** Domain confusion (.fit).  
  **Mitigation:** Strong hero copy; optional `.site` redirect; later acquire .com if ROI justifies.
- **Risk:** Stripe/RLS misconfig leaks data.  
  **Mitigation:** Strict RLS tests; service‑role keys only in serverless functions.

---

## 12) Decision Log

- **2025‑08‑24:** Use **lennin.fit** as primary domain; slogan finalized: _Fit your whole business in one app._
- **2025‑08‑24:** Ship landing first; Supabase/Stripe later in sprints.

---

## 13) Status Dashboard (update as you go)

**Landing**

- Repo: [ ] Not started [ ] In progress [ ] Done
- Copy: [ ] Not started [ ] In progress [ ] Done
- Form: [ ] Not started [ ] In progress [ ] Done
- Deploy: [ ] Not started [ ] In progress [ ] Done
- Domain: [ ] Not started [ ] In progress [ ] Done

**MVP**

- Clients: [ ] NS [ ] IP [ ] Done
- Projects/Tasks: [ ] NS [ ] IP [ ] Done
- Calendar: [ ] NS [ ] IP [ ] Done
- Invoices/Payments: [ ] NS [ ] IP [ ] Done

**Billing**

- Stripe setup: [ ] NS [ ] IP [ ] Done
- Webhooks: [ ] NS [ ] IP [ ] Done
- Upgrade flow: [ ] NS [ ] IP [ ] Done

**Growth**

- Content: [ ] NS [ ] IP [ ] Done
- Communities: [ ] NS [ ] IP [ ] Done
- Affiliates: [ ] NS [ ] IP [ ] Done

Legend: NS = Not started, IP = In progress.

---

## 14) Changelog (template)

```
## [YYYY‑MM‑DD]
### Added
- ...
### Changed
- ...
### Fixed
- ...
### Notes
- KPI snapshot: visits __, CTR __, emails __
```

**Latest entries**

- **2025‑08‑24** — Created master plan, landing copy, site scaffold instructions; domain decision (lennin.fit).

---

## 15) Operating Checklist (daily/weekly)

**Daily**

- [ ] Reply to all tester/user emails
- [ ] Check error logs (Sentry) & key metrics (PostHog)
- [ ] Ship one meaningful improvement

**Weekly**

- [ ] Publish a short update/changelog
- [ ] Outreach to 10 new freelancers/coaches
- [ ] Review KPIs vs targets; adjust next sprint

---

## 16) Next 5 Actions (immediate)

1. Buy **lennin.fit** and connect to Netlify.
2. Create repo from provided Vite/React/SCSS scaffold; paste components/styles.
3. Wire CTA form (Formspree or Netlify Forms) and test submission.
4. Add `sitemap.xml`, `robots.txt`, favicon, and OG image.
5. Share the live link with 10 freelancers for copy feedback.

---

**Owner:** Olaniyi Gabriel Aborisade  
**Contact:** olaniyi_g@hotmail.com • +49 1590 1212006

> Keep this document open in Cursor. Update the checkboxes as you finish tasks. This _is_ your control panel.
